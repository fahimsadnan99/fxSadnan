import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import DOMPurify from 'dompurify'
import { useLang } from '../context/LangContext'
import { formatDate, getPost, listPublishedPosts, pickVersion, reelOf } from '../lib/posts'
import { SIZES, withResponsiveImages } from '../lib/images'
import Cover from '../components/Cover'
import ReelPlayer from '../components/ReelPlayer'
import Loader from '../components/Loader'

export default function PostPage() {
  const { id } = useParams()
  const { lang, t } = useLang()
  const [post, setPost] = useState(undefined)
  const [all, setAll] = useState([])

  // Fetched once; used to find the posts either side of this one.
  useEffect(() => {
    listPublishedPosts()
      .then(setAll)
      .catch(() => {})
  }, [])

  useEffect(() => {
    setPost(undefined)
    window.scrollTo(0, 0)
    // Unpublished posts are blocked by Firestore rules for readers, which surfaces as an error.
    getPost(id)
      .then((p) => setPost(p?.deleted ? null : p))
      .catch(() => setPost(null))
  }, [id])

  if (post === undefined) return <Loader page />
  if (post === null) return <Navigate to="/" replace />

  const v = pickVersion(post, lang)
  // Same order as the home feed (newest first): previous = newer, next = older.
  const i = all.findIndex((p) => p.id === post.id)
  const prev = i > 0 ? all[i - 1] : null
  const next = i >= 0 && i < all.length - 1 ? all[i + 1] : null

  return (
    <main className="page-pad">
      <div className="container narrow post-top">
        <Link to="/" className="back-link">
          {t('back')}
        </Link>
      </div>

      <article lang={v.lang}>
        <header className="container narrow post-header">
          {v.topic && <span className="kicker">{v.topic}</span>}
          <h1 className="post-title">{v.title}</h1>
          <div className="post-byline">
            <span className="byline-author">FxSadnan</span>
            <span className="dot-sep" />
            <time>{formatDate(post.createdAt, lang)}</time>
          </div>
        </header>

        {post.coverUrl && (
          <div className="container wide">
            <Cover post={post} className="post-cover" sizes={SIZES.postCover} eager />
          </div>
        )}

        <div className="container narrow">
          {v.isFallback && <p className="notice">{t('fallback')}</p>}

          {reelOf(post) && (
            <div className="post-reel">
              <span className="kicker">🎬 {t('reels')}</span>
              <ReelPlayer url={reelOf(post)} />
            </div>
          )}

          <div className="prose post-body" dangerouslySetInnerHTML={{ __html: withResponsiveImages(DOMPurify.sanitize(v.content)) }} />

          {v.keyPoints.length > 0 && (
            <aside className="keypoints">
              <h2>{t('keyPoints')}</h2>
              <ul>
                {v.keyPoints.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </aside>
          )}

          <div className="post-end">
            <span className="end-line" aria-hidden="true" />
          </div>

          {(prev || next) && (
            <nav className="post-nav" aria-label={`${t('prevPost')} / ${t('nextPost')}`}>
              {prev ? (
                <Link to={`/post/${prev.id}`} className="post-nav-link prev">
                  <span className="post-nav-label">← {t('prevPost')}</span>
                  <span className="post-nav-title">{pickVersion(prev, lang).title}</span>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link to={`/post/${next.id}`} className="post-nav-link next">
                  <span className="post-nav-label">{t('nextPost')} →</span>
                  <span className="post-nav-title">{pickVersion(next, lang).title}</span>
                </Link>
              )}
            </nav>
          )}
        </div>
      </article>
    </main>
  )
}
