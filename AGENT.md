# AGENT.md — read this before touching the code

> **PRODUCT IS NOW WEDDING-ONLY (2026-07-09).** Wishly is a wedding gift
> registry: two partners, a venue, a wedding date, an invitation-style guest
> page, and gifts that are for the wedding or married life. Birthday/other
> occasions, persona filters (for her/him, student/working) and prices were
> all removed. Palette is maroon/gold/ivory. Real couple photos + a hero
> video live in `public/wedding/`. See the latest change-log entry for detail.


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
3. **Editorial, quiet, premium tone — NO emoji in the UI.** The owner
   explicitly rejected a first version that was pastel-gradient + emoji-heavy
   ("cringe"). Voice: short, warm, confident sentences ("Three people brought
   you the same perfume. Never again."). Copy is minimal — every extra
   sentence must earn its place. References the owner likes:
   heywavelength.com, Zepto product cards, and his own `crushky` project
   (Playfair Display + DM Sans, cream/ink palette).
4. **Free hosting forever**: must stay within Vercel + Supabase free tiers.
5. Amazon links must ALWAYS carry the affiliate tag — use `withAffiliateTag()`
   or `amazonSearchLink()` from `lib/config.ts`, never hand-build URLs.

## 3. Tech stack & architecture

- **Next.js 15 (App Router, TypeScript) + Tailwind CSS v4** (via
  `@tailwindcss/postcss`; NO tailwind.config file — v4 style).
- **Design system** (see `app/globals.css` tokens): warm paper background
  `--bg #faf7f1`, white cards, `--tile #f4efe6` image tiles, ink `#1c1a17`,
  muted `#96907f`, hairlines `--line #e9e2d4`, terracotta accent `#9d4433`
  (used sparingly — errors/links). Buttons are ink-filled or hairline-outline
  pills; cards are rounded-2xl with 1px borders, no drop shadows except the
  sticky bar. Product photos sit on the tile colour with
  `mix-blend-multiply` so white-background shots blend in.
- **Fonts**: `next/font/google` — Playfair Display (`--font-playfair`,
  headings via `.font-display`) and DM Sans (`--font-dm`, body). Wired in
  `app/globals.css`. NOTE: the font CSS variables are set on `<body>` by
  next/font, so reference `var(--font-dm)` etc. directly in selectors —
  do NOT chain them through `@theme` at `:root` (they won't resolve there;
  this bug was hit and fixed on day 1).
- **Data**: Supabase Postgres, accessed ONLY from server code via the
  `postgres` (postgres.js) client and a single env var `DATABASE_URL`
  pointing at Supabase's **transaction pooler**
  (`aws-1-ap-southeast-2.pooler.supabase.com:6543`, project
  `qilzahxlaxumzpiolhji`). We deliberately do NOT use supabase-js/API keys:
  this project uses Supabase's new API-key format and its legacy JWT keys are
  rejected (`UNAUTHORIZED_INVALID_API_KEY_TYPE`), so direct Postgres is both
  simpler and the only path that was available. `prepare: false` is required
  (transaction pooling); the client is a `globalThis` singleton. RLS is
  enabled with no policies — irrelevant to us (we connect as table owner) but
  keeps PostgREST locked.
- **Demo mode**: if `DATABASE_URL` is missing, `lib/store.ts` falls back to
  an in-memory Map (survives HMR via `globalThis`). Never assume persistence
  in demo mode.
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
| `lib/catalog.ts` | The 8 categories × 10 curated products with real product photos (cdn.dummyjson.com — free stable CDN; swap for own images someday), occasion/for-who filters, 5 guest-page themes (quiet paper tints). Products link to affiliate-tagged amazon.in SEARCH results (not ASINs — they go stale). Luxury source items were renamed generic + given realistic INR prices. |
| `lib/types.ts` | Shared TypeScript types. |
| `lib/store.ts` | Storage interface + Supabase and in-memory implementations. |
| `app/page.tsx` | THE page (client): short hero + list builder + details step + success screen with share/manage links and WhatsApp share — the whole creator flow is this single page. |
| `app/create/page.tsx` | Redirects to `/` (the builder used to live here). |
| `app/b/[shareId]/page.tsx` | Guest page (dynamic, themed hero + message). |
| `components/ClaimGrid.tsx` | Client claim/undo UI, affiliate buy buttons. |
| `app/manage/[shareId]/page.tsx` | Creator dashboard (needs `?key=`). |
| `components/ShareBox.tsx` | Copy link + WhatsApp button on manage page. |
| `app/api/baskets/**` | The three API routes (create / claim / unclaim). |
| `supabase/schema.sql` | Run-once DB schema for Supabase SQL editor. |
| `.env.example` | Template for `.env.local`. |
| `.claude/launch.json` | Dev-server launch config (`wishly-dev`, port 3000). |

## 4. Conventions

- UI copy: sentence case, short, no emoji, no exclamation-mark enthusiasm.
  "Reserve" (not "claim/dibs") is the guest-facing verb.
- All user input is length-capped and trimmed server-side in the API routes —
  keep doing that for any new field.
- Product images: real photos from cdn.dummyjson.com (never hotlink Amazon
  images — against their ToS). User-added items may have an `imageUrl`
  (rendered with plain `<img>`); items without one show a serif initial on
  the tile colour.
- The owner removed the affiliate-disclosure line from the footer (didn't
  like it). NOTE for future: Amazon Associates ToS requires a disclosure
  somewhere on the site — revisit before scaling up affiliate use (a small
  /about page would satisfy it).
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

GitHub repo (vikramaditya26/wishly) → Vercel (auto-deploy on push). The env
var `DATABASE_URL` must be set in Vercel (same value as `.env.local`). See
README for the owner-facing step-by-step.

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
- **2026-07-03 (v2 redesign)** — Owner rejected v1's look ("cringe": pastel
  gradients, emoji everywhere, too much copy). Full redesign to an editorial
  aesthetic: Playfair Display + DM Sans, cream/ink/terracotta tokens, zero
  emoji, drastically shorter copy, "Reserve" wording. Builder merged into the
  home page (single-page flow; `/create` now redirects). Catalog rebuilt with
  real product photos from cdn.dummyjson.com (8 cats × 10; luxury items
  renamed generic with realistic INR prices; Sports category added; Toys/Baby
  dropped — no matching photos; "baby" occasion and "vibe" filter removed
  from types/UI). Guest-page themes are now 5 quiet paper tints. Footer
  affiliate-disclosure line removed at owner's request (see Conventions note).
  Verified end-to-end in preview (create → share → reserve → undo-token →
  manage) in demo mode.
- **2026-07-04** — Pushed to GitHub (vikramaditya26/wishly). SEO + share
  previews added: full metadata/OpenGraph in `app/layout.tsx` (metadataBase
  from `NEXT_PUBLIC_SITE_URL`/`VERCEL_URL`), `app/robots.ts` (home indexable;
  `/b/` and `/manage/` disallowed + noindex — lists are private-by-link),
  `app/opengraph-image.tsx` and `app/b/[shareId]/opengraph-image.tsx`
  (dynamic per-list WhatsApp/social preview cards via next/og), and
  `generateMetadata` on the guest page (title = "Priya's Wedding · Wishly").
  Owner's Supabase project exists (qilzahxlaxumzpiolhji, URL prefilled in
  `.env.local`); still pending: run `supabase/schema.sql` in its SQL editor
  and set SUPABASE_SERVICE_ROLE_KEY locally + on Vercel.
- **2026-07-04 (later)** — Database fully connected. Owner's project rejects
  legacy JWT API keys, so the store was rewritten from supabase-js to direct
  Postgres via postgres.js (`DATABASE_URL`, transaction pooler, region
  ap-southeast-2 — found by probing since the dashboard wasn't accessible
  from here). supabase-js dependency removed. Schema confirmed in the live
  DB; full flow (create → claim → guest/manage render → wrong-key rejection)
  tested against production Supabase and test rows cleaned up afterwards.
  `outputFileTracingRoot` pinned in next.config.ts (stray lockfile in the
  user's home folder confused Next's root detection). Vercel needs ONE env
  var now: `DATABASE_URL`. Note: `next dev` (incl. preview tooling) and
  `next build` must not run at the same time — they corrupt `.next`.
- **2026-07-06** — Paste-a-link product import: new `POST /api/product-preview`
  fetches any product URL server-side and extracts name/photo/price
  (Amazon-specific selectors: `#productTitle`, `landingImage`/`hiRes`,
  `.a-price .a-offscreen`; OpenGraph fallback for Flipkart/Myntra/etc; SSRF
  guard blocks localhost/IP-literal hosts). The "Add your own" modal now
  leads with the link field and auto-fills the rest (debounced fetch + photo
  preview). Verified with a live amazon.in product from a residential IP —
  CAVEAT: Amazon may bot-block fetches from Vercel datacenter IPs; the modal
  falls back to manual fields, and Amazon PA-API is the proper fix once the
  affiliate account qualifies. Guest-list OG card now renders up to 3 actual
  product photos (next/og fetches remote images). Diagnosed owner's "shared
  link shows nothing": the live DB had zero rows — their share test never ran
  against a deployment with `DATABASE_URL` set (localhost link or missing
  Vercel env var).
- **2026-07-06 (later)** — Fixed Vercel "No Output Directory named public"
  build failure. Vercel was auto-detecting the project as a static site
  (Framework Preset "Other") instead of Next.js, so it looked for `public/`
  instead of `.next`. Added `vercel.json` with `"framework": "nextjs"` to
  force correct detection regardless of the dashboard preset. Owner still
  MUST set `DATABASE_URL` in Vercel env vars for real (non-demo) mode.
- **2026-07-07 (v3 polish)** — Owner feedback round: (1) NO prices anywhere —
  cards show a category/brand line instead ("money parts" felt tacky on a
  gift list); price inputs/display removed, DB column kept but unused.
  (2) New hero ("Get gifts you'll actually love.") replacing the
  "three perfumes" line. (3) Warmer look: deeper cream bg with soft radial
  tints + SVG grain overlay, terracotta `.btn-primary` for all primary
  actions. (4) Filtering simplified: occasion moved to the details step (it
  describes the event, not the products); browsing is now just
  Everything/Her/Him + category tabs so products never vanish confusingly.
  (5) Custom items now render as cards in the grid (photo + "from amazon.in"
  + remove), and the details step shows a thumbnail strip of picks.
  (6) Manage page: item thumbnails + creator "undo" per reservation via new
  `POST /api/baskets/[shareId]/release` (manage-key-gated) and
  `releaseItem()` in both stores. (7) Guest name is remembered and locked
  after the first reservation in that browser ("Reserving as X — not you?")
  to reduce the multiple-names loophole; decided AGAINST Google sign-in for
  guests (breaks the no-login principle; creator undo + name lock is enough
  for MVP). Full flow re-verified locally against the live DB.
- **2026-07-07 (growth features)** — (1) `/my` page: lists every basket
  created in this browser (from `localStorage["wishly-my-baskets"]`) with
  "Open dashboard" + "Copy share link"; linked from the home header and the
  success screen. Device-local by design. (2) Post-reserve WhatsApp nudge:
  after reserving, a modal offers a prewritten "I've reserved X on
  <host>'s list — pick yours here" message (viral loop back into the same
  group). (3) `lib/confetti.ts`: dependency-free canvas confetti burst in
  brand colours on successful reservation; skips when
  prefers-reduced-motion; self-removes after ~1.5s. ClaimGrid now takes a
  `hostName` prop for the nudge message.
- **2026-07-08 (v4: shelves + editable lists)** — Owner feedback: too much
  scrolling, page too plain, no way to edit lists. (1) Browsing is now
  shelf-based: "Popular picks"/"Picked for her · student" spread-across-
  categories shelf + one horizontal snap-scroll row per category with
  "See all →" (tapping a category tab shows its full grid; "Browse all"
  returns to shelves). (2) Persona filters restored: For her/him AND
  Student/Working (`vibe` back in types; assigned via STUDENT_IDS/WORKING_IDS
  sets in catalog.ts, default "any"). (3) "Your picks · n" shelf shows
  everything selected (incl. custom items) with Remove. (4) Hero: rotated
  3-photo product collage (desktop), "Free · no app" line removed per owner.
  (5) Lists are editable after creation: `POST/DELETE
  /api/baskets/[shareId]/items` (manage-key-gated) + `addItem`/`removeItem`
  in both stores; manage page has "+ Add a gift" (shared
  `components/AddGiftModal.tsx`, extracted from the builder) and per-item
  "remove" (warns if the gift was already reserved). Full add/remove/guest
  round trip verified locally against the live DB.
- **2026-07-08 (v5: soul pass)** — Owner: site felt "dead", colours not
  festive, picker looked broken, no footer, no dashboard link after creating,
  no way to delete a saved list, date showed year. Researched US gifting
  sites (Babylist etc. — warm coral/terracotta + playful accents). Changes:
  (1) Global gift-wrap ribbon in `app/layout.tsx` (5-colour gradient bar).
  (2) THEMES restructured with a strong `deep` colour (marigold/rose/mehendi/
  sky/lavender) that now drives the guest ribbon, headline eyebrow, message
  card border, countdown pill AND the picker swatches — swatches were nearly
  identical tints before (why owner thought colour selection was "not
  working"; it worked, just invisibly). (3) Home hero: rotating occasion word
  (`OCCASION_WORDS`, 2.2s), blurred colour blobs, festive dots on category
  shelves, numbered "How it works" section, and a full 3-column footer
  (brand / links / occasion chips / copyright) — page had nothing below the
  grid before. (4) Success screen now has a prominent "Open my dashboard →"
  button (previously the only way on was the raw manage link). (5) Guest date
  is DD Month (no year) + a live "N days to go" countdown pill (<=90 days).
  (6) Delete-a-list: new `DELETE /api/baskets/[shareId]` (manage-key-gated) +
  `deleteBasket()` in both stores; `/my` cards get a "Delete this list"
  action that removes from DB and localStorage, plus a colour accent strip.
  All verified locally against live DB (create→theme→countdown→delete→link
  dies; wrong-key delete rejected 403).
- **2026-07-09 (WEDDING PIVOT — major)** — Repositioned the whole product as a
  wedding gift registry. Data: `baskets` gained `partner_two` + `venue`
  columns (migration run on live DB; also in schema.sql); `host_name` = partner
  one; `occasion` is always 'wedding' and no longer read. Types dropped
  Occasion/ForWho/Vibe and item price/emoji. Catalog rebuilt around 5 wedding
  shelves (Home & Furniture, Decor & Lighting, Kitchen & Dining, For the
  Couple, Honeymoon & Tech) — all dummyjson photos, no persona filters.
  THEMES → TEMPLATES (Royal Maroon / Marigold / Rose Petals / Classic Ivory /
  Mehndi Green), each with a `deep` colour + hero photo from `public/wedding/`.
  Palette in globals.css is maroon `#7c1d2b` / gold `#c19a3f` / ivory. Home:
  full-bleed autoplay/muted/loop VIDEO hero (`public/wedding/reel.mp4`), "How
  it works" ABOVE the gifts (no numbers), gift shelves, Invitation-templates
  showcase, Resources section (RESOURCES in catalog.ts), full footer. Details
  step collects both partner names + venue + date + note + template with a live
  invitation preview. Guest page is now a wedding invitation (template hero
  photo, "…are getting married", couple names, venue, date, countdown, message,
  then reservable gifts). Owner photos copied to `public/wedding/`. `/my`,
  manage page, OG images + metadata reworded to registry/couple. Verified end
  to end locally against the live DB.
- **2026-07-10 (PREMIUM INDIAN WEDDING REDESIGN — major)** — Full aesthetic
  overhaul to a Sabyasachi/invitation feel (owner shared lotus/peacock/mandala
  invite references). Fonts: Cinzel (names/logo), Cormorant Garamond
  (headings), Poppins (body) via next/font. Palette: ivory/maroon/royal-red/
  emerald/champagne-gold/rose/saffron with CSS design tokens + helper classes
  (.btn-primary maroon-gradient, .btn-gold-fill shimmering gold, .card /
  .card-lift, .gold-frame, .eyebrow, .mandala-bg) in globals.css. New
  `components/Decor.tsx` = hand-drawn SVG motifs (Lotus, Mandala, Paisley,
  PeacockFeather, FloralCorner, TempleArch, GoldDivider) used at low opacity
  as ornaments. `components/Petals.tsx` = CSS falling-petal layer (reduced-
  motion aware). `lib/confetti.ts` reworked to marigold-petal + gold-sparkle
  burst; fires on add-gift (at cursor), reserve, and registry-create. Home
  redesigned: "Celebrate Love. Celebrate Together." hero with floral corners +
  peacock feathers, 4-step illustrated How-It-Works timeline (step 2 "Add your
  own" highlighted), maroon "Looking for something special?" add-your-own
  centrepiece, gold-framed template cards, ornate maroon footer with mandala/
  peacock; REMOVED the planning/resources section entirely; sticky continue is
  now a shimmering gold "Continue to your invitation" pill. Guest page is a
  full wedding invitation: template-photo hero, an emotional invitation letter
  in a gold frame, then the registry. Dashboard rebranded "My Wedding
  Registry" with a maroon welcome banner + Total/Reserved/Available stat cards
  + a gold progress bar. Success/share screen: congratulations, copy link,
  WhatsApp, Email, and a QR code (api.qrserver.com encoding the public share
  URL) + confetti. **Add-your-own now supports real image upload** (tap or
  drag-drop) — downscaled in-browser via canvas to a ~500px JPEG data URL and
  stored inline on the item (fixes owner's "uploaded images not displaying";
  imageUrl caps raised to 300k in the create + items APIs). All copy rewritten
  warmer/emotional. Verified locally against live DB: home sections, fonts
  (Cinzel/Cormorant/Poppins in CSS), invitation letter, dashboard stats, and a
  data-URL uploaded photo persisting + rendering on the guest page.
