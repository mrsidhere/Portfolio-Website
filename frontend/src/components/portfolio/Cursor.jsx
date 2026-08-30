import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export const Cursor = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [hasMoved, setHasMoved] = useState(false); // Controls initial visibility

  // Tracks raw mouse position
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Snappy physics for the inner logo
  const cursorX = useSpring(mouseX, { stiffness: 800, damping: 35, mass: 0.5 });
  const cursorY = useSpring(mouseY, { stiffness: 800, damping: 35, mass: 0.5 });

  // Bouncy, rubber-band physics for the outer ring
  const ringX = useSpring(mouseX, { stiffness: 150, damping: 20, mass: 0.8 });
  const ringY = useSpring(mouseY, { stiffness: 150, damping: 20, mass: 0.8 });

  useEffect(() => {
    const move = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!hasMoved) setHasMoved(true); // Unhides cursor on first movement
    };
    const down = () => setIsClicked(true);
    const up = () => setIsClicked(false);
    
    const over = (e) => {
      const hot = e.target.closest("a, button, [data-cursor='hover']");
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
      {/* Outer Playful Ring */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9998] rounded-full border border-[var(--pf-accent)] mix-blend-difference"
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
          opacity: hasMoved ? (isHovered ? 0.3 : 1) : 0, // Hidden until moved
          scale: isClicked ? 0.8 : 1, 
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />

      {/* Inner Logo SVG */}
      <motion.div 
        className="pointer-events-none fixed top-0 left-0 z-[9999] flex items-center justify-center mix-blend-difference"
        style={{ 
          x: cursorX, 
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%"
        }}
        animate={{
          scale: isHovered ? 0 : (hasMoved ? 1 : 0), // Hidden until moved
          rotate: isClicked ? 180 : 0,
          opacity: hasMoved ? 1 : 0, // Hidden until moved
        }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
      >
        <svg width="26" height="26" viewBox="0 0 100 100">
          <path d="M50 8 L92 82 L74 82 L50 40 L26 82 L8 82 Z" fill="var(--pf-accent)" />
          <path d="M50 40 L74 82 L26 82 Z" fill="none" stroke="white" strokeWidth="6" />
        </svg>
      </motion.div>
    </>
  );
};
