import { Suspense, lazy, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { useLanguage } from '@/i18n/LanguageContext'
import { content } from '@/data/content'
import { countUp, fadeUp, gsap, revealTrigger, staggerUp } from '@/utils/animations'
import SectionHeading from './SectionHeading'

const Avatar3D = lazy(() => import('./three/Avatar3D'))
const FloatingShapes = lazy(() => import('./three/FloatingShapes'))

/** Skills shown as bars here; the full set lives in the Skills section. */
const BAR_SKILLS = ['React', 'TypeScript', 'Three.js', 'GSAP', 'CSS / Tailwind', 'Next.js']

export default function About() {
  const { t, lang } = useLanguage()
  const rootRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return

      fadeUp('[data-about-visual]', root, { y: 48 })
      staggerUp('[data-about-para]', root)
      staggerUp('[data-about-stat]', root, { stagger: 0.08 })

      root.querySelectorAll<HTMLElement>('[data-stat-value]').forEach((node) => countUp(node, root))

      // Bars fill from zero to their real width when the section arrives.
      root.querySelectorAll<HTMLElement>('[data-bar-fill]').forEach((bar, index) => {
        gsap.fromTo(
          bar,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1.1,
            delay: index * 0.08,
            ease: 'power2.out',
            scrollTrigger: revealTrigger(root),
          },
        )
      })
    },
    { scope: rootRef },
  )

  const bars = content.skills.filter((skill) => BAR_SKILLS.includes(skill.name))

  return (
    <section id="about" ref={rootRef} className="relative overflow-hidden py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-70">
        <Suspense fallback={null}>
          <FloatingShapes />
        </Suspense>
      </div>

      <div className="section-shell">
        <SectionHeading eyebrow={t.about.eyebrow} title={t.about.title} />

        <div className="mt-14 grid items-start gap-12 lg:mt-20 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-16">
          <div data-about-visual className="relative mx-auto w-full max-w-sm lg:max-w-none">
            <div className="glass relative aspect-square overflow-hidden rounded-3xl">
              {content.profile.avatarImage ? (
                <img
                  src={content.profile.avatarImage}
                  alt={content.profile.name}
                  width={640}
                  height={640}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Suspense fallback={null}>
                  <Avatar3D />
                </Suspense>
              )}
              <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-neon/20 ring-inset" />
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
              <h3 className="font-mono text-xs tracking-[0.25em] text-muted uppercase">
                {t.about.skillsTitle}
              </h3>

              <ul className="mt-6 space-y-5">
                {bars.map((skill) => (
                  <li key={skill.name}>
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-sm text-ink">{skill.name}</span>
                      <span className="font-mono text-xs text-muted">{skill.level}%</span>
                    </div>
                    <div
                      role="meter"
                      aria-valuenow={skill.level}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={skill.name}
                      className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/8"
                    >
                      <div
                        data-bar-fill
                        style={{ width: `${skill.level}%` }}
                        className="h-full origin-left rounded-full bg-gradient-to-r from-neon to-cyan"
                      />
                    </div>
                  </li>
                ))}
              </ul>

              <a
                href={content.profile.resume}
                download
                className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm transition-colors hover:border-neon/45 hover:text-neon"
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
