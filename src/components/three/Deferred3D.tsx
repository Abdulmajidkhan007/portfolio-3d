import { Suspense, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useInView } from '@/hooks/useInView'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useRenderTier } from '@/hooks/useRenderTier'
import { cn } from '@/utils/cn'

interface Props {
  /** A lazily-imported 3D component. Nothing is imported until it renders. */
  children: ReactNode
  /** Shown until the scene is allowed to load, and forever if it never is. */
  fallback?: ReactNode
  className?: string
}

/**
 * Decides *whether and when* a WebGL scene is allowed to exist.
 *
 * The gate has to sit here rather than inside the scene, because `React.lazy`
 * fires its import the moment the element renders — on a slow connection that
 * means the ~230 KB WebGL bundle competes with the stylesheet and the app
 * bundle for the first paint. Holding the render back until the main thread is
 * idle keeps that download off the critical path entirely.
 *
 * The scene is skipped outright when the visitor prefers reduced motion or the
 * device has no WebGL at all.
 */
export default function Deferred3D({ children, fallback = null, className }: Props) {
  const reducedMotion = useReducedMotion()
  const tier = useRenderTier()
  const { ref, inView } = useInView<HTMLDivElement>({ rootMargin: '400px', once: true })
  const [idle, setIdle] = useState(false)

  useEffect(() => {
    if (reducedMotion || tier === 'none') return

    const ric = window.requestIdleCallback
    if (!ric) {
      const timer = setTimeout(() => setIdle(true), 400)
      return () => clearTimeout(timer)
    }
    const handle = ric(() => setIdle(true), { timeout: 2500 })
    return () => window.cancelIdleCallback?.(handle)
  }, [reducedMotion, tier])

  const allowed = !reducedMotion && tier !== 'none' && inView && idle

  return (
    <div ref={ref} className={cn('h-full w-full', className)}>
      {allowed ? <Suspense fallback={fallback}>{children}</Suspense> : fallback}
    </div>
  )
}
