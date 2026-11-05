import type { RenderTier } from '@/hooks/useRenderTier'
import type { OceanQuality, QualitySettings } from '../types'

/** Upper bound on device pixel ratio, whatever the screen offers. */
export const MAX_DPR = 1.5

interface DeviceHints {
  tier: RenderTier
  coarsePointer: boolean
  cores: number | undefined
  /** GiB, from navigator.deviceMemory where the browser exposes it. */
  memory: number | undefined
  /** `?quality=` override, for testing a tier on a machine that is not one. */
  override: string | null
}

const isQuality = (value: string | null): value is OceanQuality =>
  value === 'full' || value === 'lite' || value === 'fallback'

export function pickQuality({ tier, coarsePointer, cores, memory, override }: DeviceHints): OceanQuality {
  if (tier === 'none') return 'fallback'
  if (isQuality(override)) return override
  if (tier === 'low') return 'lite'
  // A phone with few cores or little memory cannot afford a second render pass
  // for reflections at 30 fps.
  const weakPhone = coarsePointer && ((cores ?? 8) <= 4 || (memory ?? 8) <= 3)
  return weakPhone ? 'lite' : 'full'
}

export function qualitySettings(
  quality: Exclude<OceanQuality, 'fallback'>,
  coarsePointer: boolean,
): QualitySettings {
  if (quality === 'lite') {
    return {
      quality,
      dpr: 1,
      shadows: false,
      shadowMapSize: 512,
      reflectionSize: 0,
      antialias: false,
    }
  }
  return {
    quality,
    dpr: [1, MAX_DPR],
    shadows: true,
    shadowMapSize: coarsePointer ? 1024 : 2048,
    reflectionSize: coarsePointer ? 256 : 512,
    // MSAA on a high-DPR phone screen costs more than it buys.
    antialias: !coarsePointer,
  }
}
