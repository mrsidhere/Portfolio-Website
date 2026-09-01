import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { useDevice } from "@/hooks/useDevice";

export default function MrSidReveal() {
  const { isTouch } = useDevice();
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const triggerRef = useRef(null);

  // Mount the portal safely on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isTouch || !mounted) return; 

    const ctx = gsap.context(() => {
      // Container follows mouse
      const xCont = gsap.quickTo(containerRef.current, "x", { duration: 0.4, ease: "power3.out" });
      const yCont = gsap.quickTo(containerRef.current, "y", { duration: 0.4, ease: "power3.out" });
      
      // Image moves opposite to mouse for 3D depth
      const xImg = gsap.quickTo(imgRef.current, "x", { duration: 0.8, ease: "power3.out" });
      const yImg = gsap.quickTo(imgRef.current, "y", { duration: 0.8, ease: "power3.out" });

      const handleMouseEnter = (e) => {
        // Snap container to mouse
        xCont(e.clientX - 160);
        yCont(e.clientY - 210);

        // Shutter open effect
        gsap.to(containerRef.current, {
          clipPath: "inset(0% 0% 0% 0% round 12px)",
          duration: 0.7,
          ease: "expo.out"
        });

        // Slight image zoom out for premium feel
        gsap.fromTo(imgRef.current, 
          { scale: 1.2 }, 
          { scale: 1, duration: 1.2, ease: "expo.out" }
        );
      };

      const handleMouseMove = (e) => {
        xCont(e.clientX - 160);
        yCont(e.clientY - 210);

        // Calculate Parallax based on screen center
        const xParallax = (window.innerWidth / 2 - e.clientX) * 0.15;
        const yParallax = (window.innerHeight / 2 - e.clientY) * 0.15;
        
        xImg(xParallax);
        yImg(yParallax);
      };

      const handleMouseLeave = () => {
        // Shutter close to invisible dot
        gsap.to(containerRef.current, {
          clipPath: "inset(50% 50% 50% 50% round 100px)",
          duration: 0.5,
          ease: "power3.inOut"
        });
      };

      const trigger = triggerRef.current;
      trigger.addEventListener('mouseenter', handleMouseEnter);
      trigger.addEventListener('mousemove', handleMouseMove);
      trigger.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        trigger.removeEventListener('mouseenter', handleMouseEnter);
        trigger.removeEventListener('mousemove', handleMouseMove);
        trigger.removeEventListener('mouseleave', handleMouseLeave);
      };
    });

    return () => ctx.revert();
  }, [isTouch, mounted]);

  return (
    <>
      {/* 1. THE PARALLAX LENS (PORTAL) - Rendered only on Desktop */}
      {mounted && !isTouch && createPortal(
        <div 
          ref={containerRef} 
          className="pointer-events-none fixed top-0 left-0 w-[320px] h-[420px] z-[9000] overflow-hidden"
          style={{ clipPath: "inset(50% 50% 50% 50% round 100px)" }}
        >
          <img 
            ref={imgRef} 
            src="/mrsid.jpg" 
            alt="Mohd Kaif" 
            className="absolute top-[-15%] left-[-15%] w-[130%] h-[130%] object-cover contrast-125 brightness-90"
          />
        </div>,
        document.body
      )}

      {/* 2. THE EASTER EGG TRIGGER - Rendered everywhere */}
      <div 
        ref={triggerRef}
        className="group relative flex cursor-pointer items-center gap-3 z-10 w-fit"
        data-cursor="hover"
      >
        {/* Pulsing Live Dot */}
        <div className="w-2 h-2 bg-[var(--pf-accent,#3D8BFF)] rounded-full shadow-[0_0_10px_var(--pf-accent,#3D8BFF)] animate-pulse" />
        
        {/* Animated Text Swap */}
        <div className="relative h-5 w-40 overflow-hidden text-xs sm:text-[10px] tracking-[0.35em] text-[var(--pf-accent,#3D8BFF)] font-bold uppercase">
          <span className="absolute inset-0 flex items-center transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full">
            Who is Mr Sid
          </span>
          <span className="absolute inset-0 flex items-center text-white translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0">
            [ View Identity ]
          </span>
        </div>
      </div>
    </>
  );
}
