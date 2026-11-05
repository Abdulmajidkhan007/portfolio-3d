import type { RenderTier } from '@/hooks/useRenderTier'
import type { EffectFlags, OceanQuality, QualityPreference, QualitySettings, SceneQuality } from '../types'

/** Upper bound on device pixel ratio, whatever the screen offers. */
export const MAX_DPR = 1.5

export const SCENE_QUALITIES: readonly SceneQuality[] = ['high', 'medium', 'low']
export const QUALITY_PREFERENCES: readonly QualityPreference[] = ['auto', ...SCENE_QUALITIES]

interface DeviceHints {
  tier: RenderTier
  coarsePointer: boolean
  cores: number | undefined
  /** GiB, from navigator.deviceMemory where the browser exposes it. */
  memory: number | undefined
  /** `?quality=` override, for testing a level on a machine that is not one. */
  override: string | null
}

/** Stage-1 names still work in links: full is high, lite is low. */
const LEGACY: Readonly<Record<string, OceanQuality>> = { full: 'high', lite: 'low' }

export function parseQuality(value: string | null): OceanQuality | null {
  if (value === null) return null
  if (value === 'fallback' || (SCENE_QUALITIES as readonly string[]).includes(value)) {
    return value as OceanQuality
  }
  return LEGACY[value] ?? null
}

export const isQualityPreference = (value: unknown): value is QualityPreference =>
  typeof value === 'string' && (QUALITY_PREFERENCES as readonly string[]).includes(value)

export function pickQuality({ tier, coarsePointer, cores, memory, override }: DeviceHints): OceanQuality {
  if (tier === 'none') return 'fallback'
  const forced = parseQuality(override)
  if (forced) return forced
  if (tier === 'low') return 'low'
  // A phone with few cores or little memory cannot afford a second render pass
  // for reflections at 30 fps.
  const weakPhone = coarsePointer && ((cores ?? 8) <= 4 || (memory ?? 8) <= 3)
  if (weakPhone) return 'low'
  // Phones and tablets that can: everything but the light shafts, at a lower DPR.
  return coarsePointer ? 'medium' : 'high'
}

/** The next level down, used when the measured frame rate stays too low. */
export const lowerQuality = (quality: SceneQuality): SceneQuality =>
  quality === 'high' ? 'medium' : 'low'

const NO_EFFECTS: EffectFlags = {
  wake: false,
  shoreFoam: false,
  shallowWater: false,
  caustics: false,
  underwater: false,
  godRays: false,
}

export function qualitySettings(quality: SceneQuality, coarsePointer: boolean): QualitySettings {
  if (quality === 'low') {
    return {
      quality,
      dpr: 1,
      shadows: false,
      shadowMapSize: 512,
      reflectionSize: 0,
      antialias: false,
      wakeSegments: 0,
      effects: NO_EFFECTS,
    }
  }
  const high = quality === 'high'
  return {
    quality,
    dpr: [1, high ? MAX_DPR : 1.25],
    shadows: true,
    shadowMapSize: high && !coarsePointer ? 2048 : 1024,
    reflectionSize: high && !coarsePointer ? 512 : 256,
    // MSAA on a high-DPR phone screen costs more than it buys.
    antialias: high && !coarsePointer,
    wakeSegments: high ? 72 : 44,
    effects: {
      wake: true,
      shoreFoam: true,
      shallowWater: true,
      caustics: true,
      underwater: true,
      godRays: high,
    },
  }
}
