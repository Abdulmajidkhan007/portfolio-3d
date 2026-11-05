import { useState } from 'react'
import LanguageToggle from '@/components/LanguageToggle'
import ThemeToggle from '@/components/ThemeToggle'
import { useLanguage } from '@/i18n/LanguageContext'
import { useOceanStrings } from '../hooks/useOceanStrings'
import type { OceanStrings } from '../i18n'
import { cn } from '@/utils/cn'
import type { BoatInput } from '../lib/boatInput'
import { QUALITY_PREFERENCES, isQualityPreference } from '../lib/quality'
import type { CameraMode, OceanQuality, QualityPreference } from '../types'
import TouchJoystick from './TouchJoystick'

interface Props {
  input: BoatInput
  cameraMode: CameraMode
  onToggleCamera: () => void
  quality: OceanQuality
  /** The HUD's graphics choice; null hides the picker (a `?quality=` test link). */
  preference: QualityPreference | null
  onPreference: (next: QualityPreference) => void
  underwater: boolean
  touch: boolean
  reducedMotion: boolean
  fps: number | null
}

const LEVEL_LABEL = {
  auto: 'qualityAuto',
  high: 'qualityHigh',
  medium: 'qualityMedium',
  low: 'qualityLow',
} as const satisfies Record<QualityPreference, keyof OceanStrings>

// Inline, not utilities: a class used only here would grow the CSS the portfolio downloads.
const OPTION_STYLE = { background: 'var(--color-surface)', color: 'var(--color-ink)' } as const

const panel = 'rounded-2xl border border-line bg-surface/80 text-ink shadow-lg backdrop-blur-md'
const chip =
  'rounded-full border border-line bg-surface/80 px-4 py-2 text-sm font-medium text-ink shadow-lg backdrop-blur-md transition-colors hover:border-neon/50 hover:text-neon focus-visible:outline-2 focus-visible:outline-neon'

/** Everything drawn over the canvas. Uses the site's theme tokens, so it follows dark/light. */
export default function OceanHud({
  input,
  cameraMode,
  onToggleCamera,
  quality,
  preference,
  onPreference,
  underwater,
  touch,
  reducedMotion,
  fps,
}: Props) {
  const { t } = useLanguage()
  const copy = useOceanStrings()
  // Phones start with the help folded away: it would cover half the sea.
  const [helpOpen, setHelpOpen] = useState(!touch)
  const showScene = quality !== 'fallback'
  const levelName = (level: QualityPreference) => copy[LEVEL_LABEL[level]]

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 sm:p-5">
      <header className="pointer-events-auto flex items-center justify-between gap-2">
        <a href="/" className={cn(chip, 'flex items-center gap-2')}>
          <span aria-hidden>←</span>
          <span className="hidden sm:inline">{copy.back}</span>
          <span className="sm:hidden">Portfolio</span>
        </a>
        <h1 className={cn(panel, 'hidden px-4 py-2 font-display text-sm font-semibold md:block')}>
          <span className="neon-text">{t.nav.lab}</span>
          <span className="text-muted"> · </span>
          {copy.title}
        </h1>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      {showScene && (
        <div className="flex items-end justify-between gap-3">
          <div className="pointer-events-auto flex flex-col items-start gap-2">
            {helpOpen && (
              <section
                id="ocean-help"
                aria-label={copy.helpTitle}
                className={cn(panel, 'max-w-[18rem] p-4 text-sm')}
              >
                <h2 className="mb-2 font-display font-semibold">{copy.helpTitle}</h2>
                <ul className="space-y-1 text-muted">
                  {touch ? (
                    <>
                      <li>{copy.touchMove}</li>
                      <li>{copy.touchOrbit}</li>
                    </>
                  ) : (
                    <>
                      <li>{copy.keysMove}</li>
                      <li>{copy.keysSteer}</li>
                      <li>{copy.keysCamera}</li>
                      <li>{copy.keysOrbit}</li>
                    </>
                  )}
                </ul>
                {(reducedMotion || quality === 'low') && (
                  <p className="mt-3 border-t border-line pt-2 text-xs text-muted">
                    {[reducedMotion && copy.reducedMotion, quality === 'low' && copy.liteMode]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                )}
              </section>
            )}
            {touch && <TouchJoystick input={input} label={copy.joystick} />}
            <button
              type="button"
              className={chip}
              aria-expanded={helpOpen}
              aria-controls="ocean-help"
              onClick={() => setHelpOpen((open) => !open)}
            >
              {helpOpen ? copy.helpHide : copy.helpShow}
            </button>
          </div>

          <div className="pointer-events-auto flex flex-col items-end gap-2">
            {fps !== null && (
              <output className={cn(panel, 'px-3 py-1 font-mono text-xs')} aria-live="off">
                {fps.toFixed(0)} FPS · {quality}
              </output>
            )}
            {underwater && (
              <p className={cn(panel, 'px-3 py-1 font-mono text-xs')} role="status">
                {copy.underwater}
              </p>
            )}
            {preference !== null && (
              <label className={cn(chip, 'flex items-center gap-2')}>
                <span className="text-muted">{copy.qualityLabel}</span>
                <select
                  value={preference}
                  onChange={(event) => {
                    const next = event.target.value
                    if (isQualityPreference(next)) onPreference(next)
                  }}
                  className="bg-transparent font-medium text-ink"
                  style={{ outline: 'none' }}
                >
                  {QUALITY_PREFERENCES.map((level) => (
                    <option key={level} value={level} style={OPTION_STYLE}>
                      {level === 'auto'
                        ? `${levelName('auto')} · ${levelName(quality)}`
                        : levelName(level)}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <button
              type="button"
              onClick={onToggleCamera}
              aria-pressed={cameraMode === 'free'}
              title={copy.cameraToggle}
              className={cn(chip, cameraMode === 'free' && 'border-neon/60 text-neon')}
            >
              <span aria-hidden className="mr-1.5">{cameraMode === 'free' ? '🎥' : '⛵'}</span>
              {cameraMode === 'free' ? copy.cameraFree : copy.cameraFollow}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
