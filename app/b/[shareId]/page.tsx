import Link from "next/link";
import { getStore } from "@/lib/store";
import { TEMPLATES } from "@/lib/catalog";
import { SITE_NAME } from "@/lib/config";
import { ClaimGrid } from "@/components/ClaimGrid";
import { Petals } from "@/components/Petals";
import { GoldDivider, Lotus, FloralCorner, Mandala } from "@/components/Decor";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  const basket = await getStore().getBasket(shareId).catch(() => null);
  const couple = basket ? coupleNames(basket.hostName, basket.partnerTwo) : SITE_NAME;
  const title = basket ? `${couple}'s Wedding Registry · ${SITE_NAME}` : `Wedding Registry · ${SITE_NAME}`;
  const description = basket?.message ? basket.message.slice(0, 160) : "Reserve a wedding gift for the couple — quietly, so nothing gets bought twice.";
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
        <Lotus className="h-10 w-10 text-[var(--gold)]" />
        <h1 className="font-display text-3xl mt-4">This registry doesn&apos;t exist.</h1>
        <p className="text-[var(--muted)] mt-3 text-sm">The link may be wrong, or it was removed.</p>
        <Link href="/" className="btn-primary mt-8 px-6 py-2.5 text-sm">Make your own on {SITE_NAME}</Link>
      </main>
    );
  }

  const tpl = TEMPLATES.find((t) => t.id === basket.theme) ?? TEMPLATES[0];
  const couple = coupleNames(basket.hostName, basket.partnerTwo);
  const one = basket.hostName;
  const two = basket.partnerTwo;
  const date = prettyDate(basket.eventDate);
  const countdown = daysToGo(basket.eventDate);

  return (
    <main className="min-h-screen pb-20" style={{ background: tpl.bg }}>
      <Petals />

      {/* invitation hero */}
      <section className="relative h-[78vh] min-h-[500px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={tpl.hero} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${tpl.deep}f7, ${tpl.deep}55 55%, ${tpl.deep}88)` }} />
        <FloralCorner className="absolute top-3 left-3 h-24 w-24 text-[var(--gold-soft)] opacity-70" />
        <FloralCorner className="absolute top-3 right-3 h-24 w-24 text-[var(--gold-soft)] opacity-70 -scale-x-100" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6">
          <p className="text-[11px] tracking-invite uppercase text-white/80">Together with the blessings of our families</p>
          <div className="mt-6 flex items-center gap-4">
            <span className="h-px w-10 bg-[var(--gold-soft)]" />
            <span className="text-xs tracking-invite uppercase text-[var(--gold-soft)]">are getting married</span>
            <span className="h-px w-10 bg-[var(--gold-soft)]" />
          </div>
          <h1 className="font-names text-4xl sm:text-6xl leading-tight mt-6">
            {one}
            {two && (
              <>
                <span className="block font-display italic text-3xl sm:text-4xl my-3 text-[var(--gold-soft)]">&amp;</span>
                {two}
              </>
            )}
          </h1>
          {(date || basket.venue) && (
            <div className="mt-7 space-y-1">
              {date && <p className="text-sm tracking-wide">{date}</p>}
              {basket.venue && <p className="text-sm text-white/85">{basket.venue}</p>}
            </div>
          )}
          {countdown && (
            <span className="mt-5 text-xs font-medium px-4 py-1.5 rounded-full bg-white/15 border border-white/30 backdrop-blur">{countdown}</span>
          )}
        </div>
      </section>

      {/* invitation letter */}
      <section className="max-w-2xl mx-auto px-6">
        <div className="relative -mt-10 card gold-frame p-8 sm:p-10 text-center">
          <Lotus className="h-9 w-9 mx-auto text-[var(--gold)]" />
          <p className="mt-5 font-display text-xl leading-relaxed text-[var(--ink)]">
            Together with the blessings of our families, we
            {two ? ` — ${one} & ${two} — ` : ` ${one} `}
            joyfully invite you to celebrate our wedding and to become a part of this beautiful new
            chapter of our lives.
          </p>
          <GoldDivider className="my-7" />
          <p className="text-[15px] text-[var(--muted)] leading-relaxed">
            As we begin our journey together, we&apos;ve gathered a small collection of gifts that
            will help us build our first home and countless memories. Your presence is the greatest
            gift we could ever receive — but for those who have kindly asked, we&apos;ve thoughtfully
            prepared this registry with things we&apos;ll truly cherish.
          </p>
          {basket.message && (
            <p className="mt-6 font-display italic text-lg leading-relaxed" style={{ color: tpl.deep }}>
              &ldquo;{basket.message}&rdquo;
            </p>
          )}
          <p className="mt-7 eyebrow" style={{ color: "var(--gold)" }}>With love</p>
          <p className="font-names text-2xl mt-1">{couple}</p>
        </div>
      </section>

      {/* registry */}
      <section className="mandala-bg relative max-w-4xl mx-auto px-6 overflow-hidden">
        <Mandala className="mandala-art -right-24 top-20 h-72 w-72" />
        <div className="relative text-center mt-16">
          <p className="eyebrow">Our registry</p>
          <h2 className="font-display text-3xl mt-2">Reserve a gift, with love</h2>
          <GoldDivider className="mt-4" />
          <p className="text-sm text-[var(--muted)] max-w-md mx-auto mt-4">
            Choose a gift and add your name to it. It stays private — and it makes sure no one else
            brings the very same thing.
          </p>
        </div>

        <ClaimGrid shareId={basket.shareId} initialItems={basket.items} tileColor={tpl.tile} hostName={couple} accent={tpl.deep} />

        <footer className="mt-20 pt-8 text-center">
          <GoldDivider />
          <p className="font-display text-xl mt-6">Getting married soon too?</p>
          <Link href="/" className="btn-primary inline-block mt-4 px-8 py-2.5 text-sm">Make your own registry — free</Link>
          <p className="mt-4 text-xs text-[var(--muted)]">Made with {SITE_NAME}</p>
        </footer>
      </section>
    </main>
  );
}
