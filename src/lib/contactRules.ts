/**
 * Aloqa formasi qoidalari — brauzer tomoni. Server nusxasi: functions/src/validate.ts
 * (functions/ alohida paket, shuning uchun qoidalar ikki joyda; ikkalasi bir xil
 * testlar bilan tekshiriladi).
 */

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
const PHONE_UZ = /^\+998\d{9}$/
const TELEGRAM = /^@?[A-Za-z][A-Za-z0-9_]{4,31}$/

/** `+998` va undan keyin aynan 9 raqam; bo'shliq, qavs va defis e'tiborga olinmaydi. */
export const normalizePhone = (value: string): string | null => {
  const compact = value.replace(/[\s()-]/g, '')
  return PHONE_UZ.test(compact) ? compact : null
}

export const isValidEmail = (value: string): boolean => value.length <= 254 && EMAIL.test(value)
export const isValidTelegram = (value: string): boolean => TELEGRAM.test(value)

export const emailDomain = (email: string): string => email.slice(email.lastIndexOf('@') + 1).toLowerCase()

const DOH_URL = 'https://cloudflare-dns.com/dns-query'
const MX = 15

interface DohAnswer {
  Status: number
  Answer?: { type: number; data: string }[]
}

/**
 * Domenda haqiqiy MX yozuvi bormi (DNS-over-HTTPS).
 * `false` — domen yo'q yoki pochta qabul qilmaydi; `true` — bor YOKI tekshirib
 * bo'lmadi (tarmoq xatosi foydalanuvchini bloklamasin; server baribir tekshiradi).
 */
export async function domainAcceptsMail(
  domain: string,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  try {
    const response = await fetchImpl(`${DOH_URL}?name=${encodeURIComponent(domain)}&type=MX`, {
      headers: { accept: 'application/dns-json' },
      signal: AbortSignal.timeout(4000),
    })
    if (!response.ok) return true
    const body = (await response.json()) as DohAnswer
    if (body.Status === 3) return false // NXDOMAIN
    if (body.Status !== 0) return true
    const records = (body.Answer ?? []).filter((a) => a.type === MX)
    // Null MX ("0 .") — domen pochta qabul qilmasligini e'lon qilgan.
    return records.some((a) => !/^\d+\s+\.?$/.test(a.data.trim()))
  } catch {
    return true
  }
}
