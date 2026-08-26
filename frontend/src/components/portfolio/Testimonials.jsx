import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote } from "lucide-react";
import { TESTIMONIALS } from "../../data";

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const [exitDir, setExitDir] = useState(1);
  const [thrown, setThrown] = useState(0);

  const advance = (dir) => {
    setExitDir(dir);
    setIndex((i) => (i + 1) % TESTIMONIALS.length);
    setThrown((t) => t + 1);
  };

  const onDragEnd = (_, info) => {
    if (Math.abs(info.offset.x) > 110 || Math.abs(info.velocity.x) > 500) {
      advance(info.offset.x > 0 ? 1 : -1);
    }
  };

  const visible = [0, 1, 2].map((o) => TESTIMONIALS[(index + o) % TESTIMONIALS.length]);

  return (
    <section id="voices" data-testid="voices-section" className="relative py-32 sm:py-44 px-6 sm:px-12 border-t border-[var(--pf-border)] overflow-hidden">
      <div className="flex items-baseline gap-4 mb-6">
        <span className="font-headline text-5xl sm:text-7xl font-black text-transparent" style={{ WebkitTextStroke: "1px var(--pf-muted)" }}>04</span>
        <div>
          <span className="font-mono text-[10px] tracking-[0.35em] text-[var(--pf-muted)] block mb-2">TESTIMONIALS</span>
          <h2 className="font-headline text-3xl sm:text-5xl font-extrabold tracking-tight uppercase">CLIENT VOICES</h2>
        </div>
      </div>
      <p className="font-mono text-[10px] sm:text-[11px] tracking-[0.25em] text-[var(--pf-muted)] mb-16">◉ GRAB THE TOP CARD & THROW IT OFF SCREEN</p>

      <div className="relative h-[380px] sm:h-[400px] max-w-xl mx-auto" data-testid="testimonial-stack">
        <AnimatePresence custom={exitDir}>
          {visible.map((t, o) => {
            const isTop = o === 0;
            return (
              <motion.div key={`${t.id}-${thrown + o}`}
                data-testid={isTop ? "testimonial-card-top" : undefined}
                drag={isTop} dragElastic={0.9} dragMomentum={false} onDragEnd={isTop ? onDragEnd : undefined}
                custom={exitDir}
                initial={{ scale: 0.9 - 0.05, y: 40, opacity: 0 }}
                animate={{ scale: 1 - o * 0.05, y: o * -18, opacity: 1, rotate: o === 0 ? 0 : o === 1 ? -3 : 3, zIndex: 10 - o }}
                exit={{ x: exitDir * 900, rotate: exitDir * 35, opacity: 0, transition: { duration: 0.45, ease: [0.32, 0, 0.67, 0] } }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                whileDrag={{ scale: 1.04, rotate: 2, cursor: "grabbing" }}
                className={`absolute inset-0 rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] backdrop-blur-xl p-8 sm:p-12 flex flex-col justify-between select-none ${isTop ? "cursor-grab shadow-2xl" : ""}`}
                style={{ zIndex: 10 - o }}>
                <Quote size={28} className="text-[var(--pf-accent)]" />
                <p className="font-serif-accent italic text-lg sm:text-2xl leading-snug">"{t.quote}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-headline text-sm font-bold">{t.name}</p>
                    <p className="font-mono text-[10px] tracking-[0.15em] text-[var(--pf-muted)] mt-1">{t.role}</p>
                  </div>
                  <span className="font-mono text-[10px] text-[var(--pf-muted)]">{TESTIMONIALS.indexOf(t) + 1}/{TESTIMONIALS.length}</span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="flex justify-center gap-2 mt-14">
        {TESTIMONIALS.map((t, i) => (
          <span key={t.id} className={`h-1 rounded-full transition-all duration-400 ${i === index ? "w-8 bg-[var(--pf-accent)]" : "w-2 bg-[var(--pf-border)]"}`} />
        ))}
      </div>
    </section>
  );
}
