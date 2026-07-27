import { lazy, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { useLanguage } from '@/i18n/LanguageContext'
import { content } from '@/data/content'
import { countUp, fadeUp, staggerUp } from '@/utils/animations'
import { cn } from '@/utils/cn'
import SectionHeading from './SectionHeading'
import SkillIconGrid from './SkillIconGrid'
import Deferred3D from './three/Deferred3D'
import { AvatarFallback } from './three/fallbacks'

const Avatar3D = lazy(() => import('./three/Avatar3D'))
const FloatingShapes = lazy(() => import('./three/FloatingShapes'))

export default function About() {
  const { t, lang } = useLanguage()
  const rootRef = useRef<HTMLElement>(null)
  // The generated portrait is fetched at build time, so it can legitimately be
  // absent. Clearing it on error hands the slot back to the 3D avatar.
  const [portrait, setPortrait] = useState(
    content.profile.avatarImage ?? content.profile.avatarImageHd ?? null,
  )

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return

      fadeUp('[data-about-visual]', root, { y: 48 })
      staggerUp('[data-about-para]', root)
      staggerUp('[data-about-stat]', root, { stagger: 0.08 })

      root.querySelectorAll<HTMLElement>('[data-stat-value]').forEach((node) => countUp(node, root))

    },
    { scope: rootRef },
  )

  return (
    <section id="about" ref={rootRef} className="relative overflow-hidden py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-70">
        <Deferred3D>
          <FloatingShapes />
        </Deferred3D>
      </div>

      <div className="section-shell">
        <SectionHeading eyebrow={t.about.eyebrow} title={t.about.title} />

        <div className="mt-14 grid items-start gap-12 lg:mt-20 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-16">
          <div data-about-visual className="relative mx-auto w-full max-w-sm lg:max-w-none">
            <div
              className={cn(
                'glass relative aspect-square overflow-hidden rounded-3xl',
                // Same reasoning as the skill sphere: the neon avatar needs a
                // dark backdrop, but a photo brings its own.
                !portrait && 'bg-[#0a0c11]',
              )}
            >
              {portrait ? (
                <img
                  src={portrait}
                  alt={content.profile.name}
                  width={640}
                  height={640}
                  loading="lazy"
                  decoding="async"
                  onError={() => setPortrait(null)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Deferred3D fallback={<AvatarFallback />}>
                  <Avatar3D />
                </Deferred3D>
              )}
              <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-neon/20 ring-inset" />

              {/* The portrait is generated, not a photograph. The badge says so
                  and keeps the frame from reading as a picture of a real person. */}
              {portrait && (
                <span className="glass-strong pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full px-3 py-1.5">
                  <span aria-hidden className="text-sm">👨‍💻</span>
                  <span className="font-mono text-[10px] tracking-wide text-muted uppercase">
                    {t.about.avatarBadge}
                  </span>
                </span>
              )}
            </div>

            <div className="glass mt-4 flex items-center justify-between rounded-2xl px-5 py-4">
              <div>
                <p className="font-display text-sm font-medium text-ink">{content.profile.name}</p>
                <p className="font-mono text-xs text-muted">
                  {content.profile.location[lang]}
                </p>
              </div>
              <a
                href={content.profile.resume}
                download
                className="rounded-full border border-neon/35 px-3.5 py-2 font-mono text-[11px] text-neon transition-colors hover:bg-neon/10"
              >
                CV ↓
              </a>
            </div>
          </div>

          <div>
            <div className="space-y-5">
              {content.about.bio[lang].map((paragraph, index) => (
                <p
                  key={index}
                  data-about-para
                  className="text-base leading-relaxed text-muted sm:text-lg"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <dl className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {content.about.stats.map((stat) => (
                <div key={stat.label.en} data-about-stat className="glass rounded-2xl px-4 py-4">
                  <dt className="sr-only">{stat.label[lang]}</dt>
                  <dd>
                    <span
                      data-stat-value
                      className="block font-display text-2xl font-bold text-neon sm:text-3xl"
                    >
                      {stat.value}
                    </span>
                    <span className="mt-1 block text-xs leading-snug text-muted">
                      {stat.label[lang]}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-12">
              <SkillIconGrid />

              <a
                href={content.profile.resume}
                download
                className="mt-8 inline-flex items-center gap-2 rounded-full border border-line px-5 py-3 text-sm transition-colors hover:border-neon/45 hover:text-neon"
              >
                {t.about.resume}
                <span aria-hidden>↓</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
