import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { pickVersion, reelOf } from '../lib/posts'
import { reelPoster } from '../lib/video'
import ReelPlayer from './ReelPlayer'

// Instagram-style row of reels (or a wrapping grid with `grid`); tapping one opens it full-screen with sound.
export default function ReelsRow({ posts, title, grid = false }) {
  const { lang, t } = useLang()
  const [open, setOpen] = useState(null)

  const reels = posts
    .map((post) => ({ post, v: pickVersion(post, lang), url: reelOf(post) }))
    .filter(({ url }) => url)

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

  return (
    <section className="section">
      <h2 className="section-title">
        <span>{title ?? `🎬 ${t('reels')}`}</span>
      </h2>
      <div className={grid ? 'topic-grid' : 'reels-row'}>
        {reels.map(({ post, v, url }) => (
          <button key={post.id} className="reel-card" onClick={() => setOpen({ post, url })} lang={v.lang}>
            <img src={reelPoster(url)} alt="" loading="lazy" />
            <span className="reel-play" aria-hidden="true">
              ▶
            </span>
            <span className="reel-card-title">{v.title}</span>
          </button>
        ))}
      </div>

      {open && (
        <div className="reel-modal" role="dialog" aria-modal="true" onClick={() => setOpen(null)}>
          <div className="reel-modal-inner" onClick={(e) => e.stopPropagation()}>
            <button className="reel-close" onClick={() => setOpen(null)} aria-label={t('close')}>
              ✕
            </button>
            <ReelPlayer key={open.url} url={open.url} autoPlay />
            <Link to={`/post/${open.post.id}`} className="btn btn-primary reel-read">
              {t('readPost')} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      )}
    </section>
  )
}
