import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import OceanFallback from './components/OceanFallback'
import OceanHud from './components/OceanHud'
import SceneErrorBoundary from './components/SceneErrorBoundary'
import { useBoatKeyboard } from './hooks/useBoatKeyboard'
import { useDocumentVisible } from './hooks/useDocumentVisible'
import { useOceanQuality } from './hooks/useOceanQuality'
import { useOceanStrings } from './hooks/useOceanStrings'
import { useQualityPreference } from './hooks/useQualityPreference'
import { BoatInput } from './lib/boatInput'
import { lowerQuality, qualitySettings } from './lib/quality'
import type { CameraMode, OceanQuality, QualityPreference, SceneQuality } from './types'

// The WebGL half of the page is its own chunk: a device that gets the still
// image never downloads three.js at all.
const OceanCanvas = lazy(() => import('./scene/OceanCanvas'))

/** Below this, sustained over two samples, an automatic level drops one step. */
const DECLINE_FPS = 28

/** /ocean — the 3D Lab: sail a rowing boat around a small island. */
export default function OceanPage() {
  const copy = useOceanStrings()
  const reducedMotion = useReducedMotion()
  const visible = useDocumentVisible()
  const { quality: detected, coarsePointer } = useOceanQuality()

  const [preference, setPreference] = useQualityPreference()
  // What 'auto' currently means: the detected level, lowered if frames are slow.
  const [autoQuality, setAutoQuality] = useState(detected)
  const [failed, setFailed] = useState(false)
  const [underwater, setUnderwater] = useState(false)
  const [ready, setReady] = useState(false)
  // `?dive` opens in the free camera, under water: a direct way to check that effect.
  const dive = useMemo(() => new URLSearchParams(window.location.search).has('dive'), [])
  const [cameraMode, setCameraMode] = useState<CameraMode>(dive ? 'free' : 'follow')
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

  // An explicit ?quality= is a test of that level: do not second-guess it.
  const pinned = useMemo(() => new URLSearchParams(window.location.search).has('quality'), [])
  const manual = !pinned && preference !== 'auto'
  const quality: OceanQuality = detected === 'fallback' ? 'fallback' : manual ? preference : autoQuality

  useEffect(() => {
    if (pinned || manual || slowSamples < 2) return
    setSlowSamples(0)
    setAutoQuality((current) => (current === 'fallback' || current === 'low' ? current : lowerQuality(current)))
  }, [pinned, manual, slowSamples])

  const handlePreference = useCallback(
    (next: QualityPreference) => {
      setPreference(next)
      setSlowSamples(0)
      // Back to auto starts from what the device was judged able to do.
      if (next === 'auto') setAutoQuality(detected)
    },
    [detected, setPreference],
  )

  const sceneQuality: SceneQuality | null = failed || quality === 'fallback' ? null : quality
  const fallback = sceneQuality === null

  return (
    <div className="fixed inset-0 overflow-hidden bg-bg text-ink" data-ocean-quality={quality}>
      {sceneQuality === null ? (
        <OceanFallback reason={failed ? 'error' : 'webgl'} />
      ) : (
        <SceneErrorBoundary onError={() => setFailed(true)}>
          <Suspense fallback={null}>
            <OceanCanvas
              // A new level is a new GL context: antialiasing cannot change on a live one.
              key={sceneQuality}
              settings={qualitySettings(sceneQuality, coarsePointer)}
              input={input}
              cameraMode={cameraMode}
              startBelow={dive}
              reducedMotion={reducedMotion}
              running={visible}
              onReady={handleReady}
              onFps={handleFps}
              onUnderwater={setUnderwater}
            />
          </Suspense>
        </SceneErrorBoundary>
      )}

      {sceneQuality !== null && underwater && (
        // A light vignette over the canvas: CSS, so diving costs no extra render pass.
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 20%, rgba(120, 230, 220, 0.1), rgba(2, 30, 40, 0.45) 85%)',
          }}
        />
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
        quality={sceneQuality ?? 'fallback'}
        preference={pinned ? null : preference}
        onPreference={handlePreference}
        underwater={underwater}
        touch={coarsePointer}
        reducedMotion={reducedMotion}
        fps={fps}
      />
    </div>
  )
}
