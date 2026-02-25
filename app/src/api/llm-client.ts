// LLM client for OpenCode Zen (OpenAI-compatible chat/completions API)
// Auth is handled server-side by the Vite proxy — no API keys in client code.

export interface LLMClientConfig {
  baseUrl: string
  models: string[]
  maxTokens: number
  temperature: number
}

export interface LLMResponse {
  content: string
  model: string
  tokensUsed: number
  finishReason: string
}

interface ChatCompletionMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ChatCompletionChoice {
  index: number
  message: {
    role: string
    content: string | null
  }
  finish_reason: string | null
}

interface ChatCompletionResponse {
  id: string
  object: string
  created: number
  model: string
  choices: ChatCompletionChoice[]
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

interface ChatCompletionErrorResponse {
  error?: {
    message: string
    type: string
    code: string | number | null
  }
}

// In dev, Vite proxies /api/llm → Cloudflare Worker → Pollinations.
// In prod, client calls Cloudflare Worker directly → Pollinations.
const DEFAULT_BASE_URL = import.meta.env.DEV
  ? '/api/llm'
  : 'https://drevil-proxy.drevil.workers.dev/api/llm'
const DEFAULT_MODELS = ['gemini-fast', 'mistral']  // fast-first failover chain
const DEFAULT_MAX_TOKENS = 8000  // enough for orchestrator (2-player) + UI generation
const DEFAULT_TEMPERATURE = 1.0

// Delay between retries
const RETRY_DELAY_MS = 2000
// Extra delay for rate limit (429) — should not happen with paid Pollinations key
const RATE_LIMIT_DELAY_MS = 3000
// Multiplier applied to max_tokens when response content is empty (reasoning budget consumed)
const EMPTY_CONTENT_TOKEN_MULTIPLIER = 1.5
// Per-request fetch timeout (orchestrator calls can take 60-90s with mistral)
const FETCH_TIMEOUT_MS = 120_000

/**
 * Strips markdown code fences from a string.
 * Handles ```json ... ```, ```typescript ... ```, or bare ``` ... ```.
 * Returns the inner content if fences are found, otherwise the original string.
 */
function stripCodeFences(text: string): string {
  const fencePattern = /^```(?:\w+)?\s*\n?([\s\S]*?)\n?\s*```$/
  const match = text.trim().match(fencePattern)
  if (match) {
    return match[1].trim()
  }
  return text
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export class LLMClient {
  private config: LLMClientConfig
  private currentModelIndex: number = 0

  constructor(config?: Partial<LLMClientConfig>) {
    this.config = {
      baseUrl: config?.baseUrl ?? DEFAULT_BASE_URL,
      models: config?.models ?? [...DEFAULT_MODELS],
      maxTokens: config?.maxTokens ?? DEFAULT_MAX_TOKENS,
      temperature: config?.temperature ?? DEFAULT_TEMPERATURE,
    }

    if (this.config.models.length === 0) {
      throw new Error('LLMClient: at least one model must be provided')
    }
  }

  /**
   * Generate a single turn response from the LLM.
   *
   * Sends the prompt as a user message and returns the parsed content.
   * On failure (network error, 429 rate limit, 404 model not found, empty content),
   * cycles through the model failover chain. Maximum attempts = models.length * 2 + 1.
   */
  async generateTurn(prompt: string): Promise<LLMResponse> {
    const maxAttempts = this.config.models.length * 2 + 1
    let lastError: Error | null = null
    let currentMaxTokens = this.config.maxTokens

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const model = this.config.models[this.currentModelIndex]

      try {
        const result = await this.callCompletionAPI(prompt, model, currentMaxTokens)

        // Check for empty content (reasoning models may consume budget with reasoning tokens)
        if (!result.content || result.content.trim().length === 0) {
          console.warn(
            `LLMClient: empty content from model "${model}" (attempt ${attempt + 1}/${maxAttempts}). ` +
            `Reasoning tokens may have consumed the budget.`
          )

          // First try: increase max_tokens for the same model
          if (currentMaxTokens < this.config.maxTokens * EMPTY_CONTENT_TOKEN_MULTIPLIER) {
            currentMaxTokens = Math.ceil(this.config.maxTokens * EMPTY_CONTENT_TOKEN_MULTIPLIER)
            console.info(`LLMClient: retrying with increased max_tokens=${currentMaxTokens}`)
          } else {
            // Already tried with increased tokens, fall back to next model
            this.advanceModel()
            currentMaxTokens = this.config.maxTokens
            console.info(`LLMClient: falling back to model "${this.getCurrentModel()}"`)
          }

          lastError = new Error(`Empty content from model "${model}"`)
          await sleep(RETRY_DELAY_MS)
          continue
        }

        // Check for truncated output (finish_reason: "length" means max_tokens was hit)
        if (result.finishReason === 'length') {
          console.warn(
            `LLMClient: truncated response from model "${model}" (attempt ${attempt + 1}/${maxAttempts}, ` +
            `${result.tokensUsed} tokens, max_tokens=${currentMaxTokens}). Retrying with more tokens.`
          )

          if (currentMaxTokens < this.config.maxTokens * EMPTY_CONTENT_TOKEN_MULTIPLIER) {
            currentMaxTokens = Math.ceil(this.config.maxTokens * EMPTY_CONTENT_TOKEN_MULTIPLIER)
            console.info(`LLMClient: retrying with increased max_tokens=${currentMaxTokens}`)
          }

          lastError = new Error(`Truncated response from model "${model}"`)
          await sleep(RETRY_DELAY_MS)
          continue
        }

        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        lastError = error
        console.warn(
          `LLMClient: error from model "${model}" (attempt ${attempt + 1}/${maxAttempts}): ${error.message}`
        )

        this.advanceModel()
        currentMaxTokens = this.config.maxTokens

        if (attempt < maxAttempts - 1) {
          const isRateLimit = error.message.includes('429')
          await sleep(isRateLimit ? RATE_LIMIT_DELAY_MS : RETRY_DELAY_MS)
        }
      }
    }

    throw new Error(
      `LLMClient: all ${maxAttempts} attempts failed. Last error: ${lastError?.message ?? 'unknown'}`
    )
  }

  /** Returns the name of the currently selected model. */
  getCurrentModel(): string {
    return this.config.models[this.currentModelIndex]
  }

  /** Resets the model index to the first (preferred) model in the chain. */
  resetModelIndex(): void {
    this.currentModelIndex = 0
  }

  // --- Private helpers ---

  private advanceModel(): void {
    this.currentModelIndex = (this.currentModelIndex + 1) % this.config.models.length
  }

  private async callCompletionAPI(
    prompt: string,
    model: string,
    maxTokens: number
  ): Promise<LLMResponse> {
    const url = `${this.config.baseUrl}/chat/completions`

    const messages: ChatCompletionMessage[] = [
      { role: 'user', content: prompt },
    ]

    // JSON output is enforced via the prompt instructions rather than
    // response_format to maximize compatibility across model providers.
    const body = JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature: this.config.temperature,
    })

    let response: Response

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
        signal: controller.signal,
      })
    } catch (networkErr) {
      clearTimeout(timeoutId)
      const msg = networkErr instanceof DOMException && networkErr.name === 'AbortError'
        ? `Request timeout (${FETCH_TIMEOUT_MS / 1000}s) calling ${model}`
        : `Network error calling ${model}: ${networkErr instanceof Error ? networkErr.message : String(networkErr)}`
      throw new Error(msg)
    } finally {
      clearTimeout(timeoutId)
    }

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status} ${response.statusText}`
      try {
        const errorBody = (await response.json()) as ChatCompletionErrorResponse
        if (errorBody.error?.message) {
          errorMessage += `: ${errorBody.error.message}`
        }
      } catch {
        // Could not parse error body, use status text
      }

      if (response.status === 429) {
        throw new Error(`Rate limited (429) on model "${model}": ${errorMessage}`)
      }
      if (response.status === 404) {
        throw new Error(`Model not found (404) "${model}": ${errorMessage}`)
      }
      throw new Error(`API error on model "${model}": ${errorMessage}`)
    }

    let data: ChatCompletionResponse
    try {
      data = (await response.json()) as ChatCompletionResponse
    } catch {
      throw new Error(`Failed to parse JSON response from model "${model}"`)
    }

    if (!data.choices || data.choices.length === 0) {
      throw new Error(`No choices in response from model "${model}"`)
    }

    const rawContent = data.choices[0].message.content ?? ''
    const content = stripCodeFences(rawContent)
    const finishReason = data.choices[0].finish_reason ?? 'unknown'

    const tokensUsed =
      data.usage?.total_tokens ??
      data.usage?.completion_tokens ??
      0

    return {
      content,
      model: data.model ?? model,
      tokensUsed,
      finishReason,
    }
  }
}
