"use client";

// The gift grid on the guest page. Handles claiming ("calling dibs"),
// undo (via a claim token kept in the guest's localStorage), and buy links.

import { useEffect, useState } from "react";
import { gradientFor } from "@/lib/catalog";
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
  hostName,
}: {
  shareId: string;
  initialItems: BasketItem[];
  hostName: string;
}) {
  const [items, setItems] = useState(initialItems);
  const [claiming, setClaiming] = useState<BasketItem | null>(null);
  const [guestName, setGuestName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [myTokens, setMyTokens] = useState<Record<string, string>>({});

  useEffect(() => {
    setMyTokens(loadTokens());
    try {
      const saved = localStorage.getItem("wishly-guest-name");
      if (saved) setGuestName(saved);
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
        throw new Error(data.error || "Something went wrong 😭");
      }
      setItems((prev) =>
        prev.map((i) => (i.id === claiming.id ? { ...i, claimedBy: guestName.trim() } : i))
      );
      saveToken(claiming.id, data.claimToken);
      setMyTokens(loadTokens());
      try {
        localStorage.setItem("wishly-guest-name", guestName.trim());
      } catch {}
      setClaiming(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong 😭");
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

  const firstName = hostName.split(" ")[0];

  return (
    <>
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((item) => {
          const claimed = !!item.claimedBy;
          const mine = !!myTokens[item.id];
          return (
            <div
              key={item.id}
              className={`rounded-3xl p-4 bg-white shadow-sm border-2 transition ${
                claimed ? (mine ? "border-emerald-300" : "border-slate-100 opacity-70") : "border-transparent"
              }`}
            >
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="rounded-2xl h-24 w-full object-cover"
                />
              ) : (
                <div
                  className={`rounded-2xl bg-gradient-to-br ${gradientFor(item.id)} h-24 flex items-center justify-center text-4xl`}
                >
                  {item.emoji || "🎁"}
                </div>
              )}
              <p className="mt-2 font-bold text-sm text-slate-800 leading-tight">{item.name}</p>
              {item.price && <p className="text-xs text-slate-500 mt-0.5">{item.price}</p>}

              {claimed ? (
                mine ? (
                  <div className="mt-2">
                    <p className="text-xs font-bold text-emerald-600">You&apos;re gifting this ✨</p>
                    <div className="mt-1.5 flex flex-col gap-1.5">
                      {item.url && (
                        <a
                          href={withAffiliateTag(item.url)}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="text-center text-xs font-bold py-2 rounded-full bg-amber-400 text-amber-900 hover:bg-amber-500 transition"
                        >
                          Buy it 🛒
                        </a>
                      )}
                      <button onClick={() => unclaim(item)} className="text-xs text-slate-400 underline">
                        changed my mind, undo
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-xs font-bold text-slate-400">🎁 {item.claimedBy} is gifting this</p>
                )
              ) : (
                <button
                  onClick={() => {
                    setError("");
                    setClaiming(item);
                  }}
                  className="mt-2 w-full py-2 rounded-full bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 active:scale-95 transition"
                >
                  I&apos;ll gift this 🫶
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* claim modal */}
      {claiming && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm animate-popin text-center">
            <div className="text-4xl">🤫</div>
            <h3 className="font-display text-xl font-extrabold text-slate-800 mt-2">Calling dibs on</h3>
            <p className="font-bold text-violet-600 mt-1">
              {claiming.emoji || "🎁"} {claiming.name}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Just your name, so nobody else buys the same gift for {firstName} 😉
            </p>
            <input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Your name"
              maxLength={60}
              autoFocus
              className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-center focus:outline-none focus:ring-2 focus:ring-violet-300"
            />
            {error && <p className="mt-2 text-xs font-bold text-rose-600">{error}</p>}
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setClaiming(null)}
                className="flex-1 py-3 rounded-full border border-slate-200 font-bold text-slate-500 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={claim}
                disabled={busy || !guestName.trim()}
                className="flex-1 py-3 rounded-full bg-violet-600 text-white font-bold text-sm disabled:opacity-40"
              >
                {busy ? "…" : "Dibs! 🙋"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
