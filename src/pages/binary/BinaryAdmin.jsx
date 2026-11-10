import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ALL_LESSONS, COURSES } from '../../binary/courses'
import { loadEdits, resetLesson } from '../../binary/store'
import { formatDate } from '../../lib/posts'
import LessonCover from '../../binary/LessonCover'
import { coverKicker } from '../../binary/LessonCard'
import Loader from '../../components/Loader'

const FROM = '/admin?tab=binary'

// Courses each lesson appears in (four lessons are in both).
const coursesOf = (key) => COURSES.filter((c) => c.lessons.some((l) => l.key === key))

const FILTERS = [
  { id: 'all', label: 'Sob' },
  { id: 'price-action', label: 'Price Action' },
  { id: 'master-class', label: 'Master Class' },
  { id: 'articles', label: 'Psychology / Money' },
  { id: 'edited', label: 'Edited' },
]

// Dashboard section for the Binary course: every lesson with its status and edit/reset actions.
export default function BinaryAdmin() {
  const [edits, setEdits] = useState(null)
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState('')

  const refresh = () => loadEdits().then(setEdits)
  useEffect(() => {
    refresh()
  }, [])

  const rows = useMemo(() => {
    const course = COURSES.find((c) => c.id === filter)
    let list = course
      ? course.lessons.map((l) => ({ ...l, course }))
      : filter === 'articles'
        ? ALL_LESSONS.filter((l) => !l.course)
        : ALL_LESSONS
    if (filter === 'edited') list = list.filter((l) => edits?.[l.slug])
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter((l) =>
        [edits?.[l.slug]?.bn?.title, edits?.[l.slug]?.en?.title, l.title.bn, l.title.en, l.slug.replaceAll('-', ' ')]
          .filter(Boolean)
          .some((s) => s.toLowerCase().includes(q)),
      )
    }
    return list
  }, [filter, query, edits])

  async function reset(lesson) {
    if (!window.confirm(`"${lesson.title.bn}" er edit muche original lekhay ferot jabe. Nishchit?`)) return
    setBusy(lesson.slug)
    setError('')
    try {
      await resetLesson(lesson.slug)
      await refresh()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(null)
    }
  }

  const editedCount = edits ? ALL_LESSONS.filter((l) => edits[l.slug]).length : 0

  return (
    <>
      <div className="admin-tabs">
        {FILTERS.map((f) => (
          <button key={f.id} className={filter === f.id ? 'pill active' : 'pill'} onClick={() => setFilter(f.id)}>
            {f.label}
            {f.id === 'edited' ? ` (${editedCount})` : ''}
          </button>
        ))}
      </div>

      <div className="lesson-toolbar">
        <label className="lesson-search">
          <span className="sr-only">Lesson khujun</span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" />
          </svg>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Lesson khujun (Bangla ba English)" />
        </label>
        <p className="muted small">
          {rows.length} ta lesson · Edit korle Bangla ar English duita version e bodlano jay. Save korle readers notun lekha dekhe.
        </p>
      </div>

      {error && <p className="error">{error}</p>}
      {!edits && <Loader />}
      {edits && rows.length === 0 && <p className="muted">Kono lesson pawa jayni.</p>}

      {edits && (
        <ul className="admin-list">
          {rows.map((l) => {
            const edit = edits[l.slug]
            const inCourses = coursesOf(l.key)
            const course = l.course
            const viewPath = course ? `/binary/${course.id}/${l.slug}` : `/binary/${l.slug}`
            const editPath = course ? `/admin/binary/${course.id}/${l.slug}` : `/admin/binary/${l.slug}`
            return (
              <li key={`${course?.id ?? 'a'}-${l.slug}`} className="panel admin-row binary-admin-row">
                <div className="binary-admin-thumb">
                  <LessonCover coverKey={l.key} kicker={coverKicker(course, l)} subtitle={edit?.bn?.title || l.title.bn} />
                </div>
                <div className="admin-row-main">
                  <strong>{edit?.bn?.title || l.title.bn}</strong>
                  <span className="muted">{edit?.en?.title || l.title.en}</span>
                  <span className="muted small">
                    {course ? `${inCourses.map((c) => c.title.en).join(' + ')} · Lesson ${l.number}` : 'Article'}
                    {edit?.updatedAt && ` · Last edit ${formatDate(edit.updatedAt, 'en')}`}
                  </span>
                </div>
                <span className={edit ? 'badge badge-live' : 'badge'}>{edit ? 'Edited' : 'Original'}</span>
                <div className="admin-actions">
                  <Link to={viewPath} className="btn btn-ghost">
                    View
                  </Link>
                  <Link to={editPath} state={{ from: FROM }} className="btn btn-primary">
                    ✎ Edit
                  </Link>
                  {edit && (
                    <button className="btn btn-ghost" disabled={busy === l.slug} onClick={() => reset(l)}>
                      ↺ Original
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
