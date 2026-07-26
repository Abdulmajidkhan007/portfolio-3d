import { Suspense, lazy, useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/i18n/LanguageContext'
import { content } from '@/data/content'
import { cn } from '@/utils/cn'
import type { SkillGroup } from '@/types'
import SectionHeading from './SectionHeading'

const SkillSphere = lazy(() => import('./three/SkillSphere'))

const GROUPS: SkillGroup[] = ['core', 'threed', 'tooling']

export default function Skills() {
  const { t } = useLanguage()
  const [selected, setSelected] = useState<string | null>(null)

  const active = content.skills.find((skill) => skill.name === selected) ?? null

  return (
    <section id="skills" className="relative overflow-hidden py-24 lg:py-32">
      <div className="grid-backdrop pointer-events-none absolute inset-0 -z-10 opacity-50" />

      <div className="section-shell">
        <SectionHeading
          eyebrow={t.skills.eyebrow}
          title={t.skills.title}
          subtitle={t.skills.subtitle}
        />

        <div className="mt-14 grid gap-10 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:items-center lg:gap-16">
          <div className="relative">
            <div className="aspect-square w-full max-w-[520px] mx-auto">
              <Suspense fallback={null}>
                <SkillSphere
                  skills={content.skills}
                  selected={selected}
                  onSelect={setSelected}
                />
              </Suspense>
            </div>

            <p className="mt-2 text-center font-mono text-[11px] tracking-[0.25em] text-muted uppercase">
              {t.skills.hint}
            </p>

            {/* The sphere is decorative; this list is the accessible equivalent. */}
            <div className="sr-only">
              <ul>
                {content.skills.map((skill) => (
                  <li key={skill.name}>
                    {skill.name}: {skill.level}%
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <motion.div
              key={active?.name ?? 'none'}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="glass mb-8 rounded-2xl p-6"
            >
              {active ? (
                <>
                  <p className="font-display text-2xl font-bold text-ink">{active.name}</p>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${active.level}%`,
                        background: `linear-gradient(90deg, ${active.color}, #00d4ff)`,
                      }}
                    />
                  </div>
                  <p className="mt-3 font-mono text-sm text-muted">
                    {active.level}% · {t.skills.groups[active.group]}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted">{t.skills.subtitle}</p>
              )}
            </motion.div>

            <div className="space-y-7">
              {GROUPS.map((group) => (
                <div key={group}>
                  <h3 className="font-mono text-xs tracking-[0.25em] text-neon uppercase">
                    {t.skills.groups[group]}
                  </h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {content.skills
                      .filter((skill) => skill.group === group)
                      .map((skill) => (
                        <li key={skill.name}>
                          <button
                            type="button"
                            onClick={() =>
                              setSelected((current) =>
                                current === skill.name ? null : skill.name,
                              )
                            }
                            aria-pressed={selected === skill.name}
                            className={cn(
                              'rounded-full border px-3.5 py-1.5 text-sm transition-all',
                              selected === skill.name
                                ? 'border-neon/60 bg-neon/12 text-neon'
                                : 'border-white/10 text-muted hover:border-white/25 hover:text-ink',
                            )}
                          >
                            {skill.name}
                          </button>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
