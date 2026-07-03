"use client";

// The basket builder: filter chips -> product grid -> details -> share links.
// Everything is tap-based (no typing needed until the final details step).

import { useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORIES, FOR_WHO, OCCASIONS, PRODUCTS, THEMES, VIBES, gradientFor } from "@/lib/catalog";
import { SITE_NAME, amazonSearchLink } from "@/lib/config";
import type { BasketItem, ForWho, Occasion, Vibe } from "@/lib/types";

type Step = "build" | "details" | "done";

type DraftItem = Omit<BasketItem, "claimedBy">;

export default function CreatePage() {
  const [step, setStep] = useState<Step>("build");

  // filters
  const [occasion, setOccasion] = useState<Occasion>("birthday");
  const [forWho, setForWho] = useState<ForWho | null>(null);
  const [vibe, setVibe] = useState<Vibe | null>(null);
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
          (!forWho || p.forWho.includes(forWho) || p.forWho.includes("anyone")) &&
          (!vibe || p.vibe === "any" || p.vibe === vibe) &&
          (category === "all" || p.category === category)
      ),
    [occasion, forWho, vibe, category]
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
          emoji: p.emoji,
          price: p.price,
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
        emoji: "🎁",
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
      if (!res.ok) throw new Error(data.error || "Something went wrong 😭 try again?");
      setResult(data);
      setStep("done");
      try {
        const mine = JSON.parse(localStorage.getItem("wishly-my-baskets") || "[]");
        mine.push({ shareId: data.shareId, manageKey: data.manageKey, hostName, occasion, createdAt: Date.now() });
        localStorage.setItem("wishly-my-baskets", JSON.stringify(mine));
      } catch {}
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong 😭 try again?");
    } finally {
      setBusy(false);
    }
  }

  // ------------------------------------------------------------------ done
  if (step === "done" && result) {
    const sharePath = `/b/${result.shareId}`;
    const managePath = `/manage/${result.shareId}?key=${result.manageKey}`;
    return (
      <main className="min-h-screen bg-gradient-to-b from-pink-50 via-violet-50 to-sky-50 px-6 py-16">
        <div className="max-w-xl mx-auto text-center animate-popin">
          <div className="text-6xl">🥳</div>
          <h1 className="font-display text-3xl font-extrabold text-violet-600 mt-4">Your wishlist is live!</h1>
          <p className="mt-2 text-slate-600">Send this link to your people 👇</p>

          <ShareLinkCard path={sharePath} occasion={occasion} hostName={hostName} />

          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left">
            <p className="font-bold text-amber-800 text-sm">🔑 Your secret manage link — don&apos;t share this one!</p>
            <p className="text-xs text-amber-700 mt-1">
              This is how YOU see who claimed what. It&apos;s also saved in this browser. Screenshot it or save it somewhere safe.
            </p>
            <CopyRow path={managePath} label="Copy manage link" subtle />
          </div>

          <Link href="/" className="inline-block mt-8 text-sm text-slate-500 underline">
            ← back home
          </Link>
        </div>
      </main>
    );
  }

  // --------------------------------------------------------------- details
  if (step === "details") {
    return (
      <main className="min-h-screen bg-gradient-to-b from-pink-50 via-violet-50 to-sky-50 px-6 py-10">
        <div className="max-w-xl mx-auto">
          <button onClick={() => setStep("build")} className="text-sm text-slate-500 font-semibold">
            ← back to gifts
          </button>
          <h1 className="font-display text-3xl font-extrabold text-violet-600 mt-4">Last step, promise 🤞</h1>
          <p className="text-slate-600 mt-1 text-sm">This makes the page your friends see look extra cute.</p>

          <div className="mt-6 space-y-5 bg-white/80 backdrop-blur rounded-3xl p-6 shadow-sm border border-white">
            <div>
              <label className="font-bold text-sm text-slate-700">Your name *</label>
              <input
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="e.g. Aditya"
                maxLength={60}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-300"
              />
            </div>

            <div>
              <label className="font-bold text-sm text-slate-700">When&apos;s the big day? (optional)</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-300"
              />
            </div>

            <div>
              <label className="font-bold text-sm text-slate-700">A cute message for your people (optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. turning 22 🥳 no pressure to buy anything, your presence is the real present!"
                maxLength={500}
                rows={3}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-300"
              />
            </div>

            <div>
              <label className="font-bold text-sm text-slate-700">Pick a theme</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition bg-gradient-to-r ${t.pageBg} ${
                      theme === t.id ? "border-violet-500 scale-105" : "border-transparent opacity-70"
                    }`}
                  >
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && <p className="mt-4 text-sm font-bold text-rose-600 text-center">{error}</p>}

          <button
            onClick={createBasket}
            disabled={busy || !hostName.trim()}
            className="mt-6 w-full py-4 rounded-full bg-violet-600 text-white font-display text-xl font-bold shadow-lg shadow-violet-300 hover:bg-violet-700 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {busy ? "Making magic… ✨" : `Create my ${SITE_NAME} 🎉`}
          </button>
        </div>
      </main>
    );
  }

  // ----------------------------------------------------------------- build
  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 via-violet-50 to-sky-50 pb-28">
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <Link href="/" className="font-display text-xl font-extrabold text-violet-600">
          {SITE_NAME} 🎀
        </Link>
        <h1 className="font-display text-3xl font-extrabold text-slate-800 mt-4">What do you wish for? 👀</h1>
        <p className="text-slate-600 text-sm mt-1">Tap to add. No typing needed (we know you&apos;re lazy 💅)</p>

        {/* occasion */}
        <ChipRow
          label="The occasion"
          chips={OCCASIONS}
          selected={occasion}
          onSelect={(id) => setOccasion(id as Occasion)}
        />
        {/* for who + vibe (optional) */}
        <ChipRow
          label="It's for… (optional)"
          chips={FOR_WHO}
          selected={forWho}
          onSelect={(id) => setForWho(forWho === id ? null : (id as ForWho))}
        />
        <ChipRow
          label="Vibe (optional)"
          chips={VIBES}
          selected={vibe}
          onSelect={(id) => setVibe(vibe === id ? null : (id as Vibe))}
        />

        {/* categories */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          <CategoryPill active={category === "all"} onClick={() => setCategory("all")} emoji="✨" label="All" />
          {CATEGORIES.map((c) => (
            <CategoryPill
              key={c.id}
              active={category === c.id}
              onClick={() => setCategory(c.id)}
              emoji={c.emoji}
              label={c.label}
            />
          ))}
        </div>

        {/* product grid */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {/* add your own card */}
          <button
            onClick={() => setShowCustomForm(true)}
            className="rounded-3xl border-2 border-dashed border-violet-300 bg-white/60 p-4 flex flex-col items-center justify-center gap-2 text-violet-500 hover:bg-violet-50 transition min-h-40"
          >
            <span className="text-3xl">➕</span>
            <span className="font-bold text-sm text-center">Add your own gift (any link!)</span>
          </button>

          {visible.map((p) => {
            const added = !!picked[p.id];
            return (
              <button
                key={p.id}
                onClick={() => toggleProduct(p.id)}
                className={`rounded-3xl p-4 text-left transition border-2 bg-white shadow-sm hover:shadow-md active:scale-95 ${
                  added ? "border-violet-500 ring-2 ring-violet-200" : "border-transparent"
                }`}
              >
                <div
                  className={`rounded-2xl bg-gradient-to-br ${gradientFor(p.id)} h-20 flex items-center justify-center text-4xl`}
                >
                  {p.emoji}
                </div>
                <p className="mt-2 font-bold text-sm text-slate-800 leading-tight">{p.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{p.price}</p>
                <p className={`mt-2 text-xs font-bold ${added ? "text-violet-600" : "text-slate-400"}`}>
                  {added ? "✓ in your basket" : "+ tap to add"}
                </p>
              </button>
            );
          })}
        </div>

        {visible.length === 0 && (
          <p className="text-center text-slate-500 mt-10">
            Nothing matches these filters 🙈 — try removing a filter or check another category!
          </p>
        )}
      </div>

      {/* custom product modal */}
      {showCustomForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md animate-popin">
            <h3 className="font-display text-xl font-extrabold text-slate-800">Add your own gift 🎁</h3>
            <p className="text-xs text-slate-500 mt-1">
              Paste a link from Amazon, Flipkart, Myntra… anywhere. Only the name is required.
            </p>
            <div className="mt-4 space-y-3">
              <input
                value={custom.name}
                onChange={(e) => setCustom({ ...custom, name: e.target.value })}
                placeholder="Gift name * (e.g. that blue hoodie)"
                maxLength={120}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
              />
              <input
                value={custom.url}
                onChange={(e) => setCustom({ ...custom, url: e.target.value })}
                placeholder="Product link (optional)"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
              />
              <input
                value={custom.imageUrl}
                onChange={(e) => setCustom({ ...custom, imageUrl: e.target.value })}
                placeholder="Image link (optional)"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
              />
              <input
                value={custom.price}
                onChange={(e) => setCustom({ ...custom, price: e.target.value })}
                placeholder="Approx price (optional, e.g. ₹999)"
                maxLength={40}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
              />
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowCustomForm(false)}
                className="flex-1 py-3 rounded-full border border-slate-200 font-bold text-slate-500"
              >
                Cancel
              </button>
              <button
                onClick={addCustom}
                disabled={!custom.name.trim()}
                className="flex-1 py-3 rounded-full bg-violet-600 text-white font-bold disabled:opacity-40"
              >
                Add it ✨
              </button>
            </div>
          </div>
        </div>
      )}

      {/* sticky basket bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 p-4 pointer-events-none">
        <div className="max-w-4xl mx-auto pointer-events-auto">
          <button
            onClick={() => count > 0 && setStep("details")}
            disabled={count === 0}
            className={`w-full py-4 rounded-full font-display text-lg font-bold shadow-xl transition active:scale-95 ${
              count > 0
                ? "bg-pink-500 text-white shadow-pink-300 hover:bg-pink-600"
                : "bg-white/90 text-slate-400 shadow-slate-200"
            }`}
          >
            {count === 0 ? "Your basket is empty — tap some gifts! 🧺" : `Next → ${count} gift${count > 1 ? "s" : ""} in basket 🧺`}
          </button>
        </div>
      </div>
    </main>
  );
}

// ----------------------------- small pieces --------------------------------

function ChipRow({
  label,
  chips,
  selected,
  onSelect,
}: {
  label: string;
  chips: { id: string; label: string; emoji: string }[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="mt-5">
      <p className="font-bold text-sm text-slate-700">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {chips.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition active:scale-95 ${
              selected === c.id
                ? "bg-violet-600 text-white border-violet-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-violet-300"
            }`}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function CategoryPill({
  active,
  onClick,
  emoji,
  label,
}: {
  active: boolean;
  onClick: () => void;
  emoji: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition active:scale-95 ${
        active ? "bg-slate-800 text-white" : "bg-white text-slate-600 border border-slate-200"
      }`}
    >
      {emoji} {label}
    </button>
  );
}

function ShareLinkCard({ path, occasion, hostName }: { path: string; occasion: string; hostName: string }) {
  const url = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
  const waText = encodeURIComponent(
    `hey! 🎁 I made a little wishlist for my ${occasion === "justbecause" ? "wishlist" : occasion} — pick something (secretly 🤫) so nobody gets the same gift twice: ${url}`
  );
  return (
    <div className="mt-6 bg-white rounded-3xl p-5 shadow-sm border border-violet-100 text-left">
      <p className="font-bold text-sm text-slate-700">🔗 Share link — send to friends &amp; family</p>
      <CopyRow path={path} label="Copy share link" />
      <a
        href={`https://wa.me/?text=${waText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex items-center justify-center gap-2 w-full py-3 rounded-full bg-green-500 text-white font-bold hover:bg-green-600 transition"
      >
        Share on WhatsApp 💬
      </a>
      <p className="sr-only">{hostName}</p>
    </div>
  );
}

function CopyRow({ path, label, subtle }: { path: string; label: string; subtle?: boolean }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
  return (
    <div className="mt-2 flex gap-2">
      <input
        readOnly
        value={url}
        onFocus={(e) => e.target.select()}
        className={`flex-1 rounded-xl px-3 py-2 text-xs border ${subtle ? "border-amber-200 bg-white text-amber-800" : "border-slate-200 bg-slate-50 text-slate-600"}`}
      />
      <button
        onClick={() => {
          navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          });
        }}
        className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition ${copied ? "bg-emerald-500" : subtle ? "bg-amber-500 hover:bg-amber-600" : "bg-violet-600 hover:bg-violet-700"}`}
      >
        {copied ? "Copied! ✓" : label}
      </button>
    </div>
  );
}
