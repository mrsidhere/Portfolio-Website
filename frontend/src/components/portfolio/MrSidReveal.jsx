import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { useDevice } from "@/hooks/useDevice";

export default function MrSidReveal() {
  const { isTouch } = useDevice();
  const [mounted, setMounted] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const containerRef = useRef(null);
  const atomsRef = useRef([]);

  // Ensure portal mounts safely on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Grid Configuration
  const cols = 14;
  const rows = 19;
  const width = 280;
  const height = 380;
  const atomW = width / cols;
  const atomH = height / rows;

  // The Kinetic Assembly Engine
  useEffect(() => {
    if (!mounted || !containerRef.current) return;
    
    const atoms = atomsRef.current;
    
    const ctx = gsap.context(() => {
      if (isRevealed) {
        // Assemble into the portrait
        gsap.to(atoms, {
          x: 0, y: 0, z: 0,
          rotationX: 0, rotationY: 0, rotationZ: 0,
          scale: 1, opacity: 1,
          duration: 1.2,
          ease: "expo.out",
          stagger: { amount: 0.4, from: "random" },
          overwrite: "auto"
        });
      } else {
        // Explode into scattered data points
        atoms.forEach(atom => {
          gsap.to(atom, {
            x: gsap.utils.random(-800, 800),
            y: gsap.utils.random(-800, 800),
            z: gsap.utils.random(-1000, 500),
            rotationX: gsap.utils.random(-180, 180),
            rotationY: gsap.utils.random(-180, 180),
            rotationZ: gsap.utils.random(-90, 90),
            scale: gsap.utils.random(0.1, 2),
            opacity: 0,
            duration: 0.8,
            ease: "power3.inOut",
            overwrite: "auto"
          });
        });
      }
    });
    
    return () => ctx.revert();
  }, [isRevealed, mounted]);

  // Bulletproof fix for the "Stuck Image" bug:
  // If the user scrolls while the image is open, instantly explode it.
  useEffect(() => {
    if (!isRevealed) return;
    
    const handleScroll = () => {
      setIsRevealed(false);
    };
    
    // Use passive listener for maximum scroll performance
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isRevealed]);

  // Generate the CSS grid coordinates
  const grid = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      grid.push({ r, c });
    }
  }

  return (
    <>
      {/* 1. THE DATA PARTICLES (PORTAL) */}
      {mounted && createPortal(
        <div 
          ref={containerRef}
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
                backgroundImage: "url('/mrsid.jpg')", // Must match your transparent cutout file exactly
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

      {/* 2. THE EASTER EGG TRIGGER */}
      <div 
        className="group relative flex cursor-pointer items-center gap-3 z-10 w-fit"
        data-cursor="hover"
        onMouseEnter={() => !isTouch && setIsRevealed(true)}
        onMouseLeave={() => !isTouch && setIsRevealed(false)}
        onClick={() => isTouch && setIsRevealed(!isRevealed)}
      >
        {/* Glowing Indicator Dot */}
        <div className={`w-2 h-2 rounded-full shadow-[0_0_10px_var(--pf-accent,#3D8BFF)] transition-colors duration-300 ${isRevealed ? 'bg-white shadow-white' : 'bg-[var(--pf-accent,#3D8BFF)] animate-pulse'}`} />
        
        {/* Context-Aware Text Swap (Adapts to Mobile vs Desktop) */}
        <div className="relative h-5 w-48 overflow-hidden text-xs sm:text-[10px] tracking-[0.35em] text-[var(--pf-accent,#3D8BFF)] font-bold uppercase transition-colors">
          <span className={`absolute inset-0 flex items-center transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isRevealed ? '-translate-y-full' : 'translate-y-0'}`}>
            {isTouch ? '[ TAP TO REVEAL ]' : 'Who is Mr Sid'}
          </span>
          <span className={`absolute inset-0 flex items-center text-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isRevealed ? 'translate-y-0' : 'translate-y-full'}`}>
            {isTouch ? '[ TAP TO DISPERSE ]' : '[ INITIALIZE ENTITY ]'}
          </span>
        </div>
      </div>
    </>
  );
}
