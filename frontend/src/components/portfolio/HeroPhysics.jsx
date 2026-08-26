import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";

const HEADLINE = ["INTENT", "CREATES", "IMPACT."];
const NAME_WORDS = ["MOHD", "KAIF", "/", "MR", "SID"];

const StaticHero = () => (
  <div className="relative z-10 h-full flex flex-col items-start justify-center px-6 sm:px-12">
    <motion.div initial="hidden" animate="show" transition={{ staggerChildren: 0.12 }} className="space-y-1">
      <div className="flex flex-wrap gap-2 mb-6">
        {NAME_WORDS.map((w, i) => (
          <motion.span key={i} variants={{ hidden: { y: 40, opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } }}
            className="font-mono text-[11px] tracking-[0.25em] px-3 py-1.5 rounded-full border border-[var(--pf-border)] bg-[var(--pf-surface)]">{w}</motion.span>
        ))}
      </div>
      {HEADLINE.map((line, i) => (
        <div key={i} className="overflow-hidden">
          <motion.h1 variants={{ hidden: { y: "110%" }, show: { y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } } }}
            className={`font-headline font-black uppercase leading-[0.95] tracking-tighter text-4xl sm:text-6xl lg:text-7xl ${i === 2 ? "text-[var(--pf-accent)]" : ""}`}>
            {line}
          </motion.h1>
        </div>
      ))}
    </motion.div>
  </div>
);

export default function HeroPhysics({ staticMode, theme }) {
  const containerRef = useRef(null);
  const lettersRef = useRef(null);
  const [seed, setSeed] = useState(0);

  useEffect(() => {
    if (staticMode) return;
    const container = containerRef.current;
    const layer = lettersRef.current;
    if (!container || !layer) return;
    let raf, engine, destroyed = false;
    const mouse = { x: -500, y: -500 };

    const init = () => {
      if (destroyed) return;
      const W = container.clientWidth;
      const H = container.clientHeight;
      engine = Matter.Engine.create();
      engine.gravity.y = 1.35;

      const cvs = document.createElement("canvas");
      const ctx = cvs.getContext("2d");
      const bigSize = Math.max(48, Math.min(W / 9, 118));
      const smallSize = 15;
      const bodies = [];

      const addLetter = (char, x, y, w, h, cls, delayY) => {
        const el = document.createElement("div");
        el.className = cls;
        el.textContent = char;
        el.style.width = `${w}px`;
        el.style.height = `${h}px`;
        layer.appendChild(el);
        const body = Matter.Bodies.rectangle(x, y - delayY, w, h, {
          restitution: 0.45, friction: 0.35, frictionAir: 0.012, density: 0.0018,
          angle: (Math.random() - 0.5) * 0.35,
        });
        body.plugin = { el, w, h };
        bodies.push(body);
      };

      ctx.font = `900 ${bigSize}px Unbounded, sans-serif`;
      const lineH = bigSize * 1.18;
      const blockTop = H * 0.5 - lineH * 1.1;
      HEADLINE.forEach((line, li) => {
        const chars = line.split("");
        const widths = chars.map((c) => Math.max(ctx.measureText(c).width, bigSize * 0.3) + 6);
        const total = widths.reduce((a, b) => a + b, 0);
        let cx = W / 2 - total / 2;
        const cy = blockTop + li * lineH;
        chars.forEach((c, ci) => {
          const w = widths[ci];
          addLetter(c, cx + w / 2, cy, w, bigSize * 0.98,
            `pf-letter ${li === 2 ? "pf-letter-accent" : ""}`,
            H * 0.9 + li * 220 + ci * 45 + Math.random() * 120);
          cx += w;
        });
      });

      ctx.font = `500 ${smallSize}px "JetBrains Mono", monospace`;
      const pillH = 38;
      const pillWidths = NAME_WORDS.map((w) => ctx.measureText(w).width + 44);
      const pillTotal = pillWidths.reduce((a, b) => a + b + 10, -10);
      let px = W / 2 - pillTotal / 2;
      NAME_WORDS.forEach((wrd, i) => {
        const w = pillWidths[i];
        addLetter(wrd, px + w / 2, blockTop - lineH * 0.9, w, pillH, "pf-pill", H * 1.6 + i * 90);
        px += w + 10;
      });

      const opts = { isStatic: true, render: { visible: false } };
      const bounds = [
        Matter.Bodies.rectangle(W / 2, H + 40, W * 2, 80, opts),
        Matter.Bodies.rectangle(-40, H / 2, 80, H * 6, opts),
        Matter.Bodies.rectangle(W + 40, H / 2, 80, H * 6, opts),
      ];
      const mouseBody = Matter.Bodies.circle(-500, -500, 42, { isStatic: true, restitution: 0.9 });
      Matter.Composite.add(engine.world, [...bodies, ...bounds, mouseBody]);

      let last = performance.now();
      const tick = (now) => {
        const dt = Math.min(now - last, 33);
        last = now;
        Matter.Body.setPosition(mouseBody, { x: mouse.x, y: mouse.y });
        Matter.Engine.update(engine, dt);
        for (const b of bodies) {
          const { el, w, h } = b.plugin;
          el.style.transform = `translate3d(${b.position.x - w / 2}px, ${b.position.y - h / 2}px, 0) rotate(${b.angle}rad)`;
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e) => {
      const r = container.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    document.fonts.ready.then(init);

    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      if (engine) { Matter.World.clear(engine.world, false); Matter.Engine.clear(engine); }
      layer.innerHTML = "";
    };
  }, [staticMode, seed]);

  return (
    <section id="top" ref={containerRef} data-testid="hero-physics-section" className="relative h-screen overflow-hidden select-none">
      <div className="pf-grid-bg absolute inset-0" aria-hidden="true" />
      {staticMode ? <StaticHero /> : <div ref={lettersRef} className="absolute inset-0 z-10" />}

      <div className="absolute top-24 left-6 sm:left-12 z-20 pointer-events-none">
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.8 }}
          className="font-mono text-[10px] sm:text-[11px] tracking-[0.3em] text-[var(--pf-muted)]">
          FREELANCE DIGITAL ARCHITECT — DELHI, IN
        </motion.p>
      </div>

      {!staticMode && (
        <>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4, duration: 1 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 font-mono text-[10px] tracking-[0.3em] text-[var(--pf-muted)] pointer-events-none">
            ⟢ SMASH THE LETTERS WITH YOUR CURSOR ⟣
          </motion.p>
          <button onClick={() => setSeed((s) => s + 1)} data-testid="hero-reset-btn" aria-label="Reset physics"
            className="absolute bottom-16 right-6 sm:right-12 z-20 w-11 h-11 grid place-items-center rounded-full border border-[var(--pf-border)] bg-[var(--pf-glass)] backdrop-blur-md transition-transform duration-300 hover:-rotate-180">
            <RotateCcw size={15} />
          </button>
        </>
      )}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none">
        <span className="font-mono text-[9px] tracking-[0.35em] text-[var(--pf-muted)]">SCROLL</span>
        <div className="w-px h-8 bg-[var(--pf-border)] overflow-hidden"><div className="w-full h-1/2 bg-[var(--pf-accent)] animate-scroll-line" /></div>
      </div>
    </section>
  );
}
