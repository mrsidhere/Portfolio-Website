import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sun, Moon, Volume2, VolumeX, Menu, X } from "lucide-react";
import { sfx } from "../../lib/sfx";

const LINKS = [
  { label: "WORK", target: "#vault" },
  { label: "PROCESS", target: "#process" },
  { label: "VOICES", target: "#voices" },
  { label: "CONTACT", target: "#contact" },
];

export const Navbar = ({ theme, onToggleTheme, lenis }) => {
  const [soundOn, setSoundOn] = useState(sfx.enabled);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const toggleSound = () => {
    const v = !soundOn;
    setSoundOn(v);
    sfx.setEnabled(v);
    if (v) sfx.click();
  };
  
  const go = (target) => (e) => {
    e.preventDefault();
    sfx.click();
    setMenuOpen(false);
    const el = document.querySelector(target);
    if (!el) return;
    if (lenis?.current) lenis.current.scrollTo(el, { offset: -40 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-4 sm:px-8 py-4 flex items-center justify-between pointer-events-none">
      
      {/* Desktop Logo - Increased to h-12 and aligned properly */}
      <a href="#top" onClick={go("#top")} data-testid="nav-brand" className="pointer-events-auto flex items-center h-full">
        <img src="/logo.png" alt="Mohd Kaif Logo" className="h-12 w-auto object-contain object-left" />
      </a>
      
      <nav className="pointer-events-auto hidden md:flex items-center gap-1 rounded-full border border-[var(--pf-border)] bg-[var(--pf-glass)] backdrop-blur-xl px-2 py-1.5">
        {LINKS.map((l) => (
          <a key={l.label} href={l.target} onClick={go(l.target)} data-testid={`nav-link-${l.label.toLowerCase()}`}
            className="font-mono text-[11px] tracking-[0.2em] px-4 py-1.5 rounded-full transition-colors duration-200 hover:bg-[var(--pf-accent)] hover:text-[var(--pf-bg)]">
            {l.label}
          </a>
        ))}
      </nav>
      
      <div className="pointer-events-auto flex items-center gap-2">
        <button onClick={toggleSound} data-testid="sound-toggle-btn" aria-label="Toggle sound"
          className="w-10 h-10 grid place-items-center rounded-full border border-[var(--pf-border)] bg-[var(--pf-glass)] backdrop-blur-xl transition-transform duration-300 hover:scale-110">
          {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
        </button>
        <button onClick={() => { sfx.click(); onToggleTheme(); }} data-testid="theme-toggle-btn" aria-label="Toggle theme"
          className="w-10 h-10 grid place-items-center rounded-full border border-[var(--pf-border)] bg-[var(--pf-glass)] backdrop-blur-xl transition-transform duration-300 hover:rotate-[25deg] hover:scale-110">
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button onClick={() => { sfx.click(); setMenuOpen(true); }} data-testid="mobile-menu-btn" aria-label="Open menu"
          className="md:hidden w-10 h-10 grid place-items-center rounded-full border border-[var(--pf-border)] bg-[var(--pf-glass)] backdrop-blur-xl">
          <Menu size={16} />
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
            data-testid="mobile-menu-overlay"
            className="pointer-events-auto fixed inset-0 z-[70] bg-[var(--pf-bg)] flex flex-col px-8 pt-6 pb-12">
            <div className="flex items-center justify-between">
              
              {/* Mobile Menu Logo - Increased size */}
              <span className="font-headline text-sm font-black tracking-tighter">
                <img src="/logo.png" alt="Mohd Kaif Logo" className="h-10 w-auto object-contain object-left" />
              </span>
              
              <button onClick={() => { sfx.click(); setMenuOpen(false); }} data-testid="mobile-menu-close-btn" aria-label="Close menu"
                className="w-11 h-11 grid place-items-center rounded-full border border-[var(--pf-border)]">
                <X size={18} />
              </button>
            </div>
            
            <nav className="flex-1 flex flex-col justify-center gap-2">
              {LINKS.map((l, i) => (
                <div key={l.label} className="overflow-hidden">
                  <motion.a href={l.target} onClick={go(l.target)} data-testid={`mobile-nav-link-${l.label.toLowerCase()}`}
                    initial={{ y: "110%" }} animate={{ y: 0 }} exit={{ y: "110%" }}
                    transition={{ delay: 0.06 * i, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-baseline gap-4 py-2">
                    <span className="font-mono text-[10px] text-[var(--pf-muted)]">0{i + 1}</span>
                    <span className="font-headline text-4xl font-black uppercase tracking-tighter">{l.label}</span>
                  </motion.a>
                </div>
              ))}
            </nav>
            <p className="font-mono text-[10px] tracking-[0.3em] text-[var(--pf-muted)]">REALITY, RENDERED.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
