/**
 * Backend validatori (functions/src/validate.ts) uchun testlar.
 *
 * Fayl Firebase'ga bog'liq emas, shuning uchun uni ildizdagi Vitest
 * to'g'ridan-to'g'ri import qiladi — functions/ uchun alohida test
 * toolchain'i saqlashning hojati yo'q.
 */
import { describe, expect, it } from 'vitest'
import { LIMITS, parseContact } from '../../functions/src/validate'

const valid = { name: 'Abdulmajid', phone: '+998 90 123 45 67', message: 'Salom, loyiha bo\'yicha yozmoqchi edim.' }

describe('parseContact', () => {
  it('to\'g\'ri ma\'lumotni qabul qiladi', () => {
    const result = parseContact(valid)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.name).toBe('Abdulmajid')
  })

  it('chetdagi bo\'shliqlarni olib tashlaydi', () => {
    const result = parseContact({ ...valid, name: '  Abdulmajid  ' })
    expect(result.ok && result.data.name).toBe('Abdulmajid')
  })

  it('honeypot to\'ldirilgan bo\'lsa rad etadi', () => {
    const result = parseContact({ ...valid, botField: 'men botman' })
    expect(result).toEqual({ ok: false, error: 'bot' })
  })

  it('bot-field (defis bilan) ham ushlanadi', () => {
    const result = parseContact({ ...valid, 'bot-field': 'x' })
    expect(result).toEqual({ ok: false, error: 'bot' })
  })

  it('Ism, Telefon, Xabar majburiy', () => {
    for (const key of ['name', 'phone', 'message'] as const) {
      const result = parseContact({ ...valid, [key]: '   ' })
      expect(result.ok, `${key} bo'sh bo'lsa ham o'tib ketdi`).toBe(false)
      if (!result.ok) expect(result.field).toBe(key)
    }
  })

  it('Email va Telegram ixtiyoriy', () => {
    const result = parseContact(valid)
    expect(result.ok && result.data.email).toBe('')
    expect(result.ok && result.data.telegram).toBe('')
  })

  it("berilgan noto'g'ri emailni rad etadi", () => {
    for (const email of ['a@b', 'a b@c.uz', '@b.uz', 'a@.uz', 'oddiy-matn']) {
      const result = parseContact({ ...valid, email })
      expect(result.ok, `${email} o'tib ketdi`).toBe(false)
      if (!result.ok) expect(result.code).toBe('emailInvalid')
    }
    expect(parseContact({ ...valid, email: 'a@b.uz' }).ok).toBe(true)
  })

  it('telefon: faqat +998 va 9 raqam, normallashadi', () => {
    for (const phone of ['+998 90 123 45 67', '+998901234567', '+998 (90) 123-45-67']) {
      const result = parseContact({ ...valid, phone })
      expect(result.ok && result.data.phone, phone).toBe('+998901234567')
    }
    for (const phone of ['901234567', '+7 900 123 45 67', '+99890123456', '+9989012345678', 'abc', '++998901234567']) {
      const result = parseContact({ ...valid, phone })
      expect(result.ok, `${phone} o'tib ketdi`).toBe(false)
      if (!result.ok) expect(result.field).toBe('phone')
    }
  })

  it('juda qisqa xabarni rad etadi', () => {
    const result = parseContact({ ...valid, message: 'salom' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.field).toBe('message')
  })

  it('juda uzun qiymatlarni rad etadi', () => {
    expect(parseContact({ ...valid, name: 'a'.repeat(LIMITS.name + 1) }).ok).toBe(false)
    expect(parseContact({ ...valid, message: 'a'.repeat(LIMITS.message + 1) }).ok).toBe(false)
  })

  it('obyekt bo\'lmagan tanani rad etadi', () => {
    for (const body of [null, undefined, 'matn', 42, []]) {
      expect(parseContact(body).ok, `${JSON.stringify(body)} o'tib ketdi`).toBe(false)
    }
  })

  it('nazorat belgilarini tozalaydi', () => {
    const result = parseContact({ ...valid, name: 'Ali\u0000\u001bBek' })
    expect(result.ok && result.data.name).toBe('AliBek')
  })

  it('telegram ixtiyoriy va @ bilan bir xil ko\'rinishga keltiriladi', () => {
    const none = parseContact(valid)
    expect(none.ok && none.data.telegram).toBe('')
    for (const telegram of ['Abdulloh_77700', '@Abdulloh_77700']) {
      const result = parseContact({ ...valid, telegram })
      expect(result.ok && result.data.telegram).toBe('@Abdulloh_77700')
    }
  })

  it('noto\'g\'ri telegram username\'ni rad etadi', () => {
    for (const telegram of ['abc', '1abcdef', '@ab cd ef', 'a'.repeat(33), 'https://t.me/abcdef']) {
      const result = parseContact({ ...valid, telegram })
      expect(result.ok, `${telegram} o'tib ketdi`).toBe(false)
      if (!result.ok) expect(result.field).toBe('telegram')
    }
  })
})
