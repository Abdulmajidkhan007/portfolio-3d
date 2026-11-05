/** Domen pochta qabul qiladimi — DNS-over-HTTPS orqali MX yozuvi (serverda majburiy tekshiruv). */

const DOH_URL = 'https://cloudflare-dns.com/dns-query'
const MX = 15

interface DohAnswer {
  Status: number
  Answer?: { type: number; data: string }[]
}

/**
 * `false` — domen yo'q yoki MX yo'q/null MX; `true` — MX bor YOKI DNS xizmati
 * javob bermadi (vaqtinchalik xato haqiqiy xabarni yo'qotmasin).
 */
export async function domainAcceptsMail(
  domain: string,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  if (!domain) return false
  try {
    const response = await fetchImpl(`${DOH_URL}?name=${encodeURIComponent(domain)}&type=MX`, {
      headers: { accept: 'application/dns-json' },
      signal: AbortSignal.timeout(4000),
    })
    if (!response.ok) return true
    const body = (await response.json()) as DohAnswer
    if (body.Status === 3) return false
    if (body.Status !== 0) return true
    const records = (body.Answer ?? []).filter((a) => a.type === MX)
    return records.some((a) => !/^\d+\s+\.?$/.test(a.data.trim()))
  } catch {
    return true
  }
}
