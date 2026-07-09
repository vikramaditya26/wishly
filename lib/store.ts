// ---------------------------------------------------------------------------
// Storage layer. Two implementations behind one interface:
//   - Postgres (real): used when DATABASE_URL is set (in .env.local locally,
//     or in Vercel env settings when deployed). Points at the Supabase
//     connection pooler; the password acts as the only secret.
//   - In-memory (demo): used otherwise, so the site works out of the box for
//     local preview. Baskets vanish when the server restarts.
//
// All access happens in server code (API routes / server components) - the
// connection string is never exposed to the browser.
// ---------------------------------------------------------------------------

import postgres from "postgres";
import { customAlphabet } from "nanoid";
import type { Basket, BasketItem, BasketWithSecret } from "./types";

// URL-friendly, no confusing chars (no 0/O, 1/l).
const shortId = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 10);
const secretId = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 24);

export interface NewBasketInput {
  hostName: string;
  partnerTwo?: string;
  venue?: string;
  message: string;
  theme: string;
  eventDate?: string;
  items: Omit<BasketItem, "claimedBy">[];
}

export type ClaimResult =
  | { ok: true; claimToken: string }
  | { ok: false; reason: "taken" | "notfound" };

interface Store {
  createBasket(input: NewBasketInput): Promise<BasketWithSecret>;
  getBasket(shareId: string): Promise<Basket | null>;
  verifyManageKey(shareId: string, key: string): Promise<boolean>;
  claimItem(shareId: string, itemId: string, guestName: string): Promise<ClaimResult>;
  unclaimItem(shareId: string, itemId: string, claimToken: string): Promise<boolean>;
  /** Creator override from the manage page: clear a reservation without a token. */
  releaseItem(shareId: string, itemId: string): Promise<boolean>;
  /** Creator: add a gift to an existing list. Returns the new item. */
  addItem(shareId: string, item: Omit<BasketItem, "claimedBy" | "id">): Promise<BasketItem | null>;
  /** Creator: remove a gift from an existing list. */
  removeItem(shareId: string, itemId: string): Promise<boolean>;
  /** Creator: delete the whole list (verifies the manage key first). */
  deleteBasket(shareId: string, key: string): Promise<boolean>;
}

// ------------------------------ in-memory ---------------------------------

interface MemoryRecord extends BasketWithSecret {
  claimTokens: Record<string, string>; // itemId -> token
}

// Survives hot reloads in dev via globalThis.
const mem: Map<string, MemoryRecord> =
  (globalThis as { __wishlyMem?: Map<string, MemoryRecord> }).__wishlyMem ??
  ((globalThis as { __wishlyMem?: Map<string, MemoryRecord> }).__wishlyMem = new Map());

const memoryStore: Store = {
  async createBasket(input) {
    const basket: MemoryRecord = {
      shareId: shortId(),
      manageKey: secretId(),
      hostName: input.hostName,
      partnerTwo: input.partnerTwo,
      venue: input.venue,
      message: input.message,
      theme: input.theme,
      eventDate: input.eventDate,
      items: input.items.map((it) => ({ ...it, claimedBy: null })),
      createdAt: new Date().toISOString(),
      claimTokens: {},
    };
    mem.set(basket.shareId, basket);
    const { claimTokens: _tokens, ...out } = basket;
    return out;
  },
  async getBasket(shareId) {
    const b = mem.get(shareId);
    if (!b) return null;
    const { manageKey: _k, claimTokens: _t, ...pub } = b;
    return pub;
  },
  async verifyManageKey(shareId, key) {
    return mem.get(shareId)?.manageKey === key;
  },
  async claimItem(shareId, itemId, guestName) {
    const b = mem.get(shareId);
    const item = b?.items.find((i) => i.id === itemId);
    if (!b || !item) return { ok: false, reason: "notfound" };
    if (item.claimedBy) return { ok: false, reason: "taken" };
    item.claimedBy = guestName;
    const token = secretId();
    b.claimTokens[itemId] = token;
    return { ok: true, claimToken: token };
  },
  async unclaimItem(shareId, itemId, claimToken) {
    const b = mem.get(shareId);
    const item = b?.items.find((i) => i.id === itemId);
    if (!b || !item || b.claimTokens[itemId] !== claimToken) return false;
    item.claimedBy = null;
    delete b.claimTokens[itemId];
    return true;
  },
  async releaseItem(shareId, itemId) {
    const b = mem.get(shareId);
    const item = b?.items.find((i) => i.id === itemId);
    if (!b || !item || !item.claimedBy) return false;
    item.claimedBy = null;
    delete b.claimTokens[itemId];
    return true;
  },
  async addItem(shareId, item) {
    const b = mem.get(shareId);
    if (!b) return null;
    const newItem: BasketItem = { ...item, id: `${shareId}-added-${Date.now()}`, claimedBy: null };
    b.items.push(newItem);
    return newItem;
  },
  async removeItem(shareId, itemId) {
    const b = mem.get(shareId);
    if (!b) return false;
    const before = b.items.length;
    b.items = b.items.filter((i) => i.id !== itemId);
    delete b.claimTokens[itemId];
    return b.items.length < before;
  },
  async deleteBasket(shareId, key) {
    const b = mem.get(shareId);
    if (!b || b.manageKey !== key) return false;
    return mem.delete(shareId);
  },
};

// ------------------------------ postgres ----------------------------------

// One client per server process (globalThis survives dev hot reloads).
// prepare:false + small pool = safe with Supabase's transaction pooler.
function db() {
  const g = globalThis as { __wishlySql?: ReturnType<typeof postgres> };
  if (!g.__wishlySql) {
    g.__wishlySql = postgres(process.env.DATABASE_URL!, {
      ssl: "require",
      prepare: false,
      max: 5,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }
  return g.__wishlySql;
}

interface ItemRow {
  id: string;
  name: string;
  image_url: string | null;
  url: string | null;
  claimed_by: string | null;
}

function rowToItem(r: ItemRow): BasketItem {
  return {
    id: r.id,
    name: r.name,
    imageUrl: r.image_url ?? undefined,
    url: r.url ?? undefined,
    claimedBy: r.claimed_by,
  };
}

const postgresStore: Store = {
  async createBasket(input) {
    const sql = db();
    const shareId = shortId();
    const manageKey = secretId();
    const [basket] = await sql`
      insert into baskets (share_id, manage_key, host_name, partner_two, venue, occasion, message, theme, event_date)
      values (${shareId}, ${manageKey}, ${input.hostName}, ${input.partnerTwo ?? null},
              ${input.venue ?? null}, 'wedding', ${input.message}, ${input.theme},
              ${input.eventDate ?? null})
      returning id, created_at`;

    const rows = input.items.map((it, i) => ({
      id: `${shareId}-${it.id}-${i}`,
      basket_id: basket.id,
      name: it.name,
      image_url: it.imageUrl ?? null,
      url: it.url ?? null,
      position: i,
    }));
    await sql`insert into basket_items ${sql(rows)}`;

    return {
      shareId,
      manageKey,
      hostName: input.hostName,
      partnerTwo: input.partnerTwo,
      venue: input.venue,
      message: input.message,
      theme: input.theme,
      eventDate: input.eventDate,
      items: rows.map((r) => ({
        id: r.id,
        name: r.name,
        imageUrl: r.image_url ?? undefined,
        url: r.url ?? undefined,
        claimedBy: null,
      })),
      createdAt: new Date(basket.created_at).toISOString(),
    };
  },
  async getBasket(shareId) {
    const sql = db();
    const [basket] = await sql`select * from baskets where share_id = ${shareId}`;
    if (!basket) return null;
    const items = await sql`
      select id, name, image_url, url, claimed_by
      from basket_items where basket_id = ${basket.id} order by position`;
    return {
      shareId: basket.share_id,
      hostName: basket.host_name,
      partnerTwo: basket.partner_two ?? undefined,
      venue: basket.venue ?? undefined,
      message: basket.message ?? "",
      theme: basket.theme ?? "royal",
      eventDate: basket.event_date ?? undefined,
      items: (items as unknown as ItemRow[]).map(rowToItem),
      createdAt: new Date(basket.created_at).toISOString(),
    };
  },
  async verifyManageKey(shareId, key) {
    const sql = db();
    const rows = await sql`
      select id from baskets where share_id = ${shareId} and manage_key = ${key}`;
    return rows.length > 0;
  },
  async claimItem(shareId, itemId, guestName) {
    const sql = db();
    const [basket] = await sql`select id from baskets where share_id = ${shareId}`;
    if (!basket) return { ok: false, reason: "notfound" };
    const token = secretId();
    // Atomic: only succeeds if the item is still unclaimed.
    const updated = await sql`
      update basket_items
      set claimed_by = ${guestName}, claim_token = ${token}, claimed_at = now()
      where id = ${itemId} and basket_id = ${basket.id} and claimed_by is null
      returning id`;
    if (updated.length === 0) {
      const exists = await sql`
        select id from basket_items where id = ${itemId} and basket_id = ${basket.id}`;
      return { ok: false, reason: exists.length > 0 ? "taken" : "notfound" };
    }
    return { ok: true, claimToken: token };
  },
  async unclaimItem(shareId, itemId, claimToken) {
    const sql = db();
    const [basket] = await sql`select id from baskets where share_id = ${shareId}`;
    if (!basket) return false;
    const updated = await sql`
      update basket_items
      set claimed_by = null, claim_token = null, claimed_at = null
      where id = ${itemId} and basket_id = ${basket.id} and claim_token = ${claimToken}
      returning id`;
    return updated.length > 0;
  },
  async releaseItem(shareId, itemId) {
    const sql = db();
    const [basket] = await sql`select id from baskets where share_id = ${shareId}`;
    if (!basket) return false;
    const updated = await sql`
      update basket_items
      set claimed_by = null, claim_token = null, claimed_at = null
      where id = ${itemId} and basket_id = ${basket.id} and claimed_by is not null
      returning id`;
    return updated.length > 0;
  },
  async addItem(shareId, item) {
    const sql = db();
    const [basket] = await sql`select id from baskets where share_id = ${shareId}`;
    if (!basket) return null;
    const id = `${shareId}-added-${Date.now()}`;
    const [{ next }] = await sql`
      select coalesce(max(position), 0) + 1 as next from basket_items where basket_id = ${basket.id}`;
    await sql`
      insert into basket_items (id, basket_id, name, image_url, url, position)
      values (${id}, ${basket.id}, ${item.name}, ${item.imageUrl ?? null}, ${item.url ?? null}, ${next})`;
    return { id, name: item.name, imageUrl: item.imageUrl, url: item.url, claimedBy: null };
  },
  async removeItem(shareId, itemId) {
    const sql = db();
    const [basket] = await sql`select id from baskets where share_id = ${shareId}`;
    if (!basket) return false;
    const deleted = await sql`
      delete from basket_items where id = ${itemId} and basket_id = ${basket.id} returning id`;
    return deleted.length > 0;
  },
  async deleteBasket(shareId, key) {
    const sql = db();
    // basket_items cascade on delete (see schema.sql)
    const deleted = await sql`
      delete from baskets where share_id = ${shareId} and manage_key = ${key} returning id`;
    return deleted.length > 0;
  },
};

// ------------------------------ selection ----------------------------------

export function isDemoMode(): boolean {
  return !process.env.DATABASE_URL;
}

export function getStore(): Store {
  return isDemoMode() ? memoryStore : postgresStore;
}
