-- Wishly database schema.
-- Run this ONCE in your Supabase project: Dashboard -> SQL Editor -> New query
-- -> paste everything -> Run.

create table if not exists baskets (
  id uuid primary key default gen_random_uuid(),
  share_id text unique not null,
  manage_key text not null,
  host_name text not null,      -- partner one's name
  partner_two text,             -- partner two's name (weddings)
  venue text,                   -- where the wedding is
  occasion text not null,       -- always 'wedding' now
  message text default '',
  theme text default 'royal',   -- invitation template id
  event_date text,
  created_at timestamptz default now()
);

create table if not exists basket_items (
  id text primary key,
  basket_id uuid not null references baskets(id) on delete cascade,
  name text not null,
  emoji text,
  image_url text,
  price text,
  url text,
  claimed_by text,
  claim_token text,
  claimed_at timestamptz,
  position int default 0
);

create index if not exists basket_items_basket_id_idx on basket_items (basket_id);

-- Curated gifts the site owner adds from the admin panel (/admin). Shown to
-- everyone, merged with the built-in catalog in lib/catalog.ts.
create table if not exists catalog_items (
  id text primary key,
  category text not null,
  name text not null,
  image_url text,
  buy_url text,
  position int default 0,
  created_at timestamptz default now()
);

-- Lock both tables down: no anonymous/public access at all.
-- The website talks to the database only from the server using the
-- service role key, which bypasses row level security.
alter table baskets enable row level security;
alter table basket_items enable row level security;
alter table catalog_items enable row level security;
