import { useEffect } from "react";
import { ArrowUpRight } from "lucide-react";
import gsap from "gsap";

export default function NotFound() {
  useEffect(() => {
    gsap.to(".nf-title", {
      y: -20,
      duration: 2.2,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });
  }, []);

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center bg-[#0a0a0c] text-[#f4f4f6] px-6 overflow-hidden">
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }} 
      />

      <div className="relative z-10 text-center flex flex-col items-center">
        <h1 className="nf-title font-headline text-[22vw] sm:text-9xl font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-600 select-none">
          404
        </h1>
        
        <p className="mt-4 font-mono text-xs sm:text-sm tracking-[0.35em] text-[var(--pf-accent,#3D8BFF)] uppercase">
          GRAVITY ANOMALY — SECTOR NOT FOUND
        </p>

        <p className="mt-2 font-mono text-[11px] tracking-[0.2em] text-neutral-400 max-w-sm">
          The requested coordinate does not exist in this digital reality.
        </p>

        <a
          href="/"
          className="mt-10 inline-flex items-center gap-2 bg-[var(--pf-accent,#3D8BFF)] text-[#0a0a0c] font-mono text-xs font-bold tracking-[0.2em] px-8 py-4 transition-all duration-300 hover:scale-105 hover:bg-white"
        >
          <span>RETURN TO REALITY</span>
          <ArrowUpRight size={14} />
        </a>
      </div>
    </main>
  );
}
