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

  // Grid Configuration matching your HTML exactly
  const cols = 14;
  const rows = 19;
  const width = 280;
  const height = 380;
  const atomW = width / cols;
  const atomH = height / rows;

  // Assembly & Dispersion Engine
  useEffect(() => {
    if (!mounted) return;
    
    const atoms = atomsRef.current.filter(Boolean);
    const ctx = gsap.context(() => {
      if (isRevealed) {
        // Assemble into the photo
        gsap.to(atoms, {
          x: 0, y: 0, z: 0,
          rotationX: 0, rotationY: 0, rotationZ: 0,
          scale: 1, opacity: 1,
          duration: 1.2,
          ease: "expo.out",
          stagger: { amount: 0.4, from: "random" },
          force3D: true, // Hardware acceleration to prevent lag
          overwrite: "auto"
        });
      } else {
        // Explode into floating data points
        atoms.forEach(atom => {
          gsap.to(atom, {
            x: gsap.utils.random(-600, 600),
            y: gsap.utils.random(-600, 600),
            z: gsap.utils.random(-1000, 500),
            rotationX: gsap.utils.random(-180, 180),
            rotationY: gsap.utils.random(-180, 180),
            rotationZ: gsap.utils.random(-90, 90),
            scale: gsap.utils.random(0.1, 2),
            opacity: 0,
            duration: 0.8,
            ease: "power3.in",
            force3D: true,
            overwrite: "auto"
          });
        });
      }
    });
    
    return () => ctx.revert();
  }, [isRevealed, mounted]);

  // Fail-Safe: Instantly close the reveal if the user scrolls to prevent stuck images
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
      {mounted && createPortal(
        <div 
          className="pointer-events-none fixed top-1/2 left-1/2 z-[9000]"
          style={{ 
            width, height, 
            transform: "translate(-50%, -50%)", 
            perspective: "1000px" 
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
                opacity: 0
              }}
            />
          ))}
        </div>,
        document.body
      )}

      {/* Trigger Text */}
      <div 
        className="text-[var(--pf-accent,#3D8BFF)] hover:text-white transition-colors duration-300 cursor-pointer font-bold uppercase tracking-[0.35em] text-xs sm:text-[14px] z-10"
        data-cursor="hover"
        onMouseEnter={() => !isTouch && setIsRevealed(true)}
        onMouseLeave={() => !isTouch && setIsRevealed(false)}
        onClick={() => isTouch && setIsRevealed(!isRevealed)}
      >
        [ Initialize Mr Sid ]
      </div>
    </>
  );
}
