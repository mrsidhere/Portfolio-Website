import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PHASES } from "../../data";

const HOME_POS = [{ x: "12%", y: "30%" }, { x: "42%", y: "48%" }, { x: "72%", y: "26%" }];

export default function ProcessEngine({ isTouch }) {
  const arenaRef = useRef(null);
  const blobRefs = useRef([]);
  const [unlocked, setUnlocked] = useState([]);
  const [pulse, setPulse] = useState(null);

  const unlock = (id) => {
    setUnlocked((u) => (u.includes(id) ? u : [...u, id]));
  };

  const onDragEnd = (i) => {
    const me = blobRefs.current[i]?.getBoundingClientRect();
    if (!me) return;
    for (let j = 0; j < PHASES.length; j++) {
      if (j === i) continue;
      const other = blobRefs.current[j]?.getBoundingClientRect();
      if (!other) continue;
      const dx = me.x + me.width / 2 - (other.x + other.width / 2);
      const dy = me.y + me.height / 2 - (other.y + other.height / 2);
      if (Math.hypot(dx, dy) < (me.width + other.width) / 2.4) {
        unlock(PHASES[i].id);
        setPulse(j);
        setTimeout(() => setPulse(null), 700);
        return;
      }
    }
  };

  const allDone = unlocked.length === PHASES.length;

  return (
    <section id="process" data-testid="process-section" className="relative py-32 sm:py-40 px-6 sm:px-12 border-t border-[var(--pf-border)] overflow-hidden">
      <div className="flex items-baseline gap-4 mb-6">
        <span className="font-headline text-5xl sm:text-7xl font-black text-transparent" style={{ WebkitTextStroke: "1px var(--pf-muted)" }}>03</span>
        <div>
          <span className="font-mono text-[10px] tracking-[0.35em] text-[var(--pf-muted)] block mb-2">HOW I WORK</span>
          <h2 className="font-headline text-3xl sm:text-5xl font-extrabold tracking-tight uppercase">THE PROCESS ENGINE</h2>
        </div>
      </div>
      <p className="font-mono text-[10px] sm:text-[11px] tracking-[0.25em] text-[var(--pf-muted)] mb-10">
        {isTouch ? "◉ TAP A BLOB TO UNLOCK ITS PHASE" : "◉ DRAG A BLOB INTO ANOTHER TO MERGE & UNLOCK ITS PHASE"}
      </p>

      <svg width="0" height="0" aria-hidden="true">
        <defs>
          <filter id="pf-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -11" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div ref={arenaRef} data-testid="process-arena" className="relative h-[380px] sm:h-[440px] rounded-2xl border border-dashed border-[var(--pf-border)] overflow-hidden"
        style={{ filter: "url(#pf-goo)" }}>
        {PHASES.map((phase, i) => (
          <motion.div key={phase.id} ref={(el) => (blobRefs.current[i] = el)} drag={!isTouch} dragConstraints={arenaRef} dragElastic={0.25}
            dragTransition={{ bounceStiffness: 320, bounceDamping: 16 }}
            onDragEnd={() => onDragEnd(i)}
            onTap={() => isTouch && unlock(phase.id)}
            whileDrag={{ scale: 1.12 }}
            animate={pulse === i ? { scale: [1, 1.35, 1] } : {}}
            transition={{ duration: 0.6, ease: "easeOut" }}
            data-testid={`process-blob-${phase.id}`} data-cursor="hover"
            className="absolute w-32 h-32 sm:w-44 sm:h-44 cursor-grab active:cursor-grabbing"
            style={{ left: HOME_POS[i].x, top: HOME_POS[i].y }}>
            <div className="w-full h-full rounded-full grid place-items-center animate-blob-idle"
              style={{ background: phase.color, animationDelay: `${i * 1.3}s` }}>
              <div className="text-center pointer-events-none">
                <p className="font-mono text-[9px] tracking-[0.3em] text-black/60">{phase.num}</p>
                <p className="font-headline text-xs sm:text-sm font-black tracking-tight text-black">{phase.title}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 grid sm:grid-cols-3 gap-6">
        {PHASES.map((phase) => (
          <AnimatePresence key={phase.id}>
            {unlocked.includes(phase.id) ? (
              <motion.div initial={{ opacity: 0, y: 30, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                data-testid={`process-content-${phase.id}`}
                className="rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-6">
                <p className="font-mono text-[9px] tracking-[0.3em] mb-2" style={{ color: phase.color }}>{phase.num} / UNLOCKED</p>
                <h3 className="font-headline text-lg font-bold mb-3">{phase.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--pf-text2)]">{phase.details}</p>
              </motion.div>
            ) : (
              <div className="rounded-xl border border-dashed border-[var(--pf-border)] p-6 grid place-items-center min-h-[130px]">
                <p className="font-mono text-[9px] tracking-[0.3em] text-[var(--pf-muted)]">{phase.num} — LOCKED</p>
              </div>
            )}
          </AnimatePresence>
        ))}
      </div>

      {allDone && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} data-testid="process-all-unlocked"
          className="mt-8 font-mono text-[11px] tracking-[0.3em] text-[var(--pf-lime-text)]">✓ FULL CYCLE UNLOCKED — INTENT → IMPACT</motion.p>
      )}
    </section>
  );
}
