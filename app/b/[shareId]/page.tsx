import Link from "next/link";
import { getStore } from "@/lib/store";
import { THEMES } from "@/lib/catalog";
import { SITE_NAME } from "@/lib/config";
import { ClaimGrid } from "@/components/ClaimGrid";
import type { Occasion } from "@/lib/types";

export const dynamic = "force-dynamic";

function headline(occasion: Occasion, name: string): string {
  switch (occasion) {
    case "birthday": return `It's ${name}'s Birthday! 🎂`;
    case "wedding": return `${name} is getting married! 💍`;
    case "anniversary": return `${name}'s Anniversary 💖`;
    case "housewarming": return `${name} has a new home! 🏡`;
    case "baby": return `${name}'s Baby Shower 🍼`;
    default: return `${name}'s Wishlist ✨`;
  }
}

function prettyDate(d?: string): string | null {
  if (!d) return null;
  const date = new Date(d + "T00:00:00");
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export default async function GuestPage({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  const basket = await getStore().getBasket(shareId);

  if (!basket) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-pink-50 to-sky-50 flex flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl">🫠</div>
        <h1 className="font-display text-2xl font-extrabold text-slate-700 mt-4">This wishlist doesn&apos;t exist</h1>
        <p className="text-slate-500 mt-2 text-sm">The link might be wrong, or the wishlist was removed.</p>
        <Link href="/" className="mt-6 px-6 py-3 rounded-full bg-violet-600 text-white font-bold">
          Make your own on {SITE_NAME} 🎀
        </Link>
      </main>
    );
  }

  const theme = THEMES.find((t) => t.id === basket.theme) ?? THEMES[0];
  const date = prettyDate(basket.eventDate);

  return (
    <main className={`min-h-screen bg-gradient-to-b ${theme.pageBg} pb-16`}>
      <div className="max-w-3xl mx-auto px-4 pt-12">
        {/* themed hero */}
        <div className="text-center animate-popin">
          <div className="text-4xl tracking-widest select-none" aria-hidden>
            {theme.heroEmojis}
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-slate-800 mt-4">
            {headline(basket.occasion, basket.hostName)}
          </h1>
          {date && <p className="mt-2 font-bold text-slate-600">📅 {date}</p>}
          {basket.message && (
            <div className="mt-6 bg-white/80 backdrop-blur rounded-3xl p-5 shadow-sm border border-white max-w-xl mx-auto">
              <p className="text-slate-700 leading-relaxed italic">&ldquo;{basket.message}&rdquo;</p>
              <p className="mt-2 text-sm font-bold text-slate-500">— {basket.hostName} 💌</p>
            </div>
          )}
        </div>

        {/* how it works for guests */}
        <div className="mt-8 text-center">
          <p className="text-sm font-bold text-slate-600 bg-white/70 backdrop-blur inline-block px-5 py-2 rounded-full">
            👇 Tap a gift to secretly call dibs — {basket.hostName.split(" ")[0]} wished for all of these!
          </p>
        </div>

        <ClaimGrid shareId={basket.shareId} initialItems={basket.items} hostName={basket.hostName} />

        <footer className="mt-14 text-center">
          <p className="text-xs text-slate-500">
            Made with <Link href="/" className="font-bold text-violet-600 underline">{SITE_NAME}</Link> — free wishlists for
            birthdays, weddings &amp; more 🎁
          </p>
        </footer>
      </div>
    </main>
  );
}
