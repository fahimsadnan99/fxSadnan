import { useEffect, useState } from 'react'
import PostCard from '../components/PostCard'
import Loader from '../components/Loader'
import { useLang } from '../context/LangContext'
import { listPublishedPosts } from '../lib/posts'

// All posts in one grid, oldest first.
export default function Posts() {
  const { t } = useLang()
  const [posts, setPosts] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    listPublishedPosts()
      .then((all) => setPosts(all.reverse()))
      .catch((e) => setError(e.message))
  }, [])

  return (
    <main className="container page-pad">
      <header className="news-head">
        <h1>{t('posts')}</h1>
        <p className="news-intro">{t('postsIntro')}</p>
      </header>

      {error && <p className="error">{error}</p>}
      {!posts && !error && <Loader />}
      {posts && posts.length === 0 && <p className="muted center">{t('noPosts')}</p>}

      {posts?.length > 0 && (
        <section className="section">
          <div className="topic-grid">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
