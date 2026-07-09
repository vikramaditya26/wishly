import Link from "next/link";
import { getStore } from "@/lib/store";
import { SITE_NAME } from "@/lib/config";
import { ShareBox } from "@/components/ShareBox";
import { ManageList } from "@/components/ManageList";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Your registry · ${SITE_NAME}`,
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

  const couple = basket.partnerTwo ? `${basket.hostName} & ${basket.partnerTwo}` : basket.hostName;

  return (
    <main className="min-h-screen px-6 py-14">
      <div className="max-w-lg mx-auto">
        <p className="font-display text-2xl">{SITE_NAME}</p>
        <h1 className="font-display text-4xl mt-10">{couple}&apos;s registry</h1>

        <ManageList shareId={basket.shareId} manageKey={key!} initialItems={basket.items} />

        <ShareBox shareId={basket.shareId} />

        <p className="mt-8 text-xs text-[var(--muted)]">
          Bookmark this page — it&apos;s your private dashboard. If someone reserved by mistake,
          use &quot;undo&quot; to free the gift up again.
        </p>
      </div>
    </main>
  );
}
