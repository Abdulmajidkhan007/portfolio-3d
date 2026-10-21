# portfolio-3d

Cyber-minimalist 3D portfolio site — React 19 + Vite + TypeScript, React Three Fiber for the
WebGL scenes, GSAP ScrollTrigger for scroll motion, Framer Motion for component transitions,
Tailwind CSS v4 for styling, Lenis for smooth scrolling. Bilingual (Uzbek / English), dark
theme only. Deployed on **Firebase Hosting**, with a **Cloud Functions** backend for the
contact form.

## Status (2026-10-21)

- **Live:** https://abdulmajidkhan-portfolio.web.app — deployed from `main` by GitHub Actions.
- **Contact form backend is not deployed yet.** The project is on the Spark plan
  (`FIREBASE_PLAN=spark`), so only Hosting goes out; the `contact` function waits for Blaze.
  Until then a failed submit shows a Telegram link instead of a silent error.
- Last code change: 2026-10-16 (display name unified to "Abdulmajid Sharipov").

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # typecheck + production build into dist/
npm run preview      # serve the production build locally
npm test             # content, i18n, CSP and contact-form checks
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

## Contact form (backend)

The form posts JSON to `/api/contact`. `firebase.json` rewrites that path to the **`contact`
Cloud Function** (`functions/src/index.ts`), so the browser only ever talks to one origin —
no CORS, and `connect-src 'self'` in the CSP stays untouched.

What the function does, in order:

1. **Validates** the payload (`functions/src/validate.ts`) — required fields, email shape,
   length bounds, control characters stripped. The client validates too, but only for comfort:
   an HTTP request does not need a browser.
2. **Honeypot** — a `botField` input hidden from people. If it is filled the function returns
   `200 OK` without storing anything, so the bot believes it succeeded and does not retry.
3. **Rate limit** — 3 submissions per IP per minute, counted in a Firestore transaction.
4. **Stores** the message in the `messages` collection.
5. **Notifies** Telegram, if `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` secrets are set.
   A failed notification is logged but does not fail the request — the message is already saved.

`firestore.rules` denies every client read and write. Only the function, which runs with the
Admin SDK, can touch the data.

**If you add or rename a field, change it in both places** — `contact-contract.test.ts` fails
if the React form and the validator drift apart.

Full deployment steps: [`docs/FIREBASE.md`](docs/FIREBASE.md).

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
- **`contact-contract.test.ts`** — the React form still posts to `/api/contact`, `firebase.json`
  still rewrites that path to the `contact` function *before* the SPA catch-all, and the form
  fields still match the keys the validator reads.
- **`contact-validate.test.ts`** — the backend validator itself: honeypot, email shapes, length
  bounds, control-character stripping. Imported straight from `functions/src/` so there is no
  second test toolchain to keep in sync.
- **`csp.test.ts`** — every inline script in `index.html` has a matching sha256 hash in the CSP
  inside `firebase.json`, and no inline event attributes crept back in.

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
  CSP in `firebase.json` simple.

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
src/__tests__/     content, i18n, CSP and contact-form invariant checks
functions/         Cloud Functions backend (contact endpoint)
```

One deliberate naming note: the project cards use CSS 3D transforms rather than a WebGL
scene (`src/components/ProjectCard.tsx`). Six live canvases in a grid would mean six GL
contexts; `perspective` + `rotateX/rotateY` gets the same effect on the compositor for free.

## Deployment

```bash
npm run build                     # dist/
firebase deploy                   # hosting + functions + firestore rules
```

`firebase.json` holds the SPA rewrite, the `/api/contact` → function rewrite, cache headers
and the CSP. `.firebaserc` names the project — set it before the first deploy.

Step-by-step (project creation, secrets, emulator, custom domain):
[`docs/FIREBASE.md`](docs/FIREBASE.md).
