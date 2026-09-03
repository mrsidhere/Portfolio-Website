import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Copy, ArrowUpRight } from "lucide-react";
import { sfx } from "../../lib/sfx";
import { EMAIL } from "../../data";

const ADVANCED_TAGS = [
  "REALISTIC RENDERING",
  "RAW MOTION",
  "AI GENERATION",
  "POST-PRODUCTION AUDIO",
  "DYNAMIC LIGHTING",
  "WEBGL PHYSICS"
];

const FOOTER_LINKS = [
  { label: "LINKEDIN", url: "https://linkedin.com/in/mohdkaif" },
  { label: "WHATSAPP", url: "https://wa.me/919939403048?text=Hi%20Mr.%20Sid!%20I%20would%20love%20to%20discuss%20a%20project." }
];

export default function Footer({ isTouch }) {
  const sectionRef = useRef(null);
  const holeRef = useRef(null);
  const emailRef = useRef(null);
  const tagRefs = useRef([]);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const submitBrief = async (e) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);

    const formData = new FormData(e.target);
    // Your specific Web3Forms Access Key
    formData.append("access_key", "cdd55fcf-3a63-47b6-8615-e7b967819f69");

    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: json
      }).then((res) => res.json());

      if (res.success) {
        sfx.merge();
        toast.success("Brief received — I'll get back to you soon!");
        setForm({ name: "", email: "", message: "" });
      } else {
        toast.error("Transmission failed. Please try again.");
      }
    } catch {
      toast.error("Couldn't send right now. Copy the email below instead!");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (isTouch) return;
    const section = sectionRef.current;
    const hole = holeRef.current;
    const email = emailRef.current;
    let raf, inside = false;
    const mouse = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };
    const tags = ADVANCED_TAGS.map((_, i) => ({
      angle: (i / ADVANCED_TAGS.length) * Math.PI * 2,
      radius: 120 + (i % 3) * 50,
      speed: 0.008 + (i % 4) * 0.004,
    }));

    const onMove = (e) => {
      const r = section.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      inside = e.clientY >= r.top && e.clientY <= r.bottom;
    };

    const loop = () => {
      const r = section.getBoundingClientRect();
      const restX = r.width / 2, restY = r.height / 2;
      const tx = inside ? mouse.x : restX;
      const ty = inside ? mouse.y : restY;
      pos.x += (tx - pos.x) * 0.1;
      pos.y += (ty - pos.y) * 0.1;
      hole.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%) scale(${inside ? 1 : 0.6})`;
      hole.style.opacity = inside ? 1 : 0.35;

      tags.forEach((t, i) => {
        t.angle += t.speed;
        const el = tagRefs.current[i];
        if (!el) return;
        const x = pos.x + Math.cos(t.angle) * t.radius;
        const y = pos.y + Math.sin(t.angle) * t.radius * 0.62;
        el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
        el.style.opacity = inside ? 1 : 0.25;
      });

      if (email) {
        const er = email.getBoundingClientRect();
        const sr = section.getBoundingClientRect();
        const ecx = er.left - sr.left + er.width / 2;
        const ecy = er.top - sr.top + er.height / 2;
        const dx = pos.x - ecx, dy = pos.y - ecy;
        const dist = Math.hypot(dx, dy);
        if (inside && dist < 220) {
          const pull = (1 - dist / 220) * 0.45;
          email.style.transform = `translate3d(${dx * pull}px, ${dy * pull}px, 0)`;
        } else {
          email.style.transform = "translate3d(0,0,0)";
        }
      }
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, [isTouch]);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL.toLowerCase());
    } catch {
      const ta = document.createElement("textarea");
      ta.value = EMAIL.toLowerCase();
      document.body.appendChild(ta); ta.select();
      document.execCommand("copy"); document.body.removeChild(ta);
    }
    setCopied(true);
    sfx.click();
    toast.success("Email copied to clipboard", { description: EMAIL.toLowerCase() });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer id="contact" ref={sectionRef} data-testid="footer-blackhole" className="relative min-h-[85vh] flex flex-col justify-center py-20 sm:py-0 overflow-hidden border-t border-[var(--pf-border)]">
      {!isTouch && (
        <>
          <div ref={holeRef} className="pf-blackhole" aria-hidden="true" />
          {ADVANCED_TAGS.map((tag, i) => (
            <span key={tag} ref={(el) => (tagRefs.current[i] = el)} aria-hidden="true"
              className="absolute top-0 left-0 z-[5] pointer-events-none font-mono text-[10px] tracking-[0.2em] px-3 py-1 rounded-full border border-[var(--pf-border)] bg-[var(--pf-glass)] backdrop-blur-sm will-change-transform transition-opacity duration-500">
              {tag}
            </span>
          ))}
        </>
      )}

      <div className="relative z-10 px-4 sm:px-12 w-full text-center">
        <p className="font-mono text-[10px] tracking-[0.35em] text-[var(--pf-muted)] mb-6 sm:mb-8">05 — GOT AN IDEA? LET'S BEND GRAVITY</p>
        
        {/* Fluid mobile text sizing using vw to prevent cutoff */}
        <button ref={emailRef} onClick={copyEmail} data-testid="footer-email-copy" data-cursor="hover"
          className="block w-full font-headline font-black tracking-tighter uppercase text-[6vw] sm:text-6xl lg:text-7xl leading-none will-change-transform transition-colors duration-300 hover:text-[var(--pf-accent)]">
          {copied ? "COPIED ✓" : EMAIL}
        </button>
        
        <p className="mt-6 font-mono text-[10px] tracking-[0.3em] text-[var(--pf-muted)] flex items-center justify-center gap-2">
          <Copy size={11} /> CLICK TO COPY
        </p>
      </div>

      <form onSubmit={submitBrief} data-testid="contact-form" className="relative z-10 mt-12 sm:mt-16 mx-auto w-full max-w-xl px-5 sm:px-6 grid gap-3 sm:gap-4">
        <p className="font-mono text-[10px] tracking-[0.35em] text-[var(--pf-muted)] text-center mb-1 sm:mb-2">— OR SEND A PROJECT BRIEF —</p>
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          <input required name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="YOUR NAME"
            data-testid="contact-name-input" maxLength={120}
            className="bg-transparent border border-[var(--pf-border)] rounded-none px-4 py-3.5 sm:py-4 font-mono text-xs tracking-[0.15em] outline-none focus:border-[var(--pf-accent)] transition-colors placeholder:text-[var(--pf-muted)]" />
          <input required type="email" name="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="YOUR EMAIL"
            data-testid="contact-email-input" maxLength={200}
            className="bg-transparent border border-[var(--pf-border)] rounded-none px-4 py-3.5 sm:py-4 font-mono text-xs tracking-[0.15em] outline-none focus:border-[var(--pf-accent)] transition-colors placeholder:text-[var(--pf-muted)]" />
        </div>
        <textarea required name="message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="TELL ME ABOUT YOUR PROJECT..."
          data-testid="contact-message-input" rows={4} maxLength={4000}
          className="bg-transparent border border-[var(--pf-border)] rounded-none px-4 py-3.5 sm:py-4 font-mono text-xs tracking-[0.15em] outline-none focus:border-[var(--pf-accent)] transition-colors resize-none placeholder:text-[var(--pf-muted)]" />
        
        <button type="submit" disabled={sending} data-testid="contact-submit-btn" data-cursor="hover"
          className="group flex items-center justify-center gap-3 mt-1 sm:mt-2 w-full bg-[var(--pf-accent)] text-[var(--pf-bg)] font-headline text-sm font-bold uppercase tracking-[0.15em] px-8 py-4 sm:py-5 rounded-none transition-all duration-300 hover:scale-[1.02] disabled:opacity-50">
          <span>{sending ? "TRANSMITTING..." : "LAUNCH BRIEF"}</span>
          <ArrowUpRight size={18} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
        </button>
      </form>

      <div className="relative z-10 mt-20 sm:mt-24 px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-6 pb-8">
        <p className="font-mono text-[10px] tracking-[0.25em] text-[var(--pf-muted)] sm:w-1/3 text-center sm:text-left">
          © 2026 MOHD KAIF / MR SID — DELHI, IN
        </p>
        
        <div className="flex gap-8 sm:w-1/3 justify-center">
          {FOOTER_LINKS.map((s) => (
            <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" data-testid={`footer-social-${s.label.toLowerCase()}`}
              className="group font-mono text-[10px] tracking-[0.25em] flex items-center gap-1 transition-colors duration-300 hover:text-[var(--pf-accent)]">
              {s.label}<ArrowUpRight size={11} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          ))}
        </div>

        <p className="font-mono text-[10px] tracking-[0.25em] text-[var(--pf-muted)] sm:w-1/3 text-center sm:text-right">
          REALITY, RENDERED.
        </p>
      </div>
    </footer>
  );
}
