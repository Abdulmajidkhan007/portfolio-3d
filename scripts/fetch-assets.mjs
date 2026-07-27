/**
 * Pulls the generated imagery listed in generated-assets.json into public/
 * and re-encodes it to WebP. Runs as `prebuild`, so Vite copies the results
 * into dist/ on the same pass.
 *
 * Deliberately never fails the build. The site ships hand-authored SVG
 * placeholders for every one of these paths, and the components fall back to
 * them when a WebP is missing, so a flaky CDN degrades the imagery instead of
 * taking production down. Missing assets are reported loudly in the log.
 */
import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(here, '..', 'public')

const TIMEOUT_MS = 30_000
const ATTEMPTS = 3

const exists = (path) =>
  access(path).then(
    () => true,
    () => false,
  )

async function download(url) {
  let lastError
  for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return Buffer.from(await response.arrayBuffer())
    } catch (error) {
      lastError = error
      // 2s, 4s — the CDN is occasionally cold rather than down.
      if (attempt < ATTEMPTS) await new Promise((r) => setTimeout(r, 2000 * attempt))
    }
  }
  throw lastError
}

/** sharp is optional: without it the PNG is written through unconverted. */
async function loadSharp() {
  try {
    return (await import('sharp')).default
  } catch {
    return null
  }
}

async function main() {
  const manifest = JSON.parse(await readFile(join(here, 'generated-assets.json'), 'utf8'))
  const sharp = await loadSharp()
  if (!sharp) {
    console.warn('[assets] sharp unavailable — images will be written unconverted')
  }

  const missing = []

  for (const asset of manifest.assets) {
    const target = join(publicDir, asset.target)

    // An image already sitting in public/ always wins, so anyone can override
    // a generated asset just by committing their own file at that path.
    if (await exists(target)) {
      console.log(`[assets] keep   ${asset.target}`)
      continue
    }

    try {
      const source = await download(asset.url)
      const output = sharp
        ? await sharp(source)
            .resize({
              width: asset.maxWidth ?? manifest.maxWidth,
              withoutEnlargement: true,
            })
            .webp({ quality: asset.quality ?? manifest.quality })
            .toBuffer()
        : source

      await mkdir(dirname(target), { recursive: true })
      await writeFile(target, output)
      console.log(`[assets] wrote  ${asset.target} (${Math.round(output.byteLength / 1024)} kB)`)
    } catch (error) {
      missing.push(asset.target)
      console.warn(`[assets] FAILED ${asset.target}: ${error?.message ?? error}`)
    }
  }

  if (missing.length) {
    console.warn(
      `[assets] ${missing.length} asset(s) unavailable; the SVG placeholders will be served instead.`,
    )
  }
}

// Any unexpected throw is still just a warning: the build must go on.
main().catch((error) => {
  console.warn(`[assets] skipped entirely: ${error?.message ?? error}`)
})
