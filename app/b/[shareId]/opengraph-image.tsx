import { ImageResponse } from "next/og";
import { getStore } from "@/lib/store";
import { SITE_NAME } from "@/lib/config";
import type { Occasion } from "@/lib/types";

// The card shown when a wishlist link is shared on WhatsApp / social.
export const alt = `A gift list on ${SITE_NAME}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function headline(occasion: Occasion, name: string): string {
  switch (occasion) {
    case "birthday": return `${name}'s Birthday`;
    case "wedding": return `${name}'s Wedding`;
    case "anniversary": return `${name}'s Anniversary`;
    case "housewarming": return `${name}'s New Home`;
    default: return `${name}'s Wishlist`;
  }
}

export default async function OgImage({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  const basket = await getStore().getBasket(shareId).catch(() => null);
  const title = basket ? headline(basket.occasion, basket.hostName) : `A gift list on ${SITE_NAME}`;
  const count = basket ? basket.items.length : 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "80px",
          background: "#faf7f1",
          color: "#1c1a17",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ fontSize: 36 }}>{SITE_NAME}</div>
        <div style={{ fontSize: 88, marginTop: 44, lineHeight: 1.1, maxWidth: 1000 }}>{title}</div>
        <div style={{ fontSize: 32, marginTop: 40, color: "#96907f" }}>
          {count > 0
            ? `${count} gift${count > 1 ? "s" : ""} to choose from — reserve one quietly`
            : "Pick a gift and reserve it quietly"}
        </div>
      </div>
    ),
    size
  );
}
