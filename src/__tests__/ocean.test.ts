/**
 * 3D Lab: the parts that do not need WebGL — boat physics, the swell, the
 * quality decision and the lab's own dictionary.
 */
import { describe, expect, it } from 'vitest'
import { BOAT, ISLAND, SEABED, WAKE, WORLD } from '@/features/ocean/config'
import { BoatInput } from '@/features/ocean/lib/boatInput'
import { initialBoatState, stepBoat } from '@/features/ocean/lib/boatPhysics'
import { ROCK_COLLIDERS, shoreRadiusAt } from '@/features/ocean/lib/island'
import {
  lowerQuality,
  MAX_DPR,
  parseQuality,
  pickQuality,
  qualitySettings,
  SCENE_QUALITIES,
} from '@/features/ocean/lib/quality'
import { profileDepth, seabedDepth, seabedDepthGlsl, UNDERWATER_PROFILE } from '@/features/ocean/lib/seabed'
import { isUnderwater, underwaterFog } from '@/features/ocean/lib/underwater'
import { WakeEmitter, wakeStrength } from '@/features/ocean/lib/wake'
import { hullPose, waveHeight } from '@/features/ocean/lib/waves'
import { oceanStrings } from '@/features/ocean/i18n'
import { isOceanPath } from '@/routes'
import type { BoatControls, BoatState } from '@/features/ocean/types'

const run = (state: BoatState, controls: BoatControls, seconds: number, dt = 1 / 60) => {
  let current = state
  for (let t = 0; t < seconds; t += dt) current = stepBoat(current, controls, dt)
  return current
}

/** Open water south of the island, bow facing +Z (away from it). */
const OPEN_WATER: BoatState = { x: 0, z: 60, heading: 0, speed: 0 }

describe('boat physics', () => {
  it('starts outside the island and clear of every rock', () => {
    const start = initialBoatState()
    expect(stepBoat(start, { throttle: 0, steer: 0 }, 1 / 60, ROCK_COLLIDERS)).toEqual(start)
  })

  it('stays put without input', () => {
    expect(run(OPEN_WATER, { throttle: 0, steer: 0 }, 2)).toEqual(OPEN_WATER)
  })

  it('accelerates ahead along its heading and respects the top speed', () => {
    const end = run(OPEN_WATER, { throttle: 1, steer: 0 }, 10)
    expect(end.speed).toBeGreaterThan(0)
    expect(end.speed).toBeLessThanOrEqual(BOAT.maxSpeed)
    // Heading 0 faces +Z.
    expect(end.z).toBeGreaterThan(OPEN_WATER.z)
  })

  it('turns to starboard (right, -X when facing +Z) on positive steer', () => {
    const moving = { ...OPEN_WATER, speed: 6 }
    const end = run(moving, { throttle: 0.5, steer: 1 }, 0.5)
    expect(end.heading).toBeLessThan(0)
    expect(end.x).toBeLessThan(moving.x)
  })

  it('cannot sail onto the island', () => {
    const towardsIsland = { x: 0, z: 30, heading: Math.PI, speed: BOAT.maxSpeed }
    const end = run(towardsIsland, { throttle: 1, steer: 0 }, 10)
    const shore = shoreRadiusAt(Math.atan2(end.z, end.x))
    expect(Math.hypot(end.x, end.z)).toBeGreaterThanOrEqual(shore + ISLAND.hullClearance - 1e-6)
  })

  it('is held inside the world boundary', () => {
    const outward = { x: 0, z: WORLD.radius - 2, heading: 0, speed: BOAT.maxSpeed }
    const end = run(outward, { throttle: 1, steer: 0 }, 5)
    expect(Math.hypot(end.x, end.z)).toBeLessThanOrEqual(WORLD.radius + 1e-6)
  })
})

describe('boat input', () => {
  it('sums keyboard and joystick and clamps to [-1, 1]', () => {
    const input = new BoatInput()
    input.setKeyboard({ throttle: 1, steer: -1 })
    input.setTouch({ throttle: 0.8, steer: -0.5 })
    expect(input.read()).toEqual({ throttle: 1, steer: -1 })
    input.reset()
    expect(input.read()).toEqual({ throttle: 0, steer: 0 })
  })
})

describe('swell', () => {
  it('never exceeds its amplitude', () => {
    for (let i = 0; i < 500; i += 1) {
      expect(Math.abs(waveHeight(i * 3.7, i * -2.1, i * 0.13, 0.5))).toBeLessThanOrEqual(0.5)
    }
  })

  it('leaves the hull level on a flat sea', () => {
    const pose = hullPose(4, 9, 1, 3, 0)
    expect(Math.abs(pose.y) + Math.abs(pose.pitch) + Math.abs(pose.roll)).toBe(0)
  })
})

describe('quality', () => {
  const base = { tier: 'high' as const, coarsePointer: false, cores: 8, memory: 8, override: null }

  it('falls back to the still image without WebGL, whatever the override says', () => {
    expect(pickQuality({ ...base, tier: 'none', override: 'high' })).toBe('fallback')
  })

  it('picks low on a CPU rasteriser and a weak phone, medium on other touch devices, high on desktop', () => {
    expect(pickQuality({ ...base, tier: 'low' })).toBe('low')
    expect(pickQuality({ ...base, coarsePointer: true, cores: 4 })).toBe('low')
    expect(pickQuality({ ...base, coarsePointer: true })).toBe('medium')
    expect(pickQuality(base)).toBe('high')
  })

  it('honours ?quality=, including the stage-1 names', () => {
    expect(pickQuality({ ...base, tier: 'low', override: 'high' })).toBe('high')
    expect(parseQuality('full')).toBe('high')
    expect(parseQuality('lite')).toBe('low')
    expect(parseQuality('medium')).toBe('medium')
    expect(parseQuality('ultra')).toBeNull()
  })

  it('steps down one level at a time and stops at low', () => {
    expect(lowerQuality('high')).toBe('medium')
    expect(lowerQuality('medium')).toBe('low')
    expect(lowerQuality('low')).toBe('low')
  })

  it('never renders above the DPR cap', () => {
    for (const quality of SCENE_QUALITIES) {
      for (const coarse of [true, false]) {
        const { dpr } = qualitySettings(quality, coarse)
        const max = Array.isArray(dpr) ? dpr[1] : dpr
        expect(max).toBeLessThanOrEqual(MAX_DPR)
      }
    }
  })

  it('turns every stage-2 effect off on low, and keeps the light shafts for high', () => {
    const low = qualitySettings('low', true)
    expect(Object.values(low.effects).every((on) => !on)).toBe(true)
    expect(low.wakeSegments).toBe(0)
    expect(qualitySettings('medium', true).effects.godRays).toBe(false)
    expect(qualitySettings('medium', true).effects.wake).toBe(true)
    expect(Object.values(qualitySettings('high', false).effects).every(Boolean)).toBe(true)
  })
})

describe('seabed', () => {
  it('is dry on the beach, deepens monotonically, and is flat far out', () => {
    expect(profileDepth(0.5)).toBe(0)
    expect(profileDepth(1)).toBe(0)
    let previous = 0
    for (let r = 1; r < 5; r += 0.05) {
      const depth = profileDepth(r)
      expect(depth).toBeGreaterThanOrEqual(previous)
      previous = depth
    }
    expect(seabedDepth(0, WORLD.radius)).toBe(SEABED.depth)
  })

  it('matches the profile points the sand mesh is built from', () => {
    for (const [r, y] of UNDERWATER_PROFILE) expect(profileDepth(r)).toBeCloseTo(-y)
  })

  it('emits GLSL with one branch per profile segment', () => {
    const glsl = seabedDepthGlsl()
    expect(glsl).toContain('float seabedDepth(vec2 xz)')
    expect(glsl.match(/if \(r <= /g)).toHaveLength(UNDERWATER_PROFILE.length)
  })

  it('keeps the free camera above the sand', () => {
    expect(SEABED.cameraFloor).toBeGreaterThan(-SEABED.depth)
  })
})

describe('wake', () => {
  const moving = (z: number, speed: number = BOAT.maxSpeed): BoatState => ({ x: 0, z, heading: 0, speed })

  it('scales with speed and ignores direction', () => {
    expect(wakeStrength(0)).toBe(0)
    expect(wakeStrength(BOAT.maxSpeed)).toBe(1)
    expect(wakeStrength(-BOAT.maxSpeed / 2)).toBeCloseTo(0.5)
  })

  it('lays a slice every WAKE.spacing units, behind the stern', () => {
    const emitter = new WakeEmitter()
    const first = emitter.update(moving(60), 0)
    expect(first?.z).toBeCloseTo(60 - WAKE.sternOffset)
    expect(emitter.update(moving(60 + WAKE.spacing / 2), 0.1)).toBeNull()
    expect(emitter.update(moving(60 + WAKE.spacing * 1.01), 0.2)).not.toBeNull()
  })

  it('leaves nothing while drifting', () => {
    const emitter = new WakeEmitter()
    expect(emitter.update(moving(60, 0.1), 0)).toBeNull()
  })
})

describe('underwater', () => {
  it('switches just below the surface', () => {
    expect(isUnderwater(0.5)).toBe(false)
    expect(isUnderwater(-1)).toBe(true)
  })

  it('darkens and closes in with depth', () => {
    const shallow = underwaterFog(0.5)
    const deep = underwaterFog(SEABED.depth)
    expect(deep.far).toBeLessThan(shallow.far)
    const brightness = (fog: typeof shallow) => fog.color[0] + fog.color[1] + fog.color[2]
    expect(brightness(deep)).toBeLessThan(brightness(shallow))
  })
})

describe('routing', () => {
  it('matches /ocean with or without a trailing slash, and nothing else', () => {
    expect(isOceanPath('/ocean')).toBe(true)
    expect(isOceanPath('/ocean/')).toBe(true)
    expect(isOceanPath('/')).toBe(false)
    expect(isOceanPath('/oceanic')).toBe(false)
  })
})

describe('3D Lab dictionary', () => {
  it('has the same non-empty keys in both languages', () => {
    expect(Object.keys(oceanStrings.en).sort()).toEqual(Object.keys(oceanStrings.uz).sort())
    for (const dict of Object.values(oceanStrings)) {
      for (const value of Object.values(dict)) expect(value.trim()).not.toBe('')
    }
  })

  it('writes Uzbek oʻ / gʻ with U+02BB', () => {
    for (const [key, value] of Object.entries(oceanStrings.uz)) {
      expect(value, key).not.toMatch(/[og]['’`´]/i)
    }
  })
})
