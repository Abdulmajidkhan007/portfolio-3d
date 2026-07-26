import { useMediaQuery } from './useMediaQuery'

/**
 * True when the visitor asked the OS to minimise motion. Every animated
 * surface checks this and falls back to a static presentation.
 */
export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}
