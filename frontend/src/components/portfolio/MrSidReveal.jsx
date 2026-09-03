import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { useDevice } from "@/hooks/useDevice";

export default function MrSidReveal() {
  const { isTouch } = useDevice();
  const [mounted, setMounted] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const atomsRef = useRef([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Performance Fix: Reduced grid complexity (48 pieces instead of 300+)
  // This guarantees zero scroll lag while keeping the animation aggressive.
  const cols = 6;
  const rows = 8;
  const width = 300;
  const height = 400;
  const atomW = width / cols;
  const atomH = height / rows;

  useEffect(() => {
    if (!mounted) return;
    
    const atoms = atomsRef.current.filter(Boolean);
    const ctx = gsap.context(() => {
      if (isRevealed) {
        // Aggressive Magnetic Assembly
        gsap.to(atoms, {
          x: 0, y: 0, z: 0,
          rotationX: 0, rotationY: 0, rotationZ: 0,
          scale: 1, opacity: 1,
          duration: 1.4,
          ease: "back.out(1.2)", // Gives it a powerful "snap" into place
          stagger: { amount: 0.3, from: "edges" },
          force3D: true, // Hardware acceleration active
          overwrite: "auto"
        });
      } else {
        // Violent Deep-Space Dispersion
        atoms.forEach((atom) => {
          gsap.to(atom, {
            x: gsap.utils.random(-1200, 1200),
            y: gsap.utils.random(-1000, 1000),
            z: gsap.utils.random(-1500, 800),
            rotationX: gsap.utils.random(-720, 720),
            rotationY: gsap.utils.random(-720, 720),
            rotationZ: gsap.utils.random(-180, 180),
            scale: gsap.utils.random(0.5, 2.5),
            opacity: 0,
            duration: 0.8,
            ease: "power4.in",
            force3D: true,
            overwrite: "auto"
          });
        });
      }
    });
    
    return () => ctx.revert();
  }, [isRevealed, mounted]);

  // Fail-Safe: Instantly disperses if you scroll, preventing stuck images
  useEffect(() => {
    if (!isRevealed) return;
    const handleScroll = () => setIsRevealed(false);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isRevealed]);

  const grid = Array.from({ length: rows * cols }, (_, i) => ({
    r: Math.floor(i / cols),
    c: i % cols
  }));

  return (
    <>
      {/* 1. THE ARCHITECTURAL BLOCKS (PORTAL) */}
      {mounted && createPortal(
        <div 
          className="pointer-events-none fixed top-1/2 left-1/2 z-[9000]"
          style={{ 
            width, height, 
            transform: "translate(-50%, -50%)", 
            perspective: "1500px" 
          }}
        >
          {grid.map((cell, i) => (
            <div
              key={i}
              ref={el => atomsRef.current[i] = el}
              className="absolute will-change-transform"
              style={{
                width: atomW,
                height: atomH,
                left: cell.c * atomW,
                top: cell.r * atomH,
                backgroundImage: "url('/mrsid.jpg')",
                backgroundSize: `${width}px ${height}px`,
                backgroundPosition: `-${cell.c * atomW}px -${cell.r * atomH}px`,
                backgroundRepeat: "no-repeat",
                opacity: 0,
                // Adds subtle 3D lighting to the shattered blocks
                boxShadow: "inset 0 0 1px rgba(255,255,255,0.1), 0 10px 20px rgba(0,0,0,0.5)" 
              }}
            />
          ))}
        </div>,
        document.body
      )}

      {/* 2. THE SIMPLE TRIGGER TEXT */}
      <p 
        className="font-mono text-[10px] tracking-[0.35em] text-[var(--pf-accent,#3D8BFF)] hover:text-white transition-colors duration-300 cursor-pointer w-fit relative z-10 uppercase m-0 p-0"
        data-cursor="hover"
        onMouseEnter={() => !isTouch && setIsRevealed(true)}
        onMouseLeave={() => !isTouch && setIsRevealed(false)}
        onClick={() => isTouch && setIsRevealed(!isRevealed)}
      >
        WHO IS MR SID
      </p>
    </>
  );
}
