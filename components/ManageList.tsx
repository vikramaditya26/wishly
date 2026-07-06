"use client";

// The creator's item list on the manage page: photo, name, who reserved it,
// and an undo button so the host can fix mistakes or mischief.

import { useState } from "react";
import type { BasketItem } from "@/lib/types";

export function ManageList({
  shareId,
  manageKey,
  initialItems,
}: {
  shareId: string;
  manageKey: string;
  initialItems: BasketItem[];
}) {
  const [items, setItems] = useState(initialItems);
  const [busyId, setBusyId] = useState<string | null>(null);

  const reserved = items.filter((i) => i.claimedBy).length;

  async function release(item: BasketItem) {
    if (!window.confirm(`Free up "${item.name}"? ${item.claimedBy}'s reservation will be removed.`)) return;
    setBusyId(item.id);
    try {
      const res = await fetch(`/api/baskets/${shareId}/release`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id, key: manageKey }),
      });
      if (res.ok) {
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, claimedBy: null } : i)));
      }
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <p className="text-[var(--muted)] text-sm mt-2">
        {reserved} of {items.length} gifts reserved. Refresh anytime for updates.
      </p>

      <div className="mt-8 divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {items.map((item) => (
          <div key={item.id} className="py-3 flex items-center gap-4">
            <div className="h-12 w-12 shrink-0 rounded-xl bg-[var(--tile)] border border-[var(--line)] flex items-center justify-center overflow-hidden">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  loading="lazy"
                  className="max-h-full max-w-full object-contain mix-blend-multiply"
                />
              ) : (
                <span className="font-display text-lg text-[var(--muted)]">
                  {item.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.name}</p>
              {item.claimedBy ? (
                <p className="text-xs text-[var(--accent-deep)] mt-0.5">
                  Reserved by {item.claimedBy}
                </p>
              ) : (
                <p className="text-xs text-[var(--muted)] mt-0.5">Waiting</p>
              )}
            </div>
            {item.claimedBy && (
              <button
                onClick={() => release(item)}
                disabled={busyId === item.id}
                className="text-xs text-[var(--muted)] underline underline-offset-2 hover:text-[var(--ink)] disabled:opacity-40 whitespace-nowrap"
              >
                {busyId === item.id ? "…" : "undo"}
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
