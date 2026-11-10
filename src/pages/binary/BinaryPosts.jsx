import { Link } from 'react-router-dom'
import { useLang } from '../../context/LangContext'
import { ARTICLES, COURSES } from '../../binary/courses'
import LessonCard from '../../binary/LessonCard'
import CourseCover from '../../binary/CourseCover'
import { useEdits } from '../../binary/useEdits'

// Every Binary lesson, grouped by course, then the stand-alone articles.
export default function BinaryPosts() {
  const { lang, t } = useLang()
  const edits = useEdits()
  return (
    <main className="container page-pad">
      <header className="news-head">
        <h1>{t('posts')}</h1>
        <p className="news-intro">{t('postsIntro')}</p>
      </header>

      {COURSES.map((course) => (
        <section key={course.id} className="section">
          <h2 className="section-title">
            <span><Link to={`/binary/${course.id}`}>{course.title[lang]}</Link></span>
          </h2>
          <div className="topic-grid">
            {course.lessons.map((lesson) => (
              <LessonCard key={lesson.key} course={course} lesson={lesson} edits={edits} />
            ))}
          </div>
        </section>
      ))}

      {ARTICLES.length > 0 && (
        <section className="section">
          <div className="grid binary-parts">
            {ARTICLES.map((a) => (
              <Link key={a.id} to={`/binary/${a.id}`} className="card">
                <div className="card-img">
                  <CourseCover id={a.id} src={a.cover} hue={a.hue} />
                </div>
                <div className="card-body">
                  <div className="card-meta">
                    <span className="kicker">{t('oneArticle')}</span>
                  </div>
                  <h3 className="card-title">{a.title[lang]}</h3>
                  <p className="card-excerpt">{a.intro[lang]}</p>
                  <span className="read-more">
                    {t('explore')} <span aria-hidden="true">→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
