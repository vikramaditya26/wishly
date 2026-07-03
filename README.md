# Wishly 🎀

**wish it. share it. no more duplicate gifts.**

A free, no-login gift wishlist website. Make a basket of gifts you actually want
(birthday, wedding, anniversary…), share one link on WhatsApp, and friends
secretly "call dibs" on gifts — so nobody buys the same thing twice.

Built with Next.js + Tailwind CSS + Supabase. Deploys free on Vercel.

---

## Run it on your computer

```bash
npm install
npm run dev
```

Open http://localhost:3000. Without any setup it runs in **demo mode**:
everything works, but baskets are stored in memory and disappear when you stop
the server. Good enough for playing around.

## Make it real (one-time setup, ~15 minutes)

### Step 1 — Create a free Supabase database

1. Go to [supabase.com](https://supabase.com) → **Start your project** → sign in with GitHub or Google.
2. **New project** → give it any name (e.g. `wishly`) → choose the region **Mumbai (ap-south-1)** → set any database password (you won't need it again) → **Create**.
3. Wait ~2 minutes for the project to be ready.
4. In the left sidebar open **SQL Editor** → **New query** → copy ALL of the file [`supabase/schema.sql`](supabase/schema.sql) from this repo, paste it, press **Run**. You should see "Success".
5. In the left sidebar open **Settings → API**. Keep this page open — you need two values:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **service_role key** (under "Project API keys" — click reveal). ⚠️ This key is secret. Never share it or put it in normal code — only in the env settings below.

### Step 2 — Put the keys in the project

For local use: copy `.env.example` to a new file called `.env.local` and fill in the two values.

### Step 3 — Put it on the internet (GitHub + Vercel, all free)

1. Create a repo on [github.com/new](https://github.com/new) (e.g. `wishly`), then push this folder:
   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/wishly.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) → sign in with GitHub → **Add New → Project** → import your `wishly` repo.
3. Before clicking Deploy, open **Environment Variables** and add:
   - `SUPABASE_URL` = your Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = your service_role key
4. Click **Deploy**. Done — you get a live link like `wishly-yourname.vercel.app`. Later you can attach a custom domain (₹500–800/year) in Vercel settings.

Every time you push new code to GitHub, Vercel redeploys automatically.

## Change the branding / affiliate tag

Everything lives in [`lib/config.ts`](lib/config.ts): site name, tagline, and
the Amazon Associates tag. The tag is automatically added to every Amazon link
on the site — including links users paste themselves.

## Edit the gift catalog

All 80 curated products are in [`lib/catalog.ts`](lib/catalog.ts) — plain text,
no database. Add/remove/edit products there and push.

## For AI agents

Read [`AGENT.md`](AGENT.md) before changing anything, and update it after.
