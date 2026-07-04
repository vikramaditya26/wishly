import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/config";

// The card shown when the home page is shared on WhatsApp / social.
export const alt = `${SITE_NAME} — the gift list that ends duplicate gifts`;
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
          background: "#faf7f1",
          color: "#1c1a17",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ fontSize: 40, letterSpacing: -1 }}>{SITE_NAME}</div>
        <div style={{ fontSize: 84, marginTop: 40, lineHeight: 1.1, maxWidth: 950 }}>
          Never get the same gift twice.
        </div>
        <div style={{ fontSize: 32, marginTop: 36, color: "#96907f" }}>
          Pick gifts you&apos;d love · share one link · friends reserve quietly
        </div>
      </div>
    ),
    size
  );
}
