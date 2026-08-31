import { useEffect, useRef, useState } from "react";
import "@/App.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { Toaster } from "sonner";
import { useDevice } from "@/hooks/useDevice";
import { Cursor } from "@/components/portfolio/Cursor";
import { Preloader } from "@/components/portfolio/Preloader";
import { Navbar } from "@/components/portfolio/Navbar";
import HeroPhysics from "@/components/portfolio/HeroPhysics";
import Manifesto from "@/components/portfolio/Manifesto";
import { Marquee } from "@/components/portfolio/Marquee";
import Vault from "@/components/portfolio/Vault";
import ProcessEngine from "@/components/portfolio/ProcessEngine";
import Testimonials from "@/components/portfolio/Testimonials";
import Footer from "@/components/portfolio/Footer";

gsap.registerPlugin(ScrollTrigger);

function App() {
  const { isTouch, reducedMotion } = useDevice();
  const lenisRef = useRef(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("pf-theme") || "dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("pf-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.body.classList.toggle("pf-no-cursor", !isTouch);
    return () => document.body.classList.remove("pf-no-cursor");
  }, [isTouch]);

  useEffect(() => {
    if (reducedMotion) return;
    
    // Added autoSleep: true for maximum background performance
    const lenis = new Lenis({ 
      lerp: 0.09, 
      smoothWheel: true,
      autoSleep: true 
    });
    
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    
    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion]);

  return (
    <div className="pf-root min-h-screen bg-[var(--pf-bg)] text-[var(--pf-text)] font-body antialiased overflow-x-hidden">
      {!isTouch && <Cursor />}
      <Preloader onDone={() => setReady(true)} />
      <Toaster position="bottom-center" theme={theme} />
      <Navbar theme={theme} onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} lenis={lenisRef} />
      <main>
        <HeroPhysics staticMode={isTouch || reducedMotion} theme={theme} ready={ready} />
        <Manifesto reducedMotion={reducedMotion} />
        <Marquee />
        <Vault />
        <ProcessEngine isTouch={isTouch} />
        <Testimonials />
        <Footer isTouch={isTouch} />
      </main>
    </div>
  );
}

export default App;
