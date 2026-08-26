import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Copy, ArrowUpRight, Send } from "lucide-react";
import { sfx } from "../../lib/sfx";
import { TECH_TAGS, SOCIALS, EMAIL } from "../../data";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

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
    try {
      await axios.post(`${API}/contact`, form);
      sfx.merge();
      toast.success("Brief received — I'll get back to you soon!");
      setForm({ name: "", email: "", message: "" });
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
    const tags = TECH_TAGS.map((_, i) => ({
      angle: (i / TECH_TAGS.length) * Math.PI * 2,
      radius: 100 + (i % 3) * 45,
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
    <footer id="contact" ref={sectionRef} data-testid="footer-blackhole" className="relative min-h-[85vh] flex flex-col justify-center overflow-hidden border-t border-[var(--pf-border)]">
      {!isTouch && (
        <>
          <div ref={holeRef} className="pf-blackhole" aria-hidden="true" />
          {TECH_TAGS.map((tag, i) => (
            <span key={tag} ref={(el) => (tagRefs.current[i] = el)} aria-hidden="true"
              className="absolute top-0 left-0 z-[5] pointer-events-none font-mono text-[10px] tracking-[0.2em] px-3 py-1 rounded-full border border-[var(--pf-border)] bg-[var(--pf-glass)] backdrop-blur-sm will-change-transform transition-opacity duration-500">
              {tag}
            </span>
          ))}
        </>
      )}

      <div className="relative z-10 px-6 sm:px-12 text-center">
        <p className="font-mono text-[10px] tracking-[0.35em] text-[var(--pf-muted)] mb-8">05 — GOT AN IDEA? LET'S BEND GRAVITY</p>
        <button ref={emailRef} onClick={copyEmail} data-testid="footer-email-copy" data-cursor="hover"
          className="inline-block font-headline font-black tracking-tighter uppercase text-3xl sm:text-6xl lg:text-7xl leading-none will-change-transform transition-colors duration-300 hover:text-[var(--pf-accent)]">
          {copied ? "COPIED ✓" : EMAIL}
        </button>
        <p className="mt-6 font-mono text-[10px] tracking-[0.3em] text-[var(--pf-muted)] flex items-center justify-center gap-2">
          <Copy size={11} /> CLICK TO COPY
        </p>
      </div>

      <form onSubmit={submitBrief} data-testid="contact-form" className="relative z-10 mt-16 mx-auto w-full max-w-xl px-6 grid gap-3">
        <p className="font-mono text-[10px] tracking-[0.35em] text-[var(--pf-muted)] text-center mb-2">— OR SEND A PROJECT BRIEF —</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="YOUR NAME"
            data-testid="contact-name-input" maxLength={120}
            className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl px-4 py-3 font-mono text-xs tracking-[0.15em] outline-none focus:border-[var(--pf-accent)] transition-colors placeholder:text-[var(--pf-muted)]" />
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="YOUR EMAIL"
            data-testid="contact-email-input" maxLength={200}
            className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl px-4 py-3 font-mono text-xs tracking-[0.15em] outline-none focus:border-[var(--pf-accent)] transition-colors placeholder:text-[var(--pf-muted)]" />
        </div>
        <textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="TELL ME ABOUT YOUR PROJECT..."
          data-testid="contact-message-input" rows={4} maxLength={4000}
          className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl px-4 py-3 font-mono text-xs tracking-[0.15em] outline-none focus:border-[var(--pf-accent)] transition-colors resize-none placeholder:text-[var(--pf-muted)]" />
        <button type="submit" disabled={sending} data-testid="contact-submit-btn" data-cursor="hover"
          className="flex items-center justify-center gap-2 rounded-xl bg-[var(--pf-accent)] text-white font-mono text-xs tracking-[0.25em] py-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50">
          {sending ? "TRANSMITTING..." : "LAUNCH BRIEF"} <Send size={13} />
        </button>
      </form>

      <div className="relative z-10 mt-24 px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-6 pb-8">
        <p className="font-mono text-[10px] tracking-[0.25em] text-[var(--pf-muted)]">© 2026 MOHD KAIF / MR SID — DELHI, IN</p>
        <div className="flex gap-6">
          {SOCIALS.map((s) => (
            <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" data-testid={`footer-social-${s.label.toLowerCase()}`}
              className="group font-mono text-[10px] tracking-[0.25em] flex items-center gap-1 transition-colors duration-300 hover:text-[var(--pf-accent)]">
              {s.label}<ArrowUpRight size={11} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          ))}
        </div>
        <p className="font-mono text-[10px] tracking-[0.25em] text-[var(--pf-muted)]">INTENT CREATES IMPACT.</p>
      </div>
    </footer>
  );
}
