/**
 * Aloqa formasi ma'lumotini tekshirish — toza mantiq, Firebase'siz.
 *
 * Frontend ham tekshiradi, lekin u foydalanuvchiga qulaylik uchun.
 * HTTP so'rovni esa brauzersiz ham yuborish mumkin, shuning uchun
 * haqiqiy tekshiruv shu yerda: serverda.
 */

export interface ContactInput {
  name: string
  email: string
  /** Ixtiyoriy — mijoz qo'ng'iroq qilishimni xohlasa. */
  phone?: string
  /** Ixtiyoriy — Telegram username, @ bilan yoki @siz. */
  telegram?: string
  message: string
  /** Honeypot — odamlar ko'rmaydi, botlar to'ldiradi. */
  botField?: string
}

export interface ContactData {
  name: string
  email: string
  /** Bo'sh satr — telefon kiritilmagan. */
  phone: string
  /** `@username` ko'rinishida yoki bo'sh satr. */
  telegram: string
  message: string
}

export type ParseResult =
  | { ok: true; data: ContactData }
  | { ok: false; error: string; field?: keyof ContactInput }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
/** +998 90 123 45 67, (90) 123-45-67 va h.k.: faqat raqam, bo'shliq, +, -, qavs; 7–15 raqam. */
const PHONE = /^\+?[\d\s()-]{7,20}$/
const PHONE_DIGITS = { min: 7, max: 15 } as const
/** Telegram qoidasi: harf bilan boshlanadi, 5–32 belgi (harf, raqam, _). */
const TELEGRAM = /^@?[A-Za-z][A-Za-z0-9_]{4,31}$/

export const LIMITS = {
  name: 100,
  email: 254,
  message: 4000,
  messageMin: 10,
} as const

/** Nazorat belgilarini olib tashlaydi va chetlarini qirqadi. */
const clean = (value: unknown): string =>
  typeof value === 'string'
    ? // eslint-disable-next-line no-control-regex
      value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim()
    : ''

export function parseContact(body: unknown): ParseResult {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: "So'rov tanasi JSON obyekt bo'lishi kerak" }
  }

  const raw = body as Record<string, unknown>

  // Honeypot to'ldirilgan bo'lsa — bu bot. Xatoni oshkor qilmaymiz:
  // bot "muvaffaqiyat" ko'radi va qayta urinmaydi.
  if (clean(raw.botField) || clean(raw['bot-field'])) {
    return { ok: false, error: 'bot' }
  }

  const name = clean(raw.name)
  const email = clean(raw.email)
  const phone = clean(raw.phone)
  const telegramRaw = clean(raw.telegram)
  const message = clean(raw.message)

  if (!name) return { ok: false, error: 'Ism kiritilmagan', field: 'name' }
  if (name.length > LIMITS.name) {
    return { ok: false, error: `Ism ${LIMITS.name} belgidan uzun`, field: 'name' }
  }

  if (!email) return { ok: false, error: 'Email kiritilmagan', field: 'email' }
  if (email.length > LIMITS.email || !EMAIL.test(email)) {
    return { ok: false, error: "Email formati noto'g'ri", field: 'email' }
  }

  if (phone) {
    const digits = phone.replace(/\D/g, '').length
    if (!PHONE.test(phone) || digits < PHONE_DIGITS.min || digits > PHONE_DIGITS.max) {
      return { ok: false, error: "Telefon raqami noto'g'ri", field: 'phone' }
    }
  }

  if (telegramRaw && !TELEGRAM.test(telegramRaw)) {
    return { ok: false, error: "Telegram username noto'g'ri", field: 'telegram' }
  }
  const telegram = telegramRaw ? `@${telegramRaw.replace(/^@/, '')}` : ''

  if (!message) return { ok: false, error: 'Xabar kiritilmagan', field: 'message' }
  if (message.length < LIMITS.messageMin) {
    return { ok: false, error: 'Xabar juda qisqa', field: 'message' }
  }
  if (message.length > LIMITS.message) {
    return { ok: false, error: `Xabar ${LIMITS.message} belgidan uzun`, field: 'message' }
  }

  return { ok: true, data: { name, email, phone, telegram, message } }
}
