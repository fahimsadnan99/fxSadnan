import { useEffect, useState } from 'react'
import ReelsRow from '../components/ReelsRow'
import TopicFilter from '../components/TopicFilter'
import Loader from '../components/Loader'
import { useLang } from '../context/LangContext'
import { listPublishedPosts, reelOf, topicsOf } from '../lib/posts'

// All reels in one grid, oldest first, filterable by topic.
export default function Reels() {
  const { lang, t } = useLang()
  const [posts, setPosts] = useState(null)
  const [error, setError] = useState('')
  const [topic, setTopic] = useState('')

  useEffect(() => {
    listPublishedPosts()
      .then((all) => setPosts(all.filter(reelOf).reverse()))
      .catch((e) => setError(e.message))
  }, [])

  // Topic names differ per language, so reset the filter when the language changes.
  useEffect(() => setTopic(''), [lang])

  const { topics, visible } = topicsOf(posts ?? [], lang, topic)

  return (
    <main className="container page-pad">
      <header className="news-head">
        <h1>🎬 {t('reels')}</h1>
        <p className="news-intro">{t('reelsIntro')}</p>
      </header>

      <TopicFilter topics={topics} topic={topic} onChange={setTopic} />

      {error && <p className="error">{error}</p>}
      {!posts && !error && <Loader />}
      {posts && posts.length === 0 && <p className="muted center">{t('noReels')}</p>}

      {posts && <ReelsRow posts={visible} title={topic || t('allTopics')} grid />}
    </main>
  )
}
