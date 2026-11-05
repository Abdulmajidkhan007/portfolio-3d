import { useMemo } from 'react'
import { useRenderTier } from '@/hooks/useRenderTier'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { pickQuality } from '../lib/quality'
import type { OceanQuality } from '../types'

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number
}

/** Decides once, on mount, how much of the scene this device should get. */
export function useOceanQuality(): { quality: OceanQuality; coarsePointer: boolean } {
  const tier = useRenderTier()
  const coarsePointer = useMediaQuery('(pointer: coarse)')

  const quality = useMemo(() => {
    const nav = navigator as NavigatorWithMemory
    return pickQuality({
      tier,
      coarsePointer,
      cores: nav.hardwareConcurrency,
      memory: nav.deviceMemory,
      override: new URLSearchParams(window.location.search).get('quality'),
    })
  }, [tier, coarsePointer])

  return { quality, coarsePointer }
}
