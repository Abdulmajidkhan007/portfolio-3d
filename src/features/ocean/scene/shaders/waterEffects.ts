import type { ShaderMaterial } from 'three'
import { seabedDepthGlsl } from '../../lib/seabed'
import type { Collider } from '../../types'

export interface WaterEffectOptions {
  shallowWater: boolean
  shoreFoam: boolean
  /** Rocks that get a ring of foam. */
  rocks: readonly Collider[]
}

/**
 * Teaches three's `Water` shader two things it does not know: how deep the
 * water is (from the island's analytic slope, no depth pre-pass), and what
 * to do with it — let the sand show through in the shallows, and break the
 * swell into foam bands that roll in towards the beach and around the rocks.
 *
 * Edits the material's source before its first compile; uses Water's own
 * `time` uniform and normal-map noise, so the foam drifts with the surface.
 */
export function addWaterEffects(material: ShaderMaterial, { shallowWater, shoreFoam, rocks }: WaterEffectOptions): void {
  material.transparent = shallowWater
  material.uniforms.uShallow = { value: shallowWater ? 1 : 0 }
  material.uniforms.uFoam = { value: shoreFoam ? 1 : 0 }

  const rockCount = rocks.length
  const rockList = rocks.map((rock) => `vec3(${rock.x.toFixed(2)}, ${rock.z.toFixed(2)}, ${rock.radius.toFixed(2)})`)
  const rockGlsl =
    rockCount > 0
      ? `const vec3 ROCKS[${rockCount}] = vec3[${rockCount}](${rockList.join(', ')});`
      : ''
  const rockLoop =
    rockCount > 0
      ? `for (int i = 0; i < ${rockCount}; i++) {
      float gap = length(worldPosition.xz - ROCKS[i].xy) - ROCKS[i].z * 0.7;
      float ring = 1.0 - smoothstep(0.0, 1.0, gap);
      float roll = smoothstep(0.6, 1.0, sin(gap * 4.0 + time * 2.2));
      foam = max(foam, ring * (0.55 + 0.45 * roll));
    }`
      : ''

  material.fragmentShader = material.fragmentShader
    .replace(
      'void main() {',
      `uniform float uShallow;
uniform float uFoam;
${seabedDepthGlsl()}
${rockGlsl}
void main() {`,
    )
    .replace(
      'gl_FragColor = vec4( outgoingLight, alpha );',
      `float depth = seabedDepth(worldPosition.xz);
  float shallow = uShallow * (1.0 - smoothstep(0.0, 4.5, depth));
  // Turquoise over sand, and see-through: the sand and its caustics show below.
  vec3 colour = mix(outgoingLight, outgoingLight * 0.5 + vec3(0.05, 0.3, 0.28), shallow * 0.65);
  float opacity = mix(1.0, 0.32, shallow);

  if (uFoam > 0.5) {
    float breakup = 0.55 + 0.45 * noise.x;
    // A steady line at the waterline, plus bands that roll in and die on the beach.
    float edge = 1.0 - smoothstep(0.0, 0.5, depth);
    float bands = smoothstep(0.4, 1.0, sin(depth * 4.0 + time * 2.6)) * (1.0 - smoothstep(0.3, 1.9, depth));
    float foam = edge * 0.9 + bands * 0.8;
    ${rockLoop}
    foam = clamp(foam * breakup, 0.0, 1.0);
    colour = mix(colour, vec3(0.95, 0.98, 1.0), foam * 0.9);
    opacity = max(opacity, foam);
  }
  gl_FragColor = vec4(colour, opacity);`,
    )
}
