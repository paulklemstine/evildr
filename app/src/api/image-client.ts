// Image generation client for Pollinations API
// Auth is handled server-side by the proxy — no API keys in client code.

export interface ImageClientConfig {
  baseUrl: string
  defaultModel: string
  defaultWidth: number
  defaultHeight: number
}

export interface ImageGenerationOptions {
  model?: string
  width?: number
  height?: number
  seed?: number
}

// In dev, Vite proxies /api/image → gen.pollinations.ai (appends API key server-side).
// In prod, Cloudflare Worker proxy does the same.
const DEFAULT_BASE_URL = import.meta.env.DEV
  ? '/api/image'
  : 'https://drevil-proxy.drevil.workers.dev/api/image'
const DEFAULT_MODEL = 'z-image-turbo'
const DEFAULT_WIDTH = 768
const DEFAULT_HEIGHT = 576

/** Placeholder returned when image preloading fails. */
const PLACEHOLDER_IMAGE_URL =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="768" height="576" viewBox="0 0 768 576">' +
    '<rect width="768" height="576" fill="#f1f5f9"/>' +
    '<text x="384" y="288" text-anchor="middle" dominant-baseline="central" ' +
    'font-family="Inter, sans-serif" font-size="20" fill="#94a3b8">Image unavailable</text>' +
    '</svg>'
  )

export class ImageClient {
  private config: ImageClientConfig

  constructor(config?: Partial<ImageClientConfig>) {
    this.config = {
      baseUrl: config?.baseUrl ?? DEFAULT_BASE_URL,
      defaultModel: config?.defaultModel ?? DEFAULT_MODEL,
      defaultWidth: config?.defaultWidth ?? DEFAULT_WIDTH,
      defaultHeight: config?.defaultHeight ?? DEFAULT_HEIGHT,
    }
  }

  /**
   * Build the image URL for a given prompt.
   *
   * In dev, points to Vite proxy: /api/image/{prompt}?model=...
   * In prod, points to Cloudflare Worker: drevil-proxy.workers.dev/api/image/{prompt}?model=...
   * Both proxies append the API key server-side before forwarding to Pollinations.
   */
  getImageUrl(prompt: string, options?: ImageGenerationOptions): string {
    const model = options?.model ?? this.config.defaultModel
    const width = options?.width ?? this.config.defaultWidth
    const height = options?.height ?? this.config.defaultHeight
    const seed = options?.seed ?? Math.floor(Math.random() * 2_147_483_647)

    const encodedPrompt = encodeURIComponent(prompt)

    const params = new URLSearchParams({
      model,
      width: String(width),
      height: String(height),
      seed: String(seed),
      nologo: 'true',
    })

    return `${this.config.baseUrl}/${encodedPrompt}?${params.toString()}`
  }

  /**
   * Preload an image by creating an Image element and waiting for it to fully load.
   *
   * Returns the image URL on success, or a placeholder data URI on error.
   */
  async preloadImage(
    prompt: string,
    options?: Pick<ImageGenerationOptions, 'model' | 'width' | 'height'>
  ): Promise<string> {
    const url = this.getImageUrl(prompt, options)

    try {
      await this.loadImageElement(url)
      return url
    } catch (err) {
      console.warn(
        `ImageClient: failed to preload image: ${err instanceof Error ? err.message : String(err)}`
      )
      return PLACEHOLDER_IMAGE_URL
    }
  }

  // --- Private helpers ---

  private loadImageElement(url: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const img = new Image()

      const cleanup = () => {
        img.onload = null
        img.onerror = null
      }

      img.onload = () => {
        cleanup()
        resolve()
      }

      img.onerror = (_event: Event | string) => {
        cleanup()
        reject(new Error(`Failed to load image from URL: ${url}`))
      }

      img.src = url
    })
  }
}
