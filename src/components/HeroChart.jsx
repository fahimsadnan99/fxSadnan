// Decorative candlestick chart drawn behind the home page masthead.
// Uses a fixed seed so the chart looks the same on every visit.
function makeCandles(count) {
  let seed = 7
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  const candles = []
  let price = 60
  for (let i = 0; i < count; i++) {
    const open = price
    const drift = 0.35 + Math.sin(i / 6) * 1.2
    const close = open + (rand() - 0.45) * 9 + drift
    const high = Math.max(open, close) + rand() * 4
    const low = Math.min(open, close) - rand() * 4
    candles.push({ open, close, high, low })
    price = close
  }
  return candles
}

const CANDLES = makeCandles(48)
const W = 1200
const H = 320
const STEP = W / CANDLES.length

export default function HeroChart() {
  const values = CANDLES.flatMap((c) => [c.high, c.low])
  const min = Math.min(...values)
  const max = Math.max(...values)
  const y = (v) => H - 20 - ((v - min) / (max - min)) * (H - 40)
  const trend = CANDLES.map((c, i) => `${i * STEP + STEP / 2},${y((c.open + c.close) / 2)}`).join(' ')

  return (
    <svg className="hero-chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} className="hero-grid" />
      ))}
      {CANDLES.map((c, i) => {
        const x = i * STEP + STEP / 2
        const up = c.close >= c.open
        const top = y(Math.max(c.open, c.close))
        const bodyH = Math.max(2, Math.abs(y(c.open) - y(c.close)))
        return (
          <g key={i} className={up ? 'hc-up' : 'hc-down'}>
            <line x1={x} x2={x} y1={y(c.high)} y2={y(c.low)} />
            <rect x={x - STEP * 0.3} y={top} width={STEP * 0.6} height={bodyH} rx="1.5" />
          </g>
        )
      })}
      <polyline points={trend} className="hero-trend" />
    </svg>
  )
}
