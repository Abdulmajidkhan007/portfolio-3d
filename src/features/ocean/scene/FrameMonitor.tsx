import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

interface Props {
  /** Average FPS over the last window. */
  onSample: (fps: number) => void
  windowSeconds?: number
}

/** Reports average frame rate every `windowSeconds`, from real frame times. */
export default function FrameMonitor({ onSample, windowSeconds = 2 }: Props) {
  const frames = useRef(0)
  const time = useRef(0)

  useFrame((_, dt) => {
    // A frame after a paused tab is not a measurement of rendering speed.
    if (dt > 0.5) return
    frames.current += 1
    time.current += dt
    if (time.current >= windowSeconds) {
      onSample(frames.current / time.current)
      frames.current = 0
      time.current = 0
    }
  })

  return null
}
