import Link from "next/link";
import { getStore } from "@/lib/store";
import { SITE_NAME } from "@/lib/config";
import { ShareBox } from "@/components/ShareBox";
import { ManageList } from "@/components/ManageList";
import { GoldDivider, Lotus, Mandala } from "@/components/Decor";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `My Wedding Registry · ${SITE_NAME}`,
  robots: { index: false, follow: false },
};

export default async function ManagePage({
  params,
  searchParams,
}: {
  params: Promise<{ shareId: string }>;
  searchParams: Promise<{ key?: string }>;
}) {
  const { shareId } = await params;
  const { key } = await searchParams;

  const store = getStore();
  const authorized = key ? await store.verifyManageKey(shareId, key) : false;
  const basket = authorized ? await store.getBasket(shareId) : null;

  if (!basket) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <Lotus className="h-10 w-10 text-[var(--gold)]" />
        <h1 className="font-display text-3xl mt-4">This page is private.</h1>
        <p className="text-[var(--muted)] mt-3 text-sm max-w-sm">
          It opens only with your full dashboard link — the one shown when you created your registry,
          including the key after the &quot;?&quot;.
        </p>
        <Link href="/" className="btn-primary mt-8 px-6 py-2.5 text-sm">Back to {SITE_NAME}</Link>
      </main>
    );
  }

  const couple = basket.partnerTwo ? `${basket.hostName} & ${basket.partnerTwo}` : basket.hostName;
  const total = basket.items.length;
  const reserved = basket.items.filter((i) => i.claimedBy).length;
  const remaining = total - reserved;
  const pct = total ? Math.round((reserved / total) * 100) : 0;

  return (
    <main className="min-h-screen">
      {/* welcome banner */}
      <section className="relative overflow-hidden text-[var(--ivory)]" style={{ background: "linear-gradient(150deg, #7a1226, #5c0d1c)" }}>
        <Mandala className="absolute -right-20 -top-16 h-72 w-72 text-[var(--gold)] opacity-10" />
        <div className="relative max-w-2xl mx-auto px-6 py-14 text-center">
          <p className="eyebrow" style={{ color: "var(--gold-soft)" }}>My Wedding Registry</p>
          <h1 className="font-names text-4xl mt-3">{couple}</h1>
          <GoldDivider className="mt-5" />
          <p className="mt-5 text-sm text-[var(--gold-soft)] max-w-md mx-auto">
            Welcome to your private dashboard. Watch blessings arrive, and add or remove gifts anytime.
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* stats */}
        <div className="grid grid-cols-3 gap-3">
          <Stat n={total} label="Total gifts" />
          <Stat n={reserved} label="Reserved" accent />
          <Stat n={remaining} label="Still available" />
        </div>

        {/* progress */}
        <div className="mt-6 card p-5">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-medium">Your registry</p>
            <p className="text-sm text-[var(--muted)]">{pct}% reserved</p>
          </div>
          <div className="mt-3 h-2.5 rounded-full bg-[var(--tile)] overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg, var(--gold), var(--maroon))" }} />
          </div>
          {reserved > 0 && (
            <p className="mt-3 text-xs text-[var(--muted)]">
              🎉 {reserved} {reserved === 1 ? "gift has" : "gifts have"} been reserved by your loved ones.
            </p>
          )}
        </div>

        <div className="mt-10">
          <ManageList shareId={basket.shareId} manageKey={key!} initialItems={basket.items} />
        </div>

        <div className="mt-10">
          <ShareBox shareId={basket.shareId} />
        </div>

        <p className="mt-8 text-xs text-[var(--muted)] text-center">
          Bookmark this page — it&apos;s your private dashboard. If someone reserves by mistake, use
          &quot;undo&quot; to free the gift up again.
        </p>
      </div>
    </main>
  );
}

function Stat({ n, label, accent }: { n: number; label: string; accent?: boolean }) {
  return (
    <div className={`card p-4 text-center ${accent ? "ring-1 ring-[var(--gold)]" : ""}`}>
      <p className="font-display text-4xl" style={{ color: accent ? "var(--maroon)" : "var(--ink)" }}>{n}</p>
      <p className="text-[11px] uppercase tracking-widest text-[var(--muted)] mt-1">{label}</p>
    </div>
  );
}
