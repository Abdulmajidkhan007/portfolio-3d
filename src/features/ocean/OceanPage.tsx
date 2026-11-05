import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import OceanFallback from './components/OceanFallback'
import OceanHud from './components/OceanHud'
import SceneErrorBoundary from './components/SceneErrorBoundary'
import { useBoatKeyboard } from './hooks/useBoatKeyboard'
import { useDocumentVisible } from './hooks/useDocumentVisible'
import { useOceanQuality } from './hooks/useOceanQuality'
import { useOceanStrings } from './hooks/useOceanStrings'
import { BoatInput } from './lib/boatInput'
import { qualitySettings } from './lib/quality'
import type { CameraMode, OceanQuality } from './types'

// The WebGL half of the page is its own chunk: a device that gets the still
// image never downloads three.js at all.
const OceanCanvas = lazy(() => import('./scene/OceanCanvas'))

/** Below this, sustained over two samples, a 'full' scene drops to 'lite'. */
const DECLINE_FPS = 28

/** /ocean — the 3D Lab: sail a rowing boat around a small island. */
export default function OceanPage() {
  const copy = useOceanStrings()
  const reducedMotion = useReducedMotion()
  const visible = useDocumentVisible()
  const { quality: detected, coarsePointer } = useOceanQuality()

  const [quality, setQuality] = useState<OceanQuality>(detected)
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)
  const [cameraMode, setCameraMode] = useState<CameraMode>('follow')
  const [fps, setFps] = useState<number | null>(null)
  const [slowSamples, setSlowSamples] = useState(0)

  const showFps = useMemo(() => new URLSearchParams(window.location.search).has('fps'), [])
  const input = useMemo(() => new BoatInput(), [])

  const toggleCamera = useCallback(
    () => setCameraMode((mode) => (mode === 'follow' ? 'free' : 'follow')),
    [],
  )
  useBoatKeyboard(input, toggleCamera)

  useEffect(() => {
    const previous = document.title
    document.title = copy.pageTitle
    return () => {
      document.title = previous
    }
  }, [copy])

  const handleReady = useCallback(() => setReady(true), [])
  const handleFps = useCallback(
    (sample: number) => {
      if (showFps) setFps(sample)
      // Expose the measurement for automated checks (Playwright reads it).
      document.documentElement.dataset.oceanFps = sample.toFixed(1)
      setSlowSamples((count) => (sample < DECLINE_FPS ? count + 1 : 0))
    },
    [showFps],
  )

  // An explicit ?quality= is a test of that tier: do not second-guess it.
  const pinned = useMemo(() => new URLSearchParams(window.location.search).has('quality'), [])

  useEffect(() => {
    if (!pinned && slowSamples >= 2 && quality === 'full') {
      setQuality('lite')
      setSlowSamples(0)
    }
  }, [pinned, slowSamples, quality])

  const fallback = quality === 'fallback' || failed

  return (
    <div className="fixed inset-0 overflow-hidden bg-bg text-ink" data-ocean-quality={quality}>
      {failed || quality === 'fallback' ? (
        <OceanFallback reason={failed ? 'error' : 'webgl'} />
      ) : (
        <SceneErrorBoundary onError={() => setFailed(true)}>
          <Suspense fallback={null}>
            <OceanCanvas
              settings={qualitySettings(quality, coarsePointer)}
              input={input}
              cameraMode={cameraMode}
              reducedMotion={reducedMotion}
              running={visible}
              onReady={handleReady}
              onFps={handleFps}
            />
          </Suspense>
        </SceneErrorBoundary>
      )}

      {!fallback && !ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg" role="status">
          <div className="flex flex-col items-center gap-4">
            <span className="h-12 w-12 animate-spin rounded-full border-2 border-line border-t-neon motion-reduce:animate-none" />
            <p className="font-mono text-xs tracking-[0.3em] text-muted uppercase">{copy.loading}</p>
          </div>
        </div>
      )}

      <OceanHud
        input={input}
        cameraMode={cameraMode}
        onToggleCamera={toggleCamera}
        quality={fallback ? 'fallback' : quality}
        touch={coarsePointer}
        reducedMotion={reducedMotion}
        fps={fps}
      />
    </div>
  )
}
