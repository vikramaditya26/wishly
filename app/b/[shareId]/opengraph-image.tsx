import { ImageResponse } from "next/og";
import { getStore } from "@/lib/store";
import { SITE_NAME } from "@/lib/config";

// The card shown when a registry link is shared on WhatsApp / social.
// Shows the registry's actual product photos so the preview feels real.
export const alt = `A wedding registry on ${SITE_NAME}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  const basket = await getStore().getBasket(shareId).catch(() => null);
  const couple = basket
    ? basket.partnerTwo
      ? `${basket.hostName} & ${basket.partnerTwo}`
      : basket.hostName
    : SITE_NAME;
  const title = basket ? `${couple}'s Wedding` : `A wedding registry on ${SITE_NAME}`;
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
          background: "#fbf6ee",
          color: "#2a1417",
          fontFamily: "Georgia, serif",
          padding: "64px 72px",
        }}
      >
        <div style={{ fontSize: 34, color: "#7c1d2b" }}>{SITE_NAME}</div>
        <div style={{ fontSize: 72, marginTop: 28, lineHeight: 1.1, maxWidth: 1050 }}>{title}</div>
        <div style={{ display: "flex", flex: 1, alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ fontSize: 30, color: "#9a8574", paddingBottom: 24 }}>
            {count > 0
              ? `${count} gift${count > 1 ? "s" : ""} on their registry — reserve one quietly`
              : "Reserve a wedding gift quietly"}
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
