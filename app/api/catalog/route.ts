import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

// Admin gate: the owner sets ADMIN_KEY in .env.local + Vercel. If it isn't set,
// admin writes are disabled (but the public catalog still lists fine).
function checkAdmin(key: string): boolean {
  const secret = process.env.ADMIN_KEY;
  return !!secret && key === secret;
}

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Public: everyone fetches the owner-added catalog items to merge into shelves.
export async function GET() {
  const items = await getStore().listCatalogItems().catch(() => []);
  return NextResponse.json({ items });
}

// Admin: add a curated gift shown to everyone.
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!process.env.ADMIN_KEY) {
    return NextResponse.json(
      { error: "Admin is not set up yet. Add an ADMIN_KEY in your environment settings." },
      { status: 503 }
    );
  }
  if (!checkAdmin(clean(body.key, 200))) {
    return NextResponse.json({ error: "Wrong admin password." }, { status: 403 });
  }

  const category = clean(body.category, 40);
  const name = clean(body.name, 120);
  const imageUrl = clean(body.imageUrl, 300000) || undefined;
  const buyUrl = clean(body.buyUrl, 500) || undefined;
  if (!category || !name) {
    return NextResponse.json({ error: "Category and name are required." }, { status: 400 });
  }

  const item = await getStore().addCatalogItem({ category, name, imageUrl, buyUrl });
  return NextResponse.json({ ok: true, item });
}

// Admin: remove a curated gift.
export async function DELETE(req: NextRequest) {
  let body: { key?: string; id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!checkAdmin(clean(body.key, 200))) {
    return NextResponse.json({ error: "Wrong admin password." }, { status: 403 });
  }
  const ok = await getStore().deleteCatalogItem(clean(body.id, 80));
  if (!ok) return NextResponse.json({ error: "Item not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
