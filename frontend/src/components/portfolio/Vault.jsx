import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUpRight } from "lucide-react";
import { PROJECTS } from "../../data";

const ITEMS = [...PROJECTS, ...PROJECTS];

export default function Vault() {
  const wrapRef = useRef(null);
  const trackRef = useRef(null);
  const canvasRef = useRef(null);
  const drawRef = useRef(null);
  const state = useRef({ pos: 0, target: 0, dragging: false, lastX: 0, moved: 0, halfW: 1 });
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const track = trackRef.current;
    const wrap = wrapRef.current;
    const s = state.current;
    let raf, prev = 0;

    const measure = () => { s.halfW = track.scrollWidth / 2 || 1; };
    measure();
    window.addEventListener("resize", measure);

    const loop = () => {
      if (!s.dragging) s.target -= 0.6;
      s.pos += (s.target - s.pos) * 0.085;
      const vel = s.pos - prev;
      prev = s.pos;
      const wrapped = ((s.pos % s.halfW) + s.halfW) % s.halfW;
      track.style.transform = `translate3d(${-wrapped}px, 0, 0)`;
      const v = Math.max(-40, Math.min(40, vel));
      wrap.style.setProperty("--vel", v.toFixed(2));
      wrap.style.setProperty("--rgb", Math.min(Math.abs(v) / 30, 0.7).toFixed(2));
      if (drawRef.current) drawRef.current(wrapped, v);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const down = (e) => {
      s.dragging = true; s.moved = 0;
      s.lastX = e.touches ? e.touches[0].clientX : e.clientX;
    };
    const move = (e) => {
      if (!s.dragging) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const dx = x - s.lastX;
      s.moved += Math.abs(dx);
      s.target -= dx;
      s.lastX = x;
    };
    const up = () => { s.dragging = false; };

    wrap.addEventListener("mousedown", down);
    wrap.addEventListener("touchstart", down, { passive: true });
    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("touchmove", move, { passive: true });
    window.addEventListener("mouseup", up);
    window.addEventListener("touchend", up);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      wrap.removeEventListener("mousedown", down);
      wrap.removeEventListener("touchstart", down);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchend", up);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const track = trackRef.current;
    const gl = canvas.getContext("webgl", { alpha: true, antialias: true });
    if (!gl) return;

    const vsSrc = `
      attribute vec2 aPos;
      uniform vec4 uRect;
      uniform vec2 uRes;
      varying vec2 vUv;
      void main() {
        vec2 p = uRect.xy + aPos * uRect.zw;
        gl_Position = vec4(p.x / uRes.x * 2.0 - 1.0, 1.0 - p.y / uRes.y * 2.0, 0.0, 1.0);
        vUv = aPos;
      }`;
    const fsSrc = `
      precision mediump float;
      varying vec2 vUv;
      uniform sampler2D uTex;
      uniform float uVel;
      uniform float uTime;
      uniform vec2 uSize;
      uniform float uImgAspect;
      void main() {
        vec2 uv = vUv;
        uv.x += sin(uv.y * 5.0 + uTime * 2.0) * uVel * 0.0011;
        uv.y += sin(uv.x * 7.0 + uTime * 1.4) * uVel * 0.0007;
        float cardAspect = uSize.x / uSize.y;
        vec2 c = uv - 0.5;
        if (uImgAspect > cardAspect) c.x *= cardAspect / uImgAspect;
        else c.y *= uImgAspect / cardAspect;
        vec2 fuv = c * 0.94 + 0.5;
        float off = uVel * 0.0013;
        float r = texture2D(uTex, fuv + vec2(off, 0.0)).r;
        float g = texture2D(uTex, fuv).g;
        float b = texture2D(uTex, fuv - vec2(off, 0.0)).b;
        vec2 pp = (vUv - 0.5) * uSize;
        vec2 hs = uSize * 0.5 - 12.0;
        vec2 dd = abs(pp) - hs;
        float dist = length(max(dd, 0.0)) + min(max(dd.x, dd.y), 0.0) - 12.0;
        float alpha = 1.0 - smoothstep(-1.0, 1.0, dist);
        gl_FragColor = vec4(r, g, b, alpha);
      }`;

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    const vs = compile(gl.VERTEX_SHADER, vsSrc);
    const fs = compile(gl.FRAGMENT_SHADER, fsSrc);
    if (!vs || !fs) return;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const U = (n) => gl.getUniformLocation(prog, n);
    const uRect = U("uRect"), uRes = U("uRes"), uVel = U("uVel"), uTime = U("uTime"), uSize = U("uSize"), uImgAspect = U("uImgAspect");

    const textures = PROJECTS.map(() => null);
    const aspects = PROJECTS.map(() => 1);
    let loadedCount = 0, destroyed = false;
    PROJECTS.forEach((p, i) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (destroyed) return;
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        textures[i] = tex;
        aspects[i] = img.width / img.height;
        loadedCount++;
        if (loadedCount === PROJECTS.length) wrap.classList.add("webgl-on");
      };
      img.src = p.image;
    });

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let W = 0, H = 0, startT = performance.now();
    const resize = () => {
      const first = track.children[0];
      if (!first) return;
      W = wrap.clientWidth;
      H = first.offsetHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    drawRef.current = (wrapped, vel) => {
      if (loadedCount < PROJECTS.length || !W) return;
      const t = (performance.now() - startT) / 1000;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(uRes, W, H);
      gl.uniform1f(uVel, vel);
      gl.uniform1f(uTime, t);
      const cards = track.children;
      for (let i = 0; i < cards.length; i++) {
        const cw = cards[i].offsetWidth;
        const x = cards[i].offsetLeft - wrapped;
        if (x + cw < -50 || x > W + 50) continue;
        const tex = textures[i % PROJECTS.length];
        if (!tex) continue;
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.uniform4f(uRect, x, 0, cw, H);
        gl.uniform2f(uSize, cw, H);
        gl.uniform1f(uImgAspect, aspects[i % PROJECTS.length]);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    };

    return () => {
      destroyed = true;
      drawRef.current = null;
      window.removeEventListener("resize", resize);
      wrap.classList.remove("webgl-on");
    };
  }, []);

  const onCardClick = useCallback((idx) => {
    if (state.current.moved > 10) return;
    setExpanded(idx);
  }, []);

  return (
    <section id="vault" data-testid="vault-section" className="relative py-32 sm:py-40 overflow-hidden border-t border-[var(--pf-border)]">
      <div className="px-6 sm:px-12 flex items-end justify-between mb-14">
        <div className="flex items-baseline gap-4">
          <span className="font-headline text-5xl sm:text-7xl font-black text-transparent" style={{ WebkitTextStroke: "1px var(--pf-muted)" }}>02</span>
          <div>
            <span className="font-mono text-[10px] tracking-[0.35em] text-[var(--pf-muted)] block mb-2">SELECTED WORK</span>
            <h2 className="font-headline text-3xl sm:text-5xl font-extrabold tracking-tight uppercase">THE INFINITE VAULT</h2>
          </div>
        </div>
        <p className="hidden sm:block font-mono text-[10px] tracking-[0.3em] text-[var(--pf-muted)]">⟵ DRAG ⟶</p>
      </div>

      <div ref={wrapRef} data-testid="vault-carousel" className="pf-vault-wrap cursor-grab active:cursor-grabbing">
        <canvas ref={canvasRef} className="pf-vault-canvas" aria-hidden="true" />
        <div ref={trackRef} className="relative z-10 flex gap-6 sm:gap-8 w-max px-6 will-change-transform">
          {ITEMS.map((p, idx) => (
            <div key={idx} onClick={() => onCardClick(idx)} data-testid={`vault-card-${idx}`} data-cursor="hover"
              className="pf-vault-card group relative w-[75vw] sm:w-[420px] shrink-0 select-none">
              
              <div className="relative overflow-hidden rounded-xl border border-[var(--pf-border)] aspect-video bg-[var(--pf-surface)]">
                <motion.div layoutId={`vault-img-${idx}`} className="absolute inset-0">
                  <img src={p.image} alt={p.title} draggable="false" className="w-full h-full object-cover pf-vault-img" />
                  <img src={p.image} alt="" draggable="false" aria-hidden="true" className="pf-rgb-layer pf-rgb-r" />
                  <img src={p.image} alt="" draggable="false" aria-hidden="true" className="pf-rgb-layer pf-rgb-c" />
                </motion.div>
                
                {/* THE FIX: Fully Theme-Adaptive Overlays - No more hardcoded blacks/whites */}
                <div className="absolute inset-0 bg-[var(--pf-text)]/5 group-hover:bg-transparent transition-colors duration-500" />
                <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-[var(--pf-bg)] via-[var(--pf-bg)]/80 to-transparent opacity-95" />
                
                <div className="absolute top-4 right-4 w-9 h-9 grid place-items-center rounded-full bg-[var(--pf-surface)]/80 backdrop-blur-md border border-[var(--pf-border)] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowUpRight size={15} className="text-[var(--pf-text)]" />
                </div>
                <div className="absolute bottom-0 inset-x-0 p-5">
                  <p className="font-mono text-[9px] tracking-[0.3em] text-[var(--pf-accent)] mb-1">{p.year} — {p.category}</p>
                  <h3 className="font-headline text-lg sm:text-2xl font-bold tracking-tight text-[var(--pf-text)]">{p.title}</h3>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {expanded !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            data-testid="vault-expanded-modal" className="fixed inset-0 z-[80] bg-[var(--pf-bg)] overflow-y-auto">
            <button onClick={() => setExpanded(null)} data-testid="vault-close-btn" aria-label="Close project"
              className="fixed top-6 right-6 z-[90] w-12 h-12 grid place-items-center rounded-full border border-[var(--pf-border)] bg-[var(--pf-glass)] backdrop-blur-md transition-transform duration-300 hover:rotate-90">
              <X size={18} />
            </button>
            <div className="min-h-screen flex flex-col lg:flex-row">
              <motion.div layoutId={`vault-img-${expanded}`} className="lg:w-3/5 h-[50vh] lg:h-screen relative overflow-hidden bg-[var(--pf-surface)] border-b lg:border-b-0 lg:border-r border-[var(--pf-border)] flex items-center justify-center p-6 sm:p-12">
                <img src={ITEMS[expanded].image} alt={ITEMS[expanded].title} className="w-full max-h-full object-contain rounded-lg shadow-2xl border border-[var(--pf-border)]" />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="lg:w-2/5 flex flex-col justify-center p-8 sm:p-16">
                <p className="font-mono text-[10px] tracking-[0.35em] text-[var(--pf-accent)] mb-4">{ITEMS[expanded].year} — {ITEMS[expanded].category}</p>
                <h3 className="font-headline text-3xl sm:text-5xl font-black tracking-tighter uppercase mb-8 text-[var(--pf-text)]">{ITEMS[expanded].title}</h3>
                <p className="text-base sm:text-lg leading-relaxed text-[var(--pf-text2)] max-w-md">{ITEMS[expanded].description}</p>
                
                <div className="flex flex-col xl:flex-row gap-4 mt-10">
                  {ITEMS[expanded].link && (
                    <a 
                      href={ITEMS[expanded].link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group flex items-center justify-center gap-3 w-full xl:w-max border border-[var(--pf-accent)] text-[var(--pf-accent)] font-headline text-xs font-bold uppercase tracking-[0.15em] px-8 py-4 rounded-none transition-all duration-300 hover:bg-[var(--pf-accent)] hover:text-[var(--pf-bg)]"
                    >
                      <span>VIEW LIVE REALITY</span>
                      <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </a>
                  )}

                  <a 
                    href={`https://wa.me/919939403048?text=Hi%20Mr.%20Sid!%20I%20was%20just%20looking%20at%20${ITEMS[expanded].title}%20on%20your%20portfolio%20and%20I%20would%20love%20to%20discuss%20a%20project.`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label="Hire Mr. Sid - Open WhatsApp chat"
                    className="group flex items-center justify-center gap-3 w-full xl:w-max bg-[var(--pf-accent)] text-[var(--pf-bg)] font-headline text-xs font-bold uppercase tracking-[0.15em] px-8 py-4 rounded-none transition-all duration-300 hover:scale-[1.02]"
                  >
                    <span>DISCUSS PROJECT</span>
                    <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </a>
                </div>

                <div className="mt-12 h-px w-24 bg-[var(--pf-accent)]" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
