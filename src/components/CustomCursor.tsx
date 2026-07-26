import { useEffect, useRef } from 'react'
import { useHasFinePointer } from '@/hooks/useMediaQuery'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const INTERACTIVE = 'a, button, input, textarea, select, [data-cursor="hover"]'

/**
 * Two-layer cursor: a dot that tracks the pointer exactly and a ring that
 * lags behind it. Only mounts on devices with a real pointer — touch devices
 * keep their native behaviour and pay nothing for this.
 */
export default function CustomCursor() {
  const finePointer = useHasFinePointer()
  const reducedMotion = useReducedMotion()
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  const enabled = finePointer && !reducedMotion

  useEffect(() => {
    if (!enabled) return

    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    document.documentElement.classList.add('has-custom-cursor')

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const ringPos = { ...target }
    let frame = 0
    let scale = 1
    let renderedScale = 1

    const onMove = (event: PointerEvent) => {
      target.x = event.clientX
      target.y = event.clientY
      dot.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`
      if (ring.style.opacity !== '1') ring.style.opacity = '1'
      if (dot.style.opacity !== '1') dot.style.opacity = '1'
    }

    const onOver = (event: PointerEvent) => {
      const el = event.target as Element | null
      scale = el?.closest?.(INTERACTIVE) ? 1.9 : 1
    }

    const onLeave = () => {
      dot.style.opacity = '0'
      ring.style.opacity = '0'
    }

    const onDown = () => {
      scale = 0.7
    }
    const onUp = () => {
      scale = 1
    }

    const tick = () => {
      // Exponential smoothing: the ring chases the pointer instead of snapping.
      ringPos.x += (target.x - ringPos.x) * 0.16
      ringPos.y += (target.y - ringPos.y) * 0.16
      renderedScale += (scale - renderedScale) * 0.18
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%) scale(${renderedScale.toFixed(3)})`
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerover', onOver, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    document.addEventListener('pointerleave', onLeave)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerover', onOver)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointerleave', onLeave)
      document.documentElement.classList.remove('has-custom-cursor')
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[9999]">
      <div
        ref={ringRef}
        className="absolute top-0 left-0 h-9 w-9 rounded-full border border-neon/70 opacity-0 mix-blend-difference transition-opacity duration-200"
      />
      <div
        ref={dotRef}
        className="absolute top-0 left-0 h-1.5 w-1.5 rounded-full bg-neon opacity-0 transition-opacity duration-200"
      />
    </div>
  )
}
