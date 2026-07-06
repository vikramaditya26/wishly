import { ImageResponse } from "next/og";
import { getStore } from "@/lib/store";
import { SITE_NAME } from "@/lib/config";
import type { Occasion } from "@/lib/types";

// The card shown when a wishlist link is shared on WhatsApp / social.
// Shows the list's actual product photos so the preview feels real.
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
  const photos = (basket?.items ?? [])
    .map((i) => i.imageUrl)
    .filter((u): u is string => !!u && /^https:\/\//.test(u))
    .slice(0, 3);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#faf7f1",
          color: "#1c1a17",
          fontFamily: "Georgia, serif",
          padding: "64px 72px",
        }}
      >
        <div style={{ fontSize: 34 }}>{SITE_NAME}</div>
        <div style={{ fontSize: 72, marginTop: 28, lineHeight: 1.1, maxWidth: 1050 }}>{title}</div>
        <div style={{ display: "flex", flex: 1, alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ fontSize: 30, color: "#96907f", paddingBottom: 24 }}>
            {count > 0
              ? `${count} gift${count > 1 ? "s" : ""} to choose from — reserve one quietly`
              : "Pick a gift and reserve it quietly"}
          </div>
          {photos.length > 0 && (
            <div style={{ display: "flex", gap: 20 }}>
              {photos.map((src, i) => (
                <div
                  key={i}
                  style={{
                    width: 190,
                    height: 190,
                    background: "#f4efe6",
                    borderRadius: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #e9e2d4",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    width={150}
                    height={150}
                    style={{ objectFit: "contain" }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    ),
    size
  );
}
