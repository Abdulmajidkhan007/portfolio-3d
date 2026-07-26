import { useLanguage } from '@/i18n/LanguageContext'
import { cn } from '@/utils/cn'
import type { Lang } from '@/types'

const OPTIONS: Lang[] = ['uz', 'en']

/** Segmented UZ / EN switch with a sliding neon indicator. */
export default function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang, t } = useLanguage()

  return (
    <div
      role="group"
      aria-label={t.nav.switchLanguage}
      className={cn(
        'relative flex items-center rounded-full border border-white/10 bg-white/5 p-0.5',
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute top-0.5 bottom-0.5 left-0.5 w-[calc(50%-2px)] rounded-full bg-gradient-to-r from-neon/25 to-cyan/25 ring-1 ring-neon/40 transition-transform duration-300 ease-out"
        style={{ transform: `translateX(${lang === 'en' ? '100%' : '0%'})` }}
      />
      {OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLang(option)}
          aria-pressed={lang === option}
          className={cn(
            'relative z-10 w-10 rounded-full py-1 font-mono text-[11px] tracking-widest uppercase transition-colors',
            lang === option ? 'text-neon' : 'text-muted hover:text-ink',
          )}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
