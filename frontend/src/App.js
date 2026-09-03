import { useEffect, useRef, useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import NotFound from "@/NotFound";

gsap.registerPlugin(ScrollTrigger);

function MainPortfolio({ theme, ready, setReady, setTheme, lenisRef, isTouch, reducedMotion }) {
  return (
    <>
      <Preloader onDone={() => setReady(true)} />
      <Toaster position="bottom-center" theme={theme} />
      <Navbar theme={theme} onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} lenis={lenisRef} />
      <main>
        {/* Passed staticMode to HeroPhysics to kill heavy scrub on mobile */}
        <HeroPhysics staticMode={isTouch || reducedMotion} theme={theme} ready={ready} />
        <Manifesto reducedMotion={reducedMotion} />
        <Marquee />
        <Vault />
        {/* Passed isTouch to completely kill Matter.js physics on mobile */}
        <ProcessEngine isTouch={isTouch} />
        <Testimonials />
        <Footer isTouch={isTouch} />
      </main>
    </>
  );
}

export default function App() {
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
    
    const lenis = new Lenis({ 
      lerp: 0.08, 
      smoothWheel: true, 
      smoothTouch: false, // Prevents custom scroll on mobile
      syncTouch: false,
      autoSleep: false
    });
    
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    
    // Sync GSAP ticker with Lenis frame rate
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
    <BrowserRouter>
      <div className="pf-root min-h-screen bg-[var(--pf-bg)] text-[var(--pf-text)] font-body antialiased overflow-x-hidden">
        {!isTouch && <Cursor />}
        <Routes>
          <Route
            path="/"
            element={
              <MainPortfolio
                theme={theme}
                ready={ready}
                setReady={setReady}
                setTheme={setTheme}
                lenisRef={lenisRef}
                isTouch={isTouch}
                reducedMotion={reducedMotion}
              />
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
