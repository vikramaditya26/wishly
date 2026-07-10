// Hand-drawn Indian-wedding SVG motifs used as subtle decoration throughout
// the site: lotus, mandala, paisley, peacock feather, temple arch and gold
// dividers. All inherit `currentColor` (or take an explicit color) so they
// theme cleanly, and stay light. Keep opacities low where used as backgrounds.

import React from "react";

export function GoldDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden>
      <span className="h-px w-14 bg-gradient-to-r from-transparent to-[var(--gold)]" />
      <Lotus className="h-4 w-4 text-[var(--gold)]" />
      <span className="h-px w-14 bg-gradient-to-l from-transparent to-[var(--gold)]" />
    </div>
  );
}

export function Lotus({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M24 6c2.4 4 3.4 9 3 15-3.4-1.6-5.4-5-6-9 .4 4 .2 8-1 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M24 6c-2.4 4-3.4 9-3 15 3.4-1.6 5.4-5 6-9-.4 4-.2 8 1 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 14c-1 4-.6 9 2 14-3.6.2-7-1.6-9-5 2 3.4 3 7 3 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M34 14c1 4 .6 9-2 14 3.6.2 7-1.6 9-5-2 3.4-3 7-3 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 34c8 4 28 4 36 0-6 4-12 6-18 6S12 38 6 34z" fill="currentColor" opacity="0.9"/>
    </svg>
  );
}

// Full mandala for large faint backgrounds.
export function Mandala({ className = "" }: { className?: string }) {
  const petals = Array.from({ length: 16 });
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="100" cy="100" r="18" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="100" cy="100" r="30" stroke="currentColor" strokeWidth="1" />
      <circle cx="100" cy="100" r="72" stroke="currentColor" strokeWidth="1" />
      <circle cx="100" cy="100" r="92" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" />
      {petals.map((_, i) => (
        <g key={i} transform={`rotate(${(360 / petals.length) * i} 100 100)`}>
          <path d="M100 30c6 10 6 22 0 34-6-12-6-24 0-34z" stroke="currentColor" strokeWidth="1" />
          <path d="M100 46c3 6 3 12 0 18-3-6-3-12 0-18z" fill="currentColor" opacity="0.5" />
          <circle cx="100" cy="20" r="2.2" fill="currentColor" />
        </g>
      ))}
    </svg>
  );
}

export function Paisley({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M30 4C14 8 6 24 12 44c5 17 24 22 34 12 9-9 6-24-6-30-9-4-18 0-20 10-1 6 3 12 10 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M30 20c-6 3-9 10-6 18" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
      <circle cx="26" cy="52" r="3" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

// Peacock feather eye — great as a corner flourish.
export function PeacockFeather({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M30 118V54" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <ellipse cx="30" cy="34" rx="22" ry="30" stroke="currentColor" strokeWidth="1.2" />
      <ellipse cx="30" cy="34" rx="13" ry="19" stroke="currentColor" strokeWidth="1" opacity="0.8" />
      <ellipse cx="30" cy="36" rx="7" ry="10" fill="currentColor" opacity="0.85" />
      {Array.from({ length: 14 }).map((_, i) => (
        <line key={i} x1="30" y1="54" x2={30 + Math.cos((Math.PI * i) / 13 + Math.PI) * 20} y2={54 + Math.sin((Math.PI * i) / 13 + Math.PI) * 6} stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      ))}
    </svg>
  );
}

// Ornamental floral corner (place in each corner, rotate via className).
export function FloralCorner({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M4 4c30 0 44 6 60 22 12 12 18 30 18 60" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M4 22c22 2 34 8 44 22 8 11 11 26 11 48" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
      <path d="M26 8c-2 8-8 12-16 12 6 4 8 10 6 18 4-6 10-8 18-6-6-4-8-10-8-24z" fill="currentColor" opacity="0.7" />
      <circle cx="66" cy="30" r="3" fill="currentColor" />
      <circle cx="84" cy="52" r="2.4" fill="currentColor" opacity="0.8" />
      <path d="M92 78c4-3 9-3 14 0-4 3-4 8 0 12-6-2-11-2-14 0-3-3-3-9 0-12z" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

// A temple/mihrab arch outline for framing hero content.
export function TempleArch({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 360" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" aria-hidden>
      <path d="M10 350V150C10 90 70 20 150 20s140 70 140 130v200" stroke="currentColor" strokeWidth="1.5" />
      <path d="M22 350V152C22 98 78 34 150 34s128 64 128 118v198" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
    </svg>
  );
}
