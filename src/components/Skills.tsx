import { lazy, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '@/i18n/LanguageContext'
import { content } from '@/data/content'
import { cn } from '@/utils/cn'
import type { SkillTab } from '@/types'
import SectionHeading from './SectionHeading'
import Deferred3D from './three/Deferred3D'
import { SphereFallback } from './three/fallbacks'

const SkillSphere = lazy(() => import('./three/SkillSphere'))

const TABS: SkillTab[] = ['skills', 'tools']

export default function Skills() {
  const { t } = useLanguage()
  const [tab, setTab] = useState<SkillTab>('skills')
  const [selected, setSelected] = useState<string | null>(null)

  const visible = useMemo(() => content.skills.filter((skill) => skill.tab === tab), [tab])

  // `selected` is scoped to the visible set: a name from the other tab would
  // leave the detail card showing something the sphere no longer contains.
  const active = visible.find((skill) => skill.name === selected) ?? null

  const switchTab = (next: SkillTab) => {
    setTab(next)
    setSelected(null)
  }

  return (
    <section id="skills" className="relative overflow-hidden py-24 lg:py-32">
      <div className="grid-backdrop pointer-events-none absolute inset-0 -z-10 opacity-50" />

      <div className="section-shell">
        <SectionHeading
          eyebrow={t.skills.eyebrow}
          title={t.skills.title}
          subtitle={t.skills.subtitle}
        />

        {/* Segmented control. The sphere and the pill list both follow it. */}
        <div className="mt-10 flex justify-center">
          <div
            role="tablist"
            aria-label={t.skills.title}
            className="glass relative inline-flex rounded-full p-1"
          >
            {TABS.map((name) => (
              <button
                key={name}
                type="button"
                role="tab"
                aria-selected={tab === name}
                aria-controls={`skills-panel-${name}`}
                id={`skills-tab-${name}`}
                onClick={() => switchTab(name)}
                className={cn(
                  'relative rounded-full px-7 py-2.5 font-medium transition-colors sm:px-10',
                  tab === name ? 'text-bg' : 'text-muted hover:text-ink',
                )}
              >
                {tab === name && (
                  <motion.span
                    layoutId="skills-tab-pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-neon to-cyan"
                  />
                )}
                <span className="relative z-10">{t.skills.tabs[name]}</span>
              </button>
            ))}
          </div>
        </div>

        <div
          id={`skills-panel-${tab}`}
          role="tabpanel"
          aria-labelledby={`skills-tab-${tab}`}
          className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:items-center lg:gap-16"
        >
          <div className="relative">
            {/* Deliberately dark in both themes: the nodes are painted in each
                technology's own brand colour, and half of those (React cyan,
                JS yellow) vanish against a light page. A dark viewport panel
                keeps them legible and reads as intentional. */}
            <div className="mx-auto aspect-square w-full max-w-[520px] overflow-hidden rounded-3xl border border-line bg-[#0a0c11]">
              <Deferred3D fallback={<SphereFallback />}>
                <SkillSphere
                  // Remounting on tab change rebuilds the node layout for the
                  // new set instead of animating between two unrelated shapes.
                  key={tab}
                  skills={visible}
                  selected={selected}
                  onSelect={setSelected}
                />
              </Deferred3D>
            </div>

            <p className="mt-2 text-center font-mono text-[11px] tracking-[0.25em] text-muted uppercase">
              {t.skills.hint}
            </p>

            {/* The sphere is decorative; this list is the accessible equivalent. */}
            <div className="sr-only">
              <ul>
                {visible.map((skill) => (
                  <li key={skill.name}>
                    {skill.name}: {skill.level}%
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <motion.div
              key={active?.name ?? `none-${tab}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="glass mb-8 rounded-2xl p-6"
            >
              {active ? (
                <>
                  <p className="font-display text-2xl font-bold text-ink">{active.name}</p>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-line">
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

            <AnimatePresence mode="wait">
              <motion.ul
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="flex flex-wrap gap-2"
              >
                {visible.map((skill) => (
                  <li key={skill.name}>
                    <button
                      type="button"
                      onClick={() =>
                        setSelected((current) => (current === skill.name ? null : skill.name))
                      }
                      aria-pressed={selected === skill.name}
                      className={cn(
                        'rounded-full border px-3.5 py-1.5 text-sm transition-all',
                        selected === skill.name
                          ? 'border-neon/60 bg-neon/12 text-neon'
                          : 'border-line text-muted hover:border-neon/35 hover:text-ink',
                      )}
                    >
                      {skill.name}
                    </button>
                  </li>
                ))}
              </motion.ul>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
