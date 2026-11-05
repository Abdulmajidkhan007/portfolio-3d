import { describe, expect, it, vi } from 'vitest'
import { domainAcceptsMail, emailDomain, isValidEmail, isValidTelegram, normalizePhone } from '@/lib/contactRules'
import { domainAcceptsMail as serverMx } from '../../functions/src/mx'

const doh = (body: unknown, ok = true) =>
  vi.fn().mockResolvedValue({ ok, json: async () => body }) as unknown as typeof fetch

describe('brauzer qoidalari', () => {
  it('telefon +998 va 9 raqam', () => {
    expect(normalizePhone('+998 90 123 45 67')).toBe('+998901234567')
    expect(normalizePhone('90 123 45 67')).toBeNull()
    expect(normalizePhone('+998 90 123 45')).toBeNull()
  })
  it('email formati va domen', () => {
    expect(isValidEmail('a@b.uz')).toBe(true)
    expect(isValidEmail('a@b')).toBe(false)
    expect(emailDomain('A@Gmail.com')).toBe('gmail.com')
  })
  it('telegram 5–32', () => {
    expect(isValidTelegram('@abcde')).toBe(true)
    expect(isValidTelegram('@abcd')).toBe(false)
    expect(isValidTelegram('@' + 'a'.repeat(33))).toBe(false)
  })
})

describe.each([
  ['brauzer', domainAcceptsMail],
  ['server', serverMx],
])('MX tekshiruvi (%s)', (_name, check) => {
  it('MX bor — true', async () => {
    expect(await check('gmail.com', doh({ Status: 0, Answer: [{ type: 15, data: '10 smtp.google.com.' }] }))).toBe(true)
  })
  it('NXDOMAIN — false', async () => {
    expect(await check('yoq-domen.invalid', doh({ Status: 3 }))).toBe(false)
  })
  it('MX yozuvi yo‘q yoki null MX — false', async () => {
    expect(await check('a.uz', doh({ Status: 0 }))).toBe(false)
    expect(await check('a.uz', doh({ Status: 0, Answer: [{ type: 15, data: '0 .' }] }))).toBe(false)
  })
  it('DNS xizmati ishlamasa foydalanuvchi bloklanmaydi', async () => {
    expect(await check('a.uz', vi.fn().mockRejectedValue(new Error('net')) as unknown as typeof fetch)).toBe(true)
    expect(await check('a.uz', doh({}, false))).toBe(true)
  })
})
