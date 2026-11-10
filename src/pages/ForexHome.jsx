import { useEffect, useState } from 'react'
import PostCard from '../components/PostCard'
import ReelsRow from '../components/ReelsRow'
import Loader from '../components/Loader'
import { useLang } from '../context/LangContext'
import { listPublishedPosts } from '../lib/posts'

// Forex section landing: its reels, then the newest post featured and the rest below.
export default function ForexHome() {
  const { t } = useLang()
  const [posts, setPosts] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    listPublishedPosts()
      .then(setPosts)
      .catch((e) => setError(e.message))
  }, [])

  const [featured, ...rest] = posts ?? []

  return (
    <main className="container page-pad">
      <header className="news-head">
        <h1>{t('forex')}</h1>
        <p className="news-intro">{t('forexDesc')}</p>
      </header>
      {error && <p className="error">{error}</p>}
      {!posts && !error && <Loader />}
      {posts && posts.length === 0 && <p className="muted center">{t('noPosts')}</p>}

      <div id="posts" />
      {posts && <ReelsRow posts={posts} />}
      {featured && (
        <section className="section">
          <h2 className="section-title">
            <span>{t('featured')}</span>
          </h2>
          <PostCard post={featured} featured />
        </section>
      )}

      {rest.length > 0 && (
        <section className="section">
          <h2 className="section-title">
            <span>{t('latest')}</span>
          </h2>
          <div className="grid">
            {rest.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
