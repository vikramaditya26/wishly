import Link from "next/link";
import { getStore } from "@/lib/store";
import { OCCASIONS } from "@/lib/catalog";
import { SITE_NAME } from "@/lib/config";
import { ShareBox } from "@/components/ShareBox";

export const dynamic = "force-dynamic";

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
      <main className="min-h-screen bg-gradient-to-b from-pink-50 to-sky-50 flex flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl">🔒</div>
        <h1 className="font-display text-2xl font-extrabold text-slate-700 mt-4">Can&apos;t open this</h1>
        <p className="text-slate-500 mt-2 text-sm max-w-sm">
          This needs your secret manage link (the one we showed when you created the wishlist). Check the exact link — it
          includes a key after the &quot;?&quot;.
        </p>
        <Link href="/" className="mt-6 px-6 py-3 rounded-full bg-violet-600 text-white font-bold">
          ← back to {SITE_NAME}
        </Link>
      </main>
    );
  }

  const occ = OCCASIONS.find((o) => o.id === basket.occasion);
  const claimed = basket.items.filter((i) => i.claimedBy);

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 via-violet-50 to-sky-50 px-4 py-12">
      <div className="max-w-xl mx-auto">
        <Link href="/" className="font-display text-xl font-extrabold text-violet-600">
          {SITE_NAME} 🎀
        </Link>
        <h1 className="font-display text-3xl font-extrabold text-slate-800 mt-4">
          Your {occ?.label ?? "wishlist"} basket {occ?.emoji}
        </h1>
        <p className="text-slate-600 text-sm mt-1">
          {claimed.length} of {basket.items.length} gifts claimed so far 🎉
        </p>

        <ShareBox shareId={basket.shareId} />

        <div className="mt-6 space-y-2">
          {basket.items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3"
            >
              <span className="text-2xl">{item.emoji || "🎁"}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-slate-800 truncate">{item.name}</p>
                {item.price && <p className="text-xs text-slate-400">{item.price}</p>}
              </div>
              {item.claimedBy ? (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full whitespace-nowrap">
                  🎁 {item.claimedBy}
                </span>
              ) : (
                <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full whitespace-nowrap">
                  waiting…
                </span>
              )}
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs text-slate-400 text-center">
          Tip: bookmark this page — it&apos;s your private dashboard. Refresh anytime to see new claims.
        </p>
      </div>
    </main>
  );
}
