import { useScrollProgress } from '@/hooks/useScrollProgress'

/** Thin neon reading-progress bar pinned under the navbar. */
export default function ScrollProgress() {
  const progress = useScrollProgress()

  return (
    <div aria-hidden className="fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent">
      <div
        className="h-full origin-left bg-gradient-to-r from-neon to-cyan"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  )
}
