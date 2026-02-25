# Presearch: EvilDr Subscription Platform

**Date:** 2026-02-24
**Goal:** Evolve EvilDr from a static GitHub Pages game into a subscription web app with multiple AI-driven game modes and multiplayer.

---

## 1. What We Have Today (Reusable Core)

These patterns are proven across three iterations and form the foundation:

### The Engine (portable as-is)
- **LLM-driven UI renderer**: JSON array → dynamic DOM. Supports image, text, radio, slider, checkbox, textfield, hidden. ~300 lines of rendering code.
- **Self-modifying notes system**: LLM maintains its own state across turns via hidden fields. Game state, player profile, probe history, strategic plan — all managed by the AI.
- **Multi-model failover**: Cycles through Gemini models on quota/error. Already battle-tested.
- **Pollinations image generation**: Free, fast, no API key needed. Good enough for MVP.
- **Prompt template system**: `prompts.js` pattern — separates AI instructions from app logic. Each game mode = a different prompt template.
- **Auto-save/restore**: localStorage-based session persistence.

### Multiplayer (needs rework for scale)
- **PeerJS mesh + gossip protocol**: Works for <20 players. Master election, tie-breaking, TTL propagation. Good foundation but not production-grade.
- **Room directory via master peer**: Single point of failure. Needs a real backend.

### What's NOT reusable
- Monolithic `script.js` (2400 lines) — needs modularization
- Hardcoded API keys in client — needs server-side proxy
- PeerJS cloud signaling server dependency — needs self-hosted or alternative
- No auth, no user accounts, no persistence beyond localStorage

---

## 2. What Changes: Static Site → Subscription SaaS

| Concern | Today | Target |
|---------|-------|--------|
| Auth | None (anonymous play) | User accounts (email, OAuth) |
| AI API | Client-side Gemini keys, user-provided or embedded | Server-side proxy to OpenCode Zen (free models) + Pollinations |
| Game state | localStorage only | Server-persisted (resume across devices) |
| Multiplayer | PeerJS P2P, ephemeral rooms | PeerJS P2P + backend room registry (matchmaking, spectating) |
| Game modes | Single mode per deploy | 3 launch modes (GEEMS, CYOA, Flagged) with shared engine |
| Payments | None | 3-tier subscription (Free / $9 Player / $19 Pro) via Stripe |
| Content | Unrestricted | PG default, R-rated behind paid + age gate |
| Analytics | Firebase basic | User engagement, retention, mode popularity |
| Hosting | GitHub Pages | Real hosting with backend (Edge functions or server) |
| Brand | evildrgemini.github.io | **DrEvil** on custom domain |

---

## 3. Game Modes (Content Layer)

Each mode is fundamentally a **prompt template** + **mode-specific config** (turn timer, player count, UI theme, scoring). The rendering engine stays the same.

### Confirmed Modes (from existing code)

| Mode | Players | Description | Exists In |
|------|---------|-------------|-----------|
| **Flagged** (Blind Dating) | 2 | Orchestrated dates, AI profiles, flag reports | evildrgemini.github.io |
| **GEEMS** (Psych Profiling) | 1 | Wellness facade, hidden profiling, clinical reports | old/, Geems3 |
| **Explicit/Diabolical** | 1 | 18+ variant of GEEMS with neon aesthetic | old/, Geems3 |

### New Mode Ideas

| Mode | Players | Description | Complexity |
|------|---------|-------------|------------|
| **Choose Your Own Adventure** | 1 | Classic branching narrative, genre-selectable (horror, sci-fi, fantasy, noir) | Low — prompt swap only |
| **Interrogation** | 2 | One player is suspect, one is detective. AI generates evidence, alibis, contradictions | Medium — role asymmetry |
| **Group Therapy** | 3-6 | AI therapist moderates, each player gets personalized probes, group dynamics emerge | High — multi-player orchestration |
| **Truth or Dare** | 2-8 | AI escalates dares based on player comfort profiles, truth questions get increasingly personal | Medium — turn rotation |
| **Confessional** | 1 | Players confess secrets, AI responds as priest/therapist/bartender/stranger, builds trust profile | Low — prompt swap |
| **Job Interview** | 1-2 | AI simulates bizarre/surreal interview scenarios, evaluates responses | Low — prompt swap |
| **Couples Therapy** | 2 | Two real players, AI mediates relationship dynamics | Medium — orchestrator pattern |
| **Party Game** | 3-10 | Rapid-fire rounds, voting, elimination. AI generates increasingly unhinged scenarios | High — game state management |
| **Murder Mystery** | 4-8 | Each player gets a secret role/motive. AI generates clues, manages information asymmetry | High — per-player state |
| **Debate Club** | 2-4 | AI assigns positions, judges arguments, scores rhetoric | Medium — scoring system |

### Mode Architecture

```
GameMode {
  id: string              // "flagged", "geems", "cyoa", etc.
  name: string            // Display name
  description: string     // Lobby description
  minPlayers: number      // 1 for solo modes
  maxPlayers: number
  promptTemplate: string  // The system prompt
  firstRunPrompt: string  // Turn 1 special prompt
  orchestratorPrompt?: string  // For multi-player modes
  turnTimer: number       // Seconds per turn (0 = untimed)
  theme: ThemeConfig      // Colors, fonts, mood
  tier: "free" | "pro" | "premium"  // Paywall level
  nsfw: boolean           // Age-gated
  scoreEnabled: boolean   // Whether mode tracks scores
}
```

---

## 4. Multiplayer Architecture

### Current: PeerJS P2P Mesh
- **Pros**: Zero server cost, low latency for small groups, already built
- **Cons**: No persistence, master peer = SPOF, doesn't scale past ~20 peers, no matchmaking, NAT traversal issues

### Options

#### A. Keep PeerJS + Add Thin Backend
- Backend handles: auth, room registry, matchmaking, state persistence
- PeerJS handles: real-time game data between players
- Backend never sees game content (privacy win)
- **Risk**: PeerJS cloud signaling server is a dependency. Self-host PeerServer?

#### B. WebSocket Server (e.g., Socket.io, Hono WebSocket, Cloudflare Durable Objects)
- All game traffic routes through server
- Enables: room persistence, reconnection, spectating, moderation, replay
- Server sees all traffic (content moderation possible, privacy tradeoff)
- Higher server cost, but more control

#### C. Hybrid: WebSocket for Signaling + State, WebRTC for Media
- WebSocket: room management, turn orchestration, state sync
- WebRTC: optional voice/video if added later
- Best of both worlds but more complexity

### Recommendation for MVP
**Option A** — keep PeerJS for game data, add a thin backend for auth/rooms/persistence. Migrate to Option B later if needed. The existing `mp.js` is 840 lines of battle-tested P2P code.

### Room/Matchmaking Flow
```
1. Player logs in → sees game mode selection
2. Picks mode → sees lobby (open rooms for that mode)
3. Creates room or joins existing → PeerJS connection established
4. Backend records: room ID, mode, players, creation time
5. Game plays via P2P
6. On turn completion, game state snapshot sent to backend for persistence
7. On disconnect, player can resume from last snapshot
```

---

## 5. Tech Stack Decisions

### Frontend

| Option | Pros | Cons |
|--------|------|------|
| **Stay vanilla JS** | Zero build, proven, fast iteration | Hard to maintain at scale, no components, no types |
| **Vite + vanilla TS** | Types, modern build, same DX | Small migration effort |
| **Vite + Preact/Solid** | Components, reactivity, tiny bundle | Rewrite UI renderer |
| **Next.js / SvelteKit** | SSR, routing, full framework | Heavy, overkill for this |

**Lean**: Vite + vanilla TypeScript. Add types and a build step without rewriting the rendering engine. Migrate to a framework only if component complexity demands it.

### Backend

| Option | Pros | Cons |
|--------|------|------|
| **Supabase** | Auth + DB + Edge Functions + Realtime, generous free tier | Vendor lock-in, limited edge function runtime |
| **Cloudflare Workers + D1 + Durable Objects** | Edge-native, Durable Objects perfect for rooms, dirt cheap | D1 is SQLite (limited), newer ecosystem |
| **Firebase** | Already using Analytics, Auth is solid, Firestore for state | Expensive at scale, Google lock-in |
| **Self-hosted (Hono/Fastify on Fly.io)** | Full control, WebSocket native, any DB | More ops work |

**Lean**: Supabase for auth + DB + storage. Evaluate Cloudflare Durable Objects for room state if WebSocket approach is chosen later.

### API Key Proxy

Two keys to protect server-side:
- OpenCode Zen: `sk-...` (LLM calls)
- Pollinations: `sk_...` (image generation)

```
Client → Supabase Edge Function (authenticated, rate-limited) → OpenCode Zen / Pollinations
```

Edge function handles: auth check, tier-based model routing (free models vs paid), turn counting, rate limiting.

### Payments

| Option | Pros | Cons |
|--------|------|------|
| **Stripe** | Industry standard, Checkout + Customer Portal | Monthly fee at scale |
| **Lemon Squeezy** | Merchant of record (handles tax), simpler | Less flexible |
| **Paddle** | MoR, global tax handling | Higher fees |

**Lean**: Stripe. Well-documented, handles subscriptions natively.

---

## 6. Business Model

### Tier Structure (revised)

| Tier | Price | Includes |
|------|-------|----------|
| **Free** | $0 | 1 solo mode (CYOA), 10 turns/day, spectate multiplayer |
| **Player** | $9/mo | All modes (solo + multiplayer), unlimited turns, join + create rooms |
| **Pro** | $19/mo | Everything + premium AI models (Claude, GPT-5, Gemini 3), HD images, R-rated modes, game history |

### What's Gated

| Feature | Free | Player | Pro |
|---------|------|--------|-----|
| Solo modes | 1 (CYOA) | All | All |
| Multiplayer | Spectate only | Join + Create | Join + Create |
| Turns/day | 10 | Unlimited | Unlimited |
| AI model | Free (kimi/trinity) | Free (kimi/trinity) | Premium (Claude, GPT-5, Gemini 3) |
| R-rated modes | No | No | Yes (age-gated) |
| Game history | Current session only | 7 days | Unlimited |
| Image model | flux | flux | HD (gptimage-large, seedream) |

### Revenue Drivers
- Subscription is primary revenue
- Turn limits on free tier create natural upgrade pressure (10/day is ~2 game sessions)
- Multiplayer is the social hook (you need friends to join → viral loop)
- Premium AI models are a real quality difference — faster responses, richer narratives
- R-rated content behind paid + age-verified tier

---

## 7. Migration Path (Incremental)

Don't rewrite. Evolve.

### Phase 1: Foundation
- [ ] Set up Vite + TypeScript project under DrEvil brand
- [ ] Extract rendering engine from `script.js` into `engine/renderer.ts`
- [ ] Extract prompt system into `modes/` directory (one file per mode)
- [ ] Extract multiplayer into `multiplayer/peer-manager.ts`
- [ ] Build unified API client (`api/llm-client.ts`) targeting OpenCode Zen (`https://opencode.ai/zen/v1/chat/completions`)
- [ ] Update image generation to new Pollinations API (`gen.pollinations.ai/image/{prompt}?model=flux&key=...`)
- [ ] Port `old/` GEEMS mode into new structure — must work identically
- [ ] Verify free models (kimi-k2.5-free, trinity-large-preview-free) produce valid game JSON through the new client

### Phase 2: Backend + Auth
- [ ] Supabase project: auth (email + Google OAuth)
- [ ] API proxy edge function — routes LLM calls to OpenCode Zen, image calls to Pollinations. Hides both API keys server-side.
- [ ] User table: id, email, tier, turn_count_today, created_at
- [ ] Game state table: id, user_id, mode, state_json, updated_at
- [ ] Room table: id, mode, host_user_id, player_count, created_at
- [ ] Free tier turn counter (10/day, resets at midnight UTC)

### Phase 3: Three Launch Modes
- [ ] Mode selection screen / lobby
- [ ] **GEEMS** (solo) — port from `old/`, R-rated content behind age gate + Pro tier
- [ ] **CYOA** (solo) — new prompt template, genre picker (horror, sci-fi, fantasy, noir). Free tier mode.
- [ ] **Flagged** (2-player) — port from evildrgemini.github.io, orchestrator pattern
- [ ] Mode-specific theming (CSS variables per mode)
- [ ] "Entertainment only" disclaimer on signup + psych-themed modes

### Phase 4: Payments
- [ ] Stripe integration (Checkout + webhooks)
- [ ] 3-tier enforcement: Free (1 mode, 10 turns/day, spectate), Player (all modes, unlimited, join+create rooms), Pro (premium models, HD images, R-rated, history)
- [ ] Model routing: free tier → kimi-k2.5-free / trinity-large-preview-free, Pro tier → Claude/GPT-5/Gemini 3 via OpenCode Zen paid models
- [ ] Image routing: free/Player → flux, Pro → gptimage-large or seedream
- [ ] Customer portal for subscription management

### Phase 5: Polish + Launch
- [ ] DrEvil landing page + custom domain
- [ ] Onboarding flow (pick a mode, tutorial turn)
- [ ] Mobile responsive (Capacitor wrapper later)
- [ ] Error handling, loading states, offline recovery
- [ ] Analytics (mode popularity, retention, conversion, turn counts)
- [ ] Honor-system age checkbox for R-rated modes
- [ ] Beta launch

---

## 8. Open Questions

These need answers before or during Phase 1:

1. **API cost model**: ~~Gemini API pricing per 1M tokens.~~ **RESOLVED.** OpenCode Zen (opencode.ai/zen/v1/) provides free models via OpenAI-compatible API. Tested and confirmed working:
   - **kimi-k2.5-free** (Moonshot AI) — reasoning model, excellent narrative quality, ~1500 reasoning + ~130 content tokens per turn. Needs `max_tokens: 4000+`. Cost: $0.
   - **trinity-large-preview-free** (Arcee AI) — no reasoning overhead, 237 total tokens, thinner output. Fast fallback. Cost: $0.
   - **minimax-m2.5-free** / **big-pickle** / **glm-5-free** — additional free options, varying quality.
   - API base: `https://opencode.ai/zen/v1/chat/completions`, Auth: `Bearer sk-...` key.
   - 34 total models available (free + paid). Paid models include Claude, GPT-5, Gemini 3 for premium tier upsell.
   - **Strategy**: Free models for all users at MVP. Paid models (faster, higher quality) as premium subscription perk. Zero API cost at launch.

2. **Content moderation**: **RESOLVED.**
   - **Age gate**: Honor system checkbox ("I am 18+") for mature modes. Low friction, legally sufficient for R-rated content.
   - **Content rating**: R-rated max — suggestive/dark themes, psychological intensity, strong language. No explicit sexual content, no pornographic imagery.
   - **Disclaimer**: "For entertainment purposes only, not medical/psychological advice" — displayed at signup and on psych-themed modes. Covers the DSM-5/profiling angle.
   - **ToS additions**: Standard AI disclaimer ("AI-generated content may be inaccurate or offensive"), user must be 18+ for mature modes, no liability for AI outputs.
   - **Prompt engineering**: Adjust prompts to cap at R-rated. Remove "Masturbation Mode" / explicit addendums from old code. Replace with "Intense Mode" that escalates psychological themes without sexual content.
   - **No ID verification needed** — R-rated content + honor system is standard for web entertainment (same approach as Reddit, Discord, most AI chat platforms).

3. **PeerJS vs WebSocket**: **RESOLVED.** PeerJS for MVP. Existing `mp.js` (840 lines) works, zero server cost, ships immediately. Accept known limitations: rooms die with host, no reconnection, ~10-15% NAT failures. Migrate to WebSocket server post-launch if retention data shows multiplayer churn from connection issues. Abstract multiplayer behind an interface so the swap is isolated.

4. **Custom modes (Unlimited tier)**: **RESOLVED.** Drop custom modes entirely. Simplifies pricing, removes a dev-heavy feature with uncertain demand. All tiers get the same curated modes — differentiation comes from mode access, multiplayer, and model quality instead.

5. **Image generation**: **RESOLVED.** Pollinations now requires API key + explicit model param. Tested and working:
   - API: `GET https://gen.pollinations.ai/image/{prompt}?model=flux&key=sk_...&width=512&height=512`
   - **flux** (0.0002 pollen/image) — fast, good quality, best default for all tiers.
   - **gptimage** (0.000008 pollen) and **zimage** (0.0002 pollen) — additional non-paid-only options.
   - Paid-only models (nanobanana, seedream, gptimage-large, kontext) available for premium tier upsell.
   - Old keyless URL pattern (`image.pollinations.ai/prompt/...`) is dead — all existing code needs updating.
   - Key must be server-side proxied (sk_ prefix = secret key, not for client exposure).

6. **Mobile app**: **RESOLVED.** Web-first, then wrap with Capacitor/React Native later for app store presence. No native rewrite — the Geems3 Kotlin codebase is too divergent from the new multi-mode platform. Ship web MVP first, add Capacitor wrapper when app store distribution matters for growth.

7. **Voice/audio**: **RESOLVED.** Skip for MVP. Add as premium perk post-launch (likely paid TTS service like ElevenLabs for quality). Keep the Web Audio API alert sounds that already exist.

8. **Data privacy**: **RESOLVED.** Minimal approach. "Entertainment only" disclaimer, standard privacy policy, delete account = delete data. PeerJS is a natural privacy win — game content (psych profiles, narratives) stays between peers, never hits our server. Server-side data limited to auth + game state snapshots. No GDPR-specific compliance unless EU targeting becomes a priority.

9. **Domain/brand**: **RESOLVED.** Brand is **DrEvil**. Secure custom domain (drevil.app, drevil.gg, drevil.io, or similar). Individual game modes keep their own names (Flagged, GEEMS, etc.) under the DrEvil umbrella. AI persona stays "Dr. Gemini" — fits the brand.

10. **Solo vs social focus**: **RESOLVED.** Both equally. Launch with 2 solo modes (GEEMS, CYOA) + 1 multiplayer mode (Flagged). Measure retention per mode, double down on what sticks. Solo ensures the app is useful with zero other players online; multiplayer provides the viral/social hook.

---

## 9. Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| ~~Gemini API cost at scale~~ | ~~High~~ | **Resolved** — OpenCode Zen free models eliminate API cost. Paid models reserved for premium tiers |
| PeerJS signaling server down | Medium | Self-host PeerServer, or migrate to WebSocket |
| Content liability (R-rated/psych) | Low | R-rated cap, honor-system age gate, "entertainment only" disclaimer, no medical claims |
| Single-developer bus factor | High | Clean architecture, good docs, modular code |
| Pollinations pollen balance runs out | Medium | Monitor usage, flux is very cheap (0.0002/image), budget alerts |
| Google changes Gemini pricing/ToS | Low | Already using OpenCode Zen as abstraction layer — multi-provider by default |
| OpenCode Zen free tier disappears/throttles | Medium | Abstract behind provider interface, fall back to direct Gemini API or other free providers |
