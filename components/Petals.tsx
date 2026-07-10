"use client";

// Gentle falling marigold/rose petals — pure CSS, lightweight, and disabled
// for users who prefer reduced motion. Renders a fixed, non-interactive layer.

import { useEffect, useState } from "react";

const PETAL_COLORS = ["#e6a23c", "#c0562f", "#d98a8a", "#b0472b", "#e8b04b"];

export function Petals({ count = 14 }: { count?: number }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  if (!on) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden" aria-hidden>
      {Array.from({ length: count }).map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 12;
        const duration = 10 + Math.random() * 10;
        const size = 8 + Math.random() * 10;
        const color = PETAL_COLORS[i % PETAL_COLORS.length];
        return (
          <span
            key={i}
            className="wishly-petal"
            style={{
              left: `${left}%`,
              width: size,
              height: size * 0.7,
              background: color,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          />
        );
      })}
    </div>
  );
}
