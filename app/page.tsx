"use client";

// Wishly — a premium Indian wedding gift registry, on one page: a cinematic
// hero, an illustrated "how it works", the gift shelves, an "add your own"
// centrepiece, invitation templates, then the couple's details + share links
// (as steps on the same page).

import { useEffect, useMemo, useState } from "react";
import { CATEGORIES, PRODUCTS, TEMPLATES } from "@/lib/catalog";
import { SITE_NAME, amazonSearchLink } from "@/lib/config";
import { AddGiftModal, NewGift } from "@/components/AddGiftModal";
import { burstConfetti } from "@/lib/confetti";
import { Petals } from "@/components/Petals";
import { GoldDivider, Lotus, Mandala, FloralCorner, PeacockFeather } from "@/components/Decor";
import type { AdminItem, BasketItem } from "@/lib/types";

// One shape for shelf cards, whether the gift is built-in or owner-added.
interface Displayable {
  id: string;
  name: string;
  image?: string;
  category: string;
  url: string;
}

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

const STEPS = [
  { icon: "❁", t: "Create your registry", d: "Choose the gifts that will help you begin your new life together." },
  { icon: "✦", t: "Add your own gifts", d: "Can't find something? Add any gift — heirlooms, home, experiences — with a photo.", highlight: true },
  { icon: "✉", t: "Share with loved ones", d: "Send one beautiful invitation link to all your family and friends." },
  { icon: "❤", t: "Guests reserve gifts", d: "They quietly claim a gift, so two people never bring the same thing." },
];

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

  // owner-added catalog items (merged into the shelves for everyone)
  const [adminItems, setAdminItems] = useState<AdminItem[]>([]);
  useEffect(() => {
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((d) => setAdminItems(Array.isArray(d.items) ? d.items : []))
      .catch(() => {});
  }, []);

  // result
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ shareId: string; manageKey: string } | null>(null);

  const pickedList = Object.values(picked);
  const count = pickedList.length;

  // built-in gifts + owner-added, in one lookup keyed by id
  const allProducts = useMemo<Map<string, Displayable>>(() => {
    const m = new Map<string, Displayable>();
    for (const p of PRODUCTS) {
      m.set(p.id, { id: p.id, name: p.name, image: p.image, category: p.category, url: p.buyUrl ?? amazonSearchLink(p.amazonQuery) });
    }
    for (const a of adminItems) {
      m.set(a.id, { id: a.id, name: a.name, image: a.imageUrl, category: a.category, url: a.buyUrl || amazonSearchLink(a.name) });
    }
    return m;
  }, [adminItems]);

  const productsByCategory = useMemo(() => {
    const m = new Map<string, Displayable[]>();
    for (const p of allProducts.values()) {
      const arr = m.get(p.category) ?? [];
      arr.push(p);
      m.set(p.category, arr);
    }
    return m;
  }, [allProducts]);

  const shownCategories = useMemo(
    () => (category === "all" ? CATEGORIES : CATEGORIES.filter((c) => c.id === category)),
    [category]
  );

  function toggleProduct(id: string, e?: React.MouseEvent) {
    const wasAdded = !!picked[id];
    setPicked((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else {
        const p = allProducts.get(id);
        if (p) next[id] = { id: p.id, name: p.name, imageUrl: p.image, url: p.url };
      }
      return next;
    });
    if (!wasAdded && e) burstConfetti(e.clientX, e.clientY);
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
    burstConfetti();
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
        body: JSON.stringify({ hostName: nameOne, partnerTwo: nameTwo, venue, message, theme: template, eventDate, items: pickedList }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setResult(data);
      setStep("done");
      burstConfetti();
      try {
        const mine = JSON.parse(localStorage.getItem("wishly-my-baskets") || "[]");
        mine.push({ shareId: data.shareId, manageKey: data.manageKey, hostName: nameTwo ? `${nameOne} & ${nameTwo}` : nameOne, createdAt: Date.now() });
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
    return <SharePage shareId={result.shareId} manageKey={result.manageKey} couple={nameTwo ? `${nameOne} & ${nameTwo}` : nameOne} />;
  }

  // --------------------------------------------------------------- details
  if (step === "details") {
    const tpl = TEMPLATES.find((t) => t.id === template) ?? TEMPLATES[0];
    return (
      <main className="min-h-screen px-6 py-16">
        <Petals count={10} />
        <div className="max-w-lg mx-auto animate-rise">
          <button onClick={() => setStep("build")} className="text-sm text-[var(--muted)] hover:text-[var(--ink)]">
            ← Back to gifts
          </button>

          <div className="mt-6 text-center">
            <p className="eyebrow">Your invitation</p>
            <h1 className="font-display text-4xl mt-2">A few words about the two of you</h1>
            <GoldDivider className="mt-4" />
          </div>

          {/* live invitation preview */}
          <div className="mt-8 rounded-2xl overflow-hidden gold-frame relative">
            <div className="relative h-48">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={tpl.hero} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${tpl.deep}f2, ${tpl.deep}55)` }} />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
                <p className="text-[10px] tracking-invite uppercase text-[var(--gold-soft)]">Together with our families</p>
                <p className="font-names text-2xl mt-2">
                  {nameOne || "Bride"} <span className="text-[var(--gold-soft)]">&amp;</span> {nameTwo || "Groom"}
                </p>
                {venue && <p className="text-xs mt-1 opacity-90">{venue}</p>}
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Bride">
                <input value={nameOne} onChange={(e) => setNameOne(e.target.value)} placeholder="Meera" maxLength={60} className="input" />
              </Field>
              <Field label="Groom">
                <input value={nameTwo} onChange={(e) => setNameTwo(e.target.value)} placeholder="Aditya" maxLength={60} className="input" />
              </Field>
            </div>
            <Field label="Venue / city" optional>
              <input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Umaid Bhawan, Jodhpur" maxLength={120} className="input" />
            </Field>
            <Field label="Wedding date" optional>
              <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="input" />
            </Field>
            <Field label="A note for your guests" optional>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your blessings are the greatest gift of all — but if you wish to give something, here is what would truly mean the world to us."
                maxLength={500}
                rows={3}
                className="input resize-none"
              />
            </Field>
            <Field label="Invitation template">
              <div className="mt-1 grid grid-cols-3 sm:grid-cols-5 gap-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className={`relative rounded-xl overflow-hidden border-2 transition ${template === t.id ? "border-[var(--gold)] scale-[1.04]" : "border-transparent opacity-80"}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={t.hero} alt={t.label} className="h-16 w-full object-cover" />
                    <span className="absolute inset-x-0 bottom-0 text-[9px] font-medium text-white py-0.5" style={{ background: `${t.deep}dd` }}>
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>
            </Field>
          </div>

          {error && <p className="mt-5 text-sm text-[var(--maroon-deep)]">{error}</p>}

          <button onClick={createBasket} disabled={busy || !nameOne.trim()} className="btn-primary mt-8 w-full py-3.5 text-[15px]">
            {busy ? "Creating your registry…" : "Create our registry"}
          </button>
        </div>
      </main>
    );
  }

  // ----------------------------------------------------------------- build
  return (
    <main className="min-h-screen">
      <Petals />

      {/* ---------------------------------- hero ---------------------------------- */}
      <section className="relative overflow-hidden">
        {/* corner florals */}
        <FloralCorner className="absolute top-2 left-2 h-24 w-24 text-[var(--gold)] opacity-40" />
        <FloralCorner className="absolute top-2 right-2 h-24 w-24 text-[var(--gold)] opacity-40 -scale-x-100" />
        <PeacockFeather className="hidden sm:block absolute -bottom-4 left-6 h-40 w-20 text-[var(--emerald)] opacity-25" />
        <PeacockFeather className="hidden sm:block absolute -bottom-4 right-6 h-40 w-20 text-[var(--emerald)] opacity-25 -scale-x-100" />

        <header className="relative z-10 max-w-5xl mx-auto flex items-center justify-between px-6 py-6">
          <span className="font-names text-2xl text-[var(--maroon)]">{SITE_NAME}</span>
          <a href="/my" className="text-sm text-[var(--muted)] hover:text-[var(--maroon)] underline-offset-4 hover:underline">
            My registries
          </a>
        </header>

        <div className="relative z-10 max-w-3xl mx-auto text-center px-6 pt-10 pb-20 animate-rise">
          <p className="eyebrow">A wedding gift registry</p>
          <h1 className="font-display text-5xl sm:text-7xl leading-[1.05] mt-4 text-[var(--maroon-deep)]">
            Celebrate Love.
            <br />
            Celebrate Together.
          </h1>
          <GoldDivider className="mt-6" />
          <p className="mt-6 text-lg text-[var(--muted)] max-w-xl mx-auto leading-relaxed">
            Create your wedding gift registry, share it with the people you love, and let every gift
            become part of your new journey together.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <button onClick={startRegistry} className="btn-primary px-9 py-3.5 text-[15px]">
              Create your registry
            </button>
            <a href="#how" className="btn-outline-gold px-8 py-3.5 text-[15px]">
              How it works
            </a>
          </div>
        </div>
      </section>

      {/* -------------------------------- how it works -------------------------------- */}
      <section id="how" className="mandala-bg relative max-w-5xl mx-auto px-6 py-20 overflow-hidden">
        <Mandala className="mandala-art -right-24 -top-16 h-80 w-80" />
        <div className="relative text-center">
          <p className="eyebrow">The four simple steps</p>
          <h2 className="font-display text-4xl mt-2">How it works</h2>
          <GoldDivider className="mt-5" />
        </div>

        <div className="relative mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* connecting line on large screens */}
          <div className="hidden lg:block absolute top-9 left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent" aria-hidden />
          {STEPS.map((s) => (
            <div
              key={s.t}
              className={`card card-lift relative p-6 text-center ${s.highlight ? "ring-1 ring-[var(--gold)]" : ""}`}
            >
              {s.highlight && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] tracking-widest uppercase bg-[var(--maroon)] text-[var(--ivory)] px-3 py-0.5 rounded-full">
                  Most loved
                </span>
              )}
              <div className="mx-auto h-16 w-16 rounded-full flex items-center justify-center text-2xl text-[var(--maroon)] border border-[var(--gold)]" style={{ background: "radial-gradient(circle at 30% 30%, #fff, var(--tile))" }}>
                {s.icon}
              </div>
              <p className="font-display text-xl mt-4">{s.t}</p>
              <p className="text-sm text-[var(--muted)] mt-2 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------- gifts ---------------------------------- */}
      <section id="gifts" className="max-w-5xl mx-auto px-6 pb-8">
        <div className="text-center">
          <p className="eyebrow">Begin your new home</p>
          <h2 className="font-display text-4xl mt-2">Build your registry</h2>
          <GoldDivider className="mt-5" />
          <p className="text-sm text-[var(--muted)] mt-4">Tap the gifts you&apos;d truly love — everything a new life together needs.</p>
        </div>

        {/* category filter */}
        <div className="mt-8 flex gap-5 overflow-x-auto pb-1 justify-start sm:justify-center -mx-6 px-6">
          <Tab active={category === "all"} onClick={() => setCategory("all")}>All</Tab>
          {CATEGORIES.map((c) => (
            <Tab key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
              {c.label}
            </Tab>
          ))}
        </div>

        {count > 0 && (
          <Shelf title={`Your registry · ${count}`} accent>
            {pickedList.map((it) => (
              <ShelfCard
                key={it.id}
                image={it.imageUrl}
                name={it.name}
                sub={it.id.startsWith("custom-") ? (linkDomain(it.url) ? `from ${linkDomain(it.url)}` : "added by you") : CATEGORY_LABEL[allProducts.get(it.id)?.category ?? ""] ?? ""}
                added
                actionLabel="Remove"
                onAction={() => removeItem(it.id)}
              />
            ))}
          </Shelf>
        )}

        {shownCategories.map((c) => {
          const items = productsByCategory.get(c.id) ?? [];
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
                  onAction={(e) => toggleProduct(p.id, e)}
                />
              ))}
            </Shelf>
          );
        })}
      </section>

      {/* ----------------------------- add your own (centrepiece) ----------------------------- */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="relative rounded-3xl overflow-hidden text-center px-6 py-14 text-[var(--ivory)]" style={{ background: "linear-gradient(135deg, var(--maroon), var(--maroon-deep))" }}>
          <Mandala className="absolute -left-16 -bottom-16 h-64 w-64 text-[var(--gold)] opacity-10" />
          <Mandala className="absolute -right-16 -top-16 h-64 w-64 text-[var(--gold)] opacity-10" />
          <div className="relative">
            <Lotus className="h-8 w-8 mx-auto text-[var(--gold-soft)]" />
            <p className="eyebrow mt-3" style={{ color: "var(--gold-soft)" }}>Make it yours</p>
            <h2 className="font-display text-4xl mt-2">Looking for something special?</h2>
            <p className="mt-4 text-[15px] max-w-xl mx-auto opacity-90 leading-relaxed">
              Add any gift you dream of — heirloom jewellery, home essentials, a honeymoon experience,
              or something wholly unique. Paste a link and we&apos;ll pull in the photo for you.
            </p>
            <button onClick={() => setShowCustomForm(true)} className="btn-gold-fill mt-8 px-9 py-3.5 text-[15px] inline-flex items-center gap-2">
              <span className="text-lg leading-none">✦</span> Add your own gift
            </button>
          </div>
        </div>
      </section>

      {/* -------------------------------- templates -------------------------------- */}
      <section id="templates" className="mandala-bg relative border-y border-[var(--line)] bg-[var(--cream)]/40">
        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <p className="eyebrow">Invitation templates</p>
          <h2 className="font-display text-4xl mt-2">Set the mood for your day</h2>
          <GoldDivider className="mt-5" />
          <p className="text-sm text-[var(--muted)] mt-4 max-w-md mx-auto">
            Your registry comes wrapped in an invitation that matches your celebration. Choose yours
            when you add your details.
          </p>
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {TEMPLATES.map((t) => (
              <div key={t.id} className="rounded-2xl overflow-hidden gold-frame card-lift">
                <div className="relative h-44">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.hero} alt={t.label} className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${t.deep}ee, transparent)` }} />
                  <p className="absolute bottom-2 inset-x-0 text-center text-white text-sm font-medium tracking-wide">{t.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------- footer ---------------------------------- */}
      <Footer onStart={startRegistry} />

      {showCustomForm && <AddGiftModal onAdd={addCustom} onClose={() => setShowCustomForm(false)} />}

      {/* sticky continue bar */}
      {count > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 p-4">
          <div className="max-w-5xl mx-auto flex justify-center">
            <button onClick={() => setStep("details")} className="btn-gold-fill px-9 py-3.5 text-[15px] inline-flex items-center gap-2">
              <span className="text-lg leading-none">❁</span>
              Continue to your invitation
              <span className="rounded-full bg-[var(--maroon)] text-[var(--ivory)] text-xs px-2.5 py-0.5">{count}</span>
              <span aria-hidden className="transition-transform">→</span>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

// ------------------------------- share / done -------------------------------

function SharePage({ shareId, manageKey, couple }: { shareId: string; manageKey: string; couple: string }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/b/${shareId}` : `/b/${shareId}`;
  const waText = encodeURIComponent(`We've created our wedding gift registry! Pick something from it (quietly) so nothing gets bought twice 💕 ${shareUrl}`);
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=7A1226&bgcolor=FFF8F0&data=${encodeURIComponent(shareUrl)}`;

  return (
    <main className="min-h-screen px-6 py-16">
      <Petals />
      <div className="max-w-lg mx-auto text-center animate-rise">
        <Lotus className="h-10 w-10 mx-auto text-[var(--gold)]" />
        <p className="eyebrow mt-4">Congratulations, {couple.split(" ")[0]}</p>
        <h1 className="font-display text-4xl mt-2">Your registry is ready!</h1>
        <GoldDivider className="mt-5" />
        <p className="mt-5 text-[15px] text-[var(--muted)]">
          Share this link on your wedding group. Every guest reserves a gift privately — so no two
          people ever bring the same thing.
        </p>

        <div className="card p-5 mt-8 text-left">
          <p className="eyebrow">Your invitation link</p>
          <div className="mt-2 flex gap-2">
            <input readOnly value={shareUrl} onFocus={(e) => e.target.select()} className="flex-1 min-w-0 rounded-xl px-3.5 py-2.5 text-sm border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]" />
            <button
              onClick={() => navigator.clipboard.writeText(shareUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); })}
              className="btn-primary px-5 py-2.5 text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <a href={`https://wa.me/?text=${waText}`} target="_blank" rel="noopener noreferrer" className="text-center py-2.5 rounded-xl text-sm font-medium text-white" style={{ background: "#25925a" }}>
              WhatsApp
            </a>
            <a href={`mailto:?subject=${encodeURIComponent("Our wedding registry")}&body=${waText}`} className="text-center py-2.5 rounded-xl text-sm font-medium btn-outline-gold">
              Email
            </a>
          </div>
          <div className="mt-4 flex items-center gap-4 border-t border-[var(--line)] pt-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="QR code to your registry" width={90} height={90} className="rounded-lg border border-[var(--line)]" />
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Print this QR on your invitation card — guests scan it to open your registry.
            </p>
          </div>
        </div>

        <a href={`/manage/${shareId}?key=${manageKey}`} className="btn-primary block text-center w-full py-3 text-[15px] mt-6">
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

// ----------------------------- small pieces --------------------------------

function Footer({ onStart }: { onStart: () => void }) {
  return (
    <footer className="relative overflow-hidden text-[var(--ivory)]" style={{ background: "linear-gradient(160deg, #5c0d1c, #7a1226)" }}>
      <Mandala className="absolute -left-20 -bottom-24 h-80 w-80 text-[var(--gold)] opacity-10" />
      <PeacockFeather className="absolute right-8 top-8 h-40 w-20 text-[var(--gold-soft)] opacity-20" />
      <div className="relative max-w-5xl mx-auto px-6 py-16">
        <div className="text-center">
          <Lotus className="h-8 w-8 mx-auto text-[var(--gold-soft)]" />
          <p className="font-names text-3xl mt-3">{SITE_NAME}</p>
          <p className="mt-3 text-sm text-[var(--gold-soft)] max-w-md mx-auto leading-relaxed">
            Wedding registries without the duplicate gifts — so every blessing finds its place in
            your new home. Made with love in India.
          </p>
          <button onClick={onStart} className="btn-gold-fill mt-7 px-8 py-3 text-sm">
            Create your registry
          </button>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[var(--gold-soft)]">
          <a href="/my" className="hover:text-white">My registries</a>
          <span className="opacity-40">•</span>
          <a href="#templates" className="hover:text-white">Templates</a>
          <span className="opacity-40">•</span>
          <a href="#how" className="hover:text-white">How it works</a>
        </div>
        <p className="mt-8 text-center text-xs text-[var(--gold-soft)]/70">
          © {new Date().getFullYear()} {SITE_NAME} · free forever · no login needed
        </p>
      </div>
    </footer>
  );
}

function Shelf({ title, blurb, accent, children }: { title: string; blurb?: string; accent?: boolean; children: React.ReactNode }) {
  return (
    <div className="mt-10">
      <h3 className="font-display text-2xl flex items-center gap-2">
        {accent && <Lotus className="h-5 w-5 text-[var(--gold)]" />}
        {title}
      </h3>
      {blurb && <p className="text-sm text-[var(--muted)] mt-0.5">{blurb}</p>}
      <div className="mt-4 flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 snap-x">{children}</div>
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
  onAction: (e: React.MouseEvent) => void;
}) {
  return (
    <div className={`snap-start shrink-0 w-44 card card-lift overflow-hidden ${added ? "ring-1 ring-[var(--gold)]" : ""}`}>
      <div className="aspect-square bg-[var(--tile)] p-4 flex items-center justify-center">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={name} loading="lazy" className="max-h-full max-w-full object-contain mix-blend-multiply" />
        ) : (
          <span className="font-display text-3xl text-[var(--muted)]">{name.charAt(0).toUpperCase()}</span>
        )}
      </div>
      <div className="p-3">
        <p className="text-[13px] font-medium leading-snug line-clamp-2 min-h-[2.4em]">{name}</p>
        <p className="text-[11px] text-[var(--muted)] mt-0.5 truncate">{sub}</p>
        <button
          onClick={onAction}
          className={`mt-2.5 w-full py-1.5 rounded-full text-[13px] font-medium border transition ${added ? "bg-[var(--maroon)] text-white border-[var(--maroon)]" : "border-[var(--gold)] text-[var(--maroon-deep)] hover:bg-[var(--gold)]/10"}`}
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
      className={`whitespace-nowrap px-1 pb-1.5 text-sm border-b-2 transition ${active ? "border-[var(--gold)] text-[var(--maroon)] font-medium" : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"}`}
    >
      {children}
    </button>
  );
}

function Field({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="eyebrow" style={{ color: "var(--muted)" }}>
        {label}
        {optional && <span className="normal-case tracking-normal lowercase"> · optional</span>}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
