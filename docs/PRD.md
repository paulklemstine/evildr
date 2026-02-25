# DrEvil — Product Requirements Document

**Version:** 1.0
**Date:** 2026-02-24
**Status:** Approved for development

---

## 1. Product Overview

**DrEvil** is a subscription web platform where an AI game master ("Dr. Gemini") drives interactive fiction experiences across multiple game modes — dating simulations, psychological profiling, choose-your-own-adventure, and more. Players interact through dynamically generated UI that the AI creates fresh each turn. Solo and multiplayer modes, peer-to-peer real-time connections, AI-generated images, and tiered subscriptions.

### One-Liner

AI-powered interactive fiction platform with multiple game modes, multiplayer, and a subscription model.

### Core Innovation

The AI doesn't just generate text — it generates the entire UI each turn as a structured JSON array. Radio buttons, sliders, images, hidden state fields, narrative text — all decided by the AI based on game context. The rendering engine is mode-agnostic: swap the prompt template, get a completely different game.

---

## 2. User Personas

### The Solo Explorer
- Plays alone on their phone or laptop
- Wants replayable narrative experiences (horror, sci-fi, psych thriller)
- Values story quality and variety
- May never touch multiplayer
- **Entry point:** Free tier CYOA mode

### The Social Player
- Plays with friends at parties, over Discord, or on dates
- Wants multiplayer modes (Flagged dating sim, party games)
- Shares rooms via links, invites friends
- Values the social/viral experience
- **Entry point:** Invited via room link from a friend

### The Power User
- Plays frequently across multiple modes
- Wants the best AI models for richer narratives
- Cares about game history and continuity
- Willing to pay for premium features
- **Entry point:** Upgrades from Player to Pro after hitting free model limits

---

## 3. Launch Modes (MVP)

### 3.1 CYOA — Choose Your Own Adventure (Solo, Free Tier)

**Players:** 1
**Tier:** Free
**Rating:** PG

The gateway mode. Classic branching narrative where the AI generates scenes, choices, and consequences. Player picks a genre at start.

**Genre options:** Horror, Sci-Fi, Fantasy, Noir, Comedy, Post-Apocalyptic

**Turn structure:**
1. AI generates: scene image, narrative text, 3-5 choices (radio buttons), optional text input for custom actions
2. Player picks a choice or types a custom action
3. AI advances the story based on selection, maintaining continuity via self-modifying notes

**Prompt behavior:**
- Maintain story coherence across turns via `notes` hidden field
- Track: setting, characters met, inventory, plot threads, player personality inferred from choices
- Escalate tension naturally using story arc structure (setup → rising action → climax → resolution)
- Generate image prompts that match the current scene

**Key config:**
```
mode: "cyoa"
minPlayers: 1
maxPlayers: 1
turnTimer: 0 (untimed)
tier: "free"
rated: "pg"
```

### 3.2 GEEMS — Guided Extreme Emotional Mental States (Solo, Player+ Tier)

**Players:** 1
**Tier:** Player ($9/mo), R-rated variant requires Pro ($19/mo)
**Rating:** PG (standard) / R (intense mode, Pro only)

The original. AI persona "Dr. Gemini" guides the player through a psychological journey disguised as a wellness experience. Builds a hidden psychological profile through seemingly innocuous choices.

**Turn structure:**
1. AI generates: scene image, narrative/question text, interactive probes (radio, slider, checkbox, text input), hidden state fields (notes, analysis)
2. Player responds to probes
3. AI updates psychological profile, adapts next turn's approach

**Key features:**
- Two-phase system: Assessment (turns 1-10) → Tailored Guidance (turns 11+)
- Hidden `gemini_facing_analysis` field contains cumulative psychological report
- Player-facing analysis uses euphemistic language ("Unique Expression" not "Deviance")
- Anti-repetition system tracks previously asked probe types
- "Entertainment only" disclaimer displayed before first turn

**Intense Mode (R-rated, Pro tier):**
- Darker psychological themes, more confrontational AI persona
- Neon magenta/cyan visual theme replaces standard teal
- Age-gated with honor-system checkbox
- Capped at R-rated: psychological intensity, strong language, dark themes. No sexual content.

**Key config:**
```
mode: "geems"
minPlayers: 1
maxPlayers: 1
turnTimer: 120 (2 min auto-advance)
tier: "player" (standard) / "pro" (intense)
rated: "pg" (standard) / "r" (intense)
```

### 3.3 Flagged — Blind Dating Simulation (Multiplayer, Player+ Tier)

**Players:** 2
**Tier:** Player ($9/mo)
**Rating:** PG

Two players are matched into an AI-orchestrated blind date. The AI generates scenarios, conversation prompts, and "flag reports" — green flags and red flags based on player behavior.

**Turn structure (two-stage orchestration):**
1. Both players submit actions simultaneously
2. Player 1's client calls the **orchestrator** LLM: takes both players' inputs, generates shared narrative + per-player instructions (3 sections separated by `---|||---`)
3. Player 1 sends orchestrator output to Player 2 via PeerJS
4. Each player's client calls the **UI generator** LLM independently with their section
5. Each player sees their personalized UI

**Key features:**
- AI-generated player profiles (name, avatar, personality) accumulated from turn data
- Flag reports between turns: green flags, red flags, "clinical compatibility report"
- AI persona "Dr. Gemini" as a meddling, creative matchmaker
- Avatars generated via Pollinations based on accumulated physical descriptions
- Spectating: non-participants can watch via PeerJS state requests

**Key config:**
```
mode: "flagged"
minPlayers: 2
maxPlayers: 2
turnTimer: 90 (seconds)
tier: "player"
rated: "pg"
orchestratorPrompt: true
```

---

## 4. Shared Game Engine

All modes share a single rendering engine and game loop. The mode only determines the prompt template and configuration.

### 4.1 UI Element Types

The LLM returns a JSON array. Each element:

```typescript
interface UIElement {
  type: "image" | "text" | "narrative" | "header" | "radio" | "radio_group" |
        "slider" | "checkbox" | "textfield" | "text_input" | "hidden"
  name: string
  label?: string
  value: string
  color?: string    // hex color for element theming
  voice?: string    // TTS voice hint (future)
  min?: number      // slider min
  max?: number      // slider max
}
```

| Type | Renders As | Interactive |
|------|-----------|-------------|
| `image` | AI-generated image via Pollinations (value = prompt) | No |
| `text` / `narrative` / `header` | Styled text with basic markdown | No |
| `radio` / `radio_group` | Radio button group (value = newline-separated options, `*` = default) | Yes |
| `slider` | Range input with min/max | Yes |
| `checkbox` | Boolean toggle | Yes |
| `textfield` / `text_input` | Free text textarea | Yes |
| `hidden` | Not rendered. Stores state: `notes`, `subjectId`, `gemini_facing_analysis`, `tweet` | No |

### 4.2 Game Loop

```
1. Player opens mode → client sends first-run prompt to LLM
2. LLM returns JSON UI array → renderer creates DOM elements
3. Player interacts with UI elements
4. Player submits turn → client serializes all input values
5. Client builds next prompt: system prompt + notes + history + player actions
6. LLM returns next JSON UI array → renderer replaces DOM
7. Repeat from step 3
8. Auto-save state to localStorage after each turn
```

### 4.3 Self-Modifying Notes

The `notes` hidden field is the AI's persistent memory. Each turn, the AI:
- Reads its previous notes
- Updates them with new observations (player profile, story state, strategic plan, probe history)
- Outputs updated notes as a hidden field in the JSON response

This allows the AI to maintain context across turns without sending full history. History window capped at ~10 turns of raw context; older turns compressed into notes.

### 4.4 Multi-Model Failover

On API error or timeout, the client automatically cycles to the next model:

**Free tier chain:**
1. `kimi-k2.5-free` (primary — best quality, reasoning model)
2. `trinity-large-preview-free` (fast fallback — no reasoning)
3. `minimax-m2.5-free` (secondary fallback)

**Pro tier chain:**
1. Premium model selected by user preference (Claude, GPT-5, Gemini 3)
2. Fall back to free chain on quota/error

### 4.5 Image Generation

Every `image` type element triggers an image generation call:

```
GET https://gen.pollinations.ai/image/{encodeURIComponent(prompt)}?model={model}&key={key}&width=512&height=512
```

| Tier | Image Model | Quality |
|------|-------------|---------|
| Free / Player | `flux` (0.0002 pollen/image) | Standard |
| Pro | `gptimage-large` or `seedream` | HD |

---

## 5. Multiplayer System

### 5.1 Technology

PeerJS (WebRTC data channels) for MVP. Existing `mp.js` library provides:

- **Mesh network**: All players in a room connect to each other
- **Master election**: First peer claims the master ID; others connect as clients
- **Gossip protocol**: Peer discovery every 7.5 seconds via random peer polling
- **Tie-breaking**: Simultaneous connections resolved by lower peer ID
- **TTL propagation**: Messages hop up to 4 peers with deduplication

### 5.2 Room Lifecycle

```
1. Host creates room → backend records room in Supabase (id, mode, host_id, created_at)
2. Room appears in lobby for that mode
3. Players join via lobby or direct link → PeerJS connections established
4. Game begins when min players reached
5. Turns orchestrated via P2P messages (Player 1 drives for Flagged)
6. Game state snapshots saved to backend on each turn (for resume)
7. Room removed from lobby when host disconnects or game ends
```

### 5.3 Known Limitations (MVP)

- Rooms die when host closes tab (no server-side persistence of live state)
- No automatic reconnection after disconnect
- ~10-15% of connections fail behind strict corporate NAT
- No moderation of P2P traffic (game content never touches server)
- Max ~20 peers per mesh network

### 5.4 Spectating

Non-participants can join a room in spectate mode. They receive game state broadcasts from players but cannot submit turns. Available to all tiers including Free.

---

## 6. Platform Features

### 6.1 Authentication

- **Provider:** Supabase Auth
- **Methods:** Email/password, Google OAuth
- **Session:** JWT-based, persisted in httpOnly cookies
- Anonymous play not supported — account required to track tier and turn count

### 6.2 Mode Selection & Lobby

After login, the player sees:

1. **Mode grid** — cards for each available mode with: name, description, player count, rating badge, tier lock icon if not available
2. **Lobby** (multiplayer modes) — list of open rooms with: host name, player count, "Join" button
3. **Create Room** button (Player+ tier) — creates a new room, generates shareable link
4. **Solo Play** button (solo modes) — starts immediately, no room needed

### 6.3 Turn Counter (Free Tier)

- Free users get 10 turns per day across all modes
- Counter resets at midnight UTC
- Displayed in header: "7/10 turns remaining today"
- At 0 turns: UI shows upgrade prompt, all interactive elements disabled
- Turn count tracked server-side (Supabase) to prevent client manipulation

### 6.4 Game State Persistence

| Tier | Persistence |
|------|-------------|
| Free | Current session only (localStorage) |
| Player | 7 days server-side (Supabase) |
| Pro | Unlimited server-side |

Players can resume games across devices at Player+ tier. Server stores: mode, turn number, full notes field, last UI JSON, player actions history.

### 6.5 Disclaimers & Age Gate

- **Signup disclaimer:** "DrEvil is for entertainment purposes only. AI-generated content is not medical, psychological, or professional advice."
- **Psych mode disclaimer** (GEEMS): Additional "This is a game, not a clinical assessment" notice before first turn
- **R-rated age gate** (GEEMS Intense): Honor-system checkbox "I confirm I am 18 or older" before accessing mode. Stored in user profile.

### 6.6 Analytics

Track via Firebase Analytics (already integrated in legacy code):

- **Engagement:** Turns per session, sessions per day, mode popularity
- **Retention:** D1/D7/D30 retention by mode, churn triggers
- **Conversion:** Free → Player upgrade rate, Player → Pro upgrade rate, upgrade trigger (which mode/feature)
- **Multiplayer:** Rooms created per day, avg players per room, room duration, invite conversion rate
- **Technical:** LLM response time by model, image gen time, PeerJS connection success rate

---

## 7. Subscription Tiers

### 7.1 Pricing

| Tier | Price | Billing |
|------|-------|---------|
| **Free** | $0 | — |
| **Player** | $9/mo | Monthly via Stripe |
| **Pro** | $19/mo | Monthly via Stripe |

### 7.2 Feature Matrix

| Feature | Free | Player | Pro |
|---------|------|--------|-----|
| **Solo modes** | CYOA only | All (CYOA, GEEMS) | All + R-rated (GEEMS Intense) |
| **Multiplayer** | Spectate only | Join + Create rooms | Join + Create rooms |
| **Turns/day** | 10 | Unlimited | Unlimited |
| **AI model** | kimi-k2.5-free, trinity | kimi-k2.5-free, trinity | Claude, GPT-5, Gemini 3 (user picks) |
| **Image model** | flux | flux | gptimage-large, seedream |
| **R-rated content** | No | No | Yes (age-gated) |
| **Game history** | Current session | 7 days | Unlimited |
| **Resume across devices** | No | Yes | Yes |

### 7.3 Payment Integration

- **Provider:** Stripe
- **Flow:** Checkout Session → webhook → update Supabase user tier
- **Customer portal:** Self-service upgrade/downgrade/cancel via Stripe Customer Portal
- **Webhook events:** `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- **Grace period:** 3 days after failed payment before downgrade to Free

---

## 8. Technical Architecture

### 8.1 Stack

```
Frontend:        Vite + TypeScript (SPA)
Styling:         Tailwind CSS (CDN or build)
Backend:         Supabase (Auth, PostgreSQL, Edge Functions, Storage)
LLM API:         OpenCode Zen (opencode.ai/zen/v1/) — OpenAI-compatible
Image API:       Pollinations (gen.pollinations.ai) — authenticated
Multiplayer:     PeerJS (WebRTC P2P mesh)
Payments:        Stripe (Checkout + Customer Portal + Webhooks)
Analytics:       Firebase Analytics
Hosting:         TBD (Vercel, Cloudflare Pages, or Supabase hosting)
```

### 8.2 Project Structure

```
src/
  main.ts                     # Entry point, router
  engine/
    renderer.ts               # JSON UI array → DOM rendering
    game-loop.ts              # Turn lifecycle: submit → LLM call → render
    auto-save.ts              # localStorage save/restore
  api/
    llm-client.ts             # OpenCode Zen client (OpenAI-compatible)
    image-client.ts           # Pollinations image generation
    supabase-client.ts        # Supabase auth, DB, edge function calls
  modes/
    mode-registry.ts          # Mode config registry
    cyoa/
      prompts.ts              # CYOA system prompt + first-run prompt
      config.ts               # Mode config (timer, players, theme, tier)
    geems/
      prompts.ts              # GEEMS prompts (standard + intense)
      config.ts
    flagged/
      prompts.ts              # Flagged prompts (orchestrator + UI gen)
      config.ts
  multiplayer/
    peer-manager.ts           # PeerJS mesh network (extracted from mp.js)
    room-registry.ts          # Supabase room CRUD
    spectator.ts              # Spectate mode handler
  pages/
    login.ts                  # Auth page
    lobby.ts                  # Mode selection + room browser
    game.ts                   # Active game page
    settings.ts               # Account, subscription, preferences
  ui/
    components.ts             # Shared UI components (header, turn counter, disclaimers)
    themes.ts                 # Per-mode CSS variable themes
supabase/
  functions/
    llm-proxy/index.ts        # Edge function: auth check → model routing → OpenCode Zen
    image-proxy/index.ts      # Edge function: auth check → Pollinations
    stripe-webhook/index.ts   # Stripe event handler → update user tier
  migrations/
    001_users.sql             # Users table extension (tier, turn_count, age_verified)
    002_game_states.sql       # Game state persistence
    003_rooms.sql             # Room registry
```

### 8.3 Database Schema

```sql
-- Extends Supabase auth.users
create table public.profiles (
  id uuid references auth.users primary key,
  display_name text,
  tier text default 'free' check (tier in ('free', 'player', 'pro')),
  stripe_customer_id text,
  turns_today integer default 0,
  turns_reset_at timestamptz default now(),
  age_verified boolean default false,
  created_at timestamptz default now()
);

create table public.game_states (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles not null,
  mode text not null,
  turn_number integer default 0,
  notes_json text,              -- AI's self-modifying notes
  last_ui_json text,            -- Last rendered UI for resume
  actions_history jsonb,        -- Array of player actions
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

create table public.rooms (
  id text primary key,           -- PeerJS room ID
  mode text not null,
  host_user_id uuid references public.profiles,
  player_count integer default 1,
  max_players integer not null,
  is_public boolean default true,
  created_at timestamptz default now()
);
```

### 8.4 Edge Function: LLM Proxy

```
POST /functions/v1/llm-proxy

Headers: Authorization: Bearer <supabase_jwt>
Body: { prompt: string, mode: string }

Logic:
1. Verify JWT → get user ID
2. Look up user tier
3. Check turn count (free tier: reject if >= 10)
4. Select model based on tier:
   - free/player → kimi-k2.5-free (fallback: trinity-large-preview-free)
   - pro → user-preferred premium model
5. Forward to OpenCode Zen: POST https://opencode.ai/zen/v1/chat/completions
6. Increment turn count
7. Return LLM response to client
```

### 8.5 Edge Function: Image Proxy

```
GET /functions/v1/image-proxy?prompt={prompt}

Headers: Authorization: Bearer <supabase_jwt>

Logic:
1. Verify JWT → get user tier
2. Select model: free/player → flux, pro → gptimage-large
3. Forward to Pollinations: GET https://gen.pollinations.ai/image/{prompt}?model={model}&key={sk_key}
4. Return image bytes to client
```

---

## 9. User Flows

### 9.1 New User → First Game

```
1. Land on DrEvil homepage
2. Click "Play Free" → signup (email or Google OAuth)
3. See disclaimer: "For entertainment purposes only..."
4. Mode selection screen: CYOA card (unlocked), GEEMS card (locked: "Player tier"), Flagged card (locked: "Player tier")
5. Click CYOA → genre picker (Horror, Sci-Fi, Fantasy, Noir, Comedy, Post-Apocalyptic)
6. Pick genre → first turn loads
7. Play through turns, see turn counter decrement (10 → 9 → ...)
8. At turn 0: "You've used all your free turns today. Upgrade to Player for unlimited." + upgrade button
```

### 9.2 Multiplayer — Flagged

```
1. Player tier user clicks Flagged mode
2. Sees lobby: list of open rooms (or empty state)
3. Clicks "Create Room" → room created, shareable link generated
4. Shares link with friend
5. Friend clicks link → joins room (must be Player+ tier, prompted to upgrade if Free)
6. Both players connected via PeerJS
7. Game begins: AI generates first turn for both players
8. Turn-based play with 90s timer, orchestrator pattern
9. Between turns: flag reports (green/red flags, compatibility score)
10. Game ends when players choose to leave or disconnect
```

### 9.3 Upgrade Flow

```
1. User hits a gate (turn limit, locked mode, locked feature)
2. Upgrade prompt shows: tier comparison, price, "Upgrade" button
3. Click "Upgrade" → Stripe Checkout session
4. Complete payment → webhook fires → Supabase profile updated
5. Redirect back to DrEvil → gate removed, feature unlocked
6. Confirmation toast: "Welcome to Player! All modes unlocked."
```

---

## 10. Non-Functional Requirements

### 10.1 Performance

| Metric | Target |
|--------|--------|
| LLM response time (free models) | <20 seconds (reasoning models are slower) |
| LLM response time (pro models) | <8 seconds |
| Image generation time | <10 seconds |
| UI render after LLM response | <100ms |
| Page load (first meaningful paint) | <2 seconds |
| Bundle size | <300KB gzipped (lazy-load per mode) |

### 10.2 Reliability

- LLM failover: auto-cycle through model chain on error
- Image fallback: show placeholder if Pollinations fails after 15s timeout
- Auto-save every turn to localStorage (immediate) + server (async, Player+)
- PeerJS reconnection attempt on disconnect (1 retry, then show "reconnecting" UI)

### 10.3 Security

- API keys (OpenCode Zen, Pollinations) never exposed to client — all calls via Edge Functions
- Supabase Row Level Security (RLS) on all tables
- Stripe webhook signature verification
- Rate limiting on Edge Functions (per user, per minute)
- No user-generated content stored server-side beyond game state JSON

### 10.4 Compatibility

- **Browsers:** Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Devices:** Desktop, tablet, mobile (responsive)
- **WebRTC:** Required for multiplayer. Graceful degradation to solo-only if unavailable.

---

## 11. Success Metrics (First 90 Days)

| Metric | Target |
|--------|--------|
| Registered users | 1,000 |
| D7 retention | >20% |
| Free → Player conversion | >5% |
| Player → Pro conversion | >15% |
| Avg turns per session | >8 |
| Multiplayer rooms created | >100 |
| MRR | $500 |

---

## 12. Out of Scope (MVP)

- Custom game modes / prompt editor
- Voice / TTS
- Native mobile app (Capacitor wrapper is post-launch)
- WebSocket migration (evaluate post-launch based on multiplayer data)
- Video generation (Pollinations supports it but not needed yet)
- Social features (friends list, profiles, leaderboards)
- Content moderation system (P2P = no server-side visibility)
- Localization / i18n
- Offline mode
- Admin dashboard (use Supabase dashboard directly)

---

## 13. Future Modes (Post-Launch Backlog)

Prioritize based on retention data from the 3 launch modes.

| Mode | Players | Complexity | Notes |
|------|---------|------------|-------|
| Confessional | 1 | Low | Prompt swap. Good solo addition. |
| Job Interview | 1 | Low | Prompt swap. Comedic potential. |
| Interrogation | 2 | Medium | Role asymmetry (suspect vs detective). |
| Couples Therapy | 2 | Medium | Uses orchestrator pattern from Flagged. |
| Truth or Dare | 2-8 | Medium | Turn rotation needed. Party mode. |
| Debate Club | 2-4 | Medium | Scoring system needed. |
| Group Therapy | 3-6 | High | Multi-player orchestration. |
| Party Game | 3-10 | High | Voting, elimination, rapid rounds. |
| Murder Mystery | 4-8 | High | Per-player secrets, information asymmetry. |
