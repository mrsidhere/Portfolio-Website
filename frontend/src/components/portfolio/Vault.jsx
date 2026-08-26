import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUpRight } from "lucide-react";
import { PROJECTS } from "../../data";

const ITEMS = [...PROJECTS, ...PROJECTS];

export default function Vault() {
  const wrapRef = useRef(null);
  const trackRef = useRef(null);
  const state = useRef({ pos: 0, target: 0, dragging: false, lastX: 0, moved: 0, halfW: 1 });
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const track = trackRef.current;
    const wrap = wrapRef.current;
    const s = state.current;
    let raf, prev = 0;

    const measure = () => { s.halfW = track.scrollWidth / 2 || 1; };
    measure();
    window.addEventListener("resize", measure);

    const loop = () => {
      if (!s.dragging) s.target -= 0.6;
      s.pos += (s.target - s.pos) * 0.085;
      const vel = s.pos - prev;
      prev = s.pos;
      const wrapped = ((s.pos % s.halfW) + s.halfW) % s.halfW;
      track.style.transform = `translate3d(${-wrapped}px, 0, 0)`;
      const v = Math.max(-40, Math.min(40, vel));
      wrap.style.setProperty("--vel", v.toFixed(2));
      wrap.style.setProperty("--rgb", Math.min(Math.abs(v) / 30, 0.7).toFixed(2));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const down = (e) => {
      s.dragging = true; s.moved = 0;
      s.lastX = e.touches ? e.touches[0].clientX : e.clientX;
    };
    const move = (e) => {
      if (!s.dragging) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const dx = x - s.lastX;
      s.moved += Math.abs(dx);
      s.target -= dx;
      s.lastX = x;
    };
    const up = () => { s.dragging = false; };

    wrap.addEventListener("mousedown", down);
    wrap.addEventListener("touchstart", down, { passive: true });
    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("touchmove", move, { passive: true });
    window.addEventListener("mouseup", up);
    window.addEventListener("touchend", up);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      wrap.removeEventListener("mousedown", down);
      wrap.removeEventListener("touchstart", down);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchend", up);
    };
  }, []);

  const onCardClick = useCallback((idx) => {
    if (state.current.moved > 10) return;
    setExpanded(idx);
  }, []);

  return (
    <section id="vault" data-testid="vault-section" className="relative py-32 sm:py-40 overflow-hidden border-t border-[var(--pf-border)]">
      <div className="px-6 sm:px-12 flex items-end justify-between mb-14">
        <div className="flex items-baseline gap-4">
          <span className="font-headline text-5xl sm:text-7xl font-black text-transparent" style={{ WebkitTextStroke: "1px var(--pf-muted)" }}>02</span>
          <div>
            <span className="font-mono text-[10px] tracking-[0.35em] text-[var(--pf-muted)] block mb-2">SELECTED WORK</span>
            <h2 className="font-headline text-3xl sm:text-5xl font-extrabold tracking-tight uppercase">THE INFINITE VAULT</h2>
          </div>
        </div>
        <p className="hidden sm:block font-mono text-[10px] tracking-[0.3em] text-[var(--pf-muted)]">⟵ DRAG ⟶</p>
      </div>

      <div ref={wrapRef} data-testid="vault-carousel" className="pf-vault-wrap cursor-grab active:cursor-grabbing">
        <div ref={trackRef} className="flex gap-6 sm:gap-8 w-max px-6 will-change-transform">
          {ITEMS.map((p, idx) => (
            <div key={idx} onClick={() => onCardClick(idx)} data-testid={`vault-card-${idx}`} data-cursor="hover"
              className="pf-vault-card group relative w-[75vw] sm:w-[420px] shrink-0 select-none">
              <div className="relative overflow-hidden rounded-xl border border-[var(--pf-border)] aspect-[4/5]">
                <motion.div layoutId={`vault-img-${idx}`} className="absolute inset-0">
                  <img src={p.image} alt={p.title} draggable="false" className="w-full h-full object-cover pf-vault-img" />
                  <img src={p.image} alt="" draggable="false" aria-hidden="true" className="pf-rgb-layer pf-rgb-r" />
                  <img src={p.image} alt="" draggable="false" aria-hidden="true" className="pf-rgb-layer pf-rgb-c" />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
                <div className="absolute top-4 right-4 w-9 h-9 grid place-items-center rounded-full bg-[var(--pf-glass)] backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowUpRight size={15} className="text-white" />
                </div>
                <div className="absolute bottom-0 inset-x-0 p-5">
                  <p className="font-mono text-[9px] tracking-[0.3em] text-white/60 mb-1">{p.year} — {p.category}</p>
                  <h3 className="font-headline text-lg sm:text-2xl font-bold tracking-tight text-white">{p.title}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {expanded !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            data-testid="vault-expanded-modal" className="fixed inset-0 z-[80] bg-[var(--pf-bg)] overflow-y-auto">
            <button onClick={() => setExpanded(null)} data-testid="vault-close-btn" aria-label="Close project"
              className="fixed top-6 right-6 z-[90] w-12 h-12 grid place-items-center rounded-full border border-[var(--pf-border)] bg-[var(--pf-glass)] backdrop-blur-md transition-transform duration-300 hover:rotate-90">
              <X size={18} />
            </button>
            <div className="min-h-screen flex flex-col lg:flex-row">
              <motion.div layoutId={`vault-img-${expanded}`} className="lg:w-3/5 h-[50vh] lg:h-screen relative overflow-hidden">
                <img src={ITEMS[expanded].image} alt={ITEMS[expanded].title} className="w-full h-full object-cover" />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="lg:w-2/5 flex flex-col justify-center p-8 sm:p-16">
                <p className="font-mono text-[10px] tracking-[0.35em] text-[var(--pf-accent)] mb-4">{ITEMS[expanded].year} — {ITEMS[expanded].category}</p>
                <h3 className="font-headline text-3xl sm:text-5xl font-black tracking-tighter uppercase mb-8">{ITEMS[expanded].title}</h3>
                <p className="text-base sm:text-lg leading-relaxed text-[var(--pf-text2)] max-w-md">{ITEMS[expanded].description}</p>
                <div className="mt-12 h-px w-24 bg-[var(--pf-accent)]" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
