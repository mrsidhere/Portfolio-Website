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

  // Restored the high-density particle grid for the "Atom" effect
  const cols = 15;
  const rows = 20;
  const width = 300;
  const height = 400;
  const atomW = width / cols;
  const atomH = height / rows;

  useEffect(() => {
    if (!mounted) return;
    
    const atoms = atomsRef.current.filter(Boolean);
    const ctx = gsap.context(() => {
      if (isRevealed) {
        // The Assembly: Powerful, center-out magnetic convergence
        gsap.to(atoms, {
          x: 0, y: 0, z: 0,
          rotationX: 0, rotationY: 0, rotationZ: 0,
          scale: 1.01, // Fractional overlap completely hides the "cuts"
          opacity: 1,
          duration: 1.2,
          ease: "power4.out",
          stagger: { amount: 0.6, from: "center" },
          force3D: true, // GPU Acceleration
          overwrite: "auto"
        });
      } else {
        // The Dispersion: Explodes toward the camera and shrinks into dust
        atoms.forEach((atom) => {
          gsap.to(atom, {
            x: gsap.utils.random(-800, 800),
            y: gsap.utils.random(-800, 800),
            z: gsap.utils.random(200, 1000), // Flies out toward the user
            rotationX: gsap.utils.random(-360, 360),
            rotationY: gsap.utils.random(-360, 360),
            rotationZ: gsap.utils.random(-180, 180),
            scale: 0, // Shrinks into nothingness
            opacity: 0,
            duration: 0.8,
            ease: "expo.in",
            force3D: true, // GPU Acceleration
            overwrite: "auto"
          });
        });
      }
    });
    
    return () => ctx.revert();
  }, [isRevealed, mounted]);

  // Scroll Fail-Safe: Instantly disperses if the user scrolls, protecting performance
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
      {/* 1. THE PARTICLES (PORTAL) */}
      {mounted && createPortal(
        <div 
          className="pointer-events-none fixed top-1/2 left-1/2 z-[9000]"
          style={{ 
            width, height, 
            transform: "translate(-50%, -50%)", 
            perspective: "1200px" 
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
                // Critical Performance Fixes:
                backfaceVisibility: "hidden", 
                WebkitBackfaceVisibility: "hidden",
                transform: "translateZ(0)"
              }}
            />
          ))}
        </div>,
        document.body
      )}

      {/* 2. THE CLEAN TRIGGER TEXT */}
      <p 
        className="font-mono text-[10px] tracking-[0.35em] text-[var(--pf-accent,#3D8BFF)] hover:text-white transition-colors duration-300 cursor-pointer w-fit relative z-10 uppercase m-0 p-0"
        data-cursor="hover"
        // Works seamlessly on Desktop (Hover) and Mobile (Tap)
        onMouseEnter={() => !isTouch && setIsRevealed(true)}
        onMouseLeave={() => !isTouch && setIsRevealed(false)}
        onClick={() => isTouch && setIsRevealed(!isRevealed)}
      >
        WHO IS MR SID
      </p>
    </>
  );
}
