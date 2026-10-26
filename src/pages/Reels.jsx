import { useEffect, useState } from 'react'
import ReelsRow from '../components/ReelsRow'
import Loader from '../components/Loader'
import { useLang } from '../context/LangContext'
import { listPublishedPosts, reelOf } from '../lib/posts'

// All reels in one grid, oldest first.
export default function Reels() {
  const { t } = useLang()
  const [posts, setPosts] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    listPublishedPosts()
      .then((all) => setPosts(all.filter(reelOf).reverse()))
      .catch((e) => setError(e.message))
  }, [])

  return (
    <main className="container page-pad">
      <header className="news-head">
        <h1>🎬 {t('reels')}</h1>
        <p className="news-intro">{t('reelsIntro')}</p>
      </header>

      {error && <p className="error">{error}</p>}
      {!posts && !error && <Loader />}
      {posts && posts.length === 0 && <p className="muted center">{t('noReels')}</p>}

      {posts && <ReelsRow posts={posts} title={false} grid />}
    </main>
  )
}
