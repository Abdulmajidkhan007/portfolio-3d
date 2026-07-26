import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

interface Props {
  eyebrow: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  className?: string
}

/** Shared section header so every section announces itself the same way. */
export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  className,
}: Props) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center', className)}
    >
      <p className="font-mono text-xs tracking-[0.3em] text-neon uppercase">{eyebrow}</p>
      <h2 className="mt-4 font-display text-3xl leading-tight font-bold text-balance sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-base leading-relaxed text-muted">{subtitle}</p>}
      <div
        className={cn(
          'mt-6 h-px w-24 bg-gradient-to-r from-neon to-transparent',
          align === 'center' && 'mx-auto bg-gradient-to-r from-transparent via-neon to-transparent',
        )}
      />
    </motion.header>
  )
}
