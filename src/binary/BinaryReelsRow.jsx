import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { reelPoster } from '../lib/video'
import ReelPlayer from '../components/ReelPlayer'
import { ALL_LESSONS } from './courses'
import { titleOf } from './useEdits'
import { reelFor } from './reels'

// Row of the Binary lessons' reels (same look as the Forex reels row); tapping one plays it
// full-screen with sound and links to its lesson.
export default function BinaryReelsRow({ edits, title, grid = false }) {
  const { lang, t } = useLang()
  const [open, setOpen] = useState(null)
  const reels = ALL_LESSONS.filter((l) => reelFor(l.slug, lang))

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(null)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  if (!reels.length) return null
  const pathOf = (l) => (l.course ? `/binary/${l.course.id}/${l.slug}` : `/binary/${l.slug}`)

  return (
    <section className="section">
      {title !== false && (
        <h2 className="section-title">
          <span>🎬 {t('reels')}</span>
        </h2>
      )}
      <div className={grid ? 'topic-grid' : 'reels-row'}>
        {reels.map((l) => (
          <button key={l.slug} className="reel-card" onClick={() => setOpen(l)}>
            <img src={reelPoster(reelFor(l.slug, lang))} alt="" loading="lazy" />
            <span className="reel-play" aria-hidden="true">
              ▶
            </span>
            <span className="reel-card-title">{titleOf(l, lang, edits)}</span>
          </button>
        ))}
      </div>

      {open && (
        <div className="reel-modal" role="dialog" aria-modal="true" onClick={() => setOpen(null)}>
          <div className="reel-modal-inner" onClick={(e) => e.stopPropagation()}>
            <button className="reel-close" onClick={() => setOpen(null)} aria-label={t('close')}>
              ✕
            </button>
            <ReelPlayer key={open.slug} url={reelFor(open.slug, lang)} autoPlay />
            <Link to={pathOf(open)} className="btn btn-primary reel-read">
              {t('readLesson')} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      )}
    </section>
  )
}
