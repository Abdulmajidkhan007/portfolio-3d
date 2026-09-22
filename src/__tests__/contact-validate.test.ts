/**
 * Backend validatori (functions/src/validate.ts) uchun testlar.
 *
 * Fayl Firebase'ga bog'liq emas, shuning uchun uni ildizdagi Vitest
 * to'g'ridan-to'g'ri import qiladi — functions/ uchun alohida test
 * toolchain'i saqlashning hojati yo'q.
 */
import { describe, expect, it } from 'vitest'
import { LIMITS, parseContact } from '../../functions/src/validate'

const valid = { name: 'Abdulmajid', email: 'a@b.uz', message: 'Salom, loyiha bo\'yicha yozmoqchi edim.' }

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

  it('bo\'sh maydonlarni rad etadi', () => {
    for (const key of ['name', 'email', 'message'] as const) {
      const result = parseContact({ ...valid, [key]: '   ' })
      expect(result.ok, `${key} bo'sh bo'lsa ham o'tib ketdi`).toBe(false)
      if (!result.ok) expect(result.field).toBe(key)
    }
  })

  it('noto\'g\'ri emailni rad etadi', () => {
    for (const email of ['a@b', 'a b@c.uz', '@b.uz', 'a@.uz', 'oddiy-matn']) {
      const result = parseContact({ ...valid, email })
      expect(result.ok, `${email} o'tib ketdi`).toBe(false)
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
})
