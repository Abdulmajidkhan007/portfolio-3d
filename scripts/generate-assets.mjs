/**
 * Generates the placeholder project artwork and the SEO preview image.
 *
 * Output is deterministic (seeded PRNG), so re-running never produces a diff
 * unless this file changes. SVG is used instead of a raster format because the
 * artwork is pure vector: ~3 KB each, sharp at any DPR, no build-time toolchain.
 *
 *   node scripts/generate-assets.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const W = 1200
const H = 750

const NEON = '#00ff88'
const CYAN = '#00d4ff'
const BG = '#0a0a0a'
const PANEL = '#111318'
const LINE = '#1e232d'

/** Deterministic 32-bit PRNG so repeated runs are byte-identical. */
function rng(seed) {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x100000000
  }
}

const round = (n) => Math.round(n * 100) / 100

function defs(id, from, to, angle) {
  return `
    <defs>
      <linearGradient id="g-${id}" x1="0" y1="0" x2="1" y2="1" gradientTransform="rotate(${angle} 0.5 0.5)">
        <stop offset="0%" stop-color="${from}"/>
        <stop offset="100%" stop-color="${to}"/>
      </linearGradient>
      <radialGradient id="glow-${id}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${from}" stop-opacity="0.42"/>
        <stop offset="100%" stop-color="${from}" stop-opacity="0"/>
      </radialGradient>
      <filter id="blur-${id}" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="34"/>
      </filter>
      <pattern id="grid-${id}" width="48" height="48" patternUnits="userSpaceOnUse">
        <path d="M48 0H0v48" fill="none" stroke="#ffffff" stroke-opacity="0.045" stroke-width="1"/>
      </pattern>
    </defs>`
}

/** Window chrome shared by every card so the set reads as one family. */
function chrome(title) {
  return `
    <rect x="56" y="56" width="${W - 112}" height="${H - 112}" rx="18" fill="${PANEL}" stroke="${LINE}"/>
    <path d="M56 96h${W - 112}" stroke="${LINE}" stroke-width="1"/>
    <circle cx="86" cy="76" r="5" fill="#ff5f57"/>
    <circle cx="104" cy="76" r="5" fill="#febc2e"/>
    <circle cx="122" cy="76" r="5" fill="#28c840"/>
    <text x="${W / 2}" y="81" text-anchor="middle" font-family="ui-monospace, monospace"
          font-size="13" fill="#8b93a7">${title}</text>`
}

function bars(seed, x, y, w, h, count, accent) {
  const rand = rng(seed)
  const gap = 10
  const bw = (w - gap * (count - 1)) / count
  let out = ''
  for (let i = 0; i < count; i += 1) {
    const bh = round(h * (0.25 + rand() * 0.75))
    out += `<rect x="${round(x + i * (bw + gap))}" y="${round(y + h - bh)}" width="${round(bw)}" height="${bh}" rx="3" fill="${accent}" fill-opacity="${round(0.35 + rand() * 0.5)}"/>`
  }
  return out
}

function sparkline(seed, x, y, w, h, accent, id) {
  const rand = rng(seed)
  const steps = 26
  const points = []
  let value = 0.5
  for (let i = 0; i <= steps; i += 1) {
    value = Math.max(0.08, Math.min(0.95, value + (rand() - 0.45) * 0.24))
    points.push([round(x + (w / steps) * i), round(y + h - value * h)])
  }
  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]} ${p[1]}`).join(' ')
  const area = `${line} L${round(x + w)} ${round(y + h)} L${round(x)} ${round(y + h)} Z`
  return `
    <path d="${area}" fill="url(#g-${id})" fill-opacity="0.16"/>
    <path d="${line}" fill="none" stroke="${accent}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    ${points.filter((_, i) => i % 6 === 0).map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="${accent}"/>`).join('')}`
}

function codeLines(seed, x, y, w, rows, accent) {
  const rand = rng(seed)
  let out = ''
  for (let i = 0; i < rows; i += 1) {
    const indent = Math.floor(rand() * 3) * 18
    const lw = round((w - indent) * (0.3 + rand() * 0.65))
    const isAccent = rand() > 0.72
    out += `<rect x="${round(x + indent)}" y="${round(y + i * 26)}" width="${lw}" height="9" rx="4.5"
              fill="${isAccent ? accent : '#ffffff'}" fill-opacity="${isAccent ? 0.7 : 0.13}"/>`
  }
  return out
}

function wireSphere(seed, cx, cy, r, accent) {
  const rand = rng(seed)
  let out = ''
  for (let i = 1; i <= 6; i += 1) {
    const rx = round(r * Math.sin((i / 7) * Math.PI))
    out += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${r}" fill="none" stroke="${accent}" stroke-opacity="0.28" stroke-width="1.2"/>`
  }
  for (let i = 1; i <= 5; i += 1) {
    const ry = round(r * Math.sin((i / 6) * Math.PI))
    out += `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${ry}" fill="none" stroke="${accent}" stroke-opacity="0.2" stroke-width="1.2"/>`
  }
  for (let i = 0; i < 18; i += 1) {
    const theta = rand() * Math.PI * 2
    const phi = Math.acos(2 * rand() - 1)
    out += `<circle cx="${round(cx + r * Math.sin(phi) * Math.cos(theta))}"
                    cy="${round(cy + r * Math.cos(phi))}" r="${round(2 + rand() * 3)}"
                    fill="${accent}" fill-opacity="${round(0.5 + rand() * 0.5)}"/>`
  }
  return out
}

/** One archetype per project so the grid never looks repetitive. */
const layouts = [
  // 1 — commerce: product stage + spec panel
  (id, a, b) => `
    ${wireSphere(11, 420, 400, 150, a)}
    <rect x="700" y="140" width="420" height="240" rx="14" fill="#0d0f14" stroke="${LINE}"/>
    ${codeLines(21, 726, 176, 368, 6, a)}
    <rect x="700" y="404" width="200" height="46" rx="23" fill="url(#g-${id})"/>
    <rect x="916" y="404" width="204" height="46" rx="23" fill="none" stroke="${b}" stroke-opacity="0.55"/>
    ${bars(31, 700, 500, 420, 130, 9, b)}`,

  // 2 — analytics: KPI row + area chart
  (id, a, b) => `
    ${[0, 1, 2, 3].map((i) => `
      <rect x="${96 + i * 254}" y="132" width="230" height="96" rx="12" fill="#0d0f14" stroke="${LINE}"/>
      <rect x="120" y="0" width="0" height="0"/>
      <rect x="${120 + i * 254}" y="158" width="${70 + i * 14}" height="10" rx="5" fill="#ffffff" fill-opacity="0.14"/>
      <rect x="${120 + i * 254}" y="184" width="${104 - i * 10}" height="20" rx="6" fill="${i % 2 ? b : a}" fill-opacity="0.8"/>`).join('')}
    <rect x="96" y="260" width="1008" height="404" rx="14" fill="#0d0f14" stroke="${LINE}"/>
    ${sparkline(41, 140, 310, 920, 300, a, id)}
    <rect x="140" y="628" width="920" height="1" fill="${LINE}"/>`,

  // 3 — voxel editor: isometric stack + tool rail
  (id, a, b) => {
    const rand = rng(51)
    let cubes = ''
    for (let row = 0; row < 5; row += 1) {
      for (let col = 0; col < 5; col += 1) {
        const x = 480 + (col - row) * 62
        const y = 300 + (col + row) * 34 - Math.floor(rand() * 3) * 30
        const accent = rand() > 0.7 ? a : rand() > 0.5 ? b : '#2a3140'
        cubes += `
          <g opacity="${round(0.55 + rand() * 0.45)}">
            <path d="M${x} ${y} l62 34 l0 44 l-62 -34 Z" fill="${accent}" fill-opacity="0.55"/>
            <path d="M${x + 62} ${y + 34} l62 -34 l0 44 l-62 34 Z" fill="${accent}" fill-opacity="0.3"/>
            <path d="M${x} ${y} l62 -34 l62 34 l-62 34 Z" fill="${accent}" fill-opacity="0.85"/>
          </g>`
      }
    }
    return `
      <rect x="96" y="132" width="86" height="532" rx="14" fill="#0d0f14" stroke="${LINE}"/>
      ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${118}" y="${162 + i * 56}" width="42" height="42" rx="10" fill="${i === 1 ? a : '#ffffff'}" fill-opacity="${i === 1 ? 0.9 : 0.1}"/>`).join('')}
      ${cubes}
      <rect x="960" y="132" width="144" height="532" rx="14" fill="#0d0f14" stroke="${LINE}"/>
      ${codeLines(61, 984, 166, 96, 14, b)}`
  },

  // 4 — shader lab: split editor / preview
  (id, a, b) => `
    <rect x="96" y="132" width="486" height="532" rx="14" fill="#0d0f14" stroke="${LINE}"/>
    ${codeLines(71, 128, 168, 420, 17, a)}
    <rect x="614" y="132" width="490" height="532" rx="14" fill="${BG}" stroke="${LINE}"/>
    <circle cx="859" cy="398" r="168" fill="url(#g-${id})" fill-opacity="0.9"/>
    <circle cx="859" cy="398" r="168" fill="url(#glow-${id})"/>
    ${Array.from({ length: 9 }, (_, i) => `<circle cx="859" cy="398" r="${168 - i * 18}" fill="none" stroke="${b}" stroke-opacity="${round(0.06 + i * 0.03)}" stroke-width="1.5"/>`).join('')}
    <rect x="646" y="596" width="180" height="34" rx="17" fill="${a}" fill-opacity="0.16"/>`,

  // 5 — mobile app: two device frames
  (id, a, b) => `
    <g transform="translate(360 118) rotate(-6 150 260)">
      <rect x="0" y="0" width="300" height="520" rx="34" fill="#0d0f14" stroke="${LINE}" stroke-width="2"/>
      <rect x="118" y="18" width="64" height="10" rx="5" fill="${LINE}"/>
      <rect x="26" y="56" width="140" height="16" rx="8" fill="#ffffff" fill-opacity="0.16"/>
      <circle cx="150" cy="192" r="76" fill="none" stroke="${LINE}" stroke-width="14"/>
      <path d="M150 116 a76 76 0 0 1 62 118" fill="none" stroke="${a}" stroke-width="14" stroke-linecap="round"/>
      ${bars(81, 26, 300, 248, 96, 7, b)}
      ${[0, 1, 2].map((i) => `<rect x="26" y="${424 + i * 30}" width="${248 - i * 46}" height="12" rx="6" fill="#ffffff" fill-opacity="0.1"/>`).join('')}
    </g>
    <g transform="translate(650 156) rotate(7 150 250)" opacity="0.85">
      <rect x="0" y="0" width="290" height="500" rx="32" fill="#0d0f14" stroke="${LINE}" stroke-width="2"/>
      ${codeLines(91, 26, 60, 236, 12, a)}
      <rect x="26" y="410" width="238" height="46" rx="23" fill="url(#g-${id})"/>
    </g>`,

  // 6 — CLI: terminal transcript
  (id, a, b) => `
    <rect x="96" y="132" width="1008" height="532" rx="14" fill="#07090c" stroke="${LINE}"/>
    ${Array.from({ length: 13 }, (_, i) => {
      const rand = rng(101 + i)
      const isPrompt = i % 4 === 0
      const w = round(160 + rand() * 620)
      return `
        ${isPrompt ? `<text x="132" y="${190 + i * 36}" font-family="ui-monospace, monospace" font-size="17" fill="${a}">$</text>` : ''}
        <rect x="${isPrompt ? 158 : 132}" y="${178 + i * 36}" width="${w}" height="11" rx="5.5"
              fill="${isPrompt ? '#ffffff' : b}" fill-opacity="${isPrompt ? 0.22 : 0.42}"/>`
    }).join('')}
    <rect x="132" y="646" width="14" height="18" fill="${a}"/>`,
]

const palettes = [
  [NEON, CYAN, 12],
  [CYAN, NEON, 145],
  [NEON, '#a78bfa', 40],
  [CYAN, '#a78bfa', 200],
  [NEON, CYAN, 95],
  [CYAN, NEON, 300],
]

const titles = [
  'nebula-commerce — configurator',
  'orbit-analytics — dashboard',
  'voxel-studio — editor',
  'shader-lab — playground',
  'pulse-fit — mobile',
  'kit-cli — terminal',
]

function card(index) {
  const id = `p${index + 1}`
  const [a, b, angle] = palettes[index]
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${titles[index]}">
  ${defs(id, a, b, angle)}
  <rect width="${W}" height="${H}" fill="${BG}"/>
  <rect width="${W}" height="${H}" fill="url(#grid-${id})"/>
  <ellipse cx="${index % 2 ? W * 0.75 : W * 0.25}" cy="${H * 0.3}" rx="330" ry="250" fill="url(#glow-${id})" filter="url(#blur-${id})"/>
  ${chrome(titles[index])}
  ${layouts[index](id, a, b)}
</svg>
`
}

function ogImage() {
  const id = 'og'
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630" role="img" aria-label="Abdulmajid Sharipov — Frontend Developer &amp; 3D Enthusiast">
  ${defs(id, NEON, CYAN, 20)}
  <rect width="1200" height="630" fill="${BG}"/>
  <rect width="1200" height="630" fill="url(#grid-${id})"/>
  <ellipse cx="880" cy="300" rx="360" ry="300" fill="url(#glow-${id})" filter="url(#blur-${id})"/>
  ${wireSphere(7, 900, 315, 190, NEON)}
  <text x="90" y="250" font-family="ui-sans-serif, system-ui, sans-serif" font-size="30" fill="${NEON}"
        letter-spacing="6">FRONTEND DEVELOPER</text>
  <text x="86" y="345" font-family="ui-sans-serif, system-ui, sans-serif" font-size="66" font-weight="700"
        fill="#e8ecf4">Abdulmajid</text>
  <text x="86" y="420" font-family="ui-sans-serif, system-ui, sans-serif" font-size="66" font-weight="700"
        fill="url(#g-${id})">Sharipov</text>
  <text x="90" y="486" font-family="ui-monospace, monospace" font-size="24" fill="#8b93a7">
    React · TypeScript · Three.js · WebGL</text>
  <rect x="86" y="530" width="220" height="4" rx="2" fill="url(#g-${id})"/>
</svg>
`
}

async function write(path, contents) {
  const full = resolve(root, path)
  await mkdir(dirname(full), { recursive: true })
  await writeFile(full, contents, 'utf8')
  console.log(`wrote ${path} (${(contents.length / 1024).toFixed(1)} KB)`)
}

for (let i = 0; i < 6; i += 1) {
  await write(`public/images/projects/project-${i + 1}.svg`, card(i))
}
await write('public/images/og-image.svg', ogImage())
