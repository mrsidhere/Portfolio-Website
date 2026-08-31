import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export const Cursor = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);

  // Raw mouse position - NO SPRING. This ensures zero latency.
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Ultra-snappy, tight physics for the outer ring only
  const ringX = useSpring(mouseX, { stiffness: 1500, damping: 50, mass: 0.1 });
  const ringY = useSpring(mouseY, { stiffness: 1500, damping: 50, mass: 0.1 });

  useEffect(() => {
    const move = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!hasMoved) setHasMoved(true);
    };
    const down = () => setIsClicked(true);
    const up = () => setIsClicked(false);
    
    const over = (e) => {
      // Added input and textarea to ensure it works on your contact form!
      const hot = e.target.closest("a, button, [data-cursor='hover'], input, textarea");
      setIsHovered(!!hot);
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    window.addEventListener("mouseover", over, { passive: true });

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("mouseover", over);
    };
  }, [mouseX, mouseY, hasMoved]);

  return (
    <>
      {/* Outer Ring - Snappy Spring, removed mix-blend-mode */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9998] rounded-full border border-[var(--pf-accent)]"
        style={{ 
          x: ringX, 
          y: ringY,
          translateX: "-50%",
          translateY: "-50%"
        }}
        animate={{
          width: isHovered ? 64 : 36,
          height: isHovered ? 64 : 36,
          backgroundColor: isHovered ? "var(--pf-accent)" : "transparent",
          opacity: hasMoved ? (isHovered ? 0.2 : 1) : 0, 
          scale: isClicked ? 0.8 : 1, 
        }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
      />

      {/* Inner Logo SVG - INSTANT TRACKING, zero lag */}
      <motion.div 
        className="pointer-events-none fixed top-0 left-0 z-[9999] flex items-center justify-center"
        style={{ 
          x: mouseX, // Tied directly to raw mouse value!
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%"
        }}
        animate={{
          scale: isHovered ? 0 : (hasMoved ? 1 : 0),
          rotate: isClicked ? 180 : 0,
          opacity: hasMoved ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
      >
        <svg width="26" height="26" viewBox="0 0 100 100">
          <path d="M50 8 L92 82 L74 82 L50 40 L26 82 L8 82 Z" fill="var(--pf-accent)" />
          <path d="M50 40 L74 82 L26 82 Z" fill="none" stroke="var(--pf-bg)" strokeWidth="6" />
        </svg>
      </motion.div>
    </>
  );
};
