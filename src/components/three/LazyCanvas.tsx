import { Suspense } from 'react'
import type { ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import type { CanvasProps } from '@react-three/fiber'
import { useInView } from '@/hooks/useInView'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/utils/cn'

interface Props extends Omit<CanvasProps, 'children' | 'frameloop'> {
  children: ReactNode
  className?: string
  /** Rendered instead of the scene when motion is reduced. */
  staticFallback?: ReactNode
}

/**
 * Every 3D scene on the site goes through here. It:
 *  - defers creating the WebGL context until the scene is near the viewport,
 *  - stops the render loop the moment it scrolls away (idle GPU, longer battery),
 *  - caps device pixel ratio so 3x phones do not render 9x the pixels,
 *  - renders a static fallback when the visitor prefers reduced motion.
 */
export default function LazyCanvas({ children, className, staticFallback, ...canvasProps }: Props) {
  const reducedMotion = useReducedMotion()
  const { ref, inView } = useInView<HTMLDivElement>({ rootMargin: '300px' })

  return (
    <div ref={ref} className={cn('h-full w-full', className)}>
      {reducedMotion ? (
        staticFallback
      ) : (
        <Canvas
          frameloop={inView ? 'always' : 'never'}
          dpr={[1, 1.75]}
          gl={{ antialias: false, powerPreference: 'high-performance', alpha: true }}
          {...canvasProps}
        >
          <Suspense fallback={null}>{children}</Suspense>
        </Canvas>
      )}
    </div>
  )
}
