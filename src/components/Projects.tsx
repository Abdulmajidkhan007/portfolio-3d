import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '@/i18n/LanguageContext'
import { content, projectCategories } from '@/data/content'
import type { ProjectFilter } from '@/data/content'
import { cn } from '@/utils/cn'
import SectionHeading from './SectionHeading'
import ProjectCard from './ProjectCard'

export default function Projects() {
  const { t } = useLanguage()
  const [filter, setFilter] = useState<ProjectFilter>('all')

  const visible = useMemo(
    () =>
      filter === 'all'
        ? content.projects
        : content.projects.filter((project) => project.category === filter),
    [filter],
  )

  return (
    <section id="projects" className="relative py-24 lg:py-32">
      <div className="section-shell">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow={t.projects.eyebrow}
            title={t.projects.title}
            subtitle={t.projects.subtitle}
          />

          <ul role="tablist" aria-label={t.projects.title} className="flex flex-wrap gap-2">
            {projectCategories.map((category) => (
              <li key={category}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={filter === category}
                  onClick={() => setFilter(category)}
                  className={cn(
                    'relative rounded-full border px-4 py-2 text-sm transition-colors',
                    filter === category
                      ? 'border-neon/50 text-neon'
                      : 'border-white/10 text-muted hover:border-white/25 hover:text-ink',
                  )}
                >
                  {filter === category && (
                    <motion.span
                      layoutId="project-filter"
                      className="absolute inset-0 -z-10 rounded-full bg-neon/10"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  {t.projects.filters[category]}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <motion.div
          layout
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {visible.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </AnimatePresence>
        </motion.div>

        {visible.length === 0 && (
          <p className="mt-12 text-center text-muted">{t.projects.empty}</p>
        )}
      </div>
    </section>
  )
}
