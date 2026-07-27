import { lazy, useEffect, useMemo, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { useLanguage } from '@/i18n/LanguageContext'
import { content } from '@/data/content'
import { useTypewriter } from '@/hooks/useTypewriter'
import { useMousePosition } from '@/hooks/useMousePosition'
import { useHasFinePointer } from '@/hooks/useMediaQuery'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { scrollToSection } from '@/hooks/useLenis'
import { gsap } from '@/utils/animations'
import Deferred3D from './three/Deferred3D'
import { ParticleFallback } from './three/fallbacks'

// The WebGL stack is the single biggest dependency on the site. lazy() keeps it
// out of the initial bundle and <Deferred3D> keeps its download off the
// critical path until the main thread is idle.
const ParticleField = lazy(() => import('./three/ParticleField'))

export default function Hero() {
  const { t, lang, pick } = useLanguage()
  const rootRef = useRef<HTMLElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const phrases = useMemo(() => content.hero.typewriter[lang], [lang])
  const typed = useTypewriter(phrases)

  const pointer = useMousePosition()
  const finePointer = useHasFinePointer()
  const reducedMotion = useReducedMotion()

  // Parallax the grid backdrop against the particle field. Driven straight
  // from the pointer ref on an animation frame, so it never triggers a render.
  useEffect(() => {
    if (!finePointer || reducedMotion) return
    let frame = 0
    const current = { x: 0, y: 0 }

    const tick = () => {
      const grid = gridRef.current
      if (grid) {
        current.x += (pointer.current.nx * 14 - current.x) * 0.05
        current.y += (-pointer.current.ny * 14 - current.y) * 0.05
        grid.style.transform = `translate3d(${current.x.toFixed(2)}px, ${current.y.toFixed(2)}px, 0)`
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [pointer, finePointer, reducedMotion])

  useGSAP(
    () => {
      const timeline = gsap.timeline({ delay: 0.15, defaults: { ease: 'power3.out' } })
      timeline
        .from('[data-hero-badge]', { opacity: 0, y: 16, duration: 0.6 })
        .from('[data-hero-greeting]', { opacity: 0, y: 22, duration: 0.6 }, '-=0.35')
        .from('[data-hero-name]', { opacity: 0, y: 42, duration: 0.9 }, '-=0.35')
        .from('[data-hero-typed]', { opacity: 0, y: 20, duration: 0.6 }, '-=0.5')
        .from('[data-hero-lede]', { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
        .from('[data-hero-cta] > *', { opacity: 0, y: 18, duration: 0.5, stagger: 0.1 }, '-=0.35')
        .from('[data-hero-scroll]', { opacity: 0, duration: 0.6 }, '-=0.2')
    },
    { scope: rootRef },
  )

  const hasVideo = Boolean(content.hero.videoSrc)

  return (
    <section
      id="home"
      ref={rootRef}
      className="relative flex min-h-[100svh] items-center overflow-hidden pt-24 pb-20"
    >
      {/* Background layer: video if one was supplied, otherwise the particle field. */}
      <div className="absolute inset-0 -z-10">
        {hasVideo ? (
          <video
            className="h-full w-full object-cover opacity-60"
            src={content.hero.videoSrc ?? undefined}
            poster={content.hero.videoPoster ?? undefined}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <Deferred3D fallback={<ParticleFallback />}>
            <ParticleField />
          </Deferred3D>
        )}
      </div>

      <div
        ref={gridRef}
        className="grid-backdrop pointer-events-none absolute -inset-8 -z-10 opacity-60 will-change-transform"
      />
      {/* Scrim behind the copy so the headline keeps its contrast ratio no
          matter where the particles happen to drift. Kept tight around the
          text column so the field stays visible either side of it. */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_58%_68%_at_20%_50%,rgba(10,10,10,0.9),rgba(10,10,10,0.3)_58%,transparent_76%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-bg to-transparent" />

      <div className="section-shell">
        <div className="max-w-3xl">
          <p
            data-hero-badge
            className="inline-flex items-center gap-2 rounded-full border border-neon/30 bg-neon/8 px-3 py-1.5 font-mono text-[11px] tracking-wide text-neon"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-neon" />
            </span>
            {t.hero.available}
          </p>

          <p data-hero-greeting className="mt-8 font-mono text-base text-muted sm:text-lg">
            {t.hero.greeting}
          </p>

          <h1
            data-hero-name
            className="mt-2 font-display text-5xl leading-[0.95] font-bold tracking-tight text-balance sm:text-7xl lg:text-8xl"
          >
            <span className="block text-ink">Abdullohkhan</span>
            <span className="neon-text block">Sharipov</span>
          </h1>

          {/* Assistive tech reads the settled role once; the animated text is
              hidden from it so it is not re-announced on every keystroke. */}
          <p data-hero-typed className="mt-6 min-h-[2em] font-mono text-lg text-cyan sm:text-2xl">
            <span className="sr-only">{pick(content.profile.role)}</span>
            <span aria-hidden>
              {typed}
              <span className="ml-0.5 inline-block w-[2px] animate-blink bg-cyan align-middle text-transparent">
                |
              </span>
            </span>
          </p>

          <p data-hero-lede className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            {content.about.bio[lang][0]}
          </p>

          <div data-hero-cta className="mt-10 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => scrollToSection('projects')}
              className="group relative overflow-hidden rounded-full bg-gradient-to-r from-neon to-cyan px-7 py-3.5 font-medium text-bg transition-shadow hover:shadow-neon"
            >
              <span className="relative z-10">{t.hero.cta}</span>
              <span className="absolute inset-0 -translate-x-full bg-white/25 transition-transform duration-500 group-hover:translate-x-0" />
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('contact')}
              className="rounded-full border border-white/15 px-7 py-3.5 font-medium text-ink transition-colors hover:border-cyan/50 hover:text-cyan"
            >
              {t.hero.ctaSecondary}
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        data-hero-scroll
        onClick={() => scrollToSection('about')}
        className="absolute inset-x-0 bottom-7 mx-auto flex w-fit flex-col items-center gap-2 text-muted transition-colors hover:text-neon"
      >
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase">{t.hero.scroll}</span>
        <span className="flex h-9 w-5 items-start justify-center rounded-full border border-current p-1">
          <span className="h-1.5 w-1 animate-bounce rounded-full bg-current" />
        </span>
      </button>
    </section>
  )
}
