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

  useEffect(() => {
    setMounted(true);
  }, []);

  // Grid Configuration - Denser for a more complex shatter
  const cols = 16;
  const rows = 22;
  const width = 300;
  const height = 400;
  const atomW = width / cols;
  const atomH = height / rows;

  // Center the container properly with GSAP on mount
  useEffect(() => {
    if (mounted && containerRef.current) {
      gsap.set(containerRef.current, { xPercent: -50, yPercent: -50 });
    }
  }, [mounted]);

  // The Kinetic Shockwave Engine
  useEffect(() => {
    if (!mounted || !containerRef.current) return;
    
    const atoms = atomsRef.current;
    
    const ctx = gsap.context(() => {
      if (isRevealed) {
        // Shockwave Implosion: Assembles violently from the center out
        gsap.to(atoms, {
          x: 0, y: 0, z: 0,
          rotationX: 0, rotationY: 0, rotationZ: 0,
          scale: 1, opacity: 1,
          duration: 1.5,
          ease: "expo.out",
          stagger: { amount: 0.8, from: "center" },
          overwrite: "auto"
        });
      } else {
        // Deep Space Explosion: Throws atoms much further with aggressive spinning
        atoms.forEach(atom => {
          gsap.to(atom, {
            x: gsap.utils.random(-1500, 1500),
            y: gsap.utils.random(-1500, 1500),
            z: gsap.utils.random(-2500, 1500),
            rotationX: gsap.utils.random(-720, 720),
            rotationY: gsap.utils.random(-720, 720),
            rotationZ: gsap.utils.random(-180, 180),
            scale: gsap.utils.random(0, 3),
            opacity: 0,
            duration: 1.2,
            ease: "power4.inOut",
            overwrite: "auto"
          });
        });
      }
    });
    
    return () => ctx.revert();
  }, [isRevealed, mounted]);

  // Mouse Parallax Track: Makes the assembled portrait breathe with the cursor
  useEffect(() => {
    if (!isRevealed || isTouch || !containerRef.current) return;
    
    const handleParallax = (e) => {
      const xOffset = (e.clientX - window.innerWidth / 2) * 0.08;
      const yOffset = (e.clientY - window.innerHeight / 2) * 0.08;
      
      // We use x/y here because xPercent/yPercent is already handling the centering
      gsap.to(containerRef.current, {
        x: xOffset,
        y: yOffset,
        rotationY: xOffset * 0.05,
        rotationX: -yOffset * 0.05,
        duration: 0.8,
        ease: "power2.out"
      });
    };
    
    window.addEventListener("mousemove", handleParallax);
    return () => {
      window.removeEventListener("mousemove", handleParallax);
      // Reset position when parallax ends
      if (containerRef.current) gsap.to(containerRef.current, { x: 0, y: 0, rotationY: 0, rotationX: 0, duration: 0.5 });
    };
  }, [isRevealed, isTouch]);

  // Anti-Scroll Trap
  useEffect(() => {
    if (!isRevealed) return;
    const handleScroll = () => setIsRevealed(false);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isRevealed]);

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
          style={{ width, height, perspective: "1500px" }}
        >
          {grid.map((cell, i) => (
            <div
              key={i}
              ref={el => atomsRef.current[i] = el}
              className="absolute will-change-transform shadow-2xl"
              style={{
                width: atomW,
                height: atomH,
                left: cell.c * atomW,
                top: cell.r * atomH,
                backgroundImage: "url('/mrsid.jpg')", // Updated to JPG
                backgroundSize: `${width}px ${height}px`,
                backgroundPosition: `-${cell.c * atomW}px -${cell.r * atomH}px`,
                backgroundRepeat: "no-repeat",
                opacity: 0,
                boxShadow: "0 0 20px rgba(0,0,0,0.5)" // Gives the shattered pieces depth
              }}
            />
          ))}
        </div>,
        document.body
      )}

      {/* 2. THE TRIGGER */}
      <div 
        className="group relative flex cursor-pointer items-center gap-3 z-10 w-fit"
        data-cursor="hover"
        onMouseEnter={() => !isTouch && setIsRevealed(true)}
        onMouseLeave={() => !isTouch && setIsRevealed(false)}
        onClick={() => isTouch && setIsRevealed(!isRevealed)}
      >
        <div className={`w-2 h-2 rounded-full shadow-[0_0_10px_var(--pf-accent,#3D8BFF)] transition-colors duration-300 ${isRevealed ? 'bg-white shadow-white' : 'bg-[var(--pf-accent,#3D8BFF)] animate-pulse'}`} />
        
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
