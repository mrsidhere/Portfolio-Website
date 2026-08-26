const ITEMS = ["DIGITAL ARCHITECT", "GSAP", "WEBGL", "WORDPRESS", "ELEMENTOR", "AI WORKFLOWS", "LENIS", "PHYSICS"];

export const Marquee = () => {
  const row = ITEMS.map((t, i) => (
    <span key={i} className="flex items-center gap-8 sm:gap-12 shrink-0">
      <span className="font-headline text-3xl sm:text-5xl font-black uppercase tracking-tighter whitespace-nowrap text-transparent" style={{ WebkitTextStroke: "1px var(--pf-text)" }}>{t}</span>
      <svg width="20" height="20" viewBox="0 0 100 100" className="shrink-0"><path d="M50 8 L92 82 L8 82 Z" fill="var(--pf-accent)" /></svg>
    </span>
  ));
  return (
    <div data-testid="editorial-marquee" className="relative py-10 border-y border-[var(--pf-border)] overflow-hidden">
      <div className="flex gap-8 sm:gap-12 w-max animate-marquee will-change-transform">
        {row}{row}
      </div>
    </div>
  );
};
