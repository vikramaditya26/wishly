// ---------------------------------------------------------------------------
// Storage layer. Two implementations behind one interface:
//   - Supabase (real): used when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are
//     set (in .env.local locally, or in Vercel env settings when deployed).
//   - In-memory (demo): used otherwise, so the site works out of the box for
//     local preview. Baskets vanish when the server restarts.
//
// All access goes through server-side API routes - the service role key is
// never exposed to the browser, and there is no client-side Supabase usage.
// ---------------------------------------------------------------------------

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { customAlphabet } from "nanoid";
import type { Basket, BasketItem, BasketWithSecret, Occasion } from "./types";

// URL-friendly, no confusing chars (no 0/O, 1/l).
const shortId = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 10);
const secretId = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 24);

export interface NewBasketInput {
  hostName: string;
  occasion: Occasion;
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
      occasion: input.occasion,
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
};

// ------------------------------ supabase -----------------------------------

function supabaseClient(): SupabaseClient {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

interface ItemRow {
  id: string;
  basket_id: string;
  name: string;
  emoji: string | null;
  image_url: string | null;
  price: string | null;
  url: string | null;
  claimed_by: string | null;
  claim_token: string | null;
  position: number;
}

function rowToItem(r: ItemRow): BasketItem {
  return {
    id: r.id,
    name: r.name,
    emoji: r.emoji ?? undefined,
    imageUrl: r.image_url ?? undefined,
    price: r.price ?? undefined,
    url: r.url ?? undefined,
    claimedBy: r.claimed_by,
  };
}

const supabaseStore: Store = {
  async createBasket(input) {
    const sb = supabaseClient();
    const shareId = shortId();
    const manageKey = secretId();
    const { data: basket, error } = await sb
      .from("baskets")
      .insert({
        share_id: shareId,
        manage_key: manageKey,
        host_name: input.hostName,
        occasion: input.occasion,
        message: input.message,
        theme: input.theme,
        event_date: input.eventDate ?? null,
      })
      .select()
      .single();
    if (error) throw error;

    const rows = input.items.map((it, i) => ({
      id: `${shareId}-${it.id}-${i}`,
      basket_id: basket.id,
      name: it.name,
      emoji: it.emoji ?? null,
      image_url: it.imageUrl ?? null,
      price: it.price ?? null,
      url: it.url ?? null,
      position: i,
    }));
    const { error: itemsError } = await sb.from("basket_items").insert(rows);
    if (itemsError) throw itemsError;

    return {
      shareId,
      manageKey,
      hostName: input.hostName,
      occasion: input.occasion,
      message: input.message,
      theme: input.theme,
      eventDate: input.eventDate,
      items: rows.map((r) => ({
        id: r.id,
        name: r.name,
        emoji: r.emoji ?? undefined,
        imageUrl: r.image_url ?? undefined,
        price: r.price ?? undefined,
        url: r.url ?? undefined,
        claimedBy: null,
      })),
      createdAt: basket.created_at,
    };
  },
  async getBasket(shareId) {
    const sb = supabaseClient();
    const { data: basket } = await sb.from("baskets").select().eq("share_id", shareId).maybeSingle();
    if (!basket) return null;
    const { data: items } = await sb
      .from("basket_items")
      .select()
      .eq("basket_id", basket.id)
      .order("position");
    return {
      shareId: basket.share_id,
      hostName: basket.host_name,
      occasion: basket.occasion,
      message: basket.message ?? "",
      theme: basket.theme ?? "confetti",
      eventDate: basket.event_date ?? undefined,
      items: ((items ?? []) as ItemRow[]).map(rowToItem),
      createdAt: basket.created_at,
    };
  },
  async verifyManageKey(shareId, key) {
    const sb = supabaseClient();
    const { data } = await sb
      .from("baskets")
      .select("id")
      .eq("share_id", shareId)
      .eq("manage_key", key)
      .maybeSingle();
    return !!data;
  },
  async claimItem(shareId, itemId, guestName) {
    const sb = supabaseClient();
    const { data: basket } = await sb.from("baskets").select("id").eq("share_id", shareId).maybeSingle();
    if (!basket) return { ok: false, reason: "notfound" };
    const token = secretId();
    // Atomic: only succeeds if the item is still unclaimed.
    const { data, error } = await sb
      .from("basket_items")
      .update({ claimed_by: guestName, claim_token: token, claimed_at: new Date().toISOString() })
      .eq("id", itemId)
      .eq("basket_id", basket.id)
      .is("claimed_by", null)
      .select();
    if (error) throw error;
    if (!data || data.length === 0) {
      const { data: exists } = await sb
        .from("basket_items")
        .select("id")
        .eq("id", itemId)
        .eq("basket_id", basket.id)
        .maybeSingle();
      return { ok: false, reason: exists ? "taken" : "notfound" };
    }
    return { ok: true, claimToken: token };
  },
  async unclaimItem(shareId, itemId, claimToken) {
    const sb = supabaseClient();
    const { data: basket } = await sb.from("baskets").select("id").eq("share_id", shareId).maybeSingle();
    if (!basket) return false;
    const { data, error } = await sb
      .from("basket_items")
      .update({ claimed_by: null, claim_token: null, claimed_at: null })
      .eq("id", itemId)
      .eq("basket_id", basket.id)
      .eq("claim_token", claimToken)
      .select();
    if (error) throw error;
    return !!data && data.length > 0;
  },
};

// ------------------------------ selection ----------------------------------

export function isDemoMode(): boolean {
  return !(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getStore(): Store {
  return isDemoMode() ? memoryStore : supabaseStore;
}
