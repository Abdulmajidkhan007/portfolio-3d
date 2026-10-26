/**
 * Frontend formasi bilan backend endpointi orasidagi shartnoma.
 *
 * Ilgari bu rolni netlify-form.test.ts bajarardi: u index.html dagi yashirin
 * formani Contact.tsx bilan solishtirardi. Netlify Forms o'rnini Cloud
 * Function egallagach, sinadigan joy ham ko'chdi — endi maydon nomlari
 * funksiya kutayotgan kalitlarga mos kelishi kerak, aks holda forma
 * "yuborildi" deb ko'rsatadi, xabar esa hech qayerga bormaydi.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { describe, expect, it } from 'vitest'

const read = (relative: string) =>
  readFileSync(fileURLToPath(new URL(`../../${relative}`, import.meta.url)), 'utf8')

const contactSource = read('src/components/Contact.tsx')
const validatorSource = read('functions/src/validate.ts')
const indexHtml = read('index.html')
const firebaseJson = JSON.parse(read('firebase.json')) as {
  hosting: {
    rewrites: { source: string; function?: { functionId: string }; destination?: string }[]
    headers: { source: string; headers: { key: string; value: string }[] }[]
  }
}

/** Formadagi input/textarea maydonlari (form elementining o'z nomi emas). */
const fieldNames = (source: string) =>
  [...source.matchAll(/<(?:input|textarea)\b[^>]*?\bname="([^"]+)"/g)].map((match) => match[1])

describe('aloqa formasi shartnomasi', () => {
  it('forma /api/contact ga yuboradi (yoki VITE_CONTACT_URL dagi Worker ga)', () => {
    expect(contactSource).toContain("|| '/api/contact'")
    expect(contactSource).toContain('VITE_CONTACT_URL')
    expect(contactSource).toContain('fetch(ENDPOINT')
  })

  it('CSP Cloudflare Worker ga ulanishga ruxsat beradi', () => {
    const csp = firebaseJson.hosting.headers
      .flatMap((h) => h.headers)
      .find((h) => h.key === 'Content-Security-Policy')?.value
    expect(csp).toContain('connect-src')
    expect(csp).toContain('https://*.workers.dev')
  })

  it('firebase.json /api/contact ni funksiyaga yo\'naltiradi', () => {
    const rewrite = firebaseJson.hosting.rewrites.find((r) => r.source === '/api/contact')
    expect(rewrite?.function?.functionId).toBe('contact')
  })

  it('SPA rewrite /api/contact dan KEYIN turadi', () => {
    // Tartib muhim: "**" birinchi bo'lsa, /api/contact ham index.html ga
    // ketadi va POST so'rov 200 HTML qaytaradi — forma "muvaffaqiyat" deydi.
    const sources = firebaseJson.hosting.rewrites.map((r) => r.source)
    expect(sources.indexOf('/api/contact')).toBeLessThan(sources.indexOf('**'))
  })

  it('forma maydonlari backend kutgan kalitlarga mos', () => {
    const fields = fieldNames(contactSource)
    expect(fields).toContain('name')
    expect(fields).toContain('email')
    expect(fields).toContain('message')
    expect(fields).toContain('botField')

    // Validator ham aynan shu kalitlarni o'qiydi.
    for (const key of ['name', 'email', 'message', 'botField']) {
      expect(validatorSource, `validate.ts da "${key}" o'qilmayapti`).toContain(key)
    }
  })

  it('honeypot serverga yuboriladi', () => {
    expect(contactSource).toContain("namedItem('botField')")
    expect(contactSource).toContain('botField')
  })

  it("Netlify izlari qolmagan", () => {
    expect(indexHtml).not.toContain('data-netlify')
    expect(indexHtml).not.toContain('netlify.app')
    expect(contactSource.toLowerCase()).not.toContain('netlify')
  })
})

/**
 * Hosting ko'chganda canonical yangilangan, lekin robots.txt, sitemap.xml va
 * rezyume eski netlify.app manzilida qolib ketgan edi — qidiruv tizimi va HR
 * o'lik saytga yuborilardi. Endi hammasi bitta manbaga — canonical'ga bog'langan.
 */
describe('sayt manzili hamma joyda bir xil', () => {
  const canonical = indexHtml.match(/<link rel="canonical" href="([^"]+)"/)?.[1]
  const origin = canonical ? new URL(canonical).origin : ''

  it('index.html da canonical bor', () => {
    expect(origin).toMatch(/^https:\/\//)
  })

  for (const file of ['public/robots.txt', 'public/sitemap.xml', 'scripts/resume/resume.html']) {
    it(`${file} canonical manzilini ishlatadi`, () => {
      const source = read(file)
      expect(source).toContain(origin)
      expect(source).not.toContain('netlify.app')
    })
  }
})
