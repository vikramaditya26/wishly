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

export const metadata: Metadata = {
  title: `${SITE_NAME} — gift lists that end duplicate gifts`,
  description:
    "Build a wishlist for your birthday, wedding or new home. Share one link — friends quietly reserve gifts, so no one buys the same thing twice. Free, no app, no signup.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${dmSans.variable}`}>{children}</body>
    </html>
  );
}
