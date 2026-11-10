import { useEffect, useRef, useState } from 'react'

// A course's own photo, animated. The title that was printed on the photo has been removed
// from the image (assets/img/covers/*-clean.jpg) and is drawn again here as text, in the same
// place, so the letters can move: they rise in one by one, then keep a gentle wave and a colour
// sweep. The photo drifts slowly (Ken Burns) under a light sweep and a soft glow.
// Animates only while on screen; still for visitors who prefer reduced motion.

// Title lines per course: text, centre (x, y in % of the 4:3 photo), size (% of photo width).
const TITLES = {
  'price-action': [{ text: 'PRICE ACTION', x: 52, y: 56.5, size: 9.4, tone: 'pa' }],
  'master-class': [
    { text: 'MASTER CLASS', x: 49.5, y: 53, size: 11.3, tone: 'mc' },
    { text: '(OTC)', x: 49.5, y: 69.5, size: 6.6, tone: 'mc-sub' },
  ],
  psychology: [{ text: 'PSYCHOLOGY', x: 49, y: 78, size: 13.4, tone: 'psy' }],
  'money-management': [
    { text: 'Money', x: 48.5, y: 40, size: 12.5, tone: 'money' },
    { text: 'Management', x: 48, y: 53.5, size: 8.6, tone: 'mgmt' },
  ],
}

export default function CourseCover({ id, src, hue = 160, className = '' }) {
  const ref = useRef(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setPlaying(e.isIntersecting), { rootMargin: '80px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  let n = 0
  return (
    <div ref={ref} className={`ccover ${className}`} data-play={playing ? '' : undefined} style={{ '--h': hue }} aria-hidden="true">
      <div className="ccover-frame">
        <img className="ccover-img" src={src} alt="" />
        <span className="ccover-glow" />
        {(TITLES[id] ?? []).map((line) => (
          <span
            key={line.text}
            className={`cc-line cc-${line.tone}`}
            style={{ left: `${line.x}%`, top: `${line.y}%`, fontSize: `${line.size}cqw` }}
          >
            {[...line.text].map((ch, k) =>
              ch === ' ' ? (
                <span key={k} className="cc-space" />
              ) : (
                <span key={k} className="cc-l" style={{ '--i': n++, '--k': k }}>
                  <i>{ch}</i>
                </span>
              ),
            )}
          </span>
        ))}
        <span className="ccover-shine" />
      </div>
    </div>
  )
}
