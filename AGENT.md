# AGENT.md — read this before touching the code

This file is the single source of truth for AI agents (and humans) working on
this repo. **Rule: whenever you change any file, update the "Change log"
section at the bottom of this file** (date, what changed, why). If you change
architecture, update the relevant section too.

## 1. Background — why this project exists

The owner (Aditya, non-technical, India) noticed that at weddings and birthdays
people receive many duplicate gifts (3 perfumes, 5 identical decor sets) because
gifters don't know what to buy and receivers can't ask directly. US apps for
this exist but are login-heavy and app-based. Goal: an **ilovepdf-style,
frictionless, free website** — cute/Gen-Z tone, mobile-first, zero login —
where a person builds a gift wishlist ("basket"), shares one link (mainly
WhatsApp), and guests secretly claim ("call dibs on") gifts so no one
double-buys. Monetization: Amazon Associates affiliate links (tag:
`thesimpleguyy-21`), configured in `lib/config.ts`.

Product name: **Wishly**. Inspirations: Zepto/Hinge for frictionless flows,
ilovepdf for "simple tool everyone uses".

## 2. Non-negotiable product principles

1. **No login, no signup, no app.** Creator identity = a secret manage link.
   Guests only type their first name when claiming.
2. **Minimum typing.** Choices are tap-only (chips, cards); typing appears only
   at the last step (name/message) and when claiming (name).
3. **Cute, Gen-Z, emoji-heavy voice** in ALL UI copy ("call dibs", "Making
   magic… ✨"). Keep it playful but never confusing.
4. **Free hosting forever**: must stay within Vercel + Supabase free tiers.
5. Amazon links must ALWAYS carry the affiliate tag — use `withAffiliateTag()`
   or `amazonSearchLink()` from `lib/config.ts`, never hand-build URLs.

## 3. Tech stack & architecture

- **Next.js 15 (App Router, TypeScript) + Tailwind CSS v4** (via
  `@tailwindcss/postcss`; NO tailwind.config file — v4 style).
- **Fonts**: `next/font/google` — Baloo 2 (`--font-baloo`, headings via
  `.font-display`) and Nunito (`--font-nunito`, body). Wired in
  `app/globals.css`. NOTE: the font CSS variables are set on `<body>` by
  next/font, so reference `var(--font-nunito)` etc. directly in selectors —
  do NOT chain them through `@theme` at `:root` (they won't resolve there;
  this bug was hit and fixed on day 1).
- **Data**: Supabase Postgres, accessed ONLY from server code with the
  service-role key (env: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`). No
  client-side Supabase, no RLS policies needed (RLS is enabled with no
  policies = locked; service role bypasses it).
- **Demo mode**: if env vars are missing, `lib/store.ts` falls back to an
  in-memory Map (survives HMR via `globalThis`). Never assume persistence in
  demo mode.
- **IDs**: nanoid custom alphabet (no 0/O/1/l). `shareId` (10 chars, public)
  and `manageKey` (24 chars, secret) — the manage key IS the auth.

### Data flow

- `POST /api/baskets` → create basket + items → returns `{shareId, manageKey}`.
  Client also saves them to `localStorage["wishly-my-baskets"]`.
- `/b/[shareId]` (guest page) → server component reads store directly, renders
  themed page; `components/ClaimGrid.tsx` (client) handles claims.
- `POST /api/baskets/[shareId]/claim` `{itemId, name}` → atomic claim (update
  … where claimed_by is null). Returns a `claimToken` which the guest's
  browser stores in `localStorage["wishly-claim-tokens"]` for undo.
- `POST /api/baskets/[shareId]/unclaim` `{itemId, claimToken}` → undo.
- `/manage/[shareId]?key=…` → server-verifies key, shows claims dashboard.

### File map

| Path | What it is |
|---|---|
| `lib/config.ts` | Site name, tagline, affiliate tag, `withAffiliateTag()` helper. Owner edits this. |
| `lib/catalog.ts` | The 8 categories × 10 curated products, occasion/for-who/vibe filter definitions, 5 guest-page themes, card gradients. Products link to affiliate-tagged amazon.in SEARCH results (not ASINs — they go stale). |
| `lib/types.ts` | Shared TypeScript types. |
| `lib/store.ts` | Storage interface + Supabase and in-memory implementations. |
| `app/page.tsx` | Landing page (static). |
| `app/create/page.tsx` | Basket builder (client): filters → grid → custom-product modal → details/theme → success screen with share + manage links, WhatsApp share. |
| `app/b/[shareId]/page.tsx` | Guest page (dynamic, themed hero + message). |
| `components/ClaimGrid.tsx` | Client claim/undo UI, affiliate buy buttons. |
| `app/manage/[shareId]/page.tsx` | Creator dashboard (needs `?key=`). |
| `components/ShareBox.tsx` | Copy link + WhatsApp button on manage page. |
| `app/api/baskets/**` | The three API routes (create / claim / unclaim). |
| `supabase/schema.sql` | Run-once DB schema for Supabase SQL editor. |
| `.env.example` | Template for `.env.local`. |
| `.claude/launch.json` | Dev-server launch config (`wishly-dev`, port 3000). |

## 4. Conventions

- UI copy: lowercase-casual headlines, emoji allowed everywhere, Hindi-English
  blend acceptable where natural. Buttons: rounded-full; cards: rounded-3xl;
  pastel gradients from `GRADIENTS` in catalog.
- All user input is length-capped and trimmed server-side in the API routes —
  keep doing that for any new field.
- Product images: curated products deliberately use emoji-on-gradient tiles
  (no hotlinked Amazon images — against Amazon ToS; no stock URLs — they rot).
  User-added items may have an `imageUrl` (rendered with plain `<img>`).
- Mobile-first: test at 375px width first.
- Guests' claim names are visible to anyone with the share link (including the
  creator). Don't promise anonymity in copy.

## 5. How to build / test

```bash
npm run dev    # dev server (use .claude/launch.json → wishly-dev in Claude Code)
npm run build  # must pass before committing
```

Manual test loop: `/create` → add 2–3 gifts → Next → fill name → Create →
open share link → claim with a name → check manage link shows the claim.

## 6. Deployment

GitHub repo → Vercel (auto-deploy on push). Env vars `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY` must be set in Vercel. See README for the
owner-facing step-by-step.

## 7. Future plans / ideas (not built yet)

- "My baskets" page reading `localStorage["wishly-my-baskets"]` so creators
  can find their lists again.
- Optional 1-click Google sign-in (Supabase Auth) purely to recover baskets
  across devices — must stay optional.
- Edit basket after creation (add/remove items via manage key).
- "Keep it a surprise" toggle: hide claimed-by names (or claimed state) from
  the share-link view for the creator.
- Price-range filter chips; more categories; festival occasions (Diwali,
  Rakhi).
- OG meta images per basket (pretty WhatsApp link previews) — high impact for
  sharing, consider next.
- Cash-gift / UPI option ("contribute to a bigger gift").
- Analytics: plausible/umami or Vercel Analytics (free tier).
- Hindi/Hinglish language toggle.

## 8. Change log

> Agents: append a dated entry here for EVERY change you make.

- **2026-07-03** — Initial build by Claude (with owner Aditya). Next.js 15 +
  Tailwind v4 + Supabase scaffold; landing, create, guest, manage pages; 3 API
  routes; 80-product catalog; 5 themes; demo-mode in-memory store; affiliate
  helper; README + this file. Known quirks fixed during build: Tailwind v4 has
  no `font-700/800` utilities (use `font-bold/extrabold`); next/font variables
  must not be chained via `@theme` (see §3). Verified locally end-to-end
  (create → share → claim → undo → manage) in demo mode; Supabase path is
  written but NOT yet tested against a real Supabase project.
- **2026-07-03** — Footer disclosure on the landing page updated to Amazon's
  required wording ("As an Amazon Associate … earns from qualifying
  purchases"). Keep this line present somewhere visible — it's an Amazon
  Associates program requirement. Also generated `Wishly-Idea-Validation.docx`
  (market/competitor/monetization report for the owner; not part of the app).
