import { useState, useEffect } from "react";

export function useDevice() {
  const [state, setState] = useState(() => ({
    isTouch: typeof window !== "undefined" && (window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768),
    reducedMotion: typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  }));

  useEffect(() => {
    const onResize = () => setState((s) => ({ ...s, isTouch: window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768 }));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return state;
}
