import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const { shareId } = await params;
  let body: { itemId?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const itemId = typeof body.itemId === "string" ? body.itemId.slice(0, 80) : "";
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 60) : "";
  if (!itemId || !name) {
    return NextResponse.json({ error: "Please tell us your name 💛" }, { status: 400 });
  }

  const result = await getStore().claimItem(shareId, itemId, name);
  if (!result.ok) {
    const msg =
      result.reason === "taken"
        ? "Oops, someone just grabbed this one! 🏃💨"
        : "This basket or item doesn't exist anymore.";
    return NextResponse.json({ error: msg, reason: result.reason }, { status: 409 });
  }
  return NextResponse.json({ ok: true, claimToken: result.claimToken });
}
