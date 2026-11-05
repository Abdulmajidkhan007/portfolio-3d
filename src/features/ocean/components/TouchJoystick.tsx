import { useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { BoatInput } from '../lib/boatInput'
import { clamp } from '../lib/math'
import { cn } from '@/utils/cn'

interface Props {
  input: BoatInput
  label: string
  className?: string
}

/** Pad radius in CSS pixels; the knob travels this far from centre. */
const RADIUS = 52
/** Ignore tiny thumb wobble around the centre. */
const DEAD_ZONE = 0.12

const shape = (value: number): number =>
  Math.abs(value) < DEAD_ZONE ? 0 : (value - Math.sign(value) * DEAD_ZONE) / (1 - DEAD_ZONE)

/**
 * Virtual thumbstick: up/down is throttle, left/right is the rudder. Pointer
 * capture keeps the drag alive when the thumb slides off the pad.
 */
export default function TouchJoystick({ input, label, className }: Props) {
  const padRef = useRef<HTMLDivElement>(null)
  const pointerRef = useRef<number | null>(null)
  const [knob, setKnob] = useState({ x: 0, y: 0 })

  const update = (event: ReactPointerEvent<HTMLDivElement>) => {
    const pad = padRef.current
    if (!pad) return
    const rect = pad.getBoundingClientRect()
    let dx = event.clientX - (rect.left + rect.width / 2)
    let dy = event.clientY - (rect.top + rect.height / 2)
    const distance = Math.hypot(dx, dy)
    if (distance > RADIUS) {
      dx = (dx / distance) * RADIUS
      dy = (dy / distance) * RADIUS
    }
    setKnob({ x: dx, y: dy })
    input.setTouch({
      throttle: shape(clamp(-dy / RADIUS, -1, 1)),
      steer: shape(clamp(dx / RADIUS, -1, 1)),
    })
  }

  const release = () => {
    pointerRef.current = null
    setKnob({ x: 0, y: 0 })
    input.setTouch({ throttle: 0, steer: 0 })
  }

  return (
    <div
      ref={padRef}
      role="application"
      aria-label={label}
      className={cn(
        'relative h-36 w-36 touch-none rounded-full border border-line bg-surface/70 shadow-lg backdrop-blur-md select-none',
        className,
      )}
      onPointerDown={(event) => {
        if (pointerRef.current !== null) return
        pointerRef.current = event.pointerId
        event.currentTarget.setPointerCapture(event.pointerId)
        update(event)
      }}
      onPointerMove={(event) => {
        if (event.pointerId === pointerRef.current) update(event)
      }}
      onPointerUp={(event) => {
        if (event.pointerId === pointerRef.current) release()
      }}
      onPointerCancel={(event) => {
        if (event.pointerId === pointerRef.current) release()
      }}
    >
      <span aria-hidden className="absolute inset-x-0 top-2 text-center font-mono text-[10px] text-muted">
        ▲
      </span>
      <span aria-hidden className="absolute inset-x-0 bottom-2 text-center font-mono text-[10px] text-muted">
        ▼
      </span>
      <span
        aria-hidden
        className="absolute top-1/2 left-1/2 h-14 w-14 rounded-full bg-gradient-to-br from-neon to-cyan opacity-90 shadow-neon"
        style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
      />
    </div>
  )
}
