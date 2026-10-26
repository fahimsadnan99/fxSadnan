import { useEffect, useState } from 'react'
import PostCard from '../components/PostCard'
import TopicFilter from '../components/TopicFilter'
import Loader from '../components/Loader'
import { useLang } from '../context/LangContext'
import { listPublishedPosts, topicsOf } from '../lib/posts'

// All posts in one grid, oldest first, filterable by topic.
export default function Posts() {
  const { lang, t } = useLang()
  const [posts, setPosts] = useState(null)
  const [error, setError] = useState('')
  const [topic, setTopic] = useState('')

  useEffect(() => {
    listPublishedPosts()
      .then((all) => setPosts(all.reverse()))
      .catch((e) => setError(e.message))
  }, [])

  // Topic names differ per language, so reset the filter when the language changes.
  useEffect(() => setTopic(''), [lang])

  const { topics, visible } = topicsOf(posts ?? [], lang, topic)

  return (
    <main className="container page-pad">
      <header className="news-head">
        <h1>{t('posts')}</h1>
        <p className="news-intro">{t('postsIntro')}</p>
      </header>

      <TopicFilter topics={topics} topic={topic} onChange={setTopic} />

      {error && <p className="error">{error}</p>}
      {!posts && !error && <Loader />}
      {posts && posts.length === 0 && <p className="muted center">{t('noPosts')}</p>}

      {visible.length > 0 && (
        <section className="section">
          <h2 className="section-title">
            <span>{topic || t('allTopics')}</span>
          </h2>
          <div className="topic-grid">
            {visible.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
