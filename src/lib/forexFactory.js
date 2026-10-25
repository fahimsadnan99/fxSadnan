import { FF_DATA_URL } from '../config'
import { EVENTS } from './newsCalendar'

// ForexFactory calendar data, copied every few hours by .github/workflows/forexfactory.yml into the
// `ff-data` branch (the ForexFactory feed itself can't be fetched from a browser).

// ForexFactory titles we have a hand-written explanation for.
const MATCHERS = [
  ['USD', /^Federal Funds Rate$/, 'fomc'],
  ['EUR', /^Main Refinancing Rate$/, 'ecb'],
  ['GBP', /^Official Bank Rate$/, 'boe'],
  ['JPY', /^BOJ Policy Rate$/, 'boj'],
  ['USD', /^Non-Farm Employment Change$/, 'nfp'],
  ['USD', /^(Core )?CPI m\/m$/, 'cpi'],
  ['USD', /^(Core )?PPI m\/m$/, 'ppi'],
  ['USD', /^(Core )?Retail Sales m\/m$/, 'retail'],
  ['USD', /^ISM Manufacturing PMI$/, 'ismMfg'],
  ['USD', /^ISM Services PMI$/, 'ismSvc'],
  ['USD', /^Advance GDP q\/q$/, 'gdp'],
  ['USD', /^Core PCE Price Index m\/m$/, 'pce'],
]

// For these a lower number is good for the currency.
const INVERSE = /unemployment|claimant|jobless|claims/i

const PAIRS = {
  USD: ['EUR/USD', 'USD/JPY', 'XAU/USD'],
  EUR: ['EUR/USD', 'EUR/GBP', 'EUR/JPY'],
  GBP: ['GBP/USD', 'EUR/GBP', 'GBP/JPY'],
  JPY: ['USD/JPY', 'EUR/JPY'],
  AUD: ['AUD/USD', 'AUD/JPY'],
  NZD: ['NZD/USD'],
  CAD: ['USD/CAD'],
  CHF: ['USD/CHF'],
}

const IMPACT = { High: 'high', Medium: 'medium' }

const pad = (n) => String(n).padStart(2, '0')
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

function toEvent(row) {
  const when = new Date(row.date)
  const match = MATCHERS.find(([cur, re]) => cur === row.country && re.test(row.title))
  const known = match && EVENTS[match[2]]
  return {
    id: `ff-${row.country}-${slug(row.title)}`,
    // Links the event to its expert outlook entry (date as in the feed, New York time).
    outlookKey: `${row.date.slice(0, 10)}|${row.country}|${row.title}`,
    // Grouped by the viewer's own calendar day.
    date: `${when.getFullYear()}-${pad(when.getMonth() + 1)}-${pad(when.getDate())}`,
    when,
    currency: row.country,
    impact: IMPACT[row.impact],
    title: known ? { bn: `${known.title.bn} — ${row.title}`, en: row.title } : { bn: row.title, en: row.title },
    effect: known?.effect ?? null,
    pairs: known?.pairs ?? PAIRS[row.country] ?? [],
    inverse: INVERSE.test(row.title),
    source: 'ff',
  }
}

const cache = {}

// { weeks: [[first, last], ...], events: [...] } for one month; empty when there is no data yet.
export function loadFFMonth(year, month) {
  const key = `${year}-${pad(month + 1)}`
  cache[key] ??= fetch(`${FF_DATA_URL}/months/${key}.json`)
    .then((res) => (res.ok ? res.json() : { weeks: [], events: [] }))
    .then((data) => ({
      weeks: data.weeks,
      events: data.events
        .filter((row) => IMPACT[row.impact])
        .map(toEvent)
        .filter((e) => e.date.startsWith(key)),
    }))
    .catch((err) => {
      delete cache[key]
      throw err
    })
  return cache[key]
}

const outlookCache = {}

// Expert previews for one month: { updated, byKey: { "date|country|title": entry } }. Entries are filed by New York date,
// and a late-evening New York event can fall on the next local day, so the previous month is read too.
export function loadOutlook(year, month) {
  const files = [-1, 0].map((step) => {
    const d = new Date(year, month + step, 1)
    const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
    outlookCache[key] ??= fetch(`${FF_DATA_URL}/outlook/${key}.json`)
      .then((res) => (res.ok ? res.json() : { entries: [] }))
      .catch(() => {
        delete outlookCache[key]
        return { entries: [] }
      })
    return outlookCache[key]
  })
  return Promise.all(files).then((all) => ({
    updated: all.map((f) => f.updated).filter(Boolean).sort().at(-1) ?? null,
    byKey: Object.fromEntries(all.flatMap((f) => f.entries.flatMap((entry) => entry.keys.map((k) => [k, entry])))),
  }))
}

export const isCovered = (weeks, date) => weeks.some(([first, last]) => date >= first && date <= last)
