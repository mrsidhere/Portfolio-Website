import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useDevice } from "@/hooks/useDevice"; // Disables effect on mobile

export default function MrSidReveal() {
  const { isTouch } = useDevice();
  const containerRef = useRef(null);
  const chRedRef = useRef(null);
  const chCyanRef = useRef(null);
  const chBaseRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    // Abort on mobile to preserve scrolling performance
    if (isTouch) return; 

    const ctx = gsap.context(() => {
      const xRed = gsap.quickTo(chRedRef.current, "x", { duration: 0.1, ease: "power3.out" });
      const yRed = gsap.quickTo(chRedRef.current, "y", { duration: 0.1, ease: "power3.out" });
      
      const xBase = gsap.quickTo(chBaseRef.current, "x", { duration: 0.35, ease: "power3.out" });
      const yBase = gsap.quickTo(chBaseRef.current, "y", { duration: 0.35, ease: "power3.out" });
      
      const xCyan = gsap.quickTo(chCyanRef.current, "x", { duration: 0.6, ease: "power3.out" });
      const yCyan = gsap.quickTo(chCyanRef.current, "y", { duration: 0.6, ease: "power3.out" });

      const xCont = gsap.quickTo(containerRef.current, "x", { duration: 0, ease: "none" });
      const yCont = gsap.quickTo(containerRef.current, "y", { duration: 0, ease: "none" });

      const handleMouseEnter = (e) => {
        xCont(e.clientX - 160);
        yCont(e.clientY - 220);
        gsap.set([chRedRef.current, chCyanRef.current, chBaseRef.current], { x: 0, y: 0 });

        gsap.to(containerRef.current, {
          clipPath: "polygon(0 0%, 100% 0%, 100% 100%, 0 100%)",
          duration: 0.8,
          ease: "expo.out"
        });

        gsap.fromTo([chRedRef.current, chCyanRef.current, chBaseRef.current], 
          { scale: 1.5, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.8, ease: "expo.out", stagger: 0.05 }
        );
      };

      const handleMouseMove = (e) => {
        const xOffset = (e.clientX - window.innerWidth / 2) * 0.1;
        const yOffset = (e.clientY - window.innerHeight / 2) * 0.1;

        xCont(e.clientX - 160);
        yCont(e.clientY - 220);

        xRed(-xOffset * 1.5);
        yRed(-yOffset * 1.5);
        
        xBase(0);
        yBase(0);
        
        xCyan(xOffset * 1.5);
        yCyan(yOffset * 1.5);
      };

      const handleMouseLeave = () => {
        gsap.to(containerRef.current, {
          clipPath: "polygon(0 50%, 100% 50%, 100% 50%, 0 50%)",
          duration: 0.5,
          ease: "power3.inOut"
        });

        gsap.to([chRedRef.current, chCyanRef.current, chBaseRef.current], {
          scale: 1.2,
          opacity: 0,
          duration: 0.4,
          ease: "power2.in"
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
  }, [isTouch]);

  return (
    <>
      {/* 3D Kinetic Image Container */}
      {!isTouch && (
        <div 
          ref={containerRef} 
          className="pointer-events-none fixed top-0 left-0 w-[320px] h-[440px] z-[9000]"
          style={{ clipPath: "polygon(0 50%, 100% 50%, 100% 50%, 0 50%)" }}
        >
          {/* Red Glitch Channel */}
          <img 
            ref={chRedRef} 
            src="/mrsid.jpg" 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover mix-blend-screen rounded opacity-0 z-30"
            style={{ filter: "grayscale(100%) sepia(100%) hue-rotate(300deg) saturate(300%) contrast(1.2)" }} 
          />
          {/* Cyan Glitch Channel */}
          <img 
            ref={chCyanRef} 
            src="/mrsid.jpg" 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover mix-blend-screen rounded opacity-0 z-20"
            style={{ filter: "grayscale(100%) sepia(100%) hue-rotate(150deg) saturate(300%) contrast(1.2)" }} 
          />
          {/* Base Sharp Image */}
          <img 
            ref={chBaseRef} 
            src="/mrsid.jpg" 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover rounded opacity-0 z-10"
            style={{ filter: "grayscale(20%) contrast(1.1)" }} 
          />
        </div>
      )}

      {/* The Text Trigger inside your Manifesto */}
      <span 
        ref={triggerRef}
        className="text-[var(--pf-accent,#3D8BFF)] hover:text-white transition-colors duration-300 cursor-pointer font-bold uppercase tracking-widest relative z-10 inline-block"
        data-cursor="hover"
      >
        Who is Mr Sid
      </span>
    </>
  );
}
