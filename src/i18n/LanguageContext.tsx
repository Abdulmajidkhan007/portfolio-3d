import { createContext, use, useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Lang, Localized } from '@/types'
import { uz } from './uz'
import type { Dictionary } from './uz'
import { en } from './en'

const dictionaries: Record<Lang, Dictionary> = { uz, en }
const STORAGE_KEY = 'portfolio-lang'

interface LanguageValue {
  lang: Lang
  t: Dictionary
  setLang: (lang: Lang) => void
  toggleLang: () => void
  /** Pick the current language out of a `Localized` value from content.ts. */
  pick: (value: Localized) => string
}

const LanguageContext = createContext<LanguageValue | null>(null)

function readInitialLang(): Lang {
  if (typeof window === 'undefined') return 'uz'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'uz' || stored === 'en') return stored
  // Uzbek is the site default; visitors switch to English from the navbar.
  return 'uz'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitialLang)

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    window.localStorage.setItem(STORAGE_KEY, next)
  }, [])

  const toggleLang = useCallback(() => {
    setLangState((current) => {
      const next: Lang = current === 'uz' ? 'en' : 'uz'
      window.localStorage.setItem(STORAGE_KEY, next)
      return next
    })
  }, [])

  // Keep the document in sync so screen readers and search engines agree
  // with what is rendered.
  useEffect(() => {
    const dict = dictionaries[lang]
    document.documentElement.lang = lang
    document.title = dict.meta.title
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', dict.meta.description)
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute('content', dict.meta.title)
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute('content', dict.meta.description)
  }, [lang])

  const value = useMemo<LanguageValue>(
    () => ({
      lang,
      t: dictionaries[lang],
      setLang,
      toggleLang,
      pick: (localized: Localized) => localized[lang],
    }),
    [lang, setLang, toggleLang],
  )

  return <LanguageContext value={value}>{children}</LanguageContext>
}

export function useLanguage(): LanguageValue {
  const ctx = use(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>')
  return ctx
}
