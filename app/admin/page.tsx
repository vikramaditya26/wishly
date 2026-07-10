"use client";

// Owner-only panel to add gifts that appear on the site for EVERYONE. Items
// are stored in the database (catalog_items) and merged into the home shelves.
// Access is gated by the ADMIN_KEY env var — enter it once, it's remembered in
// this browser. Photos are uploaded (downscaled to a data URL) or pulled from a
// pasted link; a buy link can be attached so guests can purchase.

import { useEffect, useRef, useState } from "react";
import { CATEGORIES } from "@/lib/catalog";
import { SITE_NAME } from "@/lib/config";
import { GoldDivider, Lotus } from "@/components/Decor";
import type { AdminItem } from "@/lib/types";

function fileToDataUrl(file: File, max = 500): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read failed"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode failed"));
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [entered, setEntered] = useState(false);
  const [items, setItems] = useState<AdminItem[]>([]);
  const [form, setForm] = useState({ category: CATEGORIES[0].id, name: "", imageUrl: "", buyUrl: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("wishly-admin-key");
    if (saved) {
      setKey(saved);
      setEntered(true);
    }
  }, []);

  useEffect(() => {
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d.items) ? d.items : []))
      .catch(() => {});
  }, []);

  async function handleFile(file?: File | null) {
    if (!file || !file.type.startsWith("image/")) return;
    setMsg("Adding photo…");
    try {
      const dataUrl = await fileToDataUrl(file);
      setForm((f) => ({ ...f, imageUrl: dataUrl }));
      setMsg("");
    } catch {
      setMsg("Couldn't read that image.");
    }
  }

  async function fetchFromLink(url: string) {
    if (!/^https?:\/\/\S+\.\S+/.test(url)) return;
    setMsg("Reading the link…");
    try {
      const res = await fetch("/api/product-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (res.ok) {
        setForm((f) => ({ ...f, name: f.name || data.name || "", imageUrl: f.imageUrl || data.imageUrl || "" }));
        setMsg(data.imageUrl ? "Photo pulled from link." : "Couldn't get a photo — upload one instead.");
      } else {
        setMsg("Couldn't read that link — upload a photo instead.");
      }
    } catch {
      setMsg("Couldn't read that link — upload a photo instead.");
    }
  }

  async function save() {
    if (!form.name.trim()) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, key }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add.");
      setItems((prev) => [...prev, data.item]);
      setForm({ category: form.category, name: "", imageUrl: "", buyUrl: "" });
      setMsg("Added! It's now live for everyone. 🎉");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed to add.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Remove this gift from the site?")) return;
    const res = await fetch("/api/catalog", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, key }),
    });
    if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
  }

  const catLabel = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]));

  // ---- gate ----
  if (!entered) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center card gold-frame p-8">
          <Lotus className="h-8 w-8 mx-auto text-[var(--gold)]" />
          <h1 className="font-display text-3xl mt-3">Admin</h1>
          <p className="text-sm text-[var(--muted)] mt-2">Enter your admin password to manage the gift catalog.</p>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Admin password"
            className="input mt-5 text-center"
          />
          <button
            onClick={() => {
              localStorage.setItem("wishly-admin-key", key);
              setEntered(true);
            }}
            disabled={!key.trim()}
            className="btn-primary w-full py-3 text-sm mt-3"
          >
            Enter
          </button>
        </div>
      </main>
    );
  }

  // ---- panel ----
  return (
    <main className="min-h-screen px-6 py-14">
      <div className="max-w-2xl mx-auto">
        <div className="text-center">
          <span className="font-names text-2xl text-[var(--maroon)]">{SITE_NAME}</span>
          <h1 className="font-display text-4xl mt-3">Gift catalog</h1>
          <GoldDivider className="mt-4" />
          <p className="text-sm text-[var(--muted)] mt-3">
            Gifts you add here appear on the site for every couple to choose from.
          </p>
        </div>

        {/* add form */}
        <div className="card gold-frame p-6 mt-8">
          <h2 className="font-display text-2xl">Add a gift</h2>
          <div className="mt-4 space-y-3">
            <div>
              <label className="eyebrow" style={{ color: "var(--muted)" }}>Section</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="input mt-1.5"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Gift name (e.g. Kanjivaram silk saree)"
              maxLength={120}
              className="input"
            />

            {/* photo: upload or from link */}
            <div
              onClick={() => fileRef.current?.click()}
              className="cursor-pointer rounded-xl border-2 border-dashed border-[var(--line)] hover:border-[var(--gold)] p-4 text-center transition"
            >
              {form.imageUrl ? (
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.imageUrl} alt="" className="h-16 w-16 object-cover rounded-lg border border-[var(--line)]" />
                  <p className="text-sm text-[var(--gold)]">Tap to change photo</p>
                </div>
              ) : (
                <p className="text-sm text-[var(--muted)]">📷 Tap to upload a photo</p>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
            </div>

            <input
              onBlur={(e) => fetchFromLink(e.target.value)}
              placeholder="…or paste a product link to pull a photo (optional)"
              className="input"
            />

            <input
              value={form.buyUrl}
              onChange={(e) => setForm({ ...form, buyUrl: e.target.value })}
              placeholder="Buy link — where guests can purchase it"
              className="input"
            />

            {msg && <p className="text-xs text-[var(--maroon-deep)] px-1">{msg}</p>}

            <button onClick={save} disabled={busy || !form.name.trim()} className="btn-primary w-full py-3 text-sm">
              {busy ? "Adding…" : "Add to the site"}
            </button>
          </div>
        </div>

        {/* existing items */}
        <h2 className="font-display text-2xl mt-10">On the site now ({items.length})</h2>
        <div className="mt-4 space-y-2">
          {items.length === 0 && <p className="text-sm text-[var(--muted)]">No owner-added gifts yet.</p>}
          {items.map((it) => (
            <div key={it.id} className="card p-3 flex items-center gap-3">
              <div className="h-12 w-12 shrink-0 rounded-lg bg-[var(--tile)] border border-[var(--line)] overflow-hidden flex items-center justify-center">
                {it.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.imageUrl} alt="" className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="font-display text-lg text-[var(--muted)]">{it.name.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{it.name}</p>
                <p className="text-xs text-[var(--muted)]">{catLabel[it.category] ?? it.category}{it.buyUrl ? " · has buy link" : " · no buy link"}</p>
              </div>
              <button onClick={() => remove(it.id)} className="text-xs text-[var(--muted)] underline hover:text-[var(--maroon)]">
                remove
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={() => { localStorage.removeItem("wishly-admin-key"); setEntered(false); }}
          className="mt-10 text-xs text-[var(--muted)] underline"
        >
          Sign out of admin
        </button>
      </div>
    </main>
  );
}
