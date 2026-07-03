import type { Metadata } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/config";
import "./globals.css";

const baloo = Baloo_2({ subsets: ["latin"], variable: "--font-baloo", weight: ["500", "600", "700", "800"] });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", weight: ["400", "600", "700", "800"] });

export const metadata: Metadata = {
  title: `${SITE_NAME} — ${SITE_TAGLINE}`,
  description:
    "Make a gift wishlist for your birthday, wedding or any occasion. Share one link. Friends secretly claim gifts so nobody buys the same thing twice. Free, no app, no login.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${baloo.variable} ${nunito.variable} antialiased text-slate-800`}>
        {children}
      </body>
    </html>
  );
}
