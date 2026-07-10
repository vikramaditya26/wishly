import type { Metadata } from "next";
import { Cinzel, Cormorant_Garamond, Poppins } from "next/font/google";
import { SITE_NAME } from "@/lib/config";
import "./globals.css";

// Cinzel — engraved roman caps for the couple's names & logo (invitation feel).
// Cormorant Garamond — elegant serif for headings.
// Poppins — clean, warm body.
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel", weight: ["500", "600", "700"] });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600", "700"],
});
const poppins = Poppins({ subsets: ["latin"], variable: "--font-poppins", weight: ["300", "400", "500", "600"] });

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const TITLE = `${SITE_NAME} — wedding registries, without the duplicate gifts`;
const DESCRIPTION =
  "Create your wedding gift registry, share one beautiful invitation link, and let loved ones reserve gifts privately — so no two people bring the same thing. Free, no app, no signup.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "wedding registry India",
    "wedding gift list",
    "shaadi gift registry",
    "wedding wishlist",
    "gift registry",
    "avoid duplicate wedding gifts",
  ],
  openGraph: { title: TITLE, description: DESCRIPTION, siteName: SITE_NAME, type: "website", locale: "en_IN" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${cinzel.variable} ${cormorant.variable} ${poppins.variable}`}>
        {/* gold-thread ribbon across every page */}
        <div aria-hidden className="wishly-ribbon" />
        {children}
      </body>
    </html>
  );
}
