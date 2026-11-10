import { diagrams } from './component/Sketch/diagrams'

// Title-image data for every Binary lesson, in the style of the Forex post covers:
// a big English headline and the lesson's own sketch, animated.
// `big` is the headline, `sketch` names a diagram in diagrams.js (or EXTRA below), `h` is the hue.

const seq = (list, start = 0) => list.map(([o, c, h, l], k) => [o, c, h, l, { i: start + k }])

// Diagrams for the lessons that have no sketch of their own.
const EXTRA = {
  trapThree: {
    dx: 52,
    x0: 50,
    c: seq([
      [82, 68, 86, 64],
      [68, 56, 70, 52],
      [56, 46, 58, 42],
      [46, 52, 54, 20],
      [52, 64, 66, 50],
      [64, 78, 82, 62],
    ]),
    o: [{ a: [3, 28], r: 15, tone: 'amber' }],
    t: [
      { a: [2.5, 104], t: 'Trap 3 · at the start of a structure', tone: 'bull', big: true },
      { a: [3, 8], t: 'sellers exhausted inside the wick', tone: 'amber' },
    ],
    ar: [{ a: [4.5, 70], b: [5.3, 88], tone: 'bull' }],
  },
  trapSeven: {
    dx: 40,
    x0: 40,
    c: seq([
      [56, 62, 66, 54],
      [62, 58, 66, 56],
      [58, 64, 68, 56],
      [64, 60, 68, 58],
      [60, 66, 72, 58],
      [66, 62, 70, 60],
      [62, 30, 64, 28],
      [30, 22, 32, 18],
    ]),
    z: [{ a: [-0.5, 52], b: [5.5, 74], tone: 'soft' }],
    o: [{ a: [6, 46], r: 16, tone: 'amber' }],
    t: [
      { a: [2.5, 90], t: 'read the 6–10 candles around it', tone: 'soft' },
      { a: [6.2, 8], t: 'a big candle shows the exhaustion', tone: 'bear' },
      { a: [3.5, 104], t: 'Trap 7 · situation based', tone: 'amber', big: true },
    ],
  },
  allLevels: {
    dx: 40,
    x0: 50,
    c: seq([
      [30, 44, 48, 28],
      [44, 60, 64, 42],
      [60, 52, 66, 48],
      [52, 72, 80, 50],
      [72, 62, 78, 58],
      [62, 48, 64, 44],
      [48, 36, 50, 30],
      [36, 56, 58, 34],
    ]),
    l: [
      { a: [-1, 80], b: [8.2, 80], tone: 'bear' },
      { a: [-1, 30], b: [8.2, 30], tone: 'bull' },
      { a: [-1, 56], b: [8.2, 56], tone: 'amber' },
      { a: [0, 28], b: [3, 50], k: 'trend', tone: 'bull' },
    ],
    t: [
      { a: [8.2, 83], t: 'resistance level', tone: 'bear', anchor: 'end' },
      { a: [8.2, 59], t: 'round number', tone: 'amber', anchor: 'end' },
      { a: [8.2, 22], t: 'support level', tone: 'bull', anchor: 'end' },
      { a: [3.6, 104], t: 'SCL · DCL · TCL · Zone · Trend', tone: 'amber', big: true },
    ],
  },
  analysis: {
    dx: 40,
    x0: 44,
    c: seq([
      [30, 42, 44, 28],
      [42, 38, 46, 36],
      [38, 56, 58, 36],
      [56, 64, 68, 54],
      [64, 61, 66, 59],
      [61, 74, 76, 58],
      [74, 70, 78, 66],
      [70, 84, 88, 68],
    ]),
    l: [{ a: [-0.8, 42], b: [8, 42], tone: 'amber' }],
    o: [
      { a: [1, 40], r: 13, tone: 'amber' },
      { a: [4, 62], r: 13, tone: 'amber' },
      { a: [7, 80], r: 13, tone: 'amber' },
    ],
    t: [
      { a: [1, 24], t: '1 · colour change level', tone: 'amber' },
      { a: [4, 46], t: '2 · inside bar', tone: 'soft' },
      { a: [6.4, 94], t: '3 · trade', tone: 'bull' },
      { a: [3.5, 104], t: 'Put every level together', tone: 'amber', big: true },
    ],
  },
  psychology: {
    dx: 42,
    x0: 40,
    c: seq([
      [50, 26, 54, 22],
      [26, 68, 72, 24],
      [68, 34, 72, 30],
      [34, 60, 64, 32],
      [56, 60, 62, 54],
      [60, 64, 66, 58],
      [64, 68, 70, 62],
      [68, 72, 74, 66],
    ]),
    l: [{ a: [3.5, 8], b: [3.5, 92], k: 'thin', tone: 'soft' }],
    t: [
      { a: [1.5, 8], t: 'fear · greed', tone: 'bear' },
      { a: [5.5, 86], t: 'discipline · patience', tone: 'bull' },
      { a: [3.5, 104], t: 'Emotional vs logical trading', tone: 'amber', big: true },
    ],
  },
  'money-management': {
    dx: 40,
    x0: 48,
    c: seq([
      [20, 24, 25, 19],
      [24, 28, 29, 23],
      [28, 33, 34, 27],
      [33, 39, 40, 32],
      [39, 46, 47, 38],
      [46, 55, 57, 45],
      [55, 66, 68, 54],
      [66, 80, 82, 65],
    ]),
    p: [{ pts: [[0, 24], [2, 33], [4, 46], [5, 55], [6, 66], [7, 80]], tone: 'amber' }],
    l: [{ a: [-1, 12], b: [8, 12], tone: 'bear' }],
    t: [
      { a: [-0.6, 90], t: ['1–3% risk per trade', '+5% a day, compounded'], tone: 'bull', anchor: 'start' },
      { a: [8, 4], t: 'daily stop: 2 losses', tone: 'bear', anchor: 'end' },
      { a: [3.5, 104], t: 'Survive first, then compound', tone: 'amber', big: true },
    ],
  },
}

const COVERS = {
  // Master Class (OTC)
  candleInformation: { big: 'Candle Info', sketch: 'anatomy', h: 200 },
  strongCandle: { big: 'Strong Candle', sketch: 'strongCandle', h: 150 },
  weakCandle: { big: 'Weak Candle', sketch: 'weakCandle', h: 5 },
  symmetrical: { big: 'Symmetrical', sketch: 'symmetrical', h: 240 },
  orderFlow: { big: 'Order Flow', sketch: 'orderFlow', h: 160 },
  disOrderFlow: { big: 'Disorder Flow', sketch: 'disorderFlow', h: 350 },
  normalMarket: { big: 'Normal Market', sketch: 'strongMarket', h: 210 },
  pressureMarket: { big: 'Pressure Market', sketch: 'pressureMarket', h: 20 },
  weakMarket: { big: 'Weak Market', sketch: 'weakMarket', h: 0 },
  marketStrength: { big: 'Market Strength', sketch: 'marketStrength', h: 170 },
  trend: { big: 'Trend', sketch: 'trend', h: 150 },
  openArea: { big: 'Open Area', sketch: 'openArea', h: 205 },
  strongReflection: { big: 'Normal Reflection', sketch: 'reflection', h: 150 },
  pressureReflection: { big: 'Pressure Reflection', sketch: 'pressureReflection', h: 25 },
  weakReflection: { big: 'Weak Reflection', sketch: 'weakReflection', h: 280 },
  directionalizom: { big: 'Direction', sketch: 'direction', h: 200 },
  trapAbsent: { big: 'Trap Absent', sketch: 'trapAbsent', h: 310 },
  trapOne: { big: 'Trap 1', sketch: 'trapOne', h: 340 },
  trapTwo: { big: 'Trap 2', sketch: 'trapTwo', h: 20 },
  trapThree: { big: 'Trap 3', sketch: 'trapThree', h: 45 },
  trapFour: { big: 'Trap 4', sketch: 'trapFour', h: 160 },
  trapFive: { big: 'Trap 5', sketch: 'trapFive', h: 200 },
  trapSix: { big: 'Trap 6', sketch: 'trapSix', h: 260 },
  trapSeven: { big: 'Trap 7', sketch: 'trapSeven', h: 300 },
  miniZone: { big: 'Mini Zone', sketch: 'miniZone', h: 50 },
  'influence&Hints': { big: 'Influence & Hints', sketch: 'influence', h: 190 },
  liquidity: { big: 'Liquidity', sketch: 'liquidityBasic', h: 215 },
  liquidityHunt: { big: 'Liquidity Hunt', sketch: 'sellSweep', h: 350 },
  sellSideLiquidity: { big: 'Sell-Side Liquidity', sketch: 'sellSweep', h: 5 },
  buySideLiquidity: { big: 'Buy-Side Liquidity', sketch: 'buySweep', h: 155 },
  pressureGenerate: { big: 'Pressure Generate', sketch: 'pressureGenerate', h: 30 },
  'measurement&DemandArea': { big: 'Demand Area', sketch: 'demandMeasure', h: 150 },
  'measurement&SupplyArea': { big: 'Supply Area', sketch: 'supplyMeasure', h: 0 },
  areaFillUp: { big: 'Area Fill-up', sketch: 'areaFill', h: 45 },
  fiveSecConfirmation: { big: '5 Sec Confirmation', sketch: 'fiveSec', h: 190 },
  optimalPressure: { big: 'Optimal Pressure', sketch: 'optimalPressure', h: 170 },
  // Price Action
  priceAction1: { big: 'Price Action', sketch: 'bounceBuy', h: 160 },
  candleIdentification: { big: 'Candle Patterns', sketch: 'engulfBull', h: 170 },
  allLevels: { big: 'All Levels', sketch: 'allLevels', h: 260 },
  'support&Resistance': { big: 'Support & Resistance', sketch: 'supportZone', h: 340 },
  scl: { big: 'SCL', sketch: 'singleLevels', h: 190 },
  dcl: { big: 'DCL', sketch: 'outsideBar', h: 215 },
  tcl: { big: 'TCL', sketch: 'morningStar', h: 150 },
  internalStructure: { big: 'Internal Structure', sketch: 'internalStructure', h: 230 },
  zone: { big: 'Zone', sketch: 'buyZone', h: 35 },
  chart1: { big: 'M & W', sketch: 'mw', h: 200 },
  chart2: { big: 'Head & Shoulders', sketch: 'headShoulders', h: 280 },
  roundNumber: { big: 'Round Number', sketch: 'roundNumber', h: 42 },
  reaction: { big: 'Reaction', sketch: 'reaction', h: 20 },
  analysis: { big: 'Analysis', sketch: 'analysis', h: 300 },
  // Single articles
  psychology: { big: 'Psychology', sketch: 'psychology', h: 280 },
  'money-management': { big: 'Money Management', sketch: 'money-management', h: 140 },
}

// { big, spec, h } for a lesson key or article id; null when there is none.
export function coverFor(key) {
  const c = COVERS[key]
  if (!c) return null
  const spec = EXTRA[c.sketch] ?? diagrams[c.sketch]
  return spec ? { ...c, spec } : null
}
