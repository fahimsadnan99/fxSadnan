import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useLang } from '../../context/LangContext'
import { findArticle, findCourse } from '../../binary/courses'
import LessonCard from '../../binary/LessonCard'
import CourseCover from '../../binary/CourseCover'
import LessonPage from './LessonPage'
import { titleOf, useEdits } from '../../binary/useEdits'

// /binary/:courseId — a course's lesson list with search, or a single-page article
// (Psychology, Money Management).
export default function CoursePage() {
  const { courseId } = useParams()
  const course = findCourse(courseId)
  if (findArticle(courseId)) return <LessonPage />
  if (!course) return <Navigate to="/binary" replace />
  return <LessonList key={course.id} course={course} />
}

function LessonList({ course }) {
  const { lang, t } = useLang()
  const edits = useEdits()
  const [query, setQuery] = useState('')
  const total = course.lessons.length

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return course.lessons
    // Matches either language's title, so a Bangla or English search both work.
    return course.lessons.filter((l) =>
      [titleOf(l, 'bn', edits), titleOf(l, 'en', edits), l.slug.replaceAll('-', ' ')].some((s) => s.toLowerCase().includes(q)),
    )
  }, [course, query, edits])

  const num = (n) => n.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')

  return (
    <main className="container page-pad">
      <div className="post-top">
        <Link to="/binary" className="back-link">
          {t('backBinary')}
        </Link>
      </div>

      <header className="news-head">
        <h1>{course.title[lang]}</h1>
        <p className="news-intro">{course.intro[lang]}</p>
      </header>

      <CourseCover id={course.id} src={course.cover} hue={course.hue} className="course-hero" />

      <div className="lesson-toolbar">
        <label className="lesson-search">
          <span className="sr-only">{t('searchLessons')}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchLessons')}
            autoComplete="off"
          />
        </label>
        <p className="muted small" aria-live="polite">
          {query.trim() ? `${num(visible.length)} / ${num(total)}` : t('lessonsCount').replace('{n}', num(total))}
        </p>
      </div>

      {visible.length > 0 ? (
        <div className="topic-grid">
          {visible.map((lesson) => (
            <LessonCard key={lesson.key} course={course} lesson={lesson} edits={edits} />
          ))}
        </div>
      ) : (
        <p className="muted center">{t('noLessonMatch')}</p>
      )}
    </main>
  )
}
