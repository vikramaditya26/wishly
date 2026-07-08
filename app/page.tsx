"use client";

// Wishly's single-page builder. Browsing is shelf-based (a "picked for you"
// row plus one horizontal row per category) so a big catalog never becomes an
// endless wall - tap a category name to see all of it as a grid.

import { useMemo, useState } from "react";
import { CATEGORIES, FOR_WHO, OCCASIONS, PRODUCTS, THEMES, VIBES } from "@/lib/catalog";
import { SITE_NAME, amazonSearchLink } from "@/lib/config";
import { AddGiftModal, NewGift } from "@/components/AddGiftModal";
import type { BasketItem, CatalogProduct, ForWho, Occasion, Vibe } from "@/lib/types";

type Step = "build" | "details" | "done";
type DraftItem = Omit<BasketItem, "claimedBy">;

const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]));

// hero collage photos (nice-looking products from the catalog)
const HERO_IMAGES = [
  "https://cdn.dummyjson.com/product-images/fragrances/gucci-bloom-eau-de/thumbnail.webp",
  "https://cdn.dummyjson.com/product-images/womens-watches/watch-gold-for-women/thumbnail.webp",
  "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods-max-silver/thumbnail.webp",
];

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
  const [vibe, setVibe] = useState<Vibe | null>(null);
  const [category, setCategory] = useState<string>("all");

  // basket
  const [picked, setPicked] = useState<Record<string, DraftItem>>({});
  const [showCustomForm, setShowCustomForm] = useState(false);

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

  const matches = useMemo(
    () =>
      PRODUCTS.filter(
        (p) =>
          (!forWho || p.forWho === forWho || p.forWho === "anyone") &&
          (!vibe || p.vibe === vibe || p.vibe === "any")
      ),
    [forWho, vibe]
  );

  // a spread across categories, so "picked for you" never feels one-note
  const pickedForYou = useMemo(() => {
    const byCat = new Map<string, CatalogProduct[]>();
    for (const p of matches) {
      const arr = byCat.get(p.category) ?? [];
      arr.push(p);
      byCat.set(p.category, arr);
    }
    const out: CatalogProduct[] = [];
    let added = true;
    while (out.length < 12 && added) {
      added = false;
      for (const arr of byCat.values()) {
        const next = arr.shift();
        if (next) {
          out.push(next);
          added = true;
          if (out.length >= 12) break;
        }
      }
    }
    return out;
  }, [matches]);

  const customItems = useMemo(
    () => Object.values(picked).filter((it) => it.id.startsWith("custom-")),
    [picked]
  );
  const pickedList = Object.values(picked);
  const count = pickedList.length;

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

  function addCustom(gift: NewGift) {
    const id = `custom-${Date.now()}`;
    setPicked((prev) => ({ ...prev, [id]: { id, ...gift } }));
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
          items: pickedList,
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
              See who reserved what, and add or remove gifts anytime. You&apos;ll always find it under{" "}
              <a href="/my" className="underline underline-offset-2 hover:text-[var(--ink)]">
                My lists
              </a>{" "}
              on this device — but keep a copy somewhere safe too.
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
  const showShelves = category === "all";
  const gridItems = showShelves ? [] : matches.filter((p) => p.category === category);

  return (
    <main className="min-h-screen pb-32">
      <header className="max-w-5xl mx-auto px-6 pt-8 flex items-baseline justify-between">
        <span className="font-display text-2xl">{SITE_NAME}</span>
        <a
          href="/my"
          className="text-sm text-[var(--muted)] hover:text-[var(--accent-deep)] underline-offset-4 hover:underline"
        >
          My lists
        </a>
      </header>

      {/* hero with a small product collage */}
      <section className="max-w-5xl mx-auto px-6 pt-14 pb-10">
        <div className="relative">
          <h1 className="font-display text-5xl sm:text-6xl leading-[1.08] max-w-2xl">
            Get gifts you&apos;ll{" "}
            <em className="text-[var(--accent)] not-italic font-display italic">actually</em> love.
          </h1>
          <p className="mt-5 text-lg text-[var(--muted)] max-w-xl">
            Build your wishlist in a minute and share one link. Friends quietly reserve gifts —
            so nothing gets bought twice.
          </p>

          <div className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 gap-0" aria-hidden>
            {HERO_IMAGES.map((src, i) => (
              <div
                key={src}
                className="h-28 w-28 rounded-2xl bg-[var(--tile)] border border-[var(--line)] shadow-md shadow-black/5 flex items-center justify-center p-3"
                style={{
                  transform: `rotate(${[-7, 4, -3][i]}deg) translateY(${[8, -10, 6][i]}px)`,
                  marginLeft: i === 0 ? 0 : -14,
                  zIndex: 3 - i,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="max-h-full max-w-full object-contain mix-blend-multiply" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* builder */}
      <section className="max-w-5xl mx-auto px-6">
        <div className="border-t border-[var(--line)] pt-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-[var(--muted)] mr-1">
              Gifting for
            </span>
            {FOR_WHO.map((f) => (
              <Chip key={f.id} active={forWho === f.id} onClick={() => setForWho(forWho === f.id ? null : f.id)}>
                {f.label}
              </Chip>
            ))}
            <span className="mx-1.5 h-4 w-px bg-[var(--line)]" />
            {VIBES.map((v) => (
              <Chip key={v.id} active={vibe === v.id} onClick={() => setVibe(vibe === v.id ? null : v.id)}>
                {v.label}
              </Chip>
            ))}
            <button
              onClick={() => setShowCustomForm(true)}
              className="ml-auto px-4 py-1.5 rounded-full text-sm font-medium bg-[var(--accent-soft)] text-[var(--accent-deep)] border border-[var(--accent)]/30 hover:bg-[var(--accent)]/15 transition"
            >
              + Add your own
            </button>
          </div>

          <div className="mt-4 flex gap-4 overflow-x-auto pb-1 -mx-6 px-6">
            <Tab active={category === "all"} onClick={() => setCategory("all")}>
              Browse all
            </Tab>
            {CATEGORIES.map((c) => (
              <Tab key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
                {c.label}
              </Tab>
            ))}
          </div>
        </div>

        {/* your picks */}
        {count > 0 && (
          <Shelf title={`Your picks · ${count}`}>
            {pickedList.map((it) => (
              <ShelfCard
                key={it.id}
                image={it.imageUrl}
                name={it.name}
                sub={
                  it.id.startsWith("custom-")
                    ? linkDomain(it.url)
                      ? `from ${linkDomain(it.url)}`
                      : "added by you"
                    : CATEGORY_LABEL[PRODUCTS.find((p) => p.id === it.id)?.category ?? ""] ?? ""
                }
                added
                actionLabel="Remove"
                onAction={() => removeItem(it.id)}
              />
            ))}
          </Shelf>
        )}

        {showShelves ? (
          <>
            <Shelf
              title={
                forWho || vibe
                  ? `Picked for ${[
                      forWho ? FOR_WHO.find((f) => f.id === forWho)?.label.replace("For ", "") : null,
                      vibe ? VIBES.find((v) => v.id === vibe)?.label.toLowerCase() : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}`
                  : "Popular picks"
              }
            >
              {pickedForYou.map((p) => (
                <ShelfCard
                  key={p.id}
                  image={p.image}
                  name={p.name}
                  sub={CATEGORY_LABEL[p.category]}
                  added={!!picked[p.id]}
                  actionLabel={picked[p.id] ? "Added ✓" : "Add"}
                  onAction={() => toggleProduct(p.id)}
                />
              ))}
            </Shelf>

            {CATEGORIES.map((c) => {
              const items = matches.filter((p) => p.category === c.id);
              if (items.length === 0) return null;
              return (
                <Shelf
                  key={c.id}
                  title={c.label}
                  onSeeAll={() => {
                    setCategory(c.id);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  {items.map((p) => (
                    <ShelfCard
                      key={p.id}
                      image={p.image}
                      name={p.name}
                      sub={CATEGORY_LABEL[p.category]}
                      added={!!picked[p.id]}
                      actionLabel={picked[p.id] ? "Added ✓" : "Add"}
                      onAction={() => toggleProduct(p.id)}
                    />
                  ))}
                </Shelf>
              );
            })}
          </>
        ) : (
          <>
            <div className="mt-8 flex items-baseline justify-between">
              <h2 className="font-display text-2xl">{CATEGORY_LABEL[category]}</h2>
              <button
                onClick={() => setCategory("all")}
                className="text-sm text-[var(--muted)] hover:text-[var(--ink)] underline underline-offset-4"
              >
                ← Browse all
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {gridItems.map((p) => (
                <GridCard
                  key={p.id}
                  image={p.image}
                  name={p.name}
                  sub={CATEGORY_LABEL[p.category]}
                  added={!!picked[p.id]}
                  actionLabel={picked[p.id] ? "Added ✓" : "Add"}
                  onAction={() => toggleProduct(p.id)}
                />
              ))}
            </div>
            {gridItems.length === 0 && (
              <p className="text-center text-[var(--muted)] mt-16 text-sm">
                Nothing matches here — try removing a filter.
              </p>
            )}
          </>
        )}
      </section>

      <footer className="max-w-5xl mx-auto px-6 mt-20 pt-6 border-t border-[var(--line)] flex items-baseline justify-between text-xs text-[var(--muted)]">
        <span>{SITE_NAME} — free gift lists for every occasion.</span>
        <a href="/my" className="hover:text-[var(--ink)] underline-offset-2 hover:underline">
          My lists
        </a>
      </footer>

      {showCustomForm && (
        <AddGiftModal onAdd={addCustom} onClose={() => setShowCustomForm(false)} />
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

function Shelf({
  title,
  onSeeAll,
  children,
}: {
  title: string;
  onSeeAll?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-9">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-xl">{title}</h2>
        {onSeeAll && (
          <button
            onClick={onSeeAll}
            className="text-sm text-[var(--muted)] hover:text-[var(--accent-deep)]"
          >
            See all →
          </button>
        )}
      </div>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 snap-x">
        {children}
      </div>
    </div>
  );
}

function CardBody({
  image,
  name,
  sub,
  added,
  actionLabel,
  onAction,
}: {
  image?: string;
  name: string;
  sub: string;
  added: boolean;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <>
      <div className="aspect-square bg-[var(--tile)] p-4 flex items-center justify-center">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={name}
            loading="lazy"
            className="max-h-full max-w-full object-contain mix-blend-multiply"
          />
        ) : (
          <span className="font-display text-3xl text-[var(--muted)]">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-[13px] font-medium leading-snug line-clamp-2 min-h-[2.4em]">{name}</p>
        <p className="text-[11px] text-[var(--muted)] mt-0.5 truncate">{sub}</p>
        <button
          onClick={onAction}
          className={`mt-2 w-full py-1.5 rounded-full text-[13px] font-medium border transition ${
            added
              ? "bg-[var(--ink)] text-white border-[var(--ink)]"
              : "border-[var(--accent)]/40 text-[var(--accent-deep)] hover:bg-[var(--accent-soft)]/60"
          }`}
        >
          {actionLabel}
        </button>
      </div>
    </>
  );
}

function ShelfCard(props: Parameters<typeof CardBody>[0]) {
  return (
    <div
      className={`snap-start shrink-0 w-40 rounded-2xl bg-[var(--surface)] overflow-hidden border ${
        props.added ? "border-2 border-[var(--accent)]/50" : "border-[var(--line)]"
      }`}
    >
      <CardBody {...props} />
    </div>
  );
}

function GridCard(props: Parameters<typeof CardBody>[0]) {
  return (
    <div
      className={`rounded-2xl bg-[var(--surface)] overflow-hidden border ${
        props.added ? "border-2 border-[var(--accent)]/50" : "border-[var(--line)]"
      }`}
    >
      <CardBody {...props} />
    </div>
  );
}

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
