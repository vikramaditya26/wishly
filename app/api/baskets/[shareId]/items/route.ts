import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";

// Creator-only list editing from the manage page.
// POST adds a gift; DELETE removes one. Both require the manage key.

const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const { shareId } = await params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const key = clean(body.key, 60);
  const name = clean(body.name, 120);
  const url = clean(body.url, 500) || undefined;
  const imageUrl = clean(body.imageUrl, 300000) || undefined;
  if (!key || !name) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const store = getStore();
  if (!(await store.verifyManageKey(shareId, key))) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }
  const item = await store.addItem(shareId, { name, url, imageUrl });
  if (!item) {
    return NextResponse.json({ error: "List not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, item });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const { shareId } = await params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const key = clean(body.key, 60);
  const itemId = clean(body.itemId, 80);
  if (!key || !itemId) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const store = getStore();
  if (!(await store.verifyManageKey(shareId, key))) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }
  const ok = await store.removeItem(shareId, itemId);
  if (!ok) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
