import { fileURLToPath, URL } from 'node:url'
// vitest/config re-exports Vite's defineConfig with the `test` block typed.
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

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
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('/three/') || id.includes('three-stdlib') || id.includes('@react-three')) {
            return 'three'
          }
          if (id.includes('/gsap/')) return 'gsap'
          if (
            id.includes('framer-motion') ||
            id.includes('motion-dom') ||
            id.includes('motion-utils')
          ) {
            return 'motion'
          }
          return 'vendor'
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
