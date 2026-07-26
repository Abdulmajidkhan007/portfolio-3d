import { useEffect, useRef } from 'react'

export interface PointerState {
  /** Viewport pixels. */
  x: number
  y: number
  /** Normalised to -1..1, origin at the viewport centre. */
  nx: number
  ny: number
}

/**
 * Tracks the pointer in a ref rather than state — reading it during an
 * animation frame avoids a React render on every mousemove.
 */
export function useMousePosition() {
  const pointer = useRef<PointerState>({ x: 0, y: 0, nx: 0, ny: 0 })

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.current.x = event.clientX
      pointer.current.y = event.clientY
      pointer.current.nx = (event.clientX / window.innerWidth) * 2 - 1
      pointer.current.ny = -((event.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return pointer
}
