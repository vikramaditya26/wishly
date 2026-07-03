import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const { shareId } = await params;
  let body: { itemId?: string; claimToken?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const itemId = typeof body.itemId === "string" ? body.itemId.slice(0, 80) : "";
  const claimToken = typeof body.claimToken === "string" ? body.claimToken.slice(0, 60) : "";
  const ok = itemId && claimToken && (await getStore().unclaimItem(shareId, itemId, claimToken));
  if (!ok) {
    return NextResponse.json({ error: "Couldn't undo this claim." }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
