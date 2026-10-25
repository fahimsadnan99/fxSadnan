// Monthly high-impact forex news for the News Impact page.
// Central-bank meetings use their published dates (add next year's when they are announced).
// Monthly data releases are placed by their usual rule, so those dates are marked approximate.

// Each event: what it is, which currency it moves, how strong, and what a surprise usually does.
export const EVENTS = {
  fomc: {
    currency: 'USD',
    impact: 'high',
    title: { bn: 'FOMC সুদের হার সিদ্ধান্ত (ফেড)', en: 'FOMC rate decision (Fed)' },
    effect: {
      bn: 'রেট বাড়ালে বা কঠোর (hawkish) বার্তা দিলে USD শক্তিশালী হয়, গোল্ড (XAU/USD) ও EUR/USD নামে। রেট কমালে বা নরম (dovish) বার্তায় USD দুর্বল হয়, গোল্ড ওঠে। ঘোষণা ও প্রেস কনফারেন্সের সময় খুব বড় মুভ আর স্প্রেড বাড়ে।',
      en: 'A hike or hawkish tone strengthens USD and pushes gold (XAU/USD) and EUR/USD lower. A cut or dovish tone weakens USD and lifts gold. Expect large moves and wide spreads around the statement and press conference.',
    },
    pairs: ['EUR/USD', 'USD/JPY', 'XAU/USD', 'GBP/USD'],
  },
  ecb: {
    currency: 'EUR',
    impact: 'high',
    title: { bn: 'ECB সুদের হার সিদ্ধান্ত', en: 'ECB rate decision' },
    effect: {
      bn: 'রেট বাড়ালে বা hawkish বার্তায় EUR শক্তিশালী হয়, EUR/USD ওঠে। রেট কমালে বা dovish বার্তায় EUR/USD নামে। লাগার্দের প্রেস কনফারেন্সে দ্বিতীয় দফা মুভ হতে পারে।',
      en: 'A hike or hawkish message lifts EUR and EUR/USD. A cut or dovish message pushes EUR/USD lower. The press conference often brings a second wave of volatility.',
    },
    pairs: ['EUR/USD', 'EUR/GBP', 'EUR/JPY'],
  },
  boe: {
    currency: 'GBP',
    impact: 'high',
    title: { bn: 'BoE সুদের হার সিদ্ধান্ত', en: 'BoE rate decision' },
    effect: {
      bn: 'রেট বাড়ালে বা ভোটে hawkish ঝোঁক থাকলে GBP শক্তিশালী হয়, GBP/USD ওঠে। রেট কমালে বা বেশি সদস্য কমানোর পক্ষে ভোট দিলে GBP/USD নামে।',
      en: 'A hike or a hawkish vote split strengthens GBP and lifts GBP/USD. A cut, or more members voting to cut, pushes GBP/USD lower.',
    },
    pairs: ['GBP/USD', 'EUR/GBP', 'GBP/JPY'],
  },
  boj: {
    currency: 'JPY',
    impact: 'high',
    title: { bn: 'BoJ সুদের হার সিদ্ধান্ত', en: 'BoJ rate decision' },
    effect: {
      bn: 'রেট বাড়ালে বা নীতি কঠোর করার ইঙ্গিতে JPY শক্তিশালী হয়, USD/JPY হঠাৎ নামতে পারে। নীতি অপরিবর্তিত ও নরম থাকলে USD/JPY উপরে যেতে পারে।',
      en: 'A hike or a hint of tightening strengthens JPY and can drop USD/JPY sharply. Keeping policy loose tends to push USD/JPY higher.',
    },
    pairs: ['USD/JPY', 'EUR/JPY', 'GBP/JPY'],
  },
  nfp: {
    currency: 'USD',
    impact: 'high',
    title: { bn: 'নন-ফার্ম পেরোল (NFP) ও বেকারত্বের হার', en: 'Non-Farm Payrolls (NFP) & unemployment rate' },
    effect: {
      bn: 'চাকরি প্রত্যাশার চেয়ে বেশি হলে USD শক্তিশালী হয়, গোল্ড নামে। কম হলে বা বেকারত্ব বাড়লে USD দুর্বল হয়, গোল্ড ওঠে। মাসের সবচেয়ে ভোলাটাইল রিলিজগুলোর একটি।',
      en: 'More jobs than expected strengthens USD and weighs on gold. Fewer jobs or higher unemployment weakens USD and lifts gold. One of the most volatile releases of the month.',
    },
    pairs: ['EUR/USD', 'USD/JPY', 'XAU/USD', 'GBP/USD'],
  },
  cpi: {
    currency: 'USD',
    impact: 'high',
    title: { bn: 'যুক্তরাষ্ট্রের CPI (মূল্যস্ফীতি)', en: 'US CPI (inflation)' },
    effect: {
      bn: 'মূল্যস্ফীতি প্রত্যাশার চেয়ে বেশি হলে ফেড রেট বাড়ানোর/ধরে রাখার সম্ভাবনা বাড়ে — USD শক্তিশালী, গোল্ড দুর্বল। কম হলে রেট কমানোর আশা বাড়ে — USD দুর্বল, গোল্ড শক্তিশালী।',
      en: 'Hotter-than-expected inflation raises the odds of tighter Fed policy: USD up, gold down. Cooler inflation raises rate-cut hopes: USD down, gold up.',
    },
    pairs: ['EUR/USD', 'USD/JPY', 'XAU/USD'],
  },
  ppi: {
    currency: 'USD',
    impact: 'medium',
    title: { bn: 'যুক্তরাষ্ট্রের PPI (উৎপাদক মূল্য)', en: 'US PPI (producer prices)' },
    effect: {
      bn: 'উৎপাদন খরচ বেশি বাড়লে ভবিষ্যৎ মূল্যস্ফীতির ইঙ্গিত দেয় — সাধারণত USD-এর জন্য ইতিবাচক। প্রভাব CPI-র চেয়ে কম।',
      en: 'Rising producer prices hint at future inflation and usually support USD. The effect is smaller than CPI.',
    },
    pairs: ['EUR/USD', 'XAU/USD'],
  },
  retail: {
    currency: 'USD',
    impact: 'medium',
    title: { bn: 'যুক্তরাষ্ট্রের রিটেইল সেলস', en: 'US retail sales' },
    effect: {
      bn: 'ভোক্তা খরচ প্রত্যাশার চেয়ে বেশি হলে অর্থনীতি মজবুত — USD শক্তিশালী। কম হলে USD দুর্বল হতে পারে।',
      en: 'Stronger consumer spending signals a healthy economy and supports USD. A miss can weaken USD.',
    },
    pairs: ['EUR/USD', 'USD/JPY'],
  },
  ismMfg: {
    currency: 'USD',
    impact: 'medium',
    title: { bn: 'ISM ম্যানুফ্যাকচারিং PMI', en: 'ISM Manufacturing PMI' },
    effect: {
      bn: '৫০-এর উপরে মানে উৎপাদন খাত বাড়ছে, নিচে মানে সংকুচিত হচ্ছে। প্রত্যাশার চেয়ে ভালো হলে USD শক্তিশালী।',
      en: 'Above 50 means manufacturing is expanding, below 50 means it is shrinking. A beat supports USD.',
    },
    pairs: ['EUR/USD', 'USD/JPY'],
  },
  ismSvc: {
    currency: 'USD',
    impact: 'medium',
    title: { bn: 'ISM সার্ভিসেস PMI', en: 'ISM Services PMI' },
    effect: {
      bn: 'যুক্তরাষ্ট্রের অর্থনীতির বড় অংশ সার্ভিস খাত, তাই ৫০-এর উপরে ও প্রত্যাশার চেয়ে ভালো হলে USD শক্তিশালী হয়।',
      en: 'Services are most of the US economy, so a reading above 50 that beats forecasts supports USD.',
    },
    pairs: ['EUR/USD', 'USD/JPY'],
  },
  gdp: {
    currency: 'USD',
    impact: 'high',
    title: { bn: 'যুক্তরাষ্ট্রের GDP (প্রাথমিক)', en: 'US GDP (advance)' },
    effect: {
      bn: 'প্রবৃদ্ধি প্রত্যাশার চেয়ে বেশি হলে USD শক্তিশালী, কম হলে মন্দার ভয়ে USD দুর্বল ও গোল্ড শক্তিশালী হতে পারে।',
      en: 'Faster growth than expected supports USD. A miss raises recession worries, weakening USD and lifting gold.',
    },
    pairs: ['EUR/USD', 'USD/JPY', 'XAU/USD'],
  },
  pce: {
    currency: 'USD',
    impact: 'high',
    title: { bn: 'কোর PCE মূল্য সূচক', en: 'Core PCE price index' },
    effect: {
      bn: 'ফেডের পছন্দের মূল্যস্ফীতির মাপকাঠি। বেশি হলে USD শক্তিশালী ও গোল্ড দুর্বল, কম হলে উল্টো।',
      en: "The Fed's preferred inflation gauge. A hot reading supports USD and weighs on gold; a soft one does the opposite.",
    },
    pairs: ['EUR/USD', 'XAU/USD'],
  },
}

// Published 2026 meeting dates (decision day).
const FIXED = {
  fomc: ['2026-01-28', '2026-03-18', '2026-04-29', '2026-06-17', '2026-07-29', '2026-09-16', '2026-10-28', '2026-12-09'],
  ecb: ['2026-02-05', '2026-03-19', '2026-04-30', '2026-06-11', '2026-07-23', '2026-09-10', '2026-10-29', '2026-12-17'],
  boe: ['2026-02-05', '2026-03-19', '2026-04-30', '2026-06-18', '2026-07-30', '2026-09-17', '2026-11-05', '2026-12-17'],
  boj: ['2026-01-23', '2026-03-19', '2026-04-28', '2026-06-16', '2026-07-31', '2026-09-18', '2026-10-30', '2026-12-18'],
}

const isWeekday = (d) => d.getDay() !== 0 && d.getDay() !== 6

function nthWeekday(year, month, weekday, n) {
  const d = new Date(year, month, 1)
  while (d.getDay() !== weekday) d.setDate(d.getDate() + 1)
  d.setDate(d.getDate() + 7 * (n - 1))
  return d
}

function lastWeekday(year, month, weekday) {
  const d = new Date(year, month + 1, 0)
  while (d.getDay() !== weekday) d.setDate(d.getDate() - 1)
  return d
}

function nthBusinessDay(year, month, n) {
  const d = new Date(year, month, 1)
  let count = 0
  for (;;) {
    if (isWeekday(d) && ++count === n) return d
    d.setDate(d.getDate() + 1)
  }
}

// The usual business day on or after a given date of the month.
function businessDayFrom(year, month, day) {
  const d = new Date(year, month, day)
  while (!isWeekday(d)) d.setDate(d.getDate() + 1)
  return d
}

// Rules for monthly releases; month is 0-based here, like Date.
const RECURRING = [
  { id: 'ismMfg', date: (y, m) => nthBusinessDay(y, m, 1) },
  { id: 'ismSvc', date: (y, m) => nthBusinessDay(y, m, 3) },
  { id: 'nfp', date: (y, m) => nthWeekday(y, m, 5, 1) },
  { id: 'cpi', date: (y, m) => nthWeekday(y, m, 3, 2) },
  // PPI usually follows CPI by a day.
  { id: 'ppi', date: (y, m) => nthWeekday(y, m, 4, 2 + (nthWeekday(y, m, 3, 2).getDate() > nthWeekday(y, m, 4, 2).getDate())) },
  { id: 'retail', date: (y, m) => businessDayFrom(y, m, 15) },
  // Advance GDP only comes out in the month after each quarter ends.
  { id: 'gdp', date: (y, m) => ([0, 3, 6, 9].includes(m) ? lastWeekday(y, m, 4) : null) },
  { id: 'pce', date: (y, m) => lastWeekday(y, m, 5) },
]

const pad = (n) => String(n).padStart(2, '0')
const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

// All events in a month, sorted by date, high impact first within a day.
export function eventsForMonth(year, month) {
  const prefix = `${year}-${pad(month + 1)}-`
  const list = []

  for (const [id, dates] of Object.entries(FIXED))
    for (const date of dates) if (date.startsWith(prefix)) list.push({ id, date, approx: false, ...EVENTS[id] })

  for (const { id, date } of RECURRING) {
    const d = date(year, month)
    if (d) list.push({ id, date: toKey(d), approx: true, ...EVENTS[id] })
  }

  const rank = { high: 0, medium: 1 }
  return list.sort((a, b) => a.date.localeCompare(b.date) || rank[a.impact] - rank[b.impact])
}

// Whether we have the published central-bank dates for this year.
export const hasFixedDates = (year) => Object.values(FIXED).some((dates) => dates.some((d) => d.startsWith(`${year}-`)))
