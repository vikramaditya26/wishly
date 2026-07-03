import { NextRequest, NextResponse } from "next/server";
import { getStore, NewBasketInput } from "@/lib/store";
import type { BasketItem, Occasion } from "@/lib/types";

const OCCASIONS: Occasion[] = ["birthday", "wedding", "anniversary", "housewarming", "justbecause"];

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
  const occasion = OCCASIONS.includes(body.occasion as Occasion)
    ? (body.occasion as Occasion)
    : "birthday";
  const message = clean(body.message, 500);
  const theme = clean(body.theme, 30) || "confetti";
  const eventDate = clean(body.eventDate, 20) || undefined;
  const rawItems = Array.isArray(body.items) ? body.items.slice(0, 60) : [];

  const items: Omit<BasketItem, "claimedBy">[] = rawItems
    .map((it: Record<string, unknown>, i: number) => ({
      id: clean(it.id, 40) || `item-${i}`,
      name: clean(it.name, 120),
      emoji: clean(it.emoji, 10) || undefined,
      imageUrl: clean(it.imageUrl, 500) || undefined,
      price: clean(it.price, 40) || undefined,
      url: clean(it.url, 500) || undefined,
    }))
    .filter((it) => it.name.length > 0);

  if (!hostName) {
    return NextResponse.json({ error: "Please tell us your name 💛" }, { status: 400 });
  }
  if (items.length === 0) {
    return NextResponse.json({ error: "Add at least one gift to your basket 🎁" }, { status: 400 });
  }

  const input: NewBasketInput = { hostName, occasion, message, theme, eventDate, items };
  const basket = await getStore().createBasket(input);
  return NextResponse.json({ shareId: basket.shareId, manageKey: basket.manageKey });
}
