/**
 * Aloqa formasi ma'lumotini tekshirish — toza mantiq, Firebase'siz.
 *
 * Frontend ham tekshiradi, lekin u foydalanuvchiga qulaylik uchun.
 * HTTP so'rovni esa brauzersiz ham yuborish mumkin, shuning uchun
 * haqiqiy tekshiruv shu yerda: serverda.
 */

export interface ContactInput {
  name: string
  /** Ixtiyoriy. Berilsa — format va domen MX tekshiriladi (mx.ts). */
  email?: string
  /** Majburiy: +998 va 9 raqam. */
  phone?: string
  /** Ixtiyoriy — Telegram username, @ bilan yoki @siz. */
  telegram?: string
  message: string
  /** Honeypot — odamlar ko'rmaydi, botlar to'ldiradi. */
  botField?: string
}

export interface ContactData {
  name: string
  /** Bo'sh satr — email kiritilmagan. */
  email: string
  /** Normallashgan: `+998901234567`. */
  phone: string
  /** `@username` ko'rinishida yoki bo'sh satr. */
  telegram: string
  message: string
}

export type ParseResult =
  | { ok: true; data: ContactData }
  | { ok: false; error: string; code?: ContactErrorCode; field?: keyof ContactInput }

/** Frontend i18n kalitlari bilan bir xil (src/lib/contactRules.ts). */
export type ContactErrorCode =
  | 'nameRequired'
  | 'phoneRequired'
  | 'phoneInvalid'
  | 'emailInvalid'
  | 'emailDomain'
  | 'telegramInvalid'
  | 'messageRequired'
  | 'messageShort'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
/** +998 va 9 raqam; bo'shliq, qavs, defis olib tashlangach. */
const PHONE = /^\+998\d{9}$/
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
  const phoneRaw = clean(raw.phone)
  const telegramRaw = clean(raw.telegram)
  const message = clean(raw.message)

  const fail = (code: ContactErrorCode, error: string, field: keyof ContactInput): ParseResult => ({
    ok: false,
    error,
    code,
    field,
  })

  if (!name) return fail('nameRequired', 'Ism kiritilmagan', 'name')
  if (name.length > LIMITS.name) {
    return fail('nameRequired', `Ism ${LIMITS.name} belgidan uzun`, 'name')
  }

  if (!phoneRaw) return fail('phoneRequired', 'Telefon kiritilmagan', 'phone')
  const phone = phoneRaw.replace(/[\s()-]/g, '')
  if (!PHONE.test(phone)) {
    return fail('phoneInvalid', "Telefon +998 va 9 raqamdan iborat bo'lishi kerak", 'phone')
  }

  if (email && (email.length > LIMITS.email || !EMAIL.test(email))) {
    return fail('emailInvalid', "Email formati noto'g'ri", 'email')
  }

  if (telegramRaw && !TELEGRAM.test(telegramRaw)) {
    return fail('telegramInvalid', "Telegram username noto'g'ri", 'telegram')
  }
  const telegram = telegramRaw ? `@${telegramRaw.replace(/^@/, '')}` : ''

  if (!message) return fail('messageRequired', 'Xabar kiritilmagan', 'message')
  if (message.length < LIMITS.messageMin) return fail('messageShort', 'Xabar juda qisqa', 'message')
  if (message.length > LIMITS.message) {
    return fail('messageShort', `Xabar ${LIMITS.message} belgidan uzun`, 'message')
  }

  return { ok: true, data: { name, email, phone, telegram, message } }
}
