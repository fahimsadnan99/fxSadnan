import { useEffect, useMemo, useState } from 'react'
import PostCard from '../components/PostCard'
import Logo from '../components/Logo'
import HeroChart from '../components/HeroChart'
import MarketSessions from '../components/MarketSessions'
import ReelsRow from '../components/ReelsRow'
import Loader from '../components/Loader'
import { useLang } from '../context/LangContext'
import { listPublishedPosts, pickVersion } from '../lib/posts'

export default function Home() {
  const { lang, t } = useLang()
  const [posts, setPosts] = useState(null)
  const [error, setError] = useState('')
  const [topic, setTopic] = useState('')

  useEffect(() => {
    listPublishedPosts()
      .then(setPosts)
      .catch((e) => setError(e.message))
  }, [])

  // Topic names differ per language, so reset the filter when the language changes.
  useEffect(() => setTopic(''), [lang])

  const topics = useMemo(
    () => [...new Set((posts ?? []).map((p) => pickVersion(p, lang).topic).filter(Boolean))],
    [posts, lang],
  )
  const visible = (posts ?? []).filter((p) => !topic || pickVersion(p, lang).topic === topic)
  const [featured, ...rest] = visible

  return (
    <main className="container page-pad">
      <section className="masthead">
        <HeroChart />
        <h1 className="masthead-title">
          <Logo size="xl" />
        </h1>
        <p className="masthead-tagline">{t('tagline')}</p>
        <div className="hero-cta">
          <a href="#posts" className="btn btn-primary btn-lg">
            {t('ctaRead')} <span aria-hidden="true">→</span>
          </a>
        </div>
        <MarketSessions />
        <div className="double-rule" />
      </section>

      {topics.length > 1 && (
        <nav className="topic-filter" aria-label="Topics">
          <button className={!topic ? 'pill active' : 'pill'} onClick={() => setTopic('')}>
            {t('allTopics')}
          </button>
          {topics.map((name) => (
            <button key={name} className={topic === name ? 'pill active' : 'pill'} onClick={() => setTopic(name)}>
              {name}
            </button>
          ))}
        </nav>
      )}

      {error && <p className="error">{error}</p>}
      {!posts && !error && <Loader />}
      {posts && visible.length === 0 && <p className="muted center">{t('noPosts')}</p>}

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
