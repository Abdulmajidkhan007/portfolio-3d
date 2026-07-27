import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/i18n/LanguageContext'
import { setScrollLocked } from '@/hooks/useLenis'
import { gsap } from '@/utils/animations'

const SESSION_KEY = 'portfolio-intro-seen'

interface NetworkInformation {
  effectiveType?: string
  saveData?: boolean
}

/**
 * True when the intro should be skipped: it has already played in this tab, or
 * the visitor is on a connection where an extra second of branding is the last
 * thing they need. The intro holds back the largest text on the page, so on a
 * slow link it is pure added latency.
 */
export function introAlreadySeen() {
  if (typeof window === 'undefined') return false
  if (window.sessionStorage.getItem(SESSION_KEY) === '1') return true

  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection
  if (connection?.saveData) return true
  return connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g'
}

interface Props {
  onDone: () => void
}

/**
 * Boot sequence shown on the first visit of a tab. Progress follows real font
 * and image decoding via document.fonts.ready, with a floor so the animation
 * never flashes by, and a ceiling so a slow asset can never trap the visitor.
 */
export default function LoadingScreen({ onDone }: Props) {
  const { t } = useLanguage()
  const rootRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setScrollLocked(true)

    let frame = 0
    let settled = false
    let finishStart = 0
    const started = performance.now()
    // Kept short on purpose: the intro sits in front of the hero headline, so
    // every extra millisecond here is a millisecond of Largest Contentful Paint.
    const MIN_MS = 700
    const MAX_MS = 2500
    const FINISH_MS = 260

    Promise.race([
      document.fonts?.ready ?? Promise.resolve(),
      new Promise((resolve) => setTimeout(resolve, MAX_MS)),
    ]).then(() => {
      settled = true
    })

    // Progress is a function of elapsed time, never of frame count — otherwise
    // a slow device (where the loader matters most) would sit here the longest.
    const tick = () => {
      const now = performance.now()
      const elapsed = now - started
      const ready = settled && elapsed >= MIN_MS

      let value: number
      if (ready) {
        if (!finishStart) finishStart = now
        value = 90 + 10 * Math.min(1, (now - finishStart) / FINISH_MS)
      } else {
        // Ease-out towards 90% so the bar decelerates instead of stalling.
        const ratio = Math.min(1, elapsed / MIN_MS)
        value = 90 * (1 - Math.pow(1 - ratio, 3))
      }

      setProgress(value)
      if (value >= 100) return
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (progress < 100) return

    const timeline = gsap.timeline({
      onComplete: () => {
        window.sessionStorage.setItem(SESSION_KEY, '1')
        setScrollLocked(false)
        onDone()
      },
    })

    timeline
      .to('[data-loader-content]', { opacity: 0, y: -18, duration: 0.35, ease: 'power2.in' }, 0.1)
      .to(rootRef.current, { yPercent: -100, duration: 0.7, ease: 'power4.inOut' }, 0.28)

    return () => {
      timeline.kill()
    }
  }, [progress, onDone])

  const shown = Math.round(progress)

  return (
    <div
      ref={rootRef}
      role="status"
      aria-live="polite"
      aria-label={t.loading.hint}
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-bg"
    >
      <div className="grid-backdrop pointer-events-none absolute inset-0 opacity-70" />

      <div data-loader-content className="section-shell flex flex-col items-center gap-7">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <span className="absolute inset-0 animate-spin rounded-full border border-transparent border-t-neon border-r-cyan [animation-duration:1.4s]" />
          <span className="absolute inset-3 rounded-full border border-line" />
          <span className="font-mono text-sm text-neon">{shown}%</span>
        </div>

        <div className="text-center">
          <p className="font-mono text-xs tracking-[0.35em] text-muted uppercase">
            {shown < 100 ? t.loading.booting : t.loading.ready}
          </p>
          <p className="mt-3 font-display text-2xl font-bold sm:text-3xl">
            <span className="neon-text">{'{ '}</span>
            Abdullohkhan
            <span className="neon-text">{' }'}</span>
          </p>
        </div>

        <div className="h-px w-64 max-w-[70vw] overflow-hidden bg-line">
          <div
            className="h-full bg-gradient-to-r from-neon to-cyan transition-[width] duration-150 ease-out"
            style={{ width: `${shown}%` }}
          />
        </div>
      </div>
    </div>
  )
}
