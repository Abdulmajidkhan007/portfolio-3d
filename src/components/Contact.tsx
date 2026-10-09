import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '@/i18n/LanguageContext'
import { content } from '@/data/content'
import { cn } from '@/utils/cn'
import SectionHeading from './SectionHeading'

/** Firebase Hosting rewrite bilan Cloud Function'ga boradi (firebase.json). */
const ENDPOINT = '/api/contact'
// Server yiqilsa yoki hali deploy qilinmagan bo'lsa (Spark rejimi) — xabar yo'qolmasin.
const TELEGRAM_URL = 'https://t.me/Abdulloh_77700'

type Status = 'idle' | 'sending' | 'success' | 'error'

interface Fields {
  name: string
  email: string
  message: string
}

const EMPTY: Fields = { name: '', email: '', message: '' }

export default function Contact() {
  const { t } = useLanguage()
  const [fields, setFields] = useState<Fields>(EMPTY)
  const [errors, setErrors] = useState<Partial<Fields>>({})
  const [status, setStatus] = useState<Status>('idle')

  const validate = (): boolean => {
    const next: Partial<Fields> = {}
    if (!fields.name.trim()) next.name = t.contact.errors.nameRequired
    if (!fields.email.trim()) next.email = t.contact.errors.emailRequired
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(fields.email.trim())) {
      next.email = t.contact.errors.emailInvalid
    }
    if (!fields.message.trim()) next.message = t.contact.errors.messageRequired
    else if (fields.message.trim().length < 10) next.message = t.contact.errors.messageShort

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (status === 'sending') return
    if (!validate()) return

    setStatus('sending')
    const form = event.currentTarget
    const botField = (form.elements.namedItem('botField') as HTMLInputElement | null)?.value ?? ''

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, botField }),
      })
      // Server o'z tekshiruvini qiladi — maydon xatosini foydalanuvchiga qaytaramiz.
      if (response.status === 400) {
        const body = (await response.json()) as { error?: string; field?: keyof Fields }
        if (body.field) setErrors({ [body.field]: body.error } as Partial<Fields>)
        setStatus('idle')
        return
      }
      if (!response.ok) throw new Error(`Server ${response.status}`)
      // Funksiya yo'q bo'lsa (Spark) Hosting index.html ni 200 bilan qaytarishi mumkin —
      // faqat funksiyaning o'z javobi { ok: true } muvaffaqiyat hisoblanadi.
      const result = (await response.json().catch(() => null)) as { ok?: boolean } | null
      if (result?.ok !== true) throw new Error('Kutilmagan javob')
      setFields(EMPTY)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  const update = (key: keyof Fields) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields((current) => ({ ...current, [key]: event.target.value }))
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const inputClass = (invalid: boolean) =>
    cn(
      'w-full rounded-xl border bg-bg-soft px-4 py-3 text-sm text-ink outline-none transition-all placeholder:text-muted/60',
      invalid
        ? 'border-red-500/60 focus:border-red-500'
        : 'border-line focus:border-neon/60 focus:shadow-neon',
    )

  return (
    <section id="contact" className="relative py-24 lg:py-32">
      <div className="grid-backdrop pointer-events-none absolute inset-0 -z-10 opacity-50" />

      <div className="section-shell">
        <SectionHeading
          eyebrow={t.contact.eyebrow}
          title={t.contact.title}
          subtitle={t.contact.subtitle}
          align="center"
        />

        <div className="mt-14 grid gap-8 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="glass relative overflow-hidden rounded-3xl p-6 sm:p-8">
            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex min-h-[420px] flex-col items-center justify-center text-center"
                >
                  <svg
                    viewBox="0 0 52 52"
                    className="h-20 w-20"
                    fill="none"
                    stroke="currentColor"
                    aria-hidden
                  >
                    <motion.circle
                      cx="26"
                      cy="26"
                      r="24"
                      strokeWidth="2"
                      className="text-neon/40"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                    <motion.path
                      d="M15 27 l8 8 l15 -16"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-neon"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.45, delay: 0.4, ease: 'easeOut' }}
                    />
                  </svg>

                  <h3 className="mt-6 font-display text-2xl font-bold">{t.contact.successTitle}</h3>
                  <p className="mt-2 text-sm text-muted">{t.contact.successBody}</p>

                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="mt-8 rounded-full border border-line px-5 py-2.5 text-sm transition-colors hover:border-neon/45 hover:text-neon"
                  >
                    {t.contact.sendAnother}
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  method="POST"
                  onSubmit={handleSubmit}
                  noValidate
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  {/* Honeypot: odam ko'rmaydi, bot to'ldiradi. Serverda tekshiriladi. */}
                  <p className="hidden">
                    <label>
                      Do not fill this out: <input name="botField" tabIndex={-1} autoComplete="off" />
                    </label>
                  </p>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="contact-name" className="mb-2 block text-sm text-muted">
                        {t.contact.name}
                      </label>
                      <input
                        id="contact-name"
                        name="name"
                        value={fields.name}
                        onChange={update('name')}
                        placeholder={t.contact.namePlaceholder}
                        autoComplete="name"
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={errors.name ? 'contact-name-error' : undefined}
                        className={inputClass(Boolean(errors.name))}
                      />
                      {errors.name && (
                        <p id="contact-name-error" className="mt-1.5 text-xs text-red-400">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="contact-email" className="mb-2 block text-sm text-muted">
                        {t.contact.email}
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        value={fields.email}
                        onChange={update('email')}
                        placeholder={t.contact.emailPlaceholder}
                        autoComplete="email"
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={errors.email ? 'contact-email-error' : undefined}
                        className={inputClass(Boolean(errors.email))}
                      />
                      {errors.email && (
                        <p id="contact-email-error" className="mt-1.5 text-xs text-red-400">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="mb-2 block text-sm text-muted">
                      {t.contact.message}
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={6}
                      value={fields.message}
                      onChange={update('message')}
                      placeholder={t.contact.messagePlaceholder}
                      aria-invalid={Boolean(errors.message)}
                      aria-describedby={errors.message ? 'contact-message-error' : undefined}
                      className={cn(inputClass(Boolean(errors.message)), 'resize-y')}
                    />
                    {errors.message && (
                      <p id="contact-message-error" className="mt-1.5 text-xs text-red-400">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {status === 'error' && (
                    <p role="alert" className="text-sm text-red-400">
                      {t.contact.errorGeneric} {t.contact.errorFallback}{' '}
                      <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="underline">
                        @Abdulloh_77700
                      </a>
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="group relative w-full overflow-hidden rounded-full bg-gradient-to-r from-neon to-cyan px-7 py-3.5 font-medium text-bg transition-shadow hover:shadow-neon disabled:opacity-60 sm:w-auto"
                  >
                    <span className="relative z-10">
                      {status === 'sending' ? t.contact.sending : t.contact.submit}
                    </span>
                    <span className="absolute inset-0 -translate-x-full bg-white/25 transition-transform duration-500 group-hover:translate-x-0" />
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          <aside className="glass h-fit rounded-3xl p-6">
            <h3 className="font-mono text-xs tracking-[0.25em] text-neon uppercase">
              {t.contact.directTitle}
            </h3>
            <ul className="mt-5 space-y-4">
              {content.socials.map((social) => {
                const row = (
                  <>
                    <span className="text-sm text-muted">{social.label}</span>
                    <span className="truncate font-mono text-xs text-ink transition-colors group-hover:text-neon">
                      {social.handle}
                    </span>
                  </>
                )
                return (
                  <li key={social.label}>
                    {social.href ? (
                      <a
                        href={social.href}
                        target={social.href.startsWith('http') ? '_blank' : undefined}
                        rel="noreferrer noopener"
                        className="group flex items-center justify-between gap-3"
                      >
                        {row}
                      </a>
                    ) : (
                      <div className="flex items-center justify-between gap-3">{row}</div>
                    )}
                  </li>
                )
              })}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  )
}
