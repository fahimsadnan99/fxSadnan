import { Link } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { formatDate, pickVersion } from '../lib/posts'
import { SIZES } from '../lib/images'
import Cover from './Cover'

// `featured` renders the large horizontal card used for the newest post on the home page.
export default function PostCard({ post, featured = false }) {
  const { lang, t } = useLang()
  const v = pickVersion(post, lang)

  return (
    <Link to={`/post/${post.id}`} className={featured ? 'card card-featured' : 'card'} lang={v.lang}>
      <div className="card-img">
        {post.coverUrl ? (
          <Cover post={post} sizes={featured ? SIZES.featured : SIZES.card} eager={featured} />
        ) : (
          <div className="card-img-empty">Fx</div>
        )}
      </div>
      <div className="card-body">
        <div className="card-meta">
          {v.topic && <span className="kicker">{v.topic}</span>}
          <time>{formatDate(post.createdAt, lang)}</time>
        </div>
        <h3 className="card-title">{v.title}</h3>
        {featured && v.keyPoints[0] && <p className="card-excerpt">{v.keyPoints[0]}</p>}
        <span className="read-more">
          {t('readMore')} <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  )
}
