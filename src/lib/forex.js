// Daily reference rates from the free Frankfurter API (no key needed).
// These are end-of-day rates, not live ticks, so the ticker is labelled "daily".
const API = 'https://api.frankfurter.dev/v2/rates'

// pair label, quote currency against USD, whether to invert, decimals to show
const PAIRS = [
  { pair: 'EUR/USD', quote: 'EUR', invert: true, digits: 5 },
  { pair: 'GBP/USD', quote: 'GBP', invert: true, digits: 5 },
  { pair: 'USD/JPY', quote: 'JPY', invert: false, digits: 3 },
  { pair: 'XAU/USD', quote: 'XAU', invert: true, digits: 2 },
  { pair: 'AUD/USD', quote: 'AUD', invert: true, digits: 5 },
  { pair: 'USD/CAD', quote: 'CAD', invert: false, digits: 5 },
  { pair: 'USD/CHF', quote: 'CHF', invert: false, digits: 5 },
  { pair: 'NZD/USD', quote: 'NZD', invert: true, digits: 5 },
]

let cached = null

export function fetchForexRates() {
  if (cached) return cached
  const from = new Date(Date.now() - 10 * 86400000).toISOString().slice(0, 10)
  const url = `${API}?base=USD&quotes=${PAIRS.map((p) => p.quote).join(',')}&from=${from}`

  cached = fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`Rates request failed (${res.status})`)
      return res.json()
    })
    .then((rows) => {
      const byQuote = {}
      for (const row of rows) (byQuote[row.quote] ??= []).push(row)
      return PAIRS.flatMap(({ pair, quote, invert, digits }) => {
        const series = (byQuote[quote] ?? []).sort((a, b) => a.date.localeCompare(b.date))
        if (series.length < 2) return []
        const toPrice = (r) => (invert ? 1 / r.rate : r.rate)
        const price = toPrice(series.at(-1))
        const prev = toPrice(series.at(-2))
        return [{ pair, price: price.toFixed(digits), changePct: ((price - prev) / prev) * 100 }]
      })
    })
    .catch((err) => {
      cached = null
      throw err
    })
  return cached
}

// Forex sessions in each centre's local time, so daylight saving is handled automatically.
export const SESSIONS = [
  { id: 'sydney', zone: 'Australia/Sydney', open: 7, close: 16 },
  { id: 'tokyo', zone: 'Asia/Tokyo', open: 9, close: 18 },
  { id: 'london', zone: 'Europe/London', open: 8, close: 17 },
  { id: 'newyork', zone: 'America/New_York', open: 8, close: 17 },
]

function localParts(date, zone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(date)
  const get = (type) => parts.find((p) => p.type === type).value
  return { weekday: get('weekday'), hour: Number(get('hour')) + Number(get('minute')) / 60 }
}

// The forex market is closed from Friday 17:00 to Sunday 17:00 New York time.
export function isMarketWeekend(date = new Date()) {
  const { weekday, hour } = localParts(date, 'America/New_York')
  return weekday === 'Sat' || (weekday === 'Fri' && hour >= 17) || (weekday === 'Sun' && hour < 17)
}

export function isSessionOpen(session, date = new Date()) {
  if (isMarketWeekend(date)) return false
  const { weekday, hour } = localParts(date, session.zone)
  if (weekday === 'Sat' || weekday === 'Sun') return false
  return hour >= session.open && hour < session.close
}
