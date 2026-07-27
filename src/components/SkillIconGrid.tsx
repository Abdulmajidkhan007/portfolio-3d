import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { content } from '@/data/content'
import { SKILL_ICONS } from '@/data/skillIcons'
import { useLanguage } from '@/i18n/LanguageContext'
import { useTheme } from '@/theme/ThemeContext'
import { cn } from '@/utils/cn'
import type { Skill, SkillTab } from '@/types'

const TABS: SkillTab[] = ['skills', 'tools']

/**
 * Brand marks are authored for a light page, so several of them (Next.js,
 * GitHub, Three.js) are pure black and disappear on the dark theme. content.ts
 * carries a hand-picked colour that works on dark; the official hex is the one
 * that works on light.
 */
function useMarkColour() {
  const { theme } = useTheme()
  return (skill: Skill) => {
    const hex = SKILL_ICONS[skill.name]?.hex
    return theme === 'light' && hex ? `#${hex}` : skill.color
  }
}

/**
 * The technology grid under the About copy. The name is deliberately not
 * printed under every tile — that turns into a wall of text at this density —
 * so it is revealed on hover, on focus and on tap, and the tile carries an
 * aria-label so the name is never hidden from assistive tech.
 */
export default function SkillIconGrid() {
  const { t } = useLanguage()
  const markColour = useMarkColour()
  const [tab, setTab] = useState<SkillTab>('skills')
  const [active, setActive] = useState<string | null>(null)

  const visible = content.skills.filter((skill) => skill.tab === tab)
  const activeSkill = visible.find((skill) => skill.name === active) ?? null

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-mono text-xs tracking-[0.25em] text-muted uppercase">
          {t.about.skillsTitle}
        </h3>

        <div role="tablist" aria-label={t.about.skillsTitle} className="glass inline-flex rounded-full p-0.5">
          {TABS.map((name) => (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={tab === name}
              onClick={() => {
                setTab(name)
                setActive(null)
              }}
              className={cn(
                'relative rounded-full px-4 py-1.5 font-mono text-[11px] tracking-wide uppercase transition-colors',
                tab === name ? 'text-bg' : 'text-muted hover:text-ink',
              )}
            >
              {tab === name && (
                <motion.span
                  layoutId="about-skill-tab"
                  transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-neon to-cyan"
                />
              )}
              <span className="relative z-10">{t.skills.tabs[name]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Reserved line so revealing a name never shifts the grid below it. */}
      <div className="mt-4 flex h-6 items-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={activeSkill?.name ?? `idle-${tab}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="font-mono text-sm"
            style={activeSkill ? { color: markColour(activeSkill) } : undefined}
          >
            {activeSkill ? (
              <>
                {activeSkill.name}
                <span className="ml-2 text-muted">{activeSkill.level}%</span>
              </>
            ) : (
              <span className="text-muted">{t.about.skillsHint}</span>
            )}
          </motion.p>
        </AnimatePresence>
      </div>

      <motion.ul
        key={tab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mt-3 grid grid-cols-5 gap-2.5 sm:grid-cols-7 sm:gap-3"
      >
        {visible.map((skill) => {
          const icon = SKILL_ICONS[skill.name]
          const colour = markColour(skill)
          const selected = active === skill.name

          return (
            <li key={skill.name}>
              <button
                type="button"
                aria-label={`${skill.name} — ${skill.level}%`}
                aria-pressed={selected}
                onClick={() => setActive((current) => (current === skill.name ? null : skill.name))}
                onMouseEnter={() => setActive(skill.name)}
                onMouseLeave={() => setActive((current) => (current === skill.name ? null : current))}
                onFocus={() => setActive(skill.name)}
                onBlur={() => setActive((current) => (current === skill.name ? null : current))}
                className={cn(
                  'glass grid aspect-square w-full place-items-center rounded-2xl transition-all duration-200',
                  'hover:-translate-y-0.5',
                  selected && 'ring-1',
                )}
                style={
                  selected
                    ? {
                        // Inline because the colour is per-brand and cannot be a
                        // Tailwind class. Kept faint so the mark stays the subject.
                        boxShadow: `0 0 20px -6px ${colour}`,
                        borderColor: colour,
                        // @ts-expect-error -- custom property for the ring colour
                        '--tw-ring-color': colour,
                      }
                    : undefined
                }
              >
                {icon ? (
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden
                    className="h-6 w-6 transition-transform duration-200 sm:h-7 sm:w-7"
                    style={{ fill: colour, transform: selected ? 'scale(1.12)' : undefined }}
                  >
                    <path d={icon.path} />
                  </svg>
                ) : (
                  // No brand mark in simple-icons — the monogram stands in.
                  <span
                    className="font-display text-sm font-bold sm:text-base"
                    style={{ color: colour }}
                  >
                    {skill.short}
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </motion.ul>
    </div>
  )
}
