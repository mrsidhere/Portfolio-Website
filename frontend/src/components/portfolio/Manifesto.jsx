import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MrSidReveal from "./MrSidReveal";

gsap.registerPlugin(ScrollTrigger);

const QUOTE = "The life you live tomorrow is quietly being negotiated by the choices you make today.";
const ABOUT_LINES = [
  "I am Mohd Kaif, a digital architect engineering high-profile web ecosystems.",
  "While WordPress and Elementor serve as my structural foundation,",
  "I push boundaries by integrating highly realistic AI-generated video,",
  "raw natural movements, and fine-tuned post-production audio.",
  "This transforms standard websites into highly immersive experiences.",
  "I don't just build static pages —",
  "I architect digital realities.",
];

export default function Manifesto({ reducedMotion }) {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (reducedMotion) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".pf-quote-word",
        { x: () => gsap.utils.random(-260, 260), y: () => gsap.utils.random(-180, 180), opacity: 0, rotation: () => gsap.utils.random(-40, 40), filter: "blur(6px)" },
        { x: 0, y: 0, opacity: 1, rotation: 0, filter: "blur(0px)", ease: "power2.out", stagger: { each: 0.02, from: "random" },
          scrollTrigger: { trigger: ".pf-quote", start: "top 85%", end: "top 25%", scrub: 1.2 } });

      gsap.fromTo(".pf-about-line-inner",
        { yPercent: 115 },
        { yPercent: 0, duration: 1, ease: "power4.out", stagger: 0.09,
          scrollTrigger: { trigger: ".pf-about", start: "top 75%" } });

      gsap.fromTo(".pf-chapter-num", { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%" } });
    }, sectionRef);
    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section ref={sectionRef} id="manifesto" data-testid="manifesto-section" className="relative py-32 sm:py-44 px-6 sm:px-12 border-t border-[var(--pf-border)]">
      <div className="pf-chapter-num flex items-baseline gap-4 mb-16 sm:mb-24">
        <span className="font-headline text-5xl sm:text-7xl font-black text-transparent" style={{ WebkitTextStroke: "1px var(--pf-muted)" }}>01</span>
        <span className="font-mono text-[10px] tracking-[0.35em] text-[var(--pf-muted)]">MANIFESTO / ABOUT</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
        <blockquote className="pf-quote" data-testid="manifesto-quote">
          <p className="font-serif-accent italic text-2xl sm:text-4xl lg:text-[2.6rem] leading-snug text-[var(--pf-text)] flex flex-wrap">
            {QUOTE.split(" ").map((w, i) => (
              <span key={i} className="pf-quote-word inline-block will-change-transform mr-2 sm:mr-3 mb-1 sm:mb-2">
                {w}
              </span>
            ))}
          </p>
          <div className="mt-8 h-px w-24 bg-[var(--pf-accent)]" />
        </blockquote>

        <div className="pf-about" data-testid="about-text">
          {/* Integrated Kinetic Reveal */}
          <div className="mb-8 font-mono text-[10px] tracking-[0.35em]">
            <MrSidReveal />
          </div>
          
          <div className="space-y-1">
            {ABOUT_LINES.map((line, i) => (
              <div key={i} className="overflow-hidden">
                {/* Dynamically bold the last two lines to emphasize the closing statement */}
                <p className={`pf-about-line-inner pf-goo-hover text-base sm:text-xl leading-relaxed ${i >= ABOUT_LINES.length - 2 ? "font-bold text-[var(--pf-text)]" : "text-[var(--pf-text2)]"}`}>{line}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-12 flex flex-wrap gap-3">
            {["CUSTOM WORDPRESS", "ELEMENTOR EXPERT", "HIGH-END DESIGN", "REALISTIC AI MEDIA", "IMMERSIVE UIs"].map((t) => (
              <span key={t} data-cursor="hover" className="font-mono text-[10px] tracking-[0.2em] px-4 py-2 rounded-full border border-[var(--pf-border)] transition-all duration-300 hover:bg-[var(--pf-accent)] hover:text-[var(--pf-bg)] hover:-translate-y-1">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
