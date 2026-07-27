import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export type Theme = 'dark' | 'light'

export const THEME_STORAGE_KEY = 'portfolio-theme'

interface ThemeValue {
  theme: Theme
  toggle: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeValue | null>(null)

/**
 * Resolves the theme the same way the pre-paint script in index.html does.
 * Both must agree, or the first render flips the page after it has painted.
 */
export function resolveInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'dark' || stored === 'light') return stored
  } catch {
    // Private mode or blocked storage — fall through to the media query.
  }
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(resolveInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = theme
    // Keeps form controls, scrollbars and the URL bar in step with the page.
    root.style.colorScheme = theme
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // Not being able to remember the choice is not worth failing over.
    }
  }, [theme])

  // Follow the OS only while the visitor has not made a choice of their own.
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: light)')
    if (!media) return

    const onChange = (event: MediaQueryListEvent) => {
      try {
        if (window.localStorage.getItem(THEME_STORAGE_KEY)) return
      } catch {
        // Unreadable storage means no stored preference to respect.
      }
      setThemeState(event.matches ? 'light' : 'dark')
    }

    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const setTheme = useCallback((next: Theme) => setThemeState(next), [])
  const toggle = useCallback(
    () => setThemeState((current) => (current === 'dark' ? 'light' : 'dark')),
    [],
  )

  const value = useMemo(() => ({ theme, toggle, setTheme }), [theme, toggle, setTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeValue {
  const value = useContext(ThemeContext)
  if (!value) throw new Error('useTheme must be used inside <ThemeProvider>')
  return value
}

export interface ScenePalette {
  neon: string
  cyan: string
  violet: string
  /** Additive is right over near-black; over a light page it blows out to white. */
  additive: boolean
  /** Multiplier on line/point opacity. Dark dots on a light page read much
   * heavier than glowing ones on black, so light scales this down. */
  opacityScale: number
}

/**
 * Palette for the WebGL scenes that sit directly on the page background.
 * Shaders cannot read CSS custom properties, so the values are mirrored here;
 * they track the `--color-neon` / `--color-cyan` pair in index.css.
 *
 * Scenes rendered inside a card of their own (the skill sphere, the avatar)
 * keep a dark panel in both themes and so do not use this.
 */
export function useScenePalette(): ScenePalette {
  const { theme } = useTheme()
  return useMemo(
    () =>
      theme === 'light'
        ? {
            neon: '#00854b',
            cyan: '#0072a8',
            violet: '#6d4bd8',
            additive: false,
            opacityScale: 0.62,
          }
        : {
            neon: '#00ff88',
            cyan: '#00d4ff',
            violet: '#a78bfa',
            additive: true,
            opacityScale: 1,
          },
    [theme],
  )
}
