import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { Project } from '@/types'
import { useLanguage } from '@/i18n/LanguageContext'
import { useHasFinePointer } from '@/hooks/useMediaQuery'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * The 3D hover here is a CSS transform, not a WebGL scene: six live canvases
 * in a grid would cost six GL contexts and tank the frame rate, while
 * `perspective` + `rotateX/rotateY` is composited on the GPU for free.
 */
export default function ProjectCard({ project, index }: { project: Project; index: number }) {
  const { t, pick } = useLanguage()
  const finePointer = useHasFinePointer()
  const reducedMotion = useReducedMotion()
  const cardRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  const tiltEnabled = finePointer && !reducedMotion

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!tiltEnabled) return
    const rect = event.currentTarget.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width - 0.5
    const py = (event.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: -py * 12, y: px * 14 })
  }

  const reset = () => setTilt({ x: 0, y: 0 })

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.3) }}
      className="[perspective:1000px]"
    >
      <div
        ref={cardRef}
        onPointerMove={onPointerMove}
        onPointerLeave={reset}
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: tilt.x === 0 && tilt.y === 0 ? 'transform 500ms ease-out' : 'none',
        }}
        className="group glass relative h-full overflow-hidden rounded-2xl [transform-style:preserve-3d]"
      >
        <div className="relative aspect-16/10 overflow-hidden bg-bg-soft">
          <img
            src={project.image}
            alt={project.title}
            width={1200}
            height={750}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/35 to-transparent" />

          {project.featured && (
            <span className="absolute top-3 left-3 rounded-full border border-neon/40 bg-bg/80 px-2.5 py-1 font-mono text-[10px] tracking-wide text-neon uppercase">
              {t.projects.featured}
            </span>
          )}
          <span className="absolute top-3 right-3 font-mono text-[11px] text-muted">
            {project.year}
          </span>
        </div>

        <div className="relative p-5 [transform:translateZ(28px)]">
          <h3 className="font-display text-xl font-bold text-ink transition-colors group-hover:text-neon">
            {project.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{pick(project.description)}</p>

          <ul className="mt-4 flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <li key={tag} className="tag-pill">
                {tag}
              </li>
            ))}
          </ul>

          <div className="mt-5 flex items-center gap-4">
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 text-sm text-neon transition-opacity hover:opacity-80"
              >
                {t.projects.live}
                <span aria-hidden>↗</span>
              </a>
            )}
            {project.repo && (
              <a
                href={project.repo}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
              >
                {t.projects.code}
                <span aria-hidden>↗</span>
              </a>
            )}
          </div>
        </div>

        {/* Neon edge that lights up on hover. */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent transition-all duration-300 ring-inset group-hover:ring-neon/40 group-hover:shadow-neon" />
      </div>
    </motion.article>
  )
}
