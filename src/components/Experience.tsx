import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { useLanguage } from '@/i18n/LanguageContext'
import { content } from '@/data/content'
import { gsap, staggerUp } from '@/utils/animations'
import { cn } from '@/utils/cn'
import SectionHeading from './SectionHeading'

export default function Experience() {
  const { t, pick } = useLanguage()
  const rootRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const root = rootRef.current
      const line = root?.querySelector('[data-timeline-fill]')
      const list = root?.querySelector('[data-timeline-list]')
      if (!root || !line || !list) return

      // The neon spine fills in step with the scroll position, so it reads as
      // a progress indicator through the timeline rather than decoration.
      gsap.fromTo(
        line,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: list,
            start: 'top 70%',
            end: 'bottom 75%',
            scrub: 0.6,
          },
        },
      )

      staggerUp('[data-timeline-item]', root, { stagger: 0.12, y: 34 })
    },
    { scope: rootRef },
  )

  return (
    <section id="experience" ref={rootRef} className="relative py-24 lg:py-32">
      <div className="section-shell">
        <SectionHeading eyebrow={t.experience.eyebrow} title={t.experience.title} />

        <div data-timeline-list className="relative mt-14 lg:mt-20">
          {/* Spine: left-aligned on small screens, centred from lg up. */}
          <div className="absolute top-0 bottom-0 left-[15px] w-px bg-line lg:left-1/2 lg:-translate-x-1/2">
            <div
              data-timeline-fill
              className="h-full w-full origin-top bg-gradient-to-b from-neon to-cyan"
            />
          </div>

          <ol className="space-y-10 lg:space-y-14">
            {content.experience.map((item, index) => {
              const alignRight = index % 2 === 1

              return (
                <li
                  key={item.id}
                  data-timeline-item
                  className="relative pl-12 lg:grid lg:grid-cols-2 lg:gap-14 lg:pl-0"
                >
                  <span
                    aria-hidden
                    className="absolute top-6 left-[9px] h-3.5 w-3.5 rounded-full border-2 border-neon bg-bg lg:left-1/2 lg:-translate-x-1/2"
                  />

                  {/* Cards alternate sides from lg up; below that they all sit
                      to the right of a left-aligned spine. */}
                  <div
                    className={cn(
                      'group glass rounded-2xl p-6 transition-all duration-300 hover:border-neon/30 hover:shadow-neon',
                      alignRight ? 'lg:col-start-2' : 'lg:col-start-1 lg:row-start-1',
                    )}
                  >
                    <p className="font-mono text-xs tracking-wide text-neon">{pick(item.period)}</p>
                    <h3 className="mt-2 font-display text-xl font-bold text-ink">
                      {pick(item.role)}
                    </h3>
                    <p className="mt-1 text-sm text-cyan">{item.company}</p>
                    <p className="mt-4 text-sm leading-relaxed text-muted">
                      {pick(item.description)}
                    </p>

                    <ul className="mt-4 flex flex-wrap gap-1.5">
                      {item.stack.map((tech) => (
                        <li key={tech} className="tag-pill">
                          {tech}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
