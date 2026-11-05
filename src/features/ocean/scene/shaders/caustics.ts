import type { MeshStandardMaterial } from 'three'

/**
 * A cheap caustic net: three warped sine waves whose sum crosses zero along
 * thin, wandering lines. Two layers at different scales hide the repetition.
 * Defines `float caustics(vec2 p, float t)` in 0..1.
 */
export const CAUSTICS_GLSL = /* glsl */ `
float causticLayer(vec2 p, float t) {
  vec2 q = p + vec2(sin(p.y * 1.7 + t), cos(p.x * 1.3 - t * 0.8)) * 0.6;
  float v = sin(q.x * 2.1) + sin(q.y * 2.3 + t * 0.7) + sin((q.x + q.y) * 1.6 - t * 0.5);
  return pow(1.0 - abs(v) / 3.0, 6.0);
}
float caustics(vec2 p, float t) {
  return causticLayer(p, t) * 0.65 + causticLayer(p * 1.9 + 3.1, t * 1.3) * 0.45;
}`

export interface CausticUniforms {
  uCausticTime: { value: number }
}

/**
 * Adds caustics to a standard material, strongest just below the surface and
 * fading with depth. Only fragments below y = 0 get them, so the beach above
 * the waterline is untouched.
 */
export function addCaustics(material: MeshStandardMaterial, uniforms: CausticUniforms): void {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vCausticWorld;')
      .replace(
        '#include <project_vertex>',
        '#include <project_vertex>\nvCausticWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;',
      )
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>\nvarying vec3 vCausticWorld;\nuniform float uCausticTime;\n${CAUSTICS_GLSL}`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
{
  float depth = -vCausticWorld.y;
  float reach = smoothstep(0.05, 0.5, depth) * exp(-depth * 0.14);
  float light = caustics(vCausticWorld.xz * 0.55, uCausticTime);
  totalEmissiveRadiance += diffuseColor.rgb * vec3(0.9, 1.0, 0.95) * light * reach * 0.85;
}`,
      )
  }
  material.customProgramCacheKey = () => 'ocean-caustics'
}
