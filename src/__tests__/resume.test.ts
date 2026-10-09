import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { content } from '@/data/content'

/**
 * Rezyume ikki joyda yashaydi: manba — scripts/resume/resume.html, saytdan
 * yuklanadigani — public/resume.pdf. Ilgari HTML yangilanib, PDF eskisicha
 * qolib ketgan. Bu testlar ikkisini va saytdagi ma'lumotni bir-biriga bog'laydi.
 */
const read = (relative: string) =>
  readFileSync(fileURLToPath(new URL(`../../${relative}`, import.meta.url)), 'utf8')
const html = read('scripts/resume/resume.html')

describe('rezyume', () => {
  it('PDF aynan hozirgi resume.html dan yig\'ilgan', () => {
    const stamp = read('scripts/resume/resume.sha256').trim()
    const current = createHash('sha256').update(html).digest('hex')
    // Qizil bo'lsa: node scripts/resume/build.mjs (PDF + hash qayta yoziladi).
    expect(stamp).toBe(current)
  })

  it('sayt bilan bir xil email', () => {
    expect(html).toContain(`mailto:${content.profile.email}`)
  })

  it('Telegram va portfolio havolasi bor', () => {
    expect(html).toContain('https://t.me/Abdulloh_77700')
    expect(html).toContain('https://abdulmajidkhan-portfolio.web.app')
  })

  it('botlar soni saytdagi raqam bilan bir xil', () => {
    const bots = content.about.stats.find((stat) => stat.label.en === 'Telegram bots')
    expect(bots).toBeDefined()
    expect(html).toContain(`${bots!.value} ta bot`)
  })

  it('eskirgan ma\'lumot qaytib kelmagan', () => {
    for (const stale of ['netlify', 'abdulmajidsharipovlc', '10 000+', '12 ta bot']) {
      expect(html.toLowerCase()).not.toContain(stale.toLowerCase())
    }
  })
})
