import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { SITE_NAME } from "@/lib/config";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["500", "600", "700"],
});
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  weight: ["400", "500", "700"],
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const TITLE = `${SITE_NAME} — the gift list that ends duplicate gifts`;
const DESCRIPTION =
  "Build a wishlist for your birthday, wedding or new home. Share one link on WhatsApp — friends quietly reserve gifts, so no one buys the same thing twice. Free, no app, no signup.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "gift list",
    "wishlist",
    "gift registry India",
    "birthday wishlist",
    "wedding gift list",
    "avoid duplicate gifts",
  ],
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${dmSans.variable}`}>
        {/* the ribbon — a thin gift-wrap stripe across every page */}
        <div
          aria-hidden
          className="h-1.5 w-full"
          style={{
            background:
              "linear-gradient(90deg, #d97742 0%, #c2565e 25%, #b98a2f 50%, #6f8f57 75%, #4f7ea8 100%)",
          }}
        />
        {children}
      </body>
    </html>
  );
}
