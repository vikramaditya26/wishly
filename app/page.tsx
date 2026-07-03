import Link from "next/link";
import { SITE_NAME } from "@/lib/config";

const STEPS = [
  {
    emoji: "🧺",
    title: "Make your basket",
    text: "Pick the occasion, tap the gifts you'd actually love. Add your own from any website too.",
  },
  {
    emoji: "🔗",
    title: "Share one link",
    text: "Drop it in the family WhatsApp group. No app, no login, nothing to install.",
  },
  {
    emoji: "🤫",
    title: "Friends call dibs",
    text: "They secretly tick what they'll gift — so no one else buys the same thing. Genius, right?",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 via-violet-50 to-sky-50 overflow-hidden">
      {/* hero */}
      <section className="relative max-w-3xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="absolute top-10 left-4 text-4xl animate-floaty select-none" aria-hidden>🎈</div>
        <div className="absolute top-24 right-6 text-4xl animate-floaty select-none" style={{ animationDelay: "1s" }} aria-hidden>🎁</div>
        <div className="absolute bottom-4 left-10 text-3xl animate-floaty select-none" style={{ animationDelay: "2s" }} aria-hidden>✨</div>

        <h1 className="font-display text-5xl sm:text-6xl font-extrabold text-violet-600 tracking-tight">
          {SITE_NAME}
        </h1>
        <p className="mt-3 text-lg font-semibold text-slate-600">
          wish it. share it. <span className="text-pink-500">no more duplicate gifts</span> 🎁
        </p>

        <p className="mt-6 text-slate-600 max-w-xl mx-auto leading-relaxed">
          3 people gifting you the same perfume? 5 identical dinner sets at the wedding? 💀
          Make a wishlist of gifts you actually want, share one link, and let your people
          secretly <b>call dibs</b> — so everyone gifts something different (and something you love).
        </p>

        <Link
          href="/create"
          className="inline-block mt-8 px-8 py-4 rounded-full bg-violet-600 text-white font-display text-xl font-bold shadow-lg shadow-violet-300 hover:bg-violet-700 hover:scale-105 active:scale-95 transition-transform"
        >
          Make my wishlist 🎀
        </Link>
        <p className="mt-3 text-sm text-slate-500">100% free · no app · no signup · takes 2 mins</p>
      </section>

      {/* how it works */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <h2 className="font-display text-2xl font-bold text-center text-slate-700 mb-8">
          how it works 👇
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-sm border border-white text-center animate-popin"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="text-4xl mb-3">{s.emoji}</div>
              <h3 className="font-display font-bold text-lg text-slate-800">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* occasions strip */}
      <section className="max-w-3xl mx-auto px-6 pb-20 text-center">
        <p className="text-slate-600 font-semibold">
          perfect for 🎂 birthdays · 💍 weddings · 💖 anniversaries · 🏡 housewarmings · 🍼 baby showers
        </p>
        <Link
          href="/create"
          className="inline-block mt-6 px-6 py-3 rounded-full bg-pink-500 text-white font-display font-bold shadow-md shadow-pink-200 hover:bg-pink-600 hover:scale-105 active:scale-95 transition-transform"
        >
          Start now — it&apos;s free ✨
        </Link>
      </section>

      <footer className="text-center text-xs text-slate-400 pb-8 px-6">
        Made with 💜 in India · {SITE_NAME} may earn a small commission from Amazon links (at no cost to you) — that&apos;s how it stays free.
      </footer>
    </main>
  );
}
