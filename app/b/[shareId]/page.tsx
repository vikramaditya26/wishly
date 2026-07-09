import Link from "next/link";
import { getStore } from "@/lib/store";
import { TEMPLATES } from "@/lib/catalog";
import { SITE_NAME } from "@/lib/config";
import { ClaimGrid } from "@/components/ClaimGrid";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  const basket = await getStore().getBasket(shareId).catch(() => null);
  const couple = basket ? coupleNames(basket.hostName, basket.partnerTwo) : SITE_NAME;
  const title = basket ? `${couple}'s Wedding Registry · ${SITE_NAME}` : `Wedding Registry · ${SITE_NAME}`;
  const description = basket?.message
    ? basket.message.slice(0, 160)
    : "Reserve a wedding gift for the couple — quietly, so nothing gets bought twice.";
  return { title, description, robots: { index: false, follow: false }, openGraph: { title, description } };
}

function coupleNames(one: string, two?: string): string {
  return two ? `${one} & ${two}` : one;
}

function prettyDate(d?: string): string | null {
  if (!d) return null;
  const date = new Date(d + "T00:00:00");
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
}

function daysToGo(d?: string): string | null {
  if (!d) return null;
  const date = new Date(d + "T00:00:00");
  if (isNaN(date.getTime())) return null;
  const days = Math.ceil((date.getTime() - Date.now()) / 86400000);
  if (days < 0 || days > 400) return null;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `${days} days to go`;
}

export default async function GuestPage({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  const basket = await getStore().getBasket(shareId);

  if (!basket) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-3xl">This registry doesn&apos;t exist.</h1>
        <p className="text-[var(--muted)] mt-3 text-sm">The link may be wrong, or it was removed.</p>
        <Link href="/" className="btn-primary mt-8 px-6 py-2.5 text-sm">
          Make your own on {SITE_NAME}
        </Link>
      </main>
    );
  }

  const tpl = TEMPLATES.find((t) => t.id === basket.theme) ?? TEMPLATES[0];
  const couple = coupleNames(basket.hostName, basket.partnerTwo);
  const date = prettyDate(basket.eventDate);
  const countdown = daysToGo(basket.eventDate);

  return (
    <main className="min-h-screen pb-20" style={{ background: tpl.bg }}>
      {/* invitation hero */}
      <section className="relative h-[70vh] min-h-[440px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={tpl.hero} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${tpl.deep}f5, ${tpl.deep}55 55%, ${tpl.deep}77)` }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6">
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/80">Together with their families</p>
          <div className="mt-5 flex items-center gap-4">
            <span className="h-px w-10 bg-[var(--gold-soft)]" />
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--gold-soft)]">are getting married</p>
            <span className="h-px w-10 bg-[var(--gold-soft)]" />
          </div>
          <h1 className="font-display text-5xl sm:text-7xl leading-tight mt-5">
            {basket.hostName}
            {basket.partnerTwo && (
              <>
                <span className="block text-3xl sm:text-4xl my-2 text-[var(--gold-soft)]">&amp;</span>
                {basket.partnerTwo}
              </>
            )}
          </h1>
          {(date || basket.venue) && (
            <div className="mt-6 space-y-1">
              {date && <p className="text-sm tracking-wide">{date}</p>}
              {basket.venue && <p className="text-sm text-white/85">{basket.venue}</p>}
            </div>
          )}
          {countdown && (
            <span className="mt-5 text-xs font-medium px-4 py-1.5 rounded-full bg-white/15 border border-white/30 backdrop-blur">
              {countdown}
            </span>
          )}
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6">
        {basket.message && (
          <div className="max-w-xl mx-auto -mt-8 relative bg-[var(--surface)] rounded-2xl px-6 py-5 border-l-4 shadow-sm" style={{ borderLeftColor: tpl.deep }}>
            <p className="font-display italic text-lg leading-relaxed">&ldquo;{basket.message}&rdquo;</p>
            <p className="mt-2 text-sm text-[var(--muted)]">— {couple}</p>
          </div>
        )}

        <div className="text-center mt-14">
          <p className="text-xs uppercase tracking-[0.3em]" style={{ color: tpl.deep }}>Their registry</p>
          <div className="gold-rule my-4 max-w-20 mx-auto" />
          <p className="text-sm text-[var(--muted)] max-w-md mx-auto">
            Reserve a gift — quietly. Your name goes on it so no one else brings the same thing.
          </p>
        </div>

        <ClaimGrid shareId={basket.shareId} initialItems={basket.items} tileColor={tpl.tile} hostName={couple} accent={tpl.deep} />

        <footer className="mt-20 pt-8 border-t border-black/5 text-center">
          <p className="font-display text-lg">Getting married soon too?</p>
          <Link href="/" className="btn-primary inline-block mt-4 px-8 py-2.5 text-sm" style={{ background: tpl.deep }}>
            Make your own registry — free
          </Link>
          <p className="mt-4 text-xs text-[var(--muted)]">Made with {SITE_NAME}</p>
        </footer>
      </div>
    </main>
  );
}
