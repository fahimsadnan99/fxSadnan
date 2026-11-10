import { useEffect, useRef, useState } from 'react'
import { SketchSvg } from './component/Sketch/Sketch'
import { coverFor } from './covers'

// Animated title image for a Binary lesson, made like the Forex post covers: a kicker pill,
// a big English headline, the Bangla title, and the lesson's sketch building up candle by
// candle on the right. It only animates while on screen. `kicker` is [lead, main].
export default function LessonCover({ coverKey, kicker, subtitle, subtitleLang = 'bn', chips = [], className = '' }) {
  const ref = useRef(null)
  const [playing, setPlaying] = useState(false)
  const cover = coverFor(coverKey)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setPlaying(e.isIntersecting), { rootMargin: '80px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  if (!cover) return null
  const len = cover.big.length
  // The headline has 40% of the width: shorter words can be bigger.
  const size = len > 14 ? 'xl' : len > 8 ? 'lg' : 'md'

  return (
    <div
      ref={ref}
      className={`lcover ${className}`}
      data-play={playing ? '' : undefined}
      style={{ '--h': cover.h }}
      aria-hidden="true"
    >
      <div className="lcover-left">
        <span className="lcover-pill">
          <span className="lcover-pill-dot" />
          <span>
            <span className="lcover-pill-lead">{kicker[0]}</span>
            {kicker[1]}
          </span>
        </span>
        <span className={`lcover-title lcover-title--${size}`}>{cover.big}</span>
        {subtitle && (
          <span className="lcover-sub" lang={subtitleLang}>
            {subtitle}
          </span>
        )}
        {chips.length > 0 && (
          <span className="lcover-chips">
            {chips.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </span>
        )}
      </div>
      <div className="lcover-panel">
        <SketchSvg spec={cover.spec} className="lcover-svg" />
      </div>
      <span className="lcover-mark">
        <i>Fx</i>Sadnan
      </span>
    </div>
  )
}
