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
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "long" });
}

function daysToGo(d?: string): string | null {
  if (!d) return null;
  const date = new Date(d + "T00:00:00");
  if (isNaN(date.getTime())) return null;
  const days = Math.ceil((date.getTime() - Date.now()) / 86400000);
  if (days < 0 || days > 90) return null;
  if (days === 0) return "It's today!";
  if (days === 1) return "Tomorrow!";
  return `${days} days to go`;
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
  const countdown = daysToGo(basket.eventDate);

  return (
    <main className="min-h-screen pb-20" style={{ background: theme.bg }}>
      {/* theme ribbon */}
      <div className="h-1.5 w-full" style={{ background: theme.deep }} aria-hidden />
      <div className="max-w-4xl mx-auto px-6 pt-10">
        <p className="font-display text-xl text-center">{SITE_NAME}</p>

        <div className="text-center mt-12 animate-rise">
          <p
            className="text-xs font-medium uppercase tracking-[0.25em]"
            style={{ color: theme.deep }}
          >
            You&apos;re invited to pick a gift
          </p>
          <h1 className="font-display text-5xl sm:text-6xl leading-tight mt-4">
            {headline(basket.occasion, basket.hostName)}
          </h1>
          {(date || countdown) && (
            <div className="mt-4 flex items-center justify-center gap-3">
              {date && (
                <span className="text-sm uppercase tracking-widest text-[var(--muted)]">{date}</span>
              )}
              {countdown && (
                <span
                  className="text-xs font-medium px-3 py-1 rounded-full text-white"
                  style={{ background: theme.deep }}
                >
                  {countdown}
                </span>
              )}
            </div>
          )}
          {basket.message && (
            <div
              className="mt-8 max-w-xl mx-auto bg-white/60 rounded-2xl px-6 py-5 border-l-4 text-left"
              style={{ borderLeftColor: theme.deep }}
            >
              <p className="font-display italic text-lg leading-relaxed">
                &ldquo;{basket.message}&rdquo;
              </p>
              <p className="mt-2 text-sm text-[var(--muted)]">— {basket.hostName}</p>
            </div>
          )}
        </div>

        <p className="mt-12 text-center text-sm text-[var(--muted)]">
          These are gifts {basket.hostName.split(" ")[0]} would love. Reserve one — quietly — so
          nothing gets bought twice.
        </p>

        <ClaimGrid
          shareId={basket.shareId}
          initialItems={basket.items}
          tileColor={theme.tile}
          hostName={basket.hostName}
        />

        <footer className="mt-20 pt-8 border-t border-black/5 text-center">
          <p className="font-display text-lg">Someone you love has a day coming up too.</p>
          <Link
            href="/"
            className="btn-primary inline-block mt-4 px-8 py-2.5 text-sm"
            style={{ background: theme.deep }}
          >
            Make your own list — it&apos;s free
          </Link>
          <p className="mt-4 text-xs text-[var(--muted)]">
            Made with {SITE_NAME} — gift lists for every occasion.
          </p>
        </footer>
      </div>
    </main>
  );
}
