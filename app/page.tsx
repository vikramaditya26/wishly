"use client";

// Wishly is a single-page experience: short intro, then the list builder
// directly below. Details + share links swap in as steps on the same page.

import { useMemo, useState } from "react";
import { CATEGORIES, FOR_WHO, OCCASIONS, PRODUCTS, THEMES, formatINR } from "@/lib/catalog";
import { SITE_NAME, amazonSearchLink } from "@/lib/config";
import type { BasketItem, ForWho, Occasion } from "@/lib/types";

type Step = "build" | "details" | "done";
type DraftItem = Omit<BasketItem, "claimedBy">;

export default function Home() {
  const [step, setStep] = useState<Step>("build");

  // filters
  const [occasion, setOccasion] = useState<Occasion>("birthday");
  const [forWho, setForWho] = useState<ForWho | null>(null);
  const [category, setCategory] = useState<string>("all");

  // basket
  const [picked, setPicked] = useState<Record<string, DraftItem>>({});
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [custom, setCustom] = useState({ name: "", url: "", imageUrl: "", price: "" });

  // details
  const [hostName, setHostName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [message, setMessage] = useState("");
  const [theme, setTheme] = useState(THEMES[0].id);

  // result
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ shareId: string; manageKey: string } | null>(null);

  const visible = useMemo(
    () =>
      PRODUCTS.filter(
        (p) =>
          p.occasions.includes(occasion) &&
          (!forWho || p.forWho === forWho || p.forWho === "anyone") &&
          (category === "all" || p.category === category)
      ),
    [occasion, forWho, category]
  );

  const count = Object.keys(picked).length;

  function toggleProduct(id: string) {
    setPicked((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        const p = PRODUCTS.find((x) => x.id === id)!;
        next[id] = {
          id: p.id,
          name: p.name,
          imageUrl: p.image,
          price: formatINR(p.price),
          url: amazonSearchLink(p.amazonQuery),
        };
      }
      return next;
    });
  }

  function addCustom() {
    const name = custom.name.trim();
    if (!name) return;
    const id = `custom-${Date.now()}`;
    setPicked((prev) => ({
      ...prev,
      [id]: {
        id,
        name,
        url: custom.url.trim() || undefined,
        imageUrl: custom.imageUrl.trim() || undefined,
        price: custom.price.trim() || undefined,
      },
    }));
    setCustom({ name: "", url: "", imageUrl: "", price: "" });
    setShowCustomForm(false);
  }

  async function createBasket() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/baskets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostName,
          occasion,
          message,
          theme,
          eventDate,
          items: Object.values(picked),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setResult(data);
      setStep("done");
      try {
        const mine = JSON.parse(localStorage.getItem("wishly-my-baskets") || "[]");
        mine.push({ shareId: data.shareId, manageKey: data.manageKey, hostName, occasion, createdAt: Date.now() });
        localStorage.setItem("wishly-my-baskets", JSON.stringify(mine));
      } catch {}
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  // ------------------------------------------------------------------ done
  if (step === "done" && result) {
    return (
      <main className="min-h-screen px-6 py-20">
        <div className="max-w-lg mx-auto animate-rise">
          <p className="font-display text-2xl">{SITE_NAME}</p>
          <h1 className="font-display text-4xl mt-10">Your list is live.</h1>
          <p className="mt-3 text-[15px] text-[var(--muted)]">
            Send this link to friends and family. They&apos;ll reserve gifts quietly — you just wait.
          </p>

          <div className="mt-8">
            <p className="text-xs font-medium uppercase tracking-widest text-[var(--muted)]">Share link</p>
            <CopyRow path={`/b/${result.shareId}`} />
            <WhatsAppButton path={`/b/${result.shareId}`} />
          </div>

          <div className="mt-10 border-t border-[var(--line)] pt-6">
            <p className="text-xs font-medium uppercase tracking-widest text-[var(--muted)]">
              Private link — for you only
            </p>
            <p className="mt-1.5 text-sm text-[var(--muted)]">
              This is where you see who reserved what. It&apos;s saved in this browser, but keep a copy somewhere safe.
            </p>
            <CopyRow path={`/manage/${result.shareId}?key=${result.manageKey}`} />
          </div>

          <button
            onClick={() => window.location.reload()}
            className="mt-12 text-sm text-[var(--muted)] underline underline-offset-4"
          >
            Make another list
          </button>
        </div>
      </main>
    );
  }

  // --------------------------------------------------------------- details
  if (step === "details") {
    return (
      <main className="min-h-screen px-6 py-16">
        <div className="max-w-lg mx-auto animate-rise">
          <button
            onClick={() => setStep("build")}
            className="text-sm text-[var(--muted)] hover:text-[var(--ink)]"
          >
            ← Back
          </button>
          <h1 className="font-display text-4xl mt-6">Almost done.</h1>

          <div className="mt-8 space-y-6">
            <Field label="Your name">
              <input
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="Aditya"
                maxLength={60}
                className="input"
              />
            </Field>
            <Field label="Date" optional>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="input"
              />
            </Field>
            <Field label="A note for your guests" optional>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="No pressure to buy anything — your presence is more than enough."
                maxLength={500}
                rows={3}
                className="input resize-none"
              />
            </Field>
            <Field label="Page colour">
              <div className="flex gap-3 pt-1">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    title={t.label}
                    aria-label={t.label}
                    className={`h-9 w-9 rounded-full border transition ${
                      theme === t.id
                        ? "border-[var(--ink)] ring-2 ring-[var(--ink)] ring-offset-2 ring-offset-[var(--bg)]"
                        : "border-[var(--line)]"
                    }`}
                    style={{ background: t.tile }}
                  />
                ))}
              </div>
            </Field>
          </div>

          {error && <p className="mt-5 text-sm text-[var(--accent)]">{error}</p>}

          <button
            onClick={createBasket}
            disabled={busy || !hostName.trim()}
            className="mt-9 w-full py-3.5 rounded-full bg-[var(--ink)] text-white text-[15px] font-medium hover:opacity-90 transition disabled:opacity-30"
          >
            {busy ? "Creating…" : "Create my list"}
          </button>
        </div>
      </main>
    );
  }

  // ----------------------------------------------------------------- build
  return (
    <main className="min-h-screen pb-32">
      <header className="max-w-5xl mx-auto px-6 pt-8 flex items-baseline justify-between">
        <span className="font-display text-2xl">{SITE_NAME}</span>
        <span className="text-xs uppercase tracking-widest text-[var(--muted)]">Free · No signup</span>
      </header>

      {/* hero — short */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12">
        <h1 className="font-display text-5xl sm:text-6xl leading-[1.08] max-w-2xl">
          Three people brought you the same perfume.
        </h1>
        <p className="mt-5 text-lg text-[var(--muted)] max-w-xl">
          Never again. Pick the gifts you&apos;d love, share one link — friends quietly reserve
          them so nothing gets bought twice.
        </p>
      </section>

      {/* builder */}
      <section className="max-w-5xl mx-auto px-6">
        <div className="border-t border-[var(--line)] pt-8">
          <div className="flex flex-wrap items-center gap-2">
            {OCCASIONS.map((o) => (
              <Chip key={o.id} active={occasion === o.id} onClick={() => setOccasion(o.id)}>
                {o.label}
              </Chip>
            ))}
            <span className="mx-2 h-4 w-px bg-[var(--line)] hidden sm:block" />
            {FOR_WHO.map((f) => (
              <Chip
                key={f.id}
                active={forWho === f.id}
                onClick={() => setForWho(forWho === f.id ? null : f.id)}
              >
                {f.label}
              </Chip>
            ))}
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 -mx-6 px-6">
            <Tab active={category === "all"} onClick={() => setCategory("all")}>
              All
            </Tab>
            {CATEGORIES.map((c) => (
              <Tab key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
                {c.label}
              </Tab>
            ))}
          </div>
        </div>

        {/* grid */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setShowCustomForm(true)}
            className="rounded-2xl border border-dashed border-[var(--muted)]/50 min-h-56 flex flex-col items-center justify-center gap-1.5 text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--ink)]/40 transition p-4"
          >
            <span className="text-2xl leading-none">+</span>
            <span className="text-sm font-medium">Add your own</span>
            <span className="text-xs">paste any product link</span>
          </button>

          {visible.map((p) => {
            const added = !!picked[p.id];
            return (
              <div
                key={p.id}
                className="rounded-2xl bg-[var(--surface)] border border-[var(--line)] overflow-hidden"
              >
                <div className="aspect-square bg-[var(--tile)] p-5 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain mix-blend-multiply"
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium leading-snug line-clamp-2">{p.name}</p>
                  <p className="text-sm text-[var(--muted)] mt-0.5">{formatINR(p.price)}</p>
                  <button
                    onClick={() => toggleProduct(p.id)}
                    className={`mt-2.5 w-full py-1.5 rounded-full text-sm font-medium border transition ${
                      added
                        ? "bg-[var(--ink)] text-white border-[var(--ink)]"
                        : "border-[var(--ink)]/25 hover:border-[var(--ink)]"
                    }`}
                  >
                    {added ? "Added" : "Add"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {visible.length === 0 && (
          <p className="text-center text-[var(--muted)] mt-16 text-sm">
            Nothing here for this combination — try another category.
          </p>
        )}
      </section>

      <footer className="max-w-5xl mx-auto px-6 mt-20 pt-6 border-t border-[var(--line)] text-xs text-[var(--muted)]">
        {SITE_NAME} — free gift lists for every occasion.
      </footer>

      {/* custom product modal */}
      {showCustomForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-[var(--surface)] rounded-2xl p-6 w-full max-w-md animate-rise">
            <h3 className="font-display text-2xl">Add your own gift</h3>
            <p className="text-sm text-[var(--muted)] mt-1">
              From Amazon, Flipkart, Myntra — anywhere. Only the name is required.
            </p>
            <div className="mt-5 space-y-3">
              <input
                value={custom.name}
                onChange={(e) => setCustom({ ...custom, name: e.target.value })}
                placeholder="Gift name"
                maxLength={120}
                className="input"
              />
              <input
                value={custom.url}
                onChange={(e) => setCustom({ ...custom, url: e.target.value })}
                placeholder="Product link (optional)"
                className="input"
              />
              <input
                value={custom.imageUrl}
                onChange={(e) => setCustom({ ...custom, imageUrl: e.target.value })}
                placeholder="Image link (optional)"
                className="input"
              />
              <input
                value={custom.price}
                onChange={(e) => setCustom({ ...custom, price: e.target.value })}
                placeholder="Approx price (optional)"
                maxLength={40}
                className="input"
              />
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowCustomForm(false)}
                className="flex-1 py-2.5 rounded-full border border-[var(--line)] text-sm font-medium text-[var(--muted)]"
              >
                Cancel
              </button>
              <button
                onClick={addCustom}
                disabled={!custom.name.trim()}
                className="flex-1 py-2.5 rounded-full bg-[var(--ink)] text-white text-sm font-medium disabled:opacity-30"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* sticky continue bar */}
      {count > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 p-4">
          <div className="max-w-5xl mx-auto flex justify-center">
            <button
              onClick={() => setStep("details")}
              className="px-10 py-3.5 rounded-full bg-[var(--ink)] text-white text-[15px] font-medium shadow-xl shadow-black/15 hover:opacity-90 transition"
            >
              Continue — {count} gift{count > 1 ? "s" : ""}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

// ----------------------------- small pieces --------------------------------

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
        active
          ? "bg-[var(--ink)] text-white border-[var(--ink)]"
          : "bg-transparent text-[var(--ink)] border-[var(--line)] hover:border-[var(--ink)]/50"
      }`}
    >
      {children}
    </button>
  );
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap px-1 pb-1.5 text-sm border-b-2 transition ${
        active
          ? "border-[var(--ink)] text-[var(--ink)] font-medium"
          : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
      }`}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-medium uppercase tracking-widest text-[var(--muted)]">
        {label}
        {optional && <span className="normal-case tracking-normal"> · optional</span>}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function CopyRow({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
  return (
    <div className="mt-2 flex gap-2">
      <input
        readOnly
        value={url}
        onFocus={(e) => e.target.select()}
        className="flex-1 min-w-0 rounded-xl px-3.5 py-2.5 text-sm border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]"
      />
      <button
        onClick={() => {
          navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          });
        }}
        className="px-5 py-2.5 rounded-xl text-sm font-medium bg-[var(--ink)] text-white hover:opacity-90 transition"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

function WhatsAppButton({ path }: { path: string }) {
  const url = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
  const text = encodeURIComponent(
    `I made a little gift list — pick something from it (quietly) so nothing gets bought twice: ${url}`
  );
  return (
    <a
      href={`https://wa.me/?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 block text-center w-full py-2.5 rounded-xl border border-[var(--line)] text-sm font-medium hover:border-[var(--ink)] transition"
    >
      Share on WhatsApp
    </a>
  );
}
