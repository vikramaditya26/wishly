"use client";

// Wishly is a wedding gift registry. One page: a cinematic video hero, a short
// "how it works", the gift shelves, invitation templates, planning resources,
// then the couple's details + share links (as steps on the same page).

import { useMemo, useState } from "react";
import { CATEGORIES, PRODUCTS, RESOURCES, TEMPLATES } from "@/lib/catalog";
import { SITE_NAME, amazonSearchLink } from "@/lib/config";
import { AddGiftModal, NewGift } from "@/components/AddGiftModal";
import type { BasketItem } from "@/lib/types";

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

  // basket
  const [picked, setPicked] = useState<Record<string, DraftItem>>({});
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [category, setCategory] = useState<string>("all");

  // details
  const [nameOne, setNameOne] = useState("");
  const [nameTwo, setNameTwo] = useState("");
  const [venue, setVenue] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [message, setMessage] = useState("");
  const [template, setTemplate] = useState(TEMPLATES[0].id);

  // result
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ shareId: string; manageKey: string } | null>(null);

  const pickedList = Object.values(picked);
  const count = pickedList.length;

  const shownCategories = useMemo(
    () => (category === "all" ? CATEGORIES : CATEGORIES.filter((c) => c.id === category)),
    [category]
  );

  function toggleProduct(id: string) {
    setPicked((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        const p = PRODUCTS.find((x) => x.id === id)!;
        next[id] = { id: p.id, name: p.name, imageUrl: p.image, url: amazonSearchLink(p.amazonQuery) };
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

  function startRegistry() {
    document.getElementById("gifts")?.scrollIntoView({ behavior: "smooth" });
  }

  async function createBasket() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/baskets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostName: nameOne,
          partnerTwo: nameTwo,
          venue,
          message,
          theme: template,
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
        mine.push({
          shareId: data.shareId,
          manageKey: data.manageKey,
          hostName: nameTwo ? `${nameOne} & ${nameTwo}` : nameOne,
          createdAt: Date.now(),
        });
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
        <div className="max-w-lg mx-auto animate-rise text-center">
          <p className="font-display text-2xl">{SITE_NAME}</p>
          <div className="gold-rule my-6 max-w-24 mx-auto" />
          <h1 className="font-display text-4xl">Your registry is live.</h1>
          <p className="mt-3 text-[15px] text-[var(--muted)]">
            Share this link on your wedding WhatsApp group. Guests reserve gifts quietly — no two
            people bring the same thing.
          </p>

          <div className="mt-8 text-left">
            <p className="text-xs font-medium uppercase tracking-widest text-[var(--muted)]">Share link</p>
            <CopyRow path={`/b/${result.shareId}`} />
            <WhatsAppButton path={`/b/${result.shareId}`} />
          </div>

          <a
            href={`/manage/${result.shareId}?key=${result.manageKey}`}
            className="btn-primary block text-center w-full py-3 text-[15px] mt-8"
          >
            Open our dashboard →
          </a>
          <p className="mt-2 text-xs text-[var(--muted)]">
            See who reserved what, add or remove gifts anytime. Find it later under{" "}
            <a href="/my" className="underline underline-offset-2">My registries</a>.
          </p>
        </div>
      </main>
    );
  }

  // --------------------------------------------------------------- details
  if (step === "details") {
    const tpl = TEMPLATES.find((t) => t.id === template) ?? TEMPLATES[0];
    return (
      <main className="min-h-screen px-6 py-16">
        <div className="max-w-lg mx-auto animate-rise">
          <button onClick={() => setStep("build")} className="text-sm text-[var(--muted)] hover:text-[var(--ink)]">
            ← Back to gifts
          </button>
          <h1 className="font-display text-4xl mt-6">Your invitation.</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            This is what guests see when they open your link.
          </p>

          <div className="mt-7 space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Partner one">
                <input value={nameOne} onChange={(e) => setNameOne(e.target.value)} placeholder="Aditya" maxLength={60} className="input" />
              </Field>
              <Field label="Partner two">
                <input value={nameTwo} onChange={(e) => setNameTwo(e.target.value)} placeholder="Meera" maxLength={60} className="input" />
              </Field>
            </div>
            <Field label="Venue / city" optional>
              <input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Taj Palace, New Delhi" maxLength={120} className="input" />
            </Field>
            <Field label="Wedding date" optional>
              <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="input" />
            </Field>
            <Field label="A note for your guests" optional>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your blessings are the greatest gift — but if you'd like to give something, here's what would mean the world to us."
                maxLength={500}
                rows={3}
                className="input resize-none"
              />
            </Field>
            <Field label="Invitation template">
              <div className="mt-1 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className={`relative rounded-xl overflow-hidden border-2 transition ${
                      template === t.id ? "border-[var(--maroon)] scale-[1.02]" : "border-transparent"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={t.hero} alt={t.label} className="h-20 w-full object-cover" />
                    <span className="absolute inset-x-0 bottom-0 text-[11px] font-medium text-white py-1" style={{ background: `${t.deep}dd` }}>
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>
            </Field>
          </div>

          {/* live preview */}
          <div className="mt-8 rounded-2xl overflow-hidden border border-[var(--line)]">
            <div className="relative h-40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={tpl.hero} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${tpl.deep}f2, ${tpl.deep}44)` }} />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
                <p className="text-[10px] uppercase tracking-[0.3em]">Together with their families</p>
                <p className="font-display text-2xl mt-1">
                  {nameOne || "Partner one"} <span className="text-[var(--gold-soft)]">&amp;</span> {nameTwo || "Partner two"}
                </p>
                {venue && <p className="text-xs mt-1 opacity-90">{venue}</p>}
              </div>
            </div>
          </div>

          {error && <p className="mt-5 text-sm text-[var(--maroon-deep)]">{error}</p>}

          <button onClick={createBasket} disabled={busy || !nameOne.trim()} className="btn-primary mt-8 w-full py-3.5 text-[15px]">
            {busy ? "Creating…" : "Create our registry"}
          </button>
        </div>
      </main>
    );
  }

  // ----------------------------------------------------------------- build
  return (
    <main className="min-h-screen">
      {/* video hero */}
      <section className="relative h-[86vh] min-h-[520px] w-full overflow-hidden">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/wedding/hero-petals.jpg"
        >
          <source src="/wedding/reel.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/70" />

        <div className="absolute inset-0 flex flex-col">
          <header className="flex items-center justify-between px-6 py-6 text-white">
            <span className="font-display text-2xl">{SITE_NAME}</span>
            <a href="/my" className="text-sm text-white/90 hover:text-white underline-offset-4 hover:underline">
              My registries
            </a>
          </header>

          <div className="flex-1 flex flex-col items-center justify-center text-center text-white px-6 animate-fadein">
            <p className="text-xs uppercase tracking-[0.35em] text-[var(--gold-soft)]">The wedding registry</p>
            <h1 className="font-display text-5xl sm:text-7xl leading-[1.05] mt-4 max-w-3xl">
              Gifts you&apos;ll treasure,
              <br />
              not return.
            </h1>
            <p className="mt-5 text-lg text-white/90 max-w-xl">
              Make one beautiful list for your wedding. Share a single link. Every guest brings
              something different — nothing doubles up.
            </p>
            <button onClick={startRegistry} className="btn-primary mt-8 px-9 py-3.5 text-[15px]">
              Start your registry
            </button>
          </div>
        </div>
      </section>

      {/* how it works — above the gifts, no numbers */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--gold)]">How it works</p>
        <div className="gold-rule my-5 max-w-20 mx-auto" />
        <div className="grid sm:grid-cols-3 gap-8 mt-8 text-left">
          {[
            { t: "Pick your gifts", d: "Choose from wedding essentials — home, kitchen, keepsakes — or add anything from Amazon, Flipkart or Myntra by pasting a link." },
            { t: "Share one invite", d: "Get a beautiful invitation page with your names and a single link to drop in the family WhatsApp group." },
            { t: "Guests reserve quietly", d: "Each gift gets exactly one name on it — so nobody arrives with the same dinner set or the same blender." },
          ].map((s) => (
            <div key={s.t}>
              <p className="font-display text-xl">{s.t}</p>
              <p className="text-sm text-[var(--muted)] mt-2 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* gifts */}
      <section id="gifts" className="max-w-5xl mx-auto px-6 pb-28">
        <div className="flex items-baseline justify-between border-t border-[var(--line)] pt-8">
          <div>
            <h2 className="font-display text-3xl">Build your registry</h2>
            <p className="text-sm text-[var(--muted)] mt-1">Tap to add. Everything a new home needs.</p>
          </div>
          <button
            onClick={() => setShowCustomForm(true)}
            className="btn-gold px-4 py-2 text-sm whitespace-nowrap"
          >
            + Add your own
          </button>
        </div>

        {/* category filter */}
        <div className="mt-5 flex gap-4 overflow-x-auto pb-1 -mx-6 px-6">
          <Tab active={category === "all"} onClick={() => setCategory("all")}>All</Tab>
          {CATEGORIES.map((c) => (
            <Tab key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
              {c.label}
            </Tab>
          ))}
        </div>

        {/* your picks */}
        {count > 0 && (
          <Shelf title={`Your registry · ${count}`} accent>
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

        {shownCategories.map((c) => {
          const items = PRODUCTS.filter((p) => p.category === c.id);
          if (items.length === 0) return null;
          return (
            <Shelf key={c.id} title={c.label} blurb={c.blurb}>
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
      </section>

      {/* templates */}
      <section id="templates" className="bg-[var(--surface)]/60 border-y border-[var(--line)]">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--gold)] text-center">Invitation templates</p>
          <h2 className="font-display text-3xl text-center mt-3">Set the mood for your day</h2>
          <p className="text-sm text-[var(--muted)] text-center mt-2 max-w-md mx-auto">
            Your gift page comes wrapped in a template that matches your wedding — pick one when you
            add your details.
          </p>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {TEMPLATES.map((t) => (
              <div key={t.id} className="rounded-2xl overflow-hidden border border-[var(--line)]">
                <div className="relative h-40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.hero} alt={t.label} className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${t.deep}e6, transparent)` }} />
                  <p className="absolute bottom-2 inset-x-0 text-center text-white text-sm font-medium">{t.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* resources */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--gold)] text-center">For the planning</p>
        <h2 className="font-display text-3xl text-center mt-3">Everything else you&apos;ll need</h2>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {RESOURCES.map((r) => (
            <a
              key={r.title}
              href={r.href}
              target={r.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="rounded-2xl bg-[var(--surface)] border border-[var(--line)] p-5 hover:border-[var(--gold)] transition"
            >
              <span className="text-[11px] font-medium uppercase tracking-widest text-[var(--gold)]">{r.kind}</span>
              <p className="font-display text-lg mt-2">{r.title}</p>
              <p className="text-sm text-[var(--muted)] mt-1.5 leading-relaxed">{r.blurb}</p>
            </a>
          ))}
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-[var(--line)] bg-[var(--surface)]/60">
        <div className="max-w-5xl mx-auto px-6 py-12 grid sm:grid-cols-3 gap-8">
          <div>
            <p className="font-display text-2xl">{SITE_NAME}</p>
            <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
              Wedding registries without the duplicate gifts. Made with love in India.
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-[var(--muted)]">Start</p>
            <div className="mt-3 space-y-2 text-sm">
              <button onClick={startRegistry} className="block hover:text-[var(--maroon)]">Build a registry</button>
              <a href="/my" className="block hover:text-[var(--maroon)]">My registries</a>
              <a href="#templates" className="block hover:text-[var(--maroon)]">Templates</a>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-[var(--muted)]">Good for</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {["Weddings", "Engagements", "Receptions", "New homes"].map((x) => (
                <span key={x} className="text-xs px-2.5 py-1 rounded-full text-white/95" style={{ background: "var(--maroon)" }}>
                  {x}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-[var(--line)]">
          <p className="max-w-5xl mx-auto px-6 py-4 text-xs text-[var(--muted)]">
            © {new Date().getFullYear()} {SITE_NAME} · free forever · no login needed
          </p>
        </div>
      </footer>

      {showCustomForm && <AddGiftModal onAdd={addCustom} onClose={() => setShowCustomForm(false)} />}

      {/* sticky continue bar */}
      {count > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 p-4">
          <div className="max-w-5xl mx-auto flex justify-center">
            <button onClick={() => setStep("details")} className="btn-primary px-10 py-3.5 text-[15px] shadow-xl shadow-black/20">
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
  blurb,
  accent,
  children,
}: {
  title: string;
  blurb?: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-9">
      <h3 className="font-display text-xl flex items-center gap-2">
        {accent && <span className="h-2.5 w-2.5 rounded-full inline-block" style={{ background: "var(--gold)" }} />}
        {title}
      </h3>
      {blurb && <p className="text-sm text-[var(--muted)] mt-0.5">{blurb}</p>}
      <div className="mt-3 flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 snap-x">{children}</div>
    </div>
  );
}

function ShelfCard({
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
    <div
      className={`snap-start shrink-0 w-40 rounded-2xl bg-[var(--surface)] overflow-hidden border ${
        added ? "border-2 border-[var(--maroon)]/50" : "border-[var(--line)]"
      }`}
    >
      <div className="aspect-square bg-[var(--tile)] p-4 flex items-center justify-center">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={name} loading="lazy" className="max-h-full max-w-full object-contain mix-blend-multiply" />
        ) : (
          <span className="font-display text-3xl text-[var(--muted)]">{name.charAt(0).toUpperCase()}</span>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-[13px] font-medium leading-snug line-clamp-2 min-h-[2.4em]">{name}</p>
        <p className="text-[11px] text-[var(--muted)] mt-0.5 truncate">{sub}</p>
        <button
          onClick={onAction}
          className={`mt-2 w-full py-1.5 rounded-full text-[13px] font-medium border transition ${
            added ? "bg-[var(--maroon)] text-white border-[var(--maroon)]" : "border-[var(--gold)] text-[var(--maroon-deep)] hover:bg-[var(--gold)]/10"
          }`}
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap px-1 pb-1.5 text-sm border-b-2 transition ${
        active ? "border-[var(--maroon)] text-[var(--ink)] font-medium" : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
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
    `We made our wedding gift registry — pick something from it (quietly) so nothing gets bought twice: ${url}`
  );
  return (
    <a
      href={`https://wa.me/?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 block text-center w-full py-2.5 rounded-xl border border-[var(--line)] text-sm font-medium hover:border-[var(--maroon)] hover:text-[var(--maroon)] transition"
    >
      Share on WhatsApp
    </a>
  );
}
