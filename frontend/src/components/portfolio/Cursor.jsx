import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export const Cursor = () => {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // High-performance GSAP quickTo setters for zero-latency tracking
    const xToOuter = gsap.quickTo(outerRef.current, "x", { duration: 0.35, ease: "power3.out" });
    const yToOuter = gsap.quickTo(outerRef.current, "y", { duration: 0.35, ease: "power3.out" });
    
    const xToInner = gsap.quickTo(innerRef.current, "x", { duration: 0.05, ease: "none" });
    const yToInner = gsap.quickTo(innerRef.current, "y", { duration: 0.05, ease: "none" });

    const move = (e) => {
      if (!isVisible) setIsVisible(true);
      xToOuter(e.clientX);
      yToOuter(e.clientY);
      xToInner(e.clientX);
      yToInner(e.clientY);
    };

    const down = () => setIsClicked(true);
    const up = () => setIsClicked(false);
    
    const over = (e) => {
      const hot = e.target.closest("a, button, [data-cursor='hover'], input, textarea");
      setIsHovered(!!hot);
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    window.addEventListener("mouseover", over, { passive: true });

    // Center elements on origin to match mouse point exactly
    gsap.set([outerRef.current, innerRef.current], { xPercent: -50, yPercent: -50 });

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("mouseover", over);
    };
  }, [isVisible]);

  // Handle visual state changes efficiently
  useEffect(() => {
    if (!isVisible) return;
    
    gsap.to(outerRef.current, {
      width: isHovered ? 64 : 36,
      height: isHovered ? 64 : 36,
      backgroundColor: isHovered ? "var(--pf-accent)" : "transparent",
      opacity: isHovered ? 0.2 : 1,
      scale: isClicked ? 0.8 : 1,
      duration: 0.3,
      ease: "power2.out"
    });

    gsap.to(innerRef.current, {
      scale: isHovered ? 0 : 1,
      rotate: isClicked ? 180 : 0,
      opacity: 1,
      duration: 0.3,
      ease: "power2.out"
    });
  }, [isHovered, isClicked, isVisible]);

  return (
    <>
      <div
        ref={outerRef}
        className="pointer-events-none fixed top-0 left-0 z-[9998] rounded-full border border-[var(--pf-accent)]"
        style={{ opacity: 0, width: 36, height: 36 }}
      />
      <div 
        ref={innerRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999] flex items-center justify-center"
        style={{ opacity: 0 }}
      >
        <svg width="26" height="26" viewBox="0 0 100 100">
          <path d="M50 8 L92 82 L74 82 L50 40 L26 82 L8 82 Z" fill="var(--pf-accent)" />
          <path d="M50 40 L74 82 L26 82 Z" fill="none" stroke="var(--pf-bg)" strokeWidth="6" />
        </svg>
      </div>
    </>
  );
};
