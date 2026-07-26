# portfolio-3d

Cyber-minimalist 3D portfolio site — React 19 + Vite + TypeScript, React Three Fiber for the
WebGL scenes, GSAP ScrollTrigger for scroll motion, Framer Motion for component transitions,
Tailwind CSS v4 for styling, Lenis for smooth scrolling. Bilingual (Uzbek / English), dark
theme only, deployed on Netlify.

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # typecheck + production build into dist/
npm run preview      # serve the production build locally
```

## Making it yours

Everything personal lives in **one file**: [`src/data/content.ts`](src/data/content.ts) —
name, bio, the six projects, skills, work history and social links. UI strings (labels,
buttons, form copy) live in [`src/i18n/uz.ts`](src/i18n/uz.ts) and
[`src/i18n/en.ts`](src/i18n/en.ts); `uz.ts` defines the shape, so TypeScript will tell you
if a key is missing from the English dictionary.

### Swapping in your own imagery

The visual assets ship as procedurally generated SVG. To replace any of them, drop a file
into `public/` and point `content.ts` at it — no component changes:

| Field in `content.ts` | `null` / default behaviour | Set a path to… |
| --- | --- | --- |
| `hero.videoSrc` | `null` → Three.js particle field | play a background video instead |
| `profile.avatarImage` | `null` → 3D point-cloud avatar | show an image instead |
| `projects[].image` | generated SVG under `public/images/projects/` | use your own screenshot |

`npm run assets` regenerates the project artwork and the OG source SVG deterministically.
`public/images/og-image.png` and `public/resume.pdf` are committed binaries — the PNG is a
1200×630 render of `og-image.svg` (social platforms do not accept SVG previews), and the PDF
is a placeholder résumé built from the same content.

## Contact form

The form is handled by **Netlify Forms** — no backend, no database, no SMTP credentials.

Netlify detects forms by parsing the deployed HTML at build time and never sees markup that
React renders at runtime, so `index.html` carries a hidden static twin of the form. The React
form in `src/components/Contact.tsx` then POSTs URL-encoded data to `/` with a matching
`form-name`. **If you add or rename a field, change it in both places.**

Submissions appear under *Forms* in the Netlify dashboard; turn on email notifications there.
Spam is filtered by Netlify plus the `bot-field` honeypot.

## Performance notes

- Every WebGL component sits behind `React.lazy`, so `three` never lands in the initial
  bundle. It is fetched only when a 3D section approaches the viewport.
- `LazyCanvas` defers WebGL context creation until the scene is within 300px of the viewport
  and sets `frameloop="never"` the moment it scrolls away, so off-screen scenes cost nothing.
- Device pixel ratio is capped at 1.75; particle counts and geometry detail drop on phones.
- `prefers-reduced-motion` disables Lenis, the custom cursor and all 3D, falling back to
  static CSS gradients.
- Fonts are self-hosted via `@fontsource` — no external requests, which also keeps the strict
  CSP in `netlify.toml` simple.

## Project layout

```
public/            static assets (generated artwork, resume, robots, sitemap)
scripts/           generate-assets.mjs — deterministic SVG artwork generator
src/components/    section components; three/ holds every WebGL scene
src/hooks/         media queries, pointer, scroll progress, Lenis, typewriter
src/i18n/          uz/en dictionaries + language context
src/data/          content.ts — the single source of truth for site content
src/utils/         GSAP animation presets, class-name helper
```

One deliberate naming note: the project cards use CSS 3D transforms rather than a WebGL
scene (`src/components/ProjectCard.tsx`). Six live canvases in a grid would mean six GL
contexts; `perspective` + `rotateX/rotateY` gets the same effect on the compositor for free.

## Deployment

Netlify builds with `npm run build` and publishes `dist/`. Redirects, cache headers and the
CSP live in [`netlify.toml`](netlify.toml).
