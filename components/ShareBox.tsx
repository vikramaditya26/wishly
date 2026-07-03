"use client";

// Copyable share link + WhatsApp share, used on the manage page.

import { useState } from "react";

export function ShareBox({ shareId }: { shareId: string }) {
  const [copied, setCopied] = useState(false);
  const url =
    typeof window !== "undefined" ? `${window.location.origin}/b/${shareId}` : `/b/${shareId}`;
  const waText = encodeURIComponent(
    `I made a little gift list — pick something from it (quietly) so nothing gets bought twice: ${url}`
  );

  return (
    <div className="mt-7">
      <p className="text-xs font-medium uppercase tracking-widest text-[var(--muted)]">Share link</p>
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
      <a
        href={`https://wa.me/?text=${waText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 block text-center w-full py-2.5 rounded-xl border border-[var(--line)] text-sm font-medium hover:border-[var(--ink)] transition"
      >
        Share on WhatsApp
      </a>
    </div>
  );
}
