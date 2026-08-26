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

### Iteration 2 (June 2026)
- Hero rework: readable-first spawn, zero gravity, cursor-collision breakup, spring-constraint magnetic return
- Electric blue accent (#3d8bff dark / #0b63e5 light) replacing red; process blobs blue/orange/lime
- True WebGL liquid-wave + RGB-split shader on vault carousel (raw WebGL, 'webgl-on' class, DOM fallback if textures fail)
- Synthesized Web Audio SFX (src/lib/sfx.js): letter collisions, card whoosh, blob merge, clicks; navbar toggle persisted
- Footer contact form → POST /api/contact (Mongo contact_briefs + Emergent-managed Resend email, per-IP rate limit 8/hr). OWNER_EMAIL currently delivered@resend.dev TEST address — hello@mohdkaif.com bounced as undeliverable; awaiting user's real inbox
- Process section responsive fix (border outside goo filter, responsive blob sizes/positions)
- testing_agent iteration_1: backend 9/9, frontend 100%

## Backlog
- P0: Swap mock projects with real client work (user selected "will paste details" but hasn't sent them yet)
- P0: Real owner inbox for contact emails (hello@mohdkaif.com currently undeliverable)
- P1: Mobile hamburger nav for section links
- P2: Case-study detail pages per project
- P2: SEO meta/OG tags, favicon branding
