// A warm burst of marigold petals + gold sparkles — for adding a gift and for
// reserving one. Dependency-free canvas, ~1.6s, self-removing, and skipped for
// prefers-reduced-motion.

const PETAL = ["#c99a3f", "#e6a23c", "#c0562f", "#d98a8a", "#a11d2c", "#f0d9a0"];

export function burstConfetti(originX?: number, originY?: number) {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.cssText = "position:fixed;inset:0;z-index:100;pointer-events:none;";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) return void canvas.remove();

  const cx = originX ?? canvas.width / 2;
  const cy = originY ?? canvas.height * 0.32;

  const parts = Array.from({ length: 64 }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 8;
    return {
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4,
      size: 4 + Math.random() * 6,
      color: PETAL[(Math.random() * PETAL.length) | 0],
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      petal: Math.random() > 0.35,
    };
  });

  const start = performance.now();
  const DURATION = 1600;

  function frame(now: number) {
    const t = (now - start) / DURATION;
    if (t >= 1) return void canvas.remove();
    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of parts) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2;
      p.vx *= 0.99;
      p.rot += p.vr;
      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.rotate(p.rot);
      ctx!.globalAlpha = Math.max(0, 1 - t);
      ctx!.fillStyle = p.color;
      if (p.petal) {
        // little petal shape
        ctx!.beginPath();
        ctx!.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
        ctx!.fill();
      } else {
        // gold sparkle diamond
        ctx!.beginPath();
        ctx!.moveTo(0, -p.size);
        ctx!.lineTo(p.size * 0.5, 0);
        ctx!.lineTo(0, p.size);
        ctx!.lineTo(-p.size * 0.5, 0);
        ctx!.closePath();
        ctx!.fill();
      }
      ctx!.restore();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
