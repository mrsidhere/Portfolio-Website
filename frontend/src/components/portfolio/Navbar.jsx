import { useState } from "react";
import { Sun, Moon, Volume2, VolumeX } from "lucide-react";
import { sfx } from "../../lib/sfx";

const LINKS = [
  { label: "WORK", target: "#vault" },
  { label: "PROCESS", target: "#process" },
  { label: "VOICES", target: "#voices" },
  { label: "CONTACT", target: "#contact" },
];

export const Navbar = ({ theme, onToggleTheme, lenis }) => {
  const [soundOn, setSoundOn] = useState(sfx.enabled);
  const toggleSound = () => {
    const v = !soundOn;
    setSoundOn(v);
    sfx.setEnabled(v);
    if (v) sfx.click();
  };
  const go = (target) => (e) => {
    e.preventDefault();
    sfx.click();
    const el = document.querySelector(target);
    if (!el) return;
    if (lenis?.current) lenis.current.scrollTo(el, { offset: -40 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-4 sm:px-8 py-4 flex items-center justify-between pointer-events-none">
      <a href="#top" onClick={go("#top")} data-testid="nav-brand" className="pointer-events-auto flex items-center gap-2 font-headline text-sm tracking-tighter font-black">
        <span className="w-7 h-7 grid place-items-center rounded-full border border-[var(--pf-border)] bg-[var(--pf-glass)] backdrop-blur-md">
          <svg width="14" height="14" viewBox="0 0 100 100"><path d="M50 8 L92 82 L74 82 L50 40 L26 82 L8 82 Z" fill="var(--pf-accent)" /></svg>
        </span>
        MR&nbsp;SID<sup className="text-[var(--pf-accent)]">®</sup>
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
      </div>
    </header>
  );
};
