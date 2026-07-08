import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";

// Creator-only: delete the whole list. Requires the manage key.
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const { shareId } = await params;
  let body: { key?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const key = typeof body.key === "string" ? body.key.slice(0, 60) : "";
  if (!key) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const ok = await getStore().deleteBasket(shareId, key);
  if (!ok) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }
  return NextResponse.json({ ok: true });
}
