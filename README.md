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
npm test             # content, i18n and Netlify-form checks
npm run lint         # oxlint
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
| `socials[].href` | `null` → the handle renders as plain text, not a link | link to the real profile |

`projects[].live` and `projects[].repo` work the same way: leave a key out and the card simply
does not render that link. Shipping a link to `example.com` or to a bare `linkedin.com/in/` is
worse than shipping none, so `npm test` rejects both.

`npm run assets` regenerates the project artwork and the OG source SVG deterministically.
`public/images/og-image.png` and `public/resume.pdf` are committed binaries — the PNG is a
1200×630 render of `og-image.svg` (social platforms do not accept SVG previews), and the PDF
is a placeholder résumé built from the same content.

## Contact form

The form is handled by **Netlify Forms** — no backend, no database, no SMTP credentials.

Netlify detects forms by parsing the deployed HTML at build time and never sees markup that
React renders at runtime, so `index.html` carries a hidden static twin of the form. The React
form in `src/components/Contact.tsx` then POSTs URL-encoded data to `/` with a matching
`form-name`. **If you add or rename a field, change it in both places** — `npm test` fails if
the two forms drift, because nothing else catches it before production.

Submissions appear under *Forms* in the Netlify dashboard; turn on email notifications there.
Spam is filtered by Netlify plus the `bot-field` honeypot.

## Tests

`npm test` runs Vitest in a Node environment. There are no component-render tests; the suites
guard the invariants that are easy to break and impossible to notice locally:

- **`content.test.ts`** — every asset path in `content.ts` resolves to a committed file under
  `public/`, project ids are unique, categories match the filter, skill levels stay in the
  0–100 range the progress bars assume, and no outbound URL is a placeholder (`example.com`, or
  a bare `linkedin.com/in/`). Localized `{ uz, en }` pairs must both be non-empty, and the
  array-valued ones (`bio`, `typewriter`) must have matching lengths.
- **`i18n.test.ts`** — `en.ts` defines exactly the keys `uz.ts` does and neither side is empty.
  It also enforces Uzbek orthography: `oʻ`/`gʻ` must use U+02BB (ʻ), not a straight quote and
  not a bare vowel.
- **`netlify-form.test.ts`** — the hidden static form in `index.html` still exists, is still
  marked `data-netlify`, and declares the same fields as the React form.

CI (`.github/workflows/ci.yml`) runs lint, tests and the build on every push and pull request.

## Performance notes

- Every WebGL component sits behind `React.lazy`, and `Deferred3D` decides *when* that import
  is allowed to fire — near the viewport and on an idle main thread. `vite.config.ts` also
  strips the `three` chunk from the generated `modulepreload` hints, so ~230 KB of WebGL never
  competes with the stylesheet for first paint.
- `LazyCanvas` sets `frameloop="never"` the moment a scene scrolls away, so off-screen scenes
  cost nothing.
- `useRenderTier` probes `WEBGL_debug_renderer_info` once. On a CPU rasteriser (SwiftShader,
  llvmpipe, a VM, a GPU-blocklisted browser) particle budgets drop by an order of magnitude,
  DPR pins to 1 and the decorative shapes are skipped; with no WebGL at all the static
  fallbacks render instead.
- Device pixel ratio is otherwise capped at 1.75; counts and geometry detail also drop on phones.
- `prefers-reduced-motion` disables Lenis, the custom cursor and all 3D.
- `index.html` ships a static first-paint shell inside `#root` so the page is not blank until
  React boots. Keep it visually in sync with `LoadingScreen`.
- Fonts are self-hosted via `@fontsource` — no external requests, which also keeps the strict
  CSP in `netlify.toml` simple.

### Measured (Lighthouse, production build)

| | Performance | Accessibility | Best practices | SEO |
| --- | --- | --- | --- | --- |
| Desktop | **97** | 100 | 100 | 100 |
| Mobile | **65–71** | 100 | 100 | 100 |

Desktop: FCP 0.7s, LCP 0.8s, TBT 30ms, CLS 0.001.

The mobile preset simulates a 4×-throttled CPU on slow 4G; there LCP sits around 4.3s because
the hero cannot paint until React, GSAP and Framer Motion have downloaded and executed —
measured with the intro and the 3D disabled, and the number does not move, so neither is the
cause. Closing that gap means prerendering the shell at build time (SSG) so the hero paints
straight from HTML.

## Project layout

```
public/            static assets (generated artwork, resume, robots, sitemap)
scripts/           generate-assets.mjs — deterministic SVG artwork generator
src/components/    section components; three/ holds every WebGL scene
src/hooks/         media queries, pointer, scroll progress, Lenis, typewriter
src/i18n/          uz/en dictionaries + language context
src/data/          content.ts — the single source of truth for site content
src/utils/         GSAP animation presets, class-name helper
src/__tests__/     content, i18n and Netlify-form invariant checks
```

One deliberate naming note: the project cards use CSS 3D transforms rather than a WebGL
scene (`src/components/ProjectCard.tsx`). Six live canvases in a grid would mean six GL
contexts; `perspective` + `rotateX/rotateY` gets the same effect on the compositor for free.

## Deployment

Netlify builds with `npm run build` and publishes `dist/`. Redirects, cache headers and the
CSP live in [`netlify.toml`](netlify.toml).
