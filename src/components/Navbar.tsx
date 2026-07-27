import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '@/i18n/LanguageContext'
import { useActiveSection } from '@/hooks/useScrollProgress'
import { scrollToSection, setScrollLocked } from '@/hooks/useLenis'
import { cn } from '@/utils/cn'
import LanguageToggle from './LanguageToggle'
import ThemeToggle from './ThemeToggle'

export const SECTION_IDS = [
  'home',
  'about',
  'projects',
  'skills',
  'experience',
  'contact',
] as const

export default function Navbar() {
  const { t } = useLanguage()
  const active = useActiveSection(SECTION_IDS)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // The mobile sheet covers the page, so the page behind it must not scroll.
  useEffect(() => {
    setScrollLocked(menuOpen)
    return () => setScrollLocked(false)
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const go = (id: string) => {
    // Unlock before scrolling rather than leaving it to the menuOpen effect.
    // That effect only runs after this handler returns, so Lenis would still be
    // stopped when scrollToSection fires and would swallow the scroll outright —
    // the menu closed and nothing moved.
    setScrollLocked(false)
    setMenuOpen(false)
    scrollToSection(id)
  }

  const links = SECTION_IDS.map((id) => ({ id, label: t.nav[id === 'home' ? 'home' : id] }))

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-300',
          scrolled ? 'glass-strong border-b border-line py-3' : 'border-b border-transparent py-5',
        )}
      >
        <nav className="section-shell flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => go('home')}
            className="font-display text-lg font-bold tracking-tight"
          >
            <span className="neon-text">A</span>
            <span className="text-ink">.Sharipov</span>
          </button>

          <ul className="hidden items-center gap-1 lg:flex">
            {links.map((link) => (
              <li key={link.id}>
                <button
                  type="button"
                  onClick={() => go(link.id)}
                  aria-current={active === link.id ? 'true' : undefined}
                  className={cn(
                    'relative rounded-full px-4 py-2 text-sm transition-colors',
                    active === link.id ? 'text-neon' : 'text-muted hover:text-ink',
                  )}
                >
                  {link.label}
                  {active === link.id && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-full bg-neon/10 ring-1 ring-neon/30"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle />
            <ThemeToggle />
            <button
              type="button"
              onClick={() => go('contact')}
              className="hidden rounded-full border border-neon/40 bg-neon/10 px-5 py-2 text-sm font-medium text-neon transition-all hover:bg-neon/20 hover:shadow-neon sm:block"
            >
              {t.nav.contact}
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? t.nav.close : t.nav.menu}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-line lg:hidden"
            >
              <span className="sr-only">{menuOpen ? t.nav.close : t.nav.menu}</span>
              <span
                className={cn(
                  'absolute h-px w-5 bg-ink transition-transform duration-300',
                  menuOpen ? 'rotate-45' : '-translate-y-1.5',
                )}
              />
              <span
                className={cn(
                  'absolute h-px w-5 bg-ink transition-all duration-300',
                  menuOpen ? 'opacity-0' : 'opacity-100',
                )}
              />
              <span
                className={cn(
                  'absolute h-px w-5 bg-ink transition-transform duration-300',
                  menuOpen ? '-rotate-45' : 'translate-y-1.5',
                )}
              />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-bg/95 backdrop-blur-xl lg:hidden"
          >
            <ul className="flex h-full flex-col items-center justify-center gap-2">
              {links.map((link, index) => (
                <motion.li
                  key={link.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * index, duration: 0.4 }}
                >
                  <button
                    type="button"
                    onClick={() => go(link.id)}
                    className={cn(
                      'px-6 py-3 font-display text-3xl font-bold transition-colors',
                      active === link.id ? 'neon-text' : 'text-ink/80',
                    )}
                  >
                    {link.label}
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
