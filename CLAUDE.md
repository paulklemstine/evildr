# EvilDr

AI-powered interactive fiction platform where Google Gemini acts as game master, dynamically generating both narrative and UI each turn. Players engage in multiplayer experiences via peer-to-peer WebRTC connections. The AI persona "Dr. Gemini" drives psychological profiling, dating simulations, and adaptive storytelling.

**Status:** Active development. Live at [evildrgemini.github.io](https://evildrgemini.github.io). Legacy code in `old/`, Android version in [Geems3](https://github.com/raver1975/Geems3).

## Project Lineage

| Version | Repo / Location | Description |
|---------|-----------------|-------------|
| Geems3 | `github.com/raver1975/Geems3` | Android (Kotlin/Compose) + web. Original AI psychological game with TTS, Stable Horde images, BlueSky integration |
| GEEMS (old) | `old/` | Web-only refinement. Wellness facade, encrypted API key, explicit mode, Colab backend |
| Flagged | `github.com/evildrgemini/evildrgemini.github.io` | Current. Multiplayer blind dating sim with two-player orchestration, room directory, AI profiles |

## Tech Stack

```
Frontend:       Vanilla JavaScript (ES modules, no build step)
Styling:        Tailwind CSS (CDN) + custom CSS
Fonts:          Google Fonts (Inter, Playfair Display) + Lucide icons
AI Backend:     Google Gemini API (gemini-2.5-flash, gemini-2.5-pro)
Image Gen:      Pollinations.ai (prompt-based, free)
Multiplayer:    PeerJS (WebRTC data channels, P2P mesh)
Analytics:      Firebase Analytics
Audio:          Web Audio API (synthesized alert sounds)
State:          localStorage (auto-save/restore)
Hosting:        GitHub Pages
```

## Architecture

### Core Loop

```
Player interacts → Actions serialized as JSON → LLM generates next turn as JSON UI array → Client renders dynamically → Repeat
```

### Key Patterns

- **LLM-Driven UI**: The Gemini API returns a JSON array of typed elements (`image`, `text`, `radio`, `slider`, `checkbox`, `textfield`, `hidden`). The client renders these dynamically — the AI controls what the player sees each turn.
- **Two-Stage Orchestration** (Flagged): Turn requires 3 LLM calls — 1 orchestrator (produces shared narrative + per-player instructions) + 2 UI generators (one per player). Player 1 drives orchestration, sends results to Player 2 via P2P.
- **Self-Modifying Notes**: A `notes` hidden field acts as LLM persistent memory. The AI reads its previous notes and generates updated notes each turn — game state, player profile, probe history, strategic plan.
- **Hidden Analysis**: A `gemini_facing_analysis` field contains the AI's cumulative psychological report, hidden from normal view but accessible via secret UI interactions.
- **Multi-Model Failover**: On API errors/quota exhaustion, automatically cycles through available Gemini models (2.5-flash → 2.5-pro → 2.0 → 1.5-pro).
- **PeerJS Mesh Network**: Master-election pattern for room directory. Gossip protocol for peer discovery (7.5s interval). Tie-breaking for simultaneous connections. TTL-based message propagation.
- **Encrypted Embedded Key**: XOR-encrypted API key with passphrase "consent" for fallback access when user has no key.

### Safety Settings

All Gemini API calls use `BLOCK_NONE` for all safety categories to allow unrestricted AI content generation.

## File Structure (Flagged — current version)

```
evildrgemini.github.io/
  index.html        # Single-page HTML with all markup (~8.7KB)
  script.js         # Main app logic: game loop, API, UI rendering, multiplayer (~99KB, ~2400 lines)
  prompts.js        # AI prompt templates: master UI, orchestrator, first-run, 18+ addendum (~12.7KB)
  mp.js             # PeerJS multiplayer library: mesh network, master directory, gossip (~18.5KB)
  styles.css        # All styling, no preprocessor (~13.8KB)
  favicon.ico       # Site favicon
```

### File Structure (old/ — GEEMS web version)

```
old/
  index.html          # Single-page entry point
  script.js           # Main logic (~1650 lines): game state, API calls, UI rendering
  prompts.js          # AI prompt templates: firstrun, main, explicit mode addendum
  mp.js               # PeerJS multiplayer library (~840 lines)
  styles.css          # CSS with dual theme (standard teal / explicit neon magenta)
  encrypt_key.js      # Node.js utility to XOR-encrypt API keys
  server_fixed.py     # FastAPI server for Google Colab proxy
  local_cors_proxy.js # Node.js CORS proxy for local dev
  prompt.txt          # Raw prompt protocol document (v3.3)
  favicon.ico         # Site favicon
```

## Code Style

- Vanilla JavaScript with ES modules (`import`/`export`)
- No build system, no transpiler, no bundler — static files served directly
- No framework — manual DOM manipulation via `document.createElement()`
- Monolithic file structure: one main `script.js` per variant
- Tailwind CSS via CDN for utility classes + custom CSS for theming
- CSS custom properties for theme switching (standard vs explicit mode)
- `async/await` for all API calls with try/catch error handling

## Key APIs

### Gemini API Call Pattern

```javascript
// Direct Gemini API
POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}
// Body: { contents, generationConfig: { responseMimeType: "application/json" }, safetySettings }

// OpenAI-compatible fallback (Colab proxy)
POST {baseUrl}/v1/chat/completions
// Body: { model, messages: [{ role: "user", content }], response_format: { type: "json_object" } }
```

### UI Element Schema

Each turn, the LLM returns a JSON array. Element types:

| Type | Purpose | Key Fields |
|------|---------|------------|
| `image` | AI-generated scene via Pollinations | `value` (prompt text) |
| `text` / `narrative` / `header` | Display text with markdown | `value`, `color`, `voice` |
| `radio` / `radio_group` | Multiple choice | `value` (newline-separated, `*` = default) |
| `slider` | Numeric range input | `value`, `min`, `max` |
| `checkbox` | Boolean toggle | `value` ("true"/"false") |
| `textfield` / `text_input` | Free text input | `value` (placeholder) |
| `hidden` | State fields (notes, subjectId, analysis) | `name`, `value` |

### Pollinations Image API

```
https://image.pollinations.ai/prompt/{encodeURIComponent(prompt)}?width=512&height=512&nologo=true&seed={random}
```

## Gotchas

- **API key exposure**: Keys are client-side. The encrypted embedded key uses XOR with "consent" — not real security, just obfuscation.
- **No build step**: All code ships as-is. Changes to `script.js` are live immediately on GitHub Pages push.
- **PeerJS signaling**: Depends on PeerJS's free cloud signaling server (`0.peerjs.com`). If it goes down, multiplayer breaks.
- **Pollinations rate limits**: Free tier can throttle or fail under heavy load. No retry logic for images currently.
- **Safety filters disabled**: `BLOCK_NONE` on all categories means the AI can generate any content. This is intentional for the 18+ mode.
- **localStorage limits**: Game state (full UI JSON + history) can grow large. No pruning strategy — may hit browser storage limits on long sessions.
- **Model rotation**: When a model is quota-exhausted, the index advances globally. All subsequent calls use the next model until it also fails.
- **Monolithic script.js**: ~2400 lines in the Flagged version. Refactoring into modules is a future goal.

## Development

### Running Locally

The project is static files — no install required:

```bash
# Serve with any static file server
npx serve old/
# or
python3 -m http.server 8000 --directory old/
```

For the Flagged version, clone `evildrgemini/evildrgemini.github.io` and serve similarly.

### Deployment

Push to `main` branch on `evildrgemini/evildrgemini.github.io` — GitHub Pages auto-deploys.

### Optional: Colab Backend

`old/server_fixed.py` runs on Google Colab with ngrok tunneling to provide free Gemini API access via an OpenAI-compatible endpoint. `old/local_cors_proxy.js` proxies local requests to the ngrok tunnel.

## Context Management

- Use `/clear` between unrelated tasks to prevent context pollution
- Use subagents (Task tool) for heavy investigation — protects main context window
- The three-file architecture (script.js, prompts.js, mp.js) is consistent across versions — reading one version informs understanding of others
