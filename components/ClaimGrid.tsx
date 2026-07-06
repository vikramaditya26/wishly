"use client";

// The gift grid on the guest page. Handles reserving a gift, undo (via a
// claim token kept in the guest's localStorage), and affiliate buy links.

import { useEffect, useState } from "react";
import { withAffiliateTag } from "@/lib/config";
import type { BasketItem } from "@/lib/types";

const TOKENS_KEY = "wishly-claim-tokens";

function loadTokens(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(TOKENS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveToken(itemId: string, token: string | null) {
  const all = loadTokens();
  if (token) all[itemId] = token;
  else delete all[itemId];
  localStorage.setItem(TOKENS_KEY, JSON.stringify(all));
}

export function ClaimGrid({
  shareId,
  initialItems,
  tileColor,
}: {
  shareId: string;
  initialItems: BasketItem[];
  tileColor: string;
}) {
  const [items, setItems] = useState(initialItems);
  const [claiming, setClaiming] = useState<BasketItem | null>(null);
  const [guestName, setGuestName] = useState("");
  const [nameLocked, setNameLocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [myTokens, setMyTokens] = useState<Record<string, string>>({});

  useEffect(() => {
    setMyTokens(loadTokens());
    try {
      // once you've reserved under a name in this browser, it sticks -
      // keeps one person from reserving under five different names by accident
      const saved = localStorage.getItem("wishly-guest-name");
      if (saved) {
        setGuestName(saved);
        setNameLocked(true);
      }
    } catch {}
  }, []);

  async function claim() {
    if (!claiming) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/baskets/${shareId}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: claiming.id, name: guestName }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.reason === "taken") {
          setItems((prev) =>
            prev.map((i) => (i.id === claiming.id ? { ...i, claimedBy: "someone" } : i))
          );
        }
        throw new Error(data.error || "Something went wrong.");
      }
      setItems((prev) =>
        prev.map((i) => (i.id === claiming.id ? { ...i, claimedBy: guestName.trim() } : i))
      );
      saveToken(claiming.id, data.claimToken);
      setMyTokens(loadTokens());
      try {
        localStorage.setItem("wishly-guest-name", guestName.trim());
      } catch {}
      setNameLocked(true);
      setClaiming(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function unclaim(item: BasketItem) {
    const token = myTokens[item.id];
    if (!token) return;
    const res = await fetch(`/api/baskets/${shareId}/unclaim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: item.id, claimToken: token }),
    });
    if (res.ok) {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, claimedBy: null } : i)));
      saveToken(item.id, null);
      setMyTokens(loadTokens());
    }
  }

  return (
    <>
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
        {items.map((item) => {
          const claimed = !!item.claimedBy;
          const mine = !!myTokens[item.id];
          return (
            <div
              key={item.id}
              className={`rounded-2xl bg-white/80 border border-black/5 overflow-hidden ${
                claimed && !mine ? "opacity-60" : ""
              }`}
            >
              <div
                className="aspect-square p-5 flex items-center justify-center"
                style={{ background: tileColor }}
              >
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain mix-blend-multiply"
                  />
                ) : (
                  <span className="font-display text-4xl text-[var(--muted)]">
                    {item.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium leading-snug line-clamp-2">{item.name}</p>

                {claimed ? (
                  mine ? (
                    <div className="mt-2.5 space-y-1.5">
                      <p className="text-xs font-medium">You&apos;re gifting this.</p>
                      {item.url && (
                        <a
                          href={withAffiliateTag(item.url)}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="btn-primary block text-center text-sm py-1.5"
                        >
                          See the gift
                        </a>
                      )}
                      <button
                        onClick={() => unclaim(item)}
                        className="w-full text-xs text-[var(--muted)] underline underline-offset-2"
                      >
                        Undo
                      </button>
                    </div>
                  ) : (
                    <p className="mt-2.5 text-xs text-[var(--muted)]">
                      Reserved by {item.claimedBy}
                    </p>
                  )
                ) : (
                  <button
                    onClick={() => {
                      setError("");
                      setClaiming(item);
                    }}
                    className="mt-2.5 w-full py-1.5 rounded-full text-sm font-medium border border-[var(--accent)]/40 text-[var(--accent-deep)] hover:bg-[var(--accent-soft)]/60 transition"
                  >
                    I&apos;ll gift this
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* reserve modal */}
      {claiming && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-rise">
            <h3 className="font-display text-2xl">Reserve this gift</h3>
            <p className="text-sm font-medium mt-1">{claiming.name}</p>
            <p className="text-sm text-[var(--muted)] mt-3">
              Just your name, so no one else brings the same thing.
            </p>
            {nameLocked ? (
              <p className="mt-4 text-sm">
                Reserving as <span className="font-medium">{guestName}</span>{" "}
                <button
                  onClick={() => setNameLocked(false)}
                  className="text-[var(--muted)] underline underline-offset-2"
                >
                  not you?
                </button>
              </p>
            ) : (
              <input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Your name"
                maxLength={60}
                autoFocus
                className="input mt-4"
              />
            )}
            {error && <p className="mt-2 text-sm text-[var(--accent-deep)]">{error}</p>}
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setClaiming(null)}
                className="flex-1 py-2.5 rounded-full border border-[var(--line)] text-sm font-medium text-[var(--muted)]"
              >
                Cancel
              </button>
              <button
                onClick={claim}
                disabled={busy || !guestName.trim()}
                className="btn-primary flex-1 py-2.5 text-sm"
              >
                {busy ? "…" : "Reserve"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
