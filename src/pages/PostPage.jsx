import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import DOMPurify from 'dompurify'
import { useLang } from '../context/LangContext'
import { formatDate, getPost, pickVersion, reelOf } from '../lib/posts'
import { SIZES, withResponsiveImages } from '../lib/images'
import Cover from '../components/Cover'
import ReelPlayer from '../components/ReelPlayer'
import Loader from '../components/Loader'

export default function PostPage() {
  const { id } = useParams()
  const { lang, t } = useLang()
  const [post, setPost] = useState(undefined)

  useEffect(() => {
    setPost(undefined)
    // Unpublished posts are blocked by Firestore rules for readers, which surfaces as an error.
    getPost(id)
      .then((p) => setPost(p?.deleted ? null : p))
      .catch(() => setPost(null))
  }, [id])

  if (post === undefined) return <Loader page />
  if (post === null) return <Navigate to="/" replace />

  const v = pickVersion(post, lang)

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
        </div>
      </article>
    </main>
  )
}
