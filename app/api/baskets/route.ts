import { NextRequest, NextResponse } from "next/server";
import { getStore, NewBasketInput } from "@/lib/store";
import type { BasketItem } from "@/lib/types";

const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const hostName = clean(body.hostName, 60);
  const partnerTwo = clean(body.partnerTwo, 60) || undefined;
  const venue = clean(body.venue, 120) || undefined;
  const message = clean(body.message, 500);
  const theme = clean(body.theme, 30) || "royal";
  const eventDate = clean(body.eventDate, 20) || undefined;
  const rawItems = Array.isArray(body.items) ? body.items.slice(0, 80) : [];

  const items: Omit<BasketItem, "claimedBy">[] = rawItems
    .map((it: Record<string, unknown>, i: number) => ({
      id: clean(it.id, 40) || `item-${i}`,
      name: clean(it.name, 120),
      // large cap so uploaded photos (stored as downscaled data URLs) fit
      imageUrl: clean(it.imageUrl, 300000) || undefined,
      url: clean(it.url, 500) || undefined,
    }))
    .filter((it) => it.name.length > 0);

  if (!hostName) {
    return NextResponse.json({ error: "Please add the couple's names." }, { status: 400 });
  }
  if (items.length === 0) {
    return NextResponse.json({ error: "Add at least one gift to your registry." }, { status: 400 });
  }

  const input: NewBasketInput = { hostName, partnerTwo, venue, message, theme, eventDate, items };
  const basket = await getStore().createBasket(input);
  return NextResponse.json({ shareId: basket.shareId, manageKey: basket.manageKey });
}
