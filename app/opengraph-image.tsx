import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/config";

// The card shown when the home page is shared on WhatsApp / social.
export const alt = `${SITE_NAME} — wedding registries without the duplicate gifts`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#fbf6ee",
          color: "#2a1417",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ fontSize: 40, letterSpacing: -1, color: "#7c1d2b" }}>{SITE_NAME}</div>
        <div style={{ fontSize: 84, marginTop: 40, lineHeight: 1.1, maxWidth: 950 }}>
          Gifts you&apos;ll treasure, not return.
        </div>
        <div style={{ fontSize: 32, marginTop: 36, color: "#9a8574" }}>
          The wedding registry · one link · every guest brings something different
        </div>
      </div>
    ),
    size
  );
}
