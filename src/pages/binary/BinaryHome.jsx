import { Link } from 'react-router-dom'
import HeroChart from '../../components/HeroChart'
import { useLang } from '../../context/LangContext'
import { ARTICLES, COURSES, START_HERE } from '../../binary/courses'
import LessonCard from '../../binary/LessonCard'
import CourseCover from '../../binary/CourseCover'
import BinaryReelsRow from '../../binary/BinaryReelsRow'
import { useEdits } from '../../binary/useEdits'

const TELEGRAM = 'https://t.me/traderSadnan1'

// Landing page of the Binary section: the four course parts and a few lessons to start with.
export default function BinaryHome() {
  const { lang, t } = useLang()
  const edits = useEdits()
  const count = (n) => t('lessonsCount').replace('{n}', n.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US'))
  const parts = [
    ...COURSES.map((c) => ({ ...c, meta: count(c.lessons.length) })),
    ...ARTICLES.map((a) => ({ ...a, meta: t('oneArticle') })),
  ]

  return (
    <main className="container page-pad">
      <section className="masthead binary-masthead">
        <HeroChart />
        <span className="kicker">{t('binaryKicker')}</span>
        <h1 className="binary-title">{t('binaryTitle')}</h1>
        <p className="masthead-tagline binary-intro">{t('binaryIntro')}</p>
        <div className="hero-cta">
          <Link to="/binary/price-action" className="btn btn-primary btn-lg">
            {COURSES[0].title[lang]} <span aria-hidden="true">→</span>
          </Link>
          <Link to="/binary/master-class" className="btn btn-ghost btn-lg">
            {COURSES[1].title[lang]}
          </Link>
        </div>
        <div className="double-rule" />
      </section>

      <section className="section">
        <h2 className="section-title">
          <span>{t('courses')}</span>
        </h2>
        <div className="grid binary-parts">
          {parts.map((p) => (
            <Link key={p.id} to={`/binary/${p.id}`} className="card">
              <div className="card-img">
                <CourseCover id={p.id} src={p.cover} hue={p.hue} />
              </div>
              <div className="card-body">
                <div className="card-meta">
                  <span className="kicker">{p.meta}</span>
                </div>
                <h3 className="card-title">{p.title[lang]}</h3>
                <p className="card-excerpt">{p.intro[lang]}</p>
                <span className="read-more">
                  {t('explore')} <span aria-hidden="true">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <BinaryReelsRow edits={edits} />

      <section className="section">
        <h2 className="section-title">
          <span>{t('startHere')}</span>
        </h2>
        <div className="topic-grid">
          {START_HERE.map(({ course, lesson }) => (
            <LessonCard key={lesson.key} course={course} lesson={lesson} edits={edits} showCourse />
          ))}
        </div>
      </section>

      <aside className="binary-risk">
        <p>{t('binaryRisk')}</p>
        <a href={TELEGRAM} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
          {t('telegram')} <span aria-hidden="true">↗</span>
        </a>
      </aside>
    </main>
  )
}
