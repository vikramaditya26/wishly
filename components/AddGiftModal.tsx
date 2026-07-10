"use client";

// Add-your-own-gift form. Two ways to give a gift a photo:
//   1) paste a product link — name + photo are fetched via /api/product-preview
//   2) upload / drag-drop an image — downscaled in-browser to a small data URL
//      so it displays everywhere without any file storage backend.
// The data URL is stored inline on the item (APIs allow a large imageUrl cap).

import { useEffect, useRef, useState } from "react";
import { Lotus } from "@/components/Decor";

export interface NewGift {
  name: string;
  url?: string;
  imageUrl?: string;
}

// Downscale an image file to a JPEG data URL no wider/taller than `max` px.
function fileToDataUrl(file: File, max = 500): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read failed"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode failed"));
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("no canvas"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
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
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // paste a product link -> auto-fill name + photo
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
        setNote(e instanceof Error ? e.message : "Couldn't read that page — add a photo below instead.");
      } finally {
        setFetching(false);
      }
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.url]);

  async function handleFile(file?: File | null) {
    if (!file || !file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      setForm((prev) => ({ ...prev, imageUrl: dataUrl }));
      setNote("Photo added.");
    } catch {
      setNote("Couldn't read that image — try another.");
    } finally {
      setUploading(false);
    }
  }

  function submit() {
    const name = form.name.trim();
    if (!name) return;
    onAdd({ name, url: form.url.trim() || undefined, imageUrl: form.imageUrl.trim() || undefined });
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-[var(--surface)] rounded-2xl w-full max-w-md animate-rise overflow-hidden gold-frame">
        <div className="text-center px-6 pt-6">
          <Lotus className="h-7 w-7 mx-auto text-[var(--gold)]" />
          <h3 className="font-display text-2xl mt-2">Add your own gift</h3>
          <p className="text-sm text-[var(--muted)] mt-1">
            Paste a link, or upload a photo of anything you dream of.
          </p>
        </div>

        <div className="px-6 pb-6 mt-5 space-y-3">
          <input
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="Paste product link (Amazon, Flipkart, Myntra…)"
            className="input"
          />

          {/* upload / drag-drop */}
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-4 text-center transition ${
              dragOver ? "border-[var(--gold)] bg-[var(--gold)]/10" : "border-[var(--line)] hover:border-[var(--gold)]"
            }`}
          >
            {form.imageUrl ? (
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.imageUrl} alt="" className="h-16 w-16 object-cover rounded-lg border border-[var(--line)]" />
                <div className="text-left">
                  <p className="text-sm font-medium">{form.name || "Photo added"}</p>
                  <p className="text-xs text-[var(--gold)]">Tap to change photo</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[var(--muted)]">
                {uploading ? "Adding photo…" : "📷 Tap to upload a photo, or drag one here"}
              </p>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
          </div>

          {(fetching || note) && (
            <p className="text-xs text-[var(--muted)] px-1">{fetching ? "Reading the link…" : note}</p>
          )}

          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Gift name (e.g. Brass pooja thali set)"
            maxLength={120}
            className="input"
          />

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-full border border-[var(--line)] text-sm font-medium text-[var(--muted)]">
              Cancel
            </button>
            <button onClick={submit} disabled={!form.name.trim() || busy} className="btn-primary flex-1 py-2.5 text-sm">
              {busy ? "Adding…" : "Add to registry"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
