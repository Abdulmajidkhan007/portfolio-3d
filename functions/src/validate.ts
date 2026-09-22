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
  message: string
  /** Honeypot — odamlar ko'rmaydi, botlar to'ldiradi. */
  botField?: string
}

export interface ContactData {
  name: string
  email: string
  message: string
}

export type ParseResult =
  | { ok: true; data: ContactData }
  | { ok: false; error: string; field?: keyof ContactInput }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

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
  const message = clean(raw.message)

  if (!name) return { ok: false, error: 'Ism kiritilmagan', field: 'name' }
  if (name.length > LIMITS.name) {
    return { ok: false, error: `Ism ${LIMITS.name} belgidan uzun`, field: 'name' }
  }

  if (!email) return { ok: false, error: 'Email kiritilmagan', field: 'email' }
  if (email.length > LIMITS.email || !EMAIL.test(email)) {
    return { ok: false, error: "Email formati noto'g'ri", field: 'email' }
  }

  if (!message) return { ok: false, error: 'Xabar kiritilmagan', field: 'message' }
  if (message.length < LIMITS.messageMin) {
    return { ok: false, error: 'Xabar juda qisqa', field: 'message' }
  }
  if (message.length > LIMITS.message) {
    return { ok: false, error: `Xabar ${LIMITS.message} belgidan uzun`, field: 'message' }
  }

  return { ok: true, data: { name, email, message } }
}
