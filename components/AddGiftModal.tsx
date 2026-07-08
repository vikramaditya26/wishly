"use client";

// Paste-a-link gift form: fetches name + photo automatically via
// /api/product-preview. Used by the home builder and the manage dashboard.

import { useEffect, useState } from "react";

export interface NewGift {
  name: string;
  url?: string;
  imageUrl?: string;
}

export function AddGiftModal({
  onAdd,
  onClose,
  busy,
}: {
  onAdd: (gift: NewGift) => void;
  onClose: () => void;
  busy?: boolean;
}) {
  const [form, setForm] = useState({ name: "", url: "", imageUrl: "" });
  const [fetching, setFetching] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    const url = form.url.trim();
    if (!/^https?:\/\/\S+\.\S+/.test(url)) return;
    const timer = setTimeout(async () => {
      setFetching(true);
      setNote("");
      try {
        const res = await fetch("/api/product-preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setForm((prev) => ({
          ...prev,
          name: prev.name.trim() ? prev.name : data.name ?? "",
          imageUrl: prev.imageUrl.trim() ? prev.imageUrl : data.imageUrl ?? "",
        }));
        setNote(data.name || data.imageUrl ? "Details filled from the link." : "");
      } catch (e) {
        setNote(e instanceof Error ? e.message : "Couldn't read that page - fill the details manually.");
      } finally {
        setFetching(false);
      }
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.url]);

  function submit() {
    const name = form.name.trim();
    if (!name) return;
    onAdd({
      name,
      url: form.url.trim() || undefined,
      imageUrl: form.imageUrl.trim() || undefined,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-[var(--surface)] rounded-2xl p-6 w-full max-w-md animate-rise">
        <h3 className="font-display text-2xl">Add your own gift</h3>
        <p className="text-sm text-[var(--muted)] mt-1">
          Paste a link from Amazon, Flipkart, Myntra — the name and photo fill in automatically.
        </p>
        <div className="mt-5 space-y-3">
          <input
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="Paste product link"
            className="input"
          />
          {(fetching || note) && (
            <p className="text-xs text-[var(--muted)] px-1">{fetching ? "Reading the link…" : note}</p>
          )}
          {form.imageUrl && (
            <div className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--tile)] p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.imageUrl} alt="" className="h-14 w-14 object-contain mix-blend-multiply" />
              <p className="text-xs text-[var(--muted)] leading-snug line-clamp-3">
                {form.name || "Photo found"}
              </p>
            </div>
          )}
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Gift name"
            maxLength={120}
            className="input"
          />
        </div>
        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full border border-[var(--line)] text-sm font-medium text-[var(--muted)]"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!form.name.trim() || busy}
            className="btn-primary flex-1 py-2.5 text-sm"
          >
            {busy ? "Adding…" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
