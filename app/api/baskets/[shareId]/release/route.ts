import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";

// Creator-only: clear someone's reservation from the manage page.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const { shareId } = await params;
  let body: { itemId?: string; key?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const itemId = typeof body.itemId === "string" ? body.itemId.slice(0, 80) : "";
  const key = typeof body.key === "string" ? body.key.slice(0, 60) : "";
  if (!itemId || !key) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const store = getStore();
  if (!(await store.verifyManageKey(shareId, key))) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }
  const ok = await store.releaseItem(shareId, itemId);
  if (!ok) {
    return NextResponse.json({ error: "Nothing to release" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
