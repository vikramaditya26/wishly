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
2. **New project** → give it any name (e.g. `wishly`) → set a database password (SAVE it — you need it below) → **Create**.
3. Wait ~2 minutes, then open **SQL Editor** → **New query** → copy ALL of [`supabase/schema.sql`](supabase/schema.sql), paste, **Run**.

### Step 2 — Put the connection string in the project

1. In the dashboard click **Connect** (top bar) → copy the **Transaction pooler** string. It looks like
   `postgresql://postgres.abc123:[YOUR-PASSWORD]@aws-1-xx.pooler.supabase.com:6543/postgres`.
2. Replace `[YOUR-PASSWORD]` with your database password. If the password has special characters, URL-encode them (`@`→`%40`, `#`→`%23`, `$`→`%24`, `%`→`%25`).
3. Copy `.env.example` to a new file called `.env.local` and set `DATABASE_URL=` to that string.

### Step 3 — Put it on the internet (GitHub + Vercel, all free)

1. Create a repo on [github.com/new](https://github.com/new) (e.g. `wishly`), then push this folder:
   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/wishly.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) → sign in with GitHub → **Add New → Project** → import your `wishly` repo.
3. Before clicking Deploy, open **Environment Variables** and add:
   - `DATABASE_URL` = the same connection string as in your `.env.local`
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
