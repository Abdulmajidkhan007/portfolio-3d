/**
 * netlify.toml dagi CSP bilan index.html ichidagi kod mos turishini qo'riqlaydi.
 *
 * script-src da 'unsafe-inline' yo'q, shuning uchun inline skript faqat sha256
 * hash orqali ishlaydi. Skript bir harfga o'zgarsa hash eskiradi va brauzer uni
 * jimgina bloklaydi — sayt build bo'ladi, deploy bo'ladi, lekin tema birinchi
 * bo'yoqda qo'llanmaydi. Bunday xato faqat production'da ko'rinadi, shuning
 * uchun uni shu yerda ushlaymiz.
 */
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { describe, expect, it } from 'vitest'

const read = (relative: string) =>
  readFileSync(fileURLToPath(new URL(`../../${relative}`, import.meta.url)), 'utf8')

const indexHtml = read('index.html')
const netlifyToml = read('netlify.toml')

// Avval CSP sarlavhasining o'zini ajratamiz — netlify.toml dagi izohlarda ham
// "script-src" so'zi uchraydi va to'g'ridan-to'g'ri qidiruv o'shanga tushadi.
const csp = /Content-Security-Policy = "([^"]+)"/.exec(netlifyToml)?.[1] ?? ''
const scriptSrc = /script-src ([^;]+)/.exec(csp)?.[1] ?? ''

/** CSP hash skript tegi ichidagi matnning AYNAN o'zidan hisoblanadi. */
const sha256 = (body: string) => `sha256-${createHash('sha256').update(body).digest('base64')}`

describe('Content-Security-Policy', () => {
  it('script-src da unsafe-inline yo\'q', () => {
    expect(scriptSrc).not.toContain("'unsafe-inline'")
  })

  it('har bir inline skript uchun CSP da hash bor', () => {
    const inlineScripts = [...indexHtml.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1])

    // Tema skripti shu yerda turibdi — tegib ketilgan bo'lsa test sabab aytadi.
    expect(inlineScripts.length).toBeGreaterThan(0)

    for (const body of inlineScripts) {
      expect(scriptSrc, `index.html dagi inline skript uchun hash yo'q: ${sha256(body)}`)
        .toContain(sha256(body))
    }
  })

  it('index.html da inline hodisa atributlari yo\'q', () => {
    // onfocus="..." kabi atributlar CSP tomonidan bloklanadi — ular CSS ga
    // yoki komponentga ko'chirilishi kerak.
    const handlers = indexHtml.match(/\son[a-z]+\s*=\s*"/g) ?? []
    expect(handlers).toEqual([])
  })
})
