"use client";

// Copyable share link + WhatsApp button, used on the manage page.

import { useState } from "react";

export function ShareBox({ shareId }: { shareId: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}/b/${shareId}` : `/b/${shareId}`;
  const waText = encodeURIComponent(
    `hey! 🎁 pick something from my wishlist (secretly 🤫) so nobody gets the same gift twice: ${url}`
  );

  return (
    <div className="mt-5 bg-white rounded-3xl p-5 shadow-sm border border-violet-100">
      <p className="font-bold text-sm text-slate-700">🔗 Your share link</p>
      <div className="mt-2 flex gap-2">
        <input
          readOnly
          value={url}
          onFocus={(e) => e.target.select()}
          className="flex-1 rounded-xl px-3 py-2 text-xs border border-slate-200 bg-slate-50 text-slate-600"
        />
        <button
          onClick={() => {
            navigator.clipboard.writeText(url).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            });
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition ${copied ? "bg-emerald-500" : "bg-violet-600 hover:bg-violet-700"}`}
        >
          {copied ? "Copied! ✓" : "Copy"}
        </button>
      </div>
      <a
        href={`https://wa.me/?text=${waText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex items-center justify-center gap-2 w-full py-3 rounded-full bg-green-500 text-white font-bold hover:bg-green-600 transition"
      >
        Share on WhatsApp 💬
      </a>
    </div>
  );
}
