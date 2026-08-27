import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const Preloader = ({ onDone }) => {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    let raf;
    const start = performance.now();
    // 1. INCREASED LOADING TIME: Changed from 1700 to 3500 (3.5 seconds)
    const MIN = 3500;
    let fontsReady = false;
    document.fonts.ready.then(() => { fontsReady = true; });

    const tick = (now) => {
      const t = Math.min((now - start) / MIN, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const cap = fontsReady ? 100 : 92;
      setProgress(Math.min(Math.round(eased * 100), cap));
      
      if (t >= 1 && fontsReady) {
        setProgress(100);
        // 2. ADDED A SMALL DELAY AT 100% so it doesn't rush off the screen
        setTimeout(() => {
          setExiting(true);
          setTimeout(() => {
            document.body.style.overflow = "";
            onDone();
          }, 1000); // Matches the new slower slide-up duration
        }, 400);
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
          // Slowed down the slide-up speed slightly so you can see the wink happen
          exit={{ y: "-100%", transition: { duration: 1, ease: [0.76, 0, 0.24, 1] } }}
          className="fixed inset-0 z-[200] bg-[var(--pf-bg)] flex flex-col items-center justify-center">
          
          <motion.div 
            className="mb-8 flex text-[72px] font-mono font-black text-[var(--pf-accent)]"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.span
              // 3. THE WINK ANIMATION: It only happens during the "exit" phase now!
              animate={{ scaleY: 1 }}
              exit={{ scaleY: [1, 0.1, 1], transition: { duration: 0.6, ease: "easeInOut" } }}
              style={{ display: "inline-block", transformOrigin: "center 60%" }}
            >
              ;
            </motion.span>
            <span className="ml-2">)</span>
          </motion.div>

          <div className="overflow-hidden mb-3">
            <motion.p initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="font-headline text-lg font-black tracking-tighter uppercase">
              Mohd Kaif aka Mr Sid<sup className="text-[var(--pf-accent)]">®</sup>
            </motion.p>
          </div>
          
          <p className="font-mono text-[10px] tracking-[0.4em] text-[var(--pf-muted)] mb-10">PLEASE FASTEN YOUR SEATBELTS.</p>
          
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
