/**
 * Prints scripts/resume/resume.html to public/resume.pdf.
 *
 * Run by hand when the resume changes — it is NOT part of `npm run build`,
 * because it needs a Chromium and the output is committed:
 *
 *   npx playwright@1 install chromium   # once, if you have no browser
 *   node scripts/resume/build.mjs
 *
 * Set PLAYWRIGHT_CHROMIUM to point at an existing binary instead of installing
 * one (this repo's CI image ships Chromium at /opt/pw-browsers).
 */
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const source = resolve(here, 'resume.html')
const target = resolve(here, '..', '..', 'public', 'resume.pdf')
// PDF qaysi resume.html dan yig'ilganini eslab qoladi. src/__tests__/resume.test.ts
// shu hashni tekshiradi: HTML o'zgarib, PDF qayta yig'ilmasa — test qizil bo'ladi
// va saytda eski rezyume qolib ketmaydi.
const stamp = resolve(here, 'resume.sha256')

const { chromium } = await import('playwright')

const browser = await chromium.launch(
  process.env.PLAYWRIGHT_CHROMIUM ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM } : {},
)
const page = await browser.newPage()

await page.goto(pathToFileURL(source).href, { waitUntil: 'load' })
await page.pdf({
  path: target,
  format: 'A4',
  // Margins live in the stylesheet's @page rule so the HTML preview and the
  // PDF agree; printBackground keeps the rules and badge outlines.
  printBackground: true,
  preferCSSPageSize: true,
})

await browser.close()
writeFileSync(stamp, createHash('sha256').update(readFileSync(source)).digest('hex') + '\n')
console.log(`resume -> ${target}`)
