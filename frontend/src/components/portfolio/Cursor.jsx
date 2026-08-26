import { useEffect, useRef } from "react";

export const Cursor = () => {
  const ref = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const ring = ringRef.current;
    let mx = -100, my = -100, rx = -100, ry = -100, raf;
    const move = (e) => { mx = e.clientX; my = e.clientY; };
    const over = (e) => {
      const hot = e.target.closest("a, button, [data-cursor='hover']");
      el.classList.toggle("cursor-hot", !!hot);
    };
    const loop = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      el.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", over, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="pf-cursor-ring" aria-hidden="true" />
      <div ref={ref} className="pf-cursor" aria-hidden="true">
        <svg width="26" height="26" viewBox="0 0 100 100" className="pf-cursor-svg">
          <path d="M50 8 L92 82 L74 82 L50 40 L26 82 L8 82 Z" fill="var(--pf-accent)" />
          <path d="M50 40 L74 82 L26 82 Z" fill="none" stroke="var(--pf-text)" strokeWidth="6" />
        </svg>
      </div>
    </>
  );
};
