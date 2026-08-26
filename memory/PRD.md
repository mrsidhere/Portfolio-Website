# PRD — Mohd Kaif / Mr Sid Physics Portfolio

## Original Problem Statement
Build a hyper-interactive, physics-based single-page portfolio (reference: haoqi.design). React + Tailwind + GSAP (ScrollTrigger) + Lenis + Matter.js. Data-driven (data.js with 8 projects, 5 testimonials). Sections: physics hero with throwable letters + geometric cursor collider, manifesto/about split with particle quote + masked reveal, infinite draggable vault carousel with velocity distortion + fullscreen expand, draggable gooey process blobs that merge to unlock content, throwable testimonial card stack, black-hole footer cursor with orbiting tech tags + magnetic email copy.

## User Choices
- Dark obsidian + platinum white with theme toggle (dark default)
- 8 mock projects, 5 mock testimonials
- Socials: LinkedIn (imohdkaif), Instagram (haikonmrsid)
- 60fps priority, mobile responsive w/ physics gracefully disabled on touch

## Architecture
- Frontend-only experience (backend untouched, default FastAPI hello-world at /api/)
- `src/data.js` — projects, testimonials, phases, tech tags, socials
- `src/hooks/useDevice.js` — touch + reduced-motion detection
- `src/components/portfolio/` — Cursor, Navbar, HeroPhysics (Matter.js), Manifesto (GSAP ScrollTrigger), Marquee, Vault (infinite drag + RGB split via CSS vars + framer layoutId expand), ProcessEngine (gooey SVG filter + framer drag merge), Testimonials (throwable stack), Footer (black hole rAF orbit + clipboard)
- Lenis smooth scroll wired to GSAP ticker in App.js; theme persisted in localStorage
- Fonts: Unbounded / Space Grotesk / JetBrains Mono / Cormorant Garamond

## Implemented (June 2026)
- All 6 sections + navbar + editorial marquee, dark/light toggle, custom Penrose cursor
- Touch fallbacks: static masked hero reveal, tap-to-unlock process blobs, no custom cursor
- Verified via automated browser: hero physics smash, quote assembly, vault drag/expand/close, all 3 blob merges unlock, card throw, email copy toast, light theme, mobile 390px

## Backlog
- P1: Sound-effects toggle (Web Audio synthesized clicks/whooshes)
- P1: Contact form or mailto CTA
- P2: True WebGL shader (R3F) for vault distortion instead of CSS RGB layers
- P2: Case-study detail pages per project
- P2: SEO meta/OG tags, favicon branding
