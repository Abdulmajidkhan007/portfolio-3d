import { useCallback, useState } from 'react'
import { isQualityPreference } from '../lib/quality'
import type { QualityPreference } from '../types'

const STORAGE_KEY = 'ocean-quality'

const read = (): QualityPreference => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return isQualityPreference(stored) ? stored : 'auto'
  } catch {
    // Storage blocked (private mode, sandboxed frame): the choice just is not remembered.
    return 'auto'
  }
}

/** The graphics level the visitor picked in the HUD, remembered across visits. */
export function useQualityPreference(): [QualityPreference, (next: QualityPreference) => void] {
  const [preference, setPreference] = useState<QualityPreference>(read)

  const update = useCallback((next: QualityPreference) => {
    setPreference(next)
    try {
      if (next === 'auto') window.localStorage.removeItem(STORAGE_KEY)
      else window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // See read().
    }
  }, [])

  return [preference, update]
}
