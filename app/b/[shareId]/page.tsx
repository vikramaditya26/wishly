import Link from "next/link";
import { getStore } from "@/lib/store";
import { THEMES } from "@/lib/catalog";
import { SITE_NAME } from "@/lib/config";
import { ClaimGrid } from "@/components/ClaimGrid";
import type { Occasion } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;
  const basket = await getStore().getBasket(shareId).catch(() => null);
  const title = basket
    ? `${headline(basket.occasion, basket.hostName)} · ${SITE_NAME}`
    : `Gift list · ${SITE_NAME}`;
  const description = basket?.message
    ? basket.message.slice(0, 160)
    : "Pick a gift and reserve it quietly, so nothing gets bought twice.";
  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description },
  };
}

function headline(occasion: Occasion, name: string): string {
  switch (occasion) {
    case "birthday": return `${name}'s Birthday`;
    case "wedding": return `${name}'s Wedding`;
    case "anniversary": return `${name}'s Anniversary`;
    case "housewarming": return `${name}'s New Home`;
    default: return `${name}'s Wishlist`;
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
      <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-3xl">This list doesn&apos;t exist.</h1>
        <p className="text-[var(--muted)] mt-3 text-sm">The link may be wrong, or the list was removed.</p>
        <Link
          href="/"
          className="mt-8 px-6 py-2.5 rounded-full bg-[var(--ink)] text-white text-sm font-medium"
        >
          Make your own on {SITE_NAME}
        </Link>
      </main>
    );
  }

  const theme = THEMES.find((t) => t.id === basket.theme) ?? THEMES[0];
  const date = prettyDate(basket.eventDate);

  return (
    <main className="min-h-screen pb-20" style={{ background: theme.bg }}>
      <div className="max-w-4xl mx-auto px-6 pt-10">
        <p className="font-display text-xl text-center">{SITE_NAME}</p>

        <div className="text-center mt-14 animate-rise">
          <h1 className="font-display text-5xl sm:text-6xl leading-tight">
            {headline(basket.occasion, basket.hostName)}
          </h1>
          {date && (
            <p className="mt-3 text-sm uppercase tracking-widest text-[var(--muted)]">{date}</p>
          )}
          {basket.message && (
            <p className="font-display italic text-lg mt-8 max-w-xl mx-auto leading-relaxed">
              &ldquo;{basket.message}&rdquo;
            </p>
          )}
        </div>

        <p className="mt-14 text-center text-sm text-[var(--muted)]">
          These are gifts {basket.hostName.split(" ")[0]} would love. Reserve one — quietly — so
          nothing gets bought twice.
        </p>

        <ClaimGrid
          shareId={basket.shareId}
          initialItems={basket.items}
          tileColor={theme.tile}
          hostName={basket.hostName}
        />

        <footer className="mt-20 pt-6 border-t border-black/5 text-center text-xs text-[var(--muted)]">
          Made with{" "}
          <Link href="/" className="underline underline-offset-2 hover:text-[var(--ink)]">
            {SITE_NAME}
          </Link>{" "}
          — free gift lists for every occasion.
        </footer>
      </div>
    </main>
  );
}
