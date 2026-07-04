import Link from "next/link";
import { getStore } from "@/lib/store";
import { OCCASIONS } from "@/lib/catalog";
import { SITE_NAME } from "@/lib/config";
import { ShareBox } from "@/components/ShareBox";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Your list · ${SITE_NAME}`,
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
        <h1 className="font-display text-3xl">This page is private.</h1>
        <p className="text-[var(--muted)] mt-3 text-sm max-w-sm">
          It opens only with your full manage link — the one shown when you created the list,
          including the key after the &quot;?&quot;.
        </p>
        <Link
          href="/"
          className="mt-8 px-6 py-2.5 rounded-full bg-[var(--ink)] text-white text-sm font-medium"
        >
          Back to {SITE_NAME}
        </Link>
      </main>
    );
  }

  const occ = OCCASIONS.find((o) => o.id === basket.occasion);
  const claimed = basket.items.filter((i) => i.claimedBy);

  return (
    <main className="min-h-screen px-6 py-14">
      <div className="max-w-lg mx-auto">
        <p className="font-display text-2xl">{SITE_NAME}</p>
        <h1 className="font-display text-4xl mt-10">
          Your {occ ? occ.label.toLowerCase() : ""} list
        </h1>
        <p className="text-[var(--muted)] text-sm mt-2">
          {claimed.length} of {basket.items.length} gifts reserved. Refresh anytime for updates.
        </p>

        <ShareBox shareId={basket.shareId} />

        <div className="mt-8 divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {basket.items.map((item) => (
            <div key={item.id} className="py-3.5 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                {item.price && <p className="text-xs text-[var(--muted)] mt-0.5">{item.price}</p>}
              </div>
              {item.claimedBy ? (
                <span className="text-sm font-medium whitespace-nowrap">{item.claimedBy}</span>
              ) : (
                <span className="text-sm text-[var(--muted)] whitespace-nowrap">—</span>
              )}
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs text-[var(--muted)]">
          Bookmark this page — it&apos;s your private dashboard.
        </p>
      </div>
    </main>
  );
}
