"use client";

// Every list created in this browser, so nobody ever loses a manage link.
// Data lives in localStorage["wishly-my-baskets"] - written on creation.

import { useEffect, useState } from "react";
import Link from "next/link";
import { OCCASIONS } from "@/lib/catalog";
import { SITE_NAME } from "@/lib/config";
import type { Occasion } from "@/lib/types";

interface SavedBasket {
  shareId: string;
  manageKey: string;
  hostName: string;
  occasion: Occasion;
  createdAt: number;
}

export default function MyListsPage() {
  const [lists, setLists] = useState<SavedBasket[] | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved: SavedBasket[] = JSON.parse(localStorage.getItem("wishly-my-baskets") || "[]");
      setLists(saved.reverse()); // newest first
    } catch {
      setLists([]);
    }
  }, []);

  function copyShareLink(shareId: string) {
    const url = `${window.location.origin}/b/${shareId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(shareId);
      setTimeout(() => setCopiedId(null), 1500);
    });
  }

  return (
    <main className="min-h-screen px-6 py-14">
      <div className="max-w-lg mx-auto">
        <Link href="/" className="font-display text-2xl">
          {SITE_NAME}
        </Link>
        <h1 className="font-display text-4xl mt-10">
          Your lists<span className="text-[var(--accent)]">.</span>
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Every list made in this browser, with its private dashboard.
        </p>

        {lists === null ? null : lists.length === 0 ? (
          <div className="mt-12 text-center border border-dashed border-[var(--line)] rounded-2xl py-14 px-6">
            <p className="font-display text-xl">Nothing here yet.</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Lists you create on this device will show up here automatically.
            </p>
            <Link href="/" className="btn-primary inline-block mt-6 px-8 py-3 text-sm">
              Make your first list
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {lists.map((l) => {
              const occ = OCCASIONS.find((o) => o.id === l.occasion);
              const date = new Date(l.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
              return (
                <div
                  key={l.shareId + l.createdAt}
                  className="rounded-2xl bg-[var(--surface)] border border-[var(--line)] p-4"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-display text-lg truncate">
                      {l.hostName}&apos;s {occ ? occ.label : "list"}
                    </p>
                    <p className="text-xs text-[var(--muted)] whitespace-nowrap">{date}</p>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Link
                      href={`/manage/${l.shareId}?key=${l.manageKey}`}
                      className="btn-primary flex-1 py-2 text-center text-sm"
                    >
                      Open dashboard
                    </Link>
                    <button
                      onClick={() => copyShareLink(l.shareId)}
                      className="flex-1 py-2 rounded-full border border-[var(--line)] text-sm font-medium hover:border-[var(--accent)] hover:text-[var(--accent-deep)] transition"
                    >
                      {copiedId === l.shareId ? "Copied" : "Copy share link"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-10 text-xs text-[var(--muted)]">
          Note: this page is saved on this device only. Keep your private dashboard links safe if
          you switch phones.
        </p>
      </div>
    </main>
  );
}
