"use client";

// Wishly is a single-page experience: short intro, then the list builder
// directly below. Details + share links swap in as steps on the same page.
// No prices anywhere - a gift list is about the gifts, not the money.

import { useEffect, useMemo, useState } from "react";
import { CATEGORIES, FOR_WHO, OCCASIONS, PRODUCTS, THEMES } from "@/lib/catalog";
import { SITE_NAME, amazonSearchLink } from "@/lib/config";
import type { BasketItem, ForWho, Occasion } from "@/lib/types";

type Step = "build" | "details" | "done";
type DraftItem = Omit<BasketItem, "claimedBy">;

const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]));

function linkDomain(url?: string): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export default function Home() {
  const [step, setStep] = useState<Step>("build");

  // filters
  const [forWho, setForWho] = useState<ForWho | null>(null);
  const [category, setCategory] = useState<string>("all");

  // basket
  const [picked, setPicked] = useState<Record<string, DraftItem>>({});
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [custom, setCustom] = useState({ name: "", url: "", imageUrl: "" });
  const [fetchingLink, setFetchingLink] = useState(false);
  const [fetchNote, setFetchNote] = useState("");

  // details
  const [occasion, setOccasion] = useState<Occasion>("birthday");
  const [hostName, setHostName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [message, setMessage] = useState("");
  const [theme, setTheme] = useState(THEMES[0].id);

  // result
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ shareId: string; manageKey: string } | null>(null);

  // when a product link is pasted, read its name / photo automatically
  useEffect(() => {
    const url = custom.url.trim();
    if (!/^https?:\/\/\S+\.\S+/.test(url)) return;
    const timer = setTimeout(async () => {
      setFetchingLink(true);
      setFetchNote("");
      try {
        const res = await fetch("/api/product-preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setCustom((prev) => ({
          ...prev,
          name: prev.name.trim() ? prev.name : data.name ?? "",
          imageUrl: prev.imageUrl.trim() ? prev.imageUrl : data.imageUrl ?? "",
        }));
        setFetchNote(data.name || data.imageUrl ? "Details filled from the link." : "");
      } catch (e) {
        setFetchNote(e instanceof Error ? e.message : "Couldn't read that page - fill the details manually.");
      } finally {
        setFetchingLink(false);
      }
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [custom.url]);

  const visible = useMemo(
    () =>
      PRODUCTS.filter(
        (p) =>
          (!forWho || p.forWho === forWho || p.forWho === "anyone") &&
          (category === "all" || p.category === category)
      ),
    [forWho, category]
  );

  const customItems = useMemo(
    () => Object.values(picked).filter((it) => it.id.startsWith("custom-")),
    [picked]
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
          url: amazonSearchLink(p.amazonQuery),
        };
      }
      return next;
    });
  }

  function removeItem(id: string) {
    setPicked((prev) => {
      const next = { ...prev };
      delete next[id];
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
      },
    }));
    setCustom({ name: "", url: "", imageUrl: "" });
    setFetchNote("");
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
          <h1 className="font-display text-4xl mt-10">
            Your list is live<span className="text-[var(--accent)]">.</span>
          </h1>
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
    const pickedList = Object.values(picked);
    return (
      <main className="min-h-screen px-6 py-16">
        <div className="max-w-lg mx-auto animate-rise">
          <button
            onClick={() => setStep("build")}
            className="text-sm text-[var(--muted)] hover:text-[var(--ink)]"
          >
            ← Back to gifts
          </button>
          <h1 className="font-display text-4xl mt-6">
            Almost there<span className="text-[var(--accent)]">.</span>
          </h1>

          {/* your picks, with photos */}
          <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
            {pickedList.map((it) => (
              <div
                key={it.id}
                className="shrink-0 h-16 w-16 rounded-xl bg-[var(--tile)] border border-[var(--line)] flex items-center justify-center overflow-hidden"
                title={it.name}
              >
                {it.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.imageUrl} alt={it.name} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                ) : (
                  <span className="font-display text-xl text-[var(--muted)]">
                    {it.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-7 space-y-6">
            <Field label="The occasion">
              <div className="flex flex-wrap gap-2 pt-1">
                {OCCASIONS.map((o) => (
                  <Chip key={o.id} active={occasion === o.id} onClick={() => setOccasion(o.id)}>
                    {o.label}
                  </Chip>
                ))}
              </div>
            </Field>
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
                        ? "border-[var(--accent)] ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg)]"
                        : "border-[var(--line)]"
                    }`}
                    style={{ background: t.tile }}
                  />
                ))}
              </div>
            </Field>
          </div>

          {error && <p className="mt-5 text-sm text-[var(--accent-deep)]">{error}</p>}

          <button
            onClick={createBasket}
            disabled={busy || !hostName.trim()}
            className="btn-primary mt-9 w-full py-3.5 text-[15px]"
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

      {/* hero — short and warm */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12">
        <h1 className="font-display text-5xl sm:text-6xl leading-[1.08] max-w-2xl">
          Get gifts you&apos;ll <em className="text-[var(--accent)] not-italic font-display italic">actually</em> love.
        </h1>
        <p className="mt-5 text-lg text-[var(--muted)] max-w-xl">
          Build your wishlist in a minute and share one link. Friends quietly reserve gifts —
          so nothing gets bought twice.
        </p>
      </section>

      {/* builder */}
      <section className="max-w-5xl mx-auto px-6">
        <div className="border-t border-[var(--line)] pt-8">
          <div className="flex flex-wrap items-center gap-2">
            <Chip active={forWho === null} onClick={() => setForWho(null)}>
              Everything
            </Chip>
            {FOR_WHO.map((f) => (
              <Chip key={f.id} active={forWho === f.id} onClick={() => setForWho(f.id)}>
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
            className="rounded-2xl border border-dashed border-[var(--accent)]/40 bg-[var(--accent-soft)]/40 min-h-56 flex flex-col items-center justify-center gap-1.5 text-[var(--accent-deep)] hover:bg-[var(--accent-soft)] transition p-4"
          >
            <span className="text-2xl leading-none">+</span>
            <span className="text-sm font-medium">Add your own</span>
            <span className="text-xs opacity-80">paste any product link</span>
          </button>

          {/* items you added yourself, shown with their photo */}
          {customItems.map((it) => {
            const domain = linkDomain(it.url);
            return (
              <div
                key={it.id}
                className="rounded-2xl bg-[var(--surface)] border-2 border-[var(--accent)]/50 overflow-hidden"
              >
                <div className="aspect-square bg-[var(--tile)] p-5 flex items-center justify-center">
                  {it.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={it.imageUrl}
                      alt={it.name}
                      loading="lazy"
                      className="max-h-full max-w-full object-contain mix-blend-multiply"
                    />
                  ) : (
                    <span className="font-display text-4xl text-[var(--muted)]">
                      {it.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium leading-snug line-clamp-2">{it.name}</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    {domain ? `from ${domain}` : "added by you"}
                  </p>
                  <button
                    onClick={() => removeItem(it.id)}
                    className="mt-2.5 w-full py-1.5 rounded-full text-sm font-medium bg-[var(--ink)] text-white"
                  >
                    Added ✓ tap to remove
                  </button>
                </div>
              </div>
            );
          })}

          {visible.map((p) => {
            const added = !!picked[p.id];
            return (
              <div
                key={p.id}
                className={`rounded-2xl bg-[var(--surface)] border overflow-hidden transition ${
                  added ? "border-2 border-[var(--accent)]/50" : "border-[var(--line)]"
                }`}
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
                  <p className="text-xs text-[var(--muted)] mt-0.5">{CATEGORY_LABEL[p.category]}</p>
                  <button
                    onClick={() => toggleProduct(p.id)}
                    className={`mt-2.5 w-full py-1.5 rounded-full text-sm font-medium border transition ${
                      added
                        ? "bg-[var(--ink)] text-white border-[var(--ink)]"
                        : "border-[var(--accent)]/40 text-[var(--accent-deep)] hover:bg-[var(--accent-soft)]/60"
                    }`}
                  >
                    {added ? "Added ✓" : "Add"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {visible.length === 0 && customItems.length === 0 && (
          <p className="text-center text-[var(--muted)] mt-16 text-sm">
            Nothing here — try another category.
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
              Paste a link from Amazon, Flipkart, Myntra — the name and photo fill in automatically.
            </p>
            <div className="mt-5 space-y-3">
              <input
                value={custom.url}
                onChange={(e) => setCustom({ ...custom, url: e.target.value })}
                placeholder="Paste product link"
                className="input"
              />
              {(fetchingLink || fetchNote) && (
                <p className="text-xs text-[var(--muted)] px-1">
                  {fetchingLink ? "Reading the link…" : fetchNote}
                </p>
              )}
              {custom.imageUrl && (
                <div className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--tile)] p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={custom.imageUrl}
                    alt=""
                    className="h-14 w-14 object-contain mix-blend-multiply"
                  />
                  <p className="text-xs text-[var(--muted)] leading-snug line-clamp-3">
                    {custom.name || "Photo found"}
                  </p>
                </div>
              )}
              <input
                value={custom.name}
                onChange={(e) => setCustom({ ...custom, name: e.target.value })}
                placeholder="Gift name"
                maxLength={120}
                className="input"
              />
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => {
                  setShowCustomForm(false);
                  setFetchNote("");
                }}
                className="flex-1 py-2.5 rounded-full border border-[var(--line)] text-sm font-medium text-[var(--muted)]"
              >
                Cancel
              </button>
              <button
                onClick={addCustom}
                disabled={!custom.name.trim()}
                className="btn-primary flex-1 py-2.5 text-sm"
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
              className="btn-primary px-10 py-3.5 text-[15px] shadow-xl shadow-black/15"
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
          ? "border-[var(--accent)] text-[var(--ink)] font-medium"
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
        className="btn-primary px-5 py-2.5 text-sm"
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
      className="mt-3 block text-center w-full py-2.5 rounded-xl border border-[var(--line)] text-sm font-medium hover:border-[var(--accent)] hover:text-[var(--accent-deep)] transition"
    >
      Share on WhatsApp
    </a>
  );
}
