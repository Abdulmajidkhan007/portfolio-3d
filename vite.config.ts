import { fileURLToPath, URL } from 'node:url'
// vitest/config re-exports Vite's defineConfig with the `test` block typed.
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const OCEAN_DIR = '/src/features/ocean/'

type ModuleInfoLookup = (id: string) => {
  importers: readonly string[]
  dynamicImporters: readonly string[]
} | null

/**
 * True when `id` can only be reached through the 3D Lab. Walks importers
 * upwards; any path that reaches app code outside src/features/ocean means the
 * portfolio itself may load the module, so it stays in the shared chunks.
 */
function isOceanOnly(id: string, getModuleInfo: ModuleInfoLookup): boolean {
  const seen = new Set<string>()
  const reachesPortfolio = (current: string): boolean => {
    if (seen.has(current)) return false
    seen.add(current)
    if (current.includes(OCEAN_DIR)) return false
    if (!current.includes('node_modules')) return true
    const info = getModuleInfo(current)
    if (!info) return true
    const importers = [...info.importers, ...info.dynamicImporters]
    // An entry module with no importers is the portfolio itself.
    if (importers.length === 0) return true
    return importers.some(reachesPortfolio)
  }
  return !reachesPortfolio(id)
}

const isWebgl = (id: string): boolean =>
  id.includes('node_modules') &&
  (id.includes('/three/') || id.includes('three-stdlib') || id.includes('@react-three'))

const webglOnlyCache = new Map<string, boolean>()

/**
 * The WebGL libraries plus the packages only they import (scheduler, zustand,
 * suspend-react…). Those belong with three.js: anywhere else they would be
 * downloaded up front by a visitor who never scrolls to a 3D section.
 */
function isWebglOnly(id: string, getModuleInfo: ModuleInfoLookup): boolean {
  if (isWebgl(id)) return true
  if (!id.includes('node_modules')) return false
  const cached = webglOnlyCache.get(id)
  if (cached !== undefined) return cached
  // Optimistic while in progress, so a dependency cycle does not veto itself.
  webglOnlyCache.set(id, true)
  const info = getModuleInfo(id)
  const importers = info ? [...info.importers, ...info.dynamicImporters] : []
  const result =
    importers.length > 0 && importers.every((importer) => isWebglOnly(importer, getModuleInfo))
  webglOnlyCache.set(id, result)
  return result
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    // The `three` chunk is deliberately large: it is the whole WebGL runtime,
    // it is never part of the initial download, and it is fetched only once a
    // 3D section is close to the viewport.
    chunkSizeWarningLimit: 900,
    modulePreload: {
      // Vite preloads every chunk it can reach from the entry, which would pull
      // ~230 KB of WebGL into the critical path and undo <Deferred3D>. Everything
      // else still gets its preload hint.
      resolveDependencies: (_url, deps) => deps.filter((dep) => !dep.includes('three-')),
    },
    rollupOptions: {
      output: {
        // Keep the WebGL stack out of the initial bundle. Every three/ component
        // is behind React.lazy, so these chunks only load once a 3D section is
        // actually near the viewport.
        //
        // Groups capture in priority order, each with its dependencies. `three`
        // goes first so the shared WebGL runtime lands there; the 3D Lab's own
        // libraries (Water, Sky, GLTFLoader, meshopt, OrbitControls) come next
        // and must not grow the chunks the portfolio downloads.
        codeSplitting: {
          groups: [
            {
              name: (id, ctx) => {
                const lookup: ModuleInfoLookup = (m) => ctx.getModuleInfo(m)
                return isWebglOnly(id, lookup) && !isOceanOnly(id, lookup) ? 'three' : null
              },
              priority: 50,
              // Otherwise React's jsx-runtime is captured as a dependency of
              // @react-three/fiber, and the eagerly loaded motion chunk would
              // import the whole WebGL runtime to get it.
              includeDependenciesRecursively: false,
            },
            {
              // getModuleInfo needs its receiver, so it is not destructured.
              name: (id, ctx) =>
                id.includes('node_modules') && isOceanOnly(id, (m) => ctx.getModuleInfo(m))
                  ? 'ocean-vendor'
                  : null,
              priority: 40,
              includeDependenciesRecursively: false,
            },
            { name: 'gsap', test: /node_modules[\\/]gsap[\\/]/, priority: 30 },
            {
              name: 'motion',
              test: /node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/,
              priority: 20,
            },
            { name: 'vendor', test: /node_modules/, priority: 10 },
          ],
        },
      },
    },
  },
  test: {
    // Node environment is enough: these suites assert on data, dictionaries and
    // source text, not on rendered components.
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
