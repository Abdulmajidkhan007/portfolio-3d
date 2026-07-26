export type RenderTier = 'high' | 'low' | 'none'

let cached: RenderTier | null = null

/**
 * Probes what the machine can actually render, once per session.
 *
 * A CPU rasteriser (SwiftShader, llvmpipe, Chrome with the GPU blocklisted, a
 * VM) reports itself through WEBGL_debug_renderer_info. There the fill rate of
 * thousands of additive-blended sprites lands on the main thread and turns the
 * page janky, so those visitors get the same scenes at a much smaller budget
 * rather than a stutter — or nothing at all if WebGL is missing entirely.
 */
export function detectRenderTier(): RenderTier {
  if (cached) return cached
  if (typeof document === 'undefined') return 'high'

  try {
    const canvas = document.createElement('canvas')
    const gl = (canvas.getContext('webgl2') ??
      canvas.getContext('webgl')) as WebGLRenderingContext | null

    if (!gl) {
      cached = 'none'
      return cached
    }

    const info = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : ''
    gl.getExtension('WEBGL_lose_context')?.loseContext()

    cached = /swiftshader|llvmpipe|software|basic render|microsoft basic/i.test(renderer)
      ? 'low'
      : 'high'
  } catch {
    cached = 'none'
  }

  return cached
}

export function useRenderTier(): RenderTier {
  return detectRenderTier()
}
