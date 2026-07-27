import { motion } from 'framer-motion'
import { useLanguage } from '@/i18n/LanguageContext'
import { useTheme } from '@/theme/ThemeContext'

/**
 * Two-state switch rather than a three-state (light/dark/system) control: the
 * provider already follows the OS until the visitor touches this, so the extra
 * state would only add a mode nobody asks for by name.
 */
export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const { t } = useLanguage()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={isDark}
      aria-label={t.nav.switchTheme}
      title={t.nav.switchTheme}
      className="relative flex h-9 w-16 shrink-0 items-center rounded-full border border-line bg-bg-soft px-1 transition-colors hover:border-neon/40"
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 34 }}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-neon to-cyan text-bg"
        style={{ marginLeft: isDark ? 0 : 'auto' }}
      >
        {isDark ? <MoonIcon /> : <SunIcon />}
      </motion.span>
    </button>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="15"
      height="15"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}
