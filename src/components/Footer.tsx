import { useLanguage } from '@/i18n/LanguageContext'
import { content } from '@/data/content'
import { scrollToTop } from '@/hooks/useLenis'

export default function Footer() {
  const { t } = useLanguage()
  const year = new Date().getFullYear()

  return (
    <footer className="relative border-t border-white/8 bg-bg-soft">
      <div className="section-shell flex flex-col gap-8 py-12 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-lg font-bold">
            <span className="neon-text">A</span>
            <span className="text-ink">.Sharipov</span>
          </p>
          <p className="mt-2 max-w-xs text-sm text-muted">{t.footer.tagline}</p>
        </div>

        <nav aria-label="Social links" className="flex flex-wrap gap-x-6 gap-y-2">
          {content.socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target={social.href.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer noopener"
              className="text-sm text-muted transition-colors hover:text-neon"
            >
              {social.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          onClick={scrollToTop}
          className="group inline-flex items-center gap-2 self-start rounded-full border border-white/10 px-4 py-2 text-sm text-muted transition-colors hover:border-neon/40 hover:text-neon"
        >
          {t.footer.backToTop}
          <span aria-hidden className="transition-transform group-hover:-translate-y-0.5">
            ↑
          </span>
        </button>
      </div>

      <div className="border-t border-white/5">
        <div className="section-shell flex flex-col gap-2 py-5 text-xs text-muted sm:flex-row sm:justify-between">
          <p>
            © {year} {content.profile.name}. {t.footer.rights}
          </p>
          <p className="font-mono">React · Three.js · GSAP · Netlify</p>
        </div>
      </div>
    </footer>
  )
}
