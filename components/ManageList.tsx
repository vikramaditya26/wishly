"use client";

// The creator's item list on the manage page: photo, name, who reserved it,
// undo a reservation, remove a gift, or add new gifts - the list stays alive
// after creation.

import { useState } from "react";
import { AddGiftModal, NewGift } from "@/components/AddGiftModal";
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
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);

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

  async function remove(item: BasketItem) {
    const warning = item.claimedBy
      ? `Remove "${item.name}"? ${item.claimedBy} already reserved it - maybe tell them.`
      : `Remove "${item.name}" from your list?`;
    if (!window.confirm(warning)) return;
    setBusyId(item.id);
    try {
      const res = await fetch(`/api/baskets/${shareId}/items`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id, key: manageKey }),
      });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
      }
    } finally {
      setBusyId(null);
    }
  }

  async function add(gift: NewGift) {
    setAdding(true);
    try {
      const res = await fetch(`/api/baskets/${shareId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...gift, key: manageKey }),
      });
      const data = await res.json();
      if (res.ok && data.item) {
        setItems((prev) => [...prev, data.item]);
        setShowAdd(false);
      }
    } finally {
      setAdding(false);
    }
  }

  return (
    <>
      <div className="mt-2 flex items-baseline justify-between gap-4">
        <p className="text-[var(--muted)] text-sm">
          {reserved} of {items.length} gifts reserved.
        </p>
        <button
          onClick={() => setShowAdd(true)}
          className="text-sm font-medium text-[var(--accent-deep)] hover:underline underline-offset-4 whitespace-nowrap"
        >
          + Add a gift
        </button>
      </div>

      <div className="mt-6 divide-y divide-[var(--line)] border-y border-[var(--line)]">
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
            <div className="flex items-center gap-3 whitespace-nowrap">
              {item.claimedBy && (
                <button
                  onClick={() => release(item)}
                  disabled={busyId === item.id}
                  className="text-xs text-[var(--muted)] underline underline-offset-2 hover:text-[var(--ink)] disabled:opacity-40"
                >
                  undo
                </button>
              )}
              <button
                onClick={() => remove(item)}
                disabled={busyId === item.id}
                className="text-xs text-[var(--muted)] underline underline-offset-2 hover:text-[var(--accent-deep)] disabled:opacity-40"
              >
                remove
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="py-8 text-center text-sm text-[var(--muted)]">
            No gifts on this list yet — add one above.
          </p>
        )}
      </div>

      {showAdd && <AddGiftModal onAdd={add} onClose={() => setShowAdd(false)} busy={adding} />}
    </>
  );
}
