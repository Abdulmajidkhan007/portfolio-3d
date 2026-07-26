import { Suspense } from 'react'
import type { ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import type { CanvasProps } from '@react-three/fiber'
import { useInView } from '@/hooks/useInView'
import { useRenderTier } from '@/hooks/useRenderTier'
import { cn } from '@/utils/cn'

interface Props extends Omit<CanvasProps, 'children' | 'frameloop'> {
  children: ReactNode
  className?: string
}

/**
 * The Canvas every scene renders into.
 *
 * Whether a scene may load at all is decided upstream by <Deferred3D>; this
 * component owns what happens once it has. It stops the render loop the moment
 * the scene scrolls away (idle GPU, longer battery) and caps device pixel ratio
 * so a 3x phone does not render 9x the pixels — dropping to 1x outright on a
 * CPU rasteriser.
 */
export default function LazyCanvas({ children, className, ...canvasProps }: Props) {
  const tier = useRenderTier()
  const { ref, inView } = useInView<HTMLDivElement>({ rootMargin: '150px' })

  return (
    <div ref={ref} className={cn('h-full w-full', className)}>
      <Canvas
        frameloop={inView ? 'always' : 'never'}
        dpr={tier === 'low' ? 1 : [1, 1.75]}
        gl={{ antialias: false, powerPreference: 'high-performance', alpha: true }}
        {...canvasProps}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  )
}
