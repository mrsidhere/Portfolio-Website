import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const Preloader = ({ onDone }) => {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    let raf;
    const start = performance.now();
    const MIN = 1700;
    let fontsReady = false;
    document.fonts.ready.then(() => { fontsReady = true; });

    const tick = (now) => {
      const t = Math.min((now - start) / MIN, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const cap = fontsReady ? 100 : 92;
      setProgress(Math.min(Math.round(eased * 100), cap));
      if (t >= 1 && fontsReady) {
        setProgress(100);
        setExiting(true);
        setTimeout(() => {
          document.body.style.overflow = "";
          onDone();
        }, 750);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); document.body.style.overflow = ""; };
  }, [onDone]);

  return (
    <AnimatePresence>
      {!exiting ? (
        <motion.div key="preloader" data-testid="preloader"
          exit={{ y: "-100%", transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] } }}
          className="fixed inset-0 z-[200] bg-[var(--pf-bg)] flex flex-col items-center justify-center">
          <svg width="72" height="72" viewBox="0 0 100 100" className="mb-8">
            <motion.path d="M50 8 L92 82 L8 82 Z" fill="none" stroke="var(--pf-accent)" strokeWidth="6"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: "easeInOut" }} />
            <motion.path d="M50 40 L74 82 L26 82 Z" fill="none" stroke="var(--pf-text)" strokeWidth="5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.35, ease: "easeInOut" }} />
          </svg>
          <div className="overflow-hidden mb-3">
            <motion.p initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="font-headline text-lg font-black tracking-tighter">
              MR SID<sup className="text-[var(--pf-accent)]">®</sup>
            </motion.p>
          </div>
          <p className="font-mono text-[10px] tracking-[0.4em] text-[var(--pf-muted)] mb-10">INTENT CREATES MR SID IMPACT.</p>
          <div className="flex items-center gap-4">
            <div className="w-40 h-px bg-[var(--pf-border)] overflow-hidden">
              <div className="h-full bg-[var(--pf-accent)] transition-[width] duration-150 ease-out" style={{ width: `${progress}%` }} />
            </div>
            <span data-testid="preloader-progress" className="font-mono text-[11px] tabular-nums text-[var(--pf-muted)] w-10">{progress}%</span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
