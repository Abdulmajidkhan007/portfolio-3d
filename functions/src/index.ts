/**
 * Portfolio backend — Firebase Cloud Functions (2-avlod).
 *
 * Yagona endpoint: POST /api/contact
 * firebase.json dagi rewrite uni shu funksiyaga yo'naltiradi, shuning uchun
 * brauzer uchun bu bir xil domen — CORS ham, CSP connect-src ham muammo emas.
 */

import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { initializeApp } from 'firebase-admin/app'
import { defineSecret } from 'firebase-functions/params'
import { onRequest } from 'firebase-functions/v2/https'
import * as logger from 'firebase-functions/logger'

import { parseContact } from './validate'

initializeApp()

// Ixtiyoriy: yangi xabar kelganda Telegramga xabar yuborish.
// Sozlanmagan bo'lsa funksiya baribir ishlayveradi.
const TELEGRAM_BOT_TOKEN = defineSecret('TELEGRAM_BOT_TOKEN')
const TELEGRAM_CHAT_ID = defineSecret('TELEGRAM_CHAT_ID')

/** Bitta IP dan daqiqasiga nechta xabar qabul qilinadi. */
const RATE_LIMIT = 3
const RATE_WINDOW_MS = 60_000

async function rateLimited(ip: string): Promise<boolean> {
  const db = getFirestore()
  const ref = db.collection('rate_limits').doc(ip.replace(/[^\w.:-]/g, '_'))

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    const now = Date.now()
    const data = snap.data()

    if (!data || now - (data.windowStart as number) > RATE_WINDOW_MS) {
      tx.set(ref, { windowStart: now, count: 1 })
      return false
    }
    if ((data.count as number) >= RATE_LIMIT) return true

    tx.update(ref, { count: FieldValue.increment(1) })
    return false
  })
}

async function notifyTelegram(name: string, email: string, message: string): Promise<void> {
  const token = TELEGRAM_BOT_TOKEN.value()
  const chatId = TELEGRAM_CHAT_ID.value()
  if (!token || !chatId) return

  const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const text =
    `📬 <b>Portfoliodan yangi xabar</b>\n\n` +
    `<b>Ism:</b> ${escape(name)}\n` +
    `<b>Email:</b> ${escape(email)}\n\n${escape(message)}`

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    })
    if (!response.ok) throw new Error(`Telegram ${response.status}`)
  } catch (error) {
    // Xabar Firestore'ga allaqachon yozilgan — bildirishnoma yetmagani
    // so'rovni yiqitmaydi, lekin jim ham qolmaydi.
    logger.warn('Telegram bildirishnomasi yuborilmadi', { error: String(error) })
  }
}

export const contact = onRequest(
  {
    region: 'europe-west1',
    cors: false, // bir xil domen — rewrite orqali keladi
    secrets: [TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID],
    maxInstances: 5,
  },
  async (request, response) => {
    if (request.method !== 'POST') {
      response.set('Allow', 'POST').status(405).json({ error: 'Faqat POST' })
      return
    }

    const parsed = parseContact(request.body)

    if (!parsed.ok) {
      // Honeypot ushlagan bo'lsa botga muvaffaqiyat ko'rsatamiz.
      if (parsed.error === 'bot') {
        logger.info('Honeypot ushladi', { ip: request.ip })
        response.status(200).json({ ok: true })
        return
      }
      response.status(400).json({ error: parsed.error, field: parsed.field })
      return
    }

    const ip = request.ip ?? 'unknown'
    if (await rateLimited(ip)) {
      logger.warn('Limit oshdi', { ip })
      response.status(429).json({ error: 'Juda ko\'p so\'rov. Bir daqiqadan keyin urinib ko\'ring.' })
      return
    }

    const { name, email, message } = parsed.data

    await getFirestore().collection('messages').add({
      name,
      email,
      message,
      ip,
      userAgent: request.get('user-agent') ?? null,
      createdAt: FieldValue.serverTimestamp(),
    })

    logger.info('Yangi xabar saqlandi', { email })
    await notifyTelegram(name, email, message)

    response.status(200).json({ ok: true })
  },
)
