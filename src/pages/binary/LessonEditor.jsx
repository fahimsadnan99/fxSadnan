import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import Editor from '../../components/Editor'
import Loader from '../../components/Loader'
import { COURSES, findArticle, findCourse } from '../../binary/courses'
import { loadDefault, loadLesson, resetLesson, saveLesson } from '../../binary/store'
import { LESSON_EXTENSIONS, LESSON_HEADINGS } from '../../binary/editorExtensions'

const LANGS = ['bn', 'en']
const LANG_LABEL = { bn: 'বাংলা', en: 'English' }

// Admin editor for one Binary lesson (/admin/binary/:courseId/:slug) or article
// (/admin/binary/:courseId). Saving stores the admin's copy; "Original e ferot" removes it.
export default function LessonEditor() {
  const { courseId, slug } = useParams()
  const navigate = useNavigate()
  const course = findCourse(courseId)
  const lesson = slug ? course?.lessons.find((l) => l.slug === slug) : findArticle(courseId)
  const lessonSlug = lesson?.slug
  // Opened from the dashboard: Save, Cancel and Reset go back there; otherwise to the lesson.
  const backTo = useLocation().state?.from ?? (course ? `/binary/${courseId}/${slug}` : `/binary/${courseId}`)

  const [form, setForm] = useState(null)
  const [edited, setEdited] = useState(false)
  const [tab, setTab] = useState('bn')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!lessonSlug) return
    loadLesson(lessonSlug)
      .then((l) => {
        const empty = { title: '', content: '' }
        setForm({ bn: { ...empty, ...l?.bn }, en: { ...empty, ...l?.en } })
        setEdited(!!l?.edited)
      })
      .catch((e) => setMessage(e.message))
  }, [lessonSlug])

  if (!lesson) return <Navigate to="/admin" replace />
  if (!form) return message ? <p className="container page-pad error">{message}</p> : <Loader page />

  const setVersion = (lang, patch) => setForm((f) => ({ ...f, [lang]: { ...f[lang], ...patch } }))

  async function save() {
    if (!form.bn.title.trim() && !form.en.title.trim()) {
      setMessage('Kompokkhe ekta language er title din.')
      return
    }
    setBusy(true)
    setMessage('')
    try {
      const clean = (v) => ({ title: v.title.trim(), content: v.content })
      await saveLesson(lesson.slug, { bn: clean(form.bn), en: clean(form.en) })
      navigate(backTo)
    } catch (e) {
      setMessage(e.message)
      setBusy(false)
    }
  }

  async function reset() {
    if (!window.confirm('Apnar edit muche lesson ta original lekhay ferot jabe. Nishchit?')) return
    setBusy(true)
    setMessage('')
    try {
      await resetLesson(lesson.slug)
      const def = await loadDefault(lesson.slug)
      setForm({ bn: { ...def.bn }, en: { ...def.en } })
      setEdited(false)
      navigate(backTo)
    } catch (e) {
      setMessage(e.message)
      setBusy(false)
    }
  }

  return (
    <main className="container page-pad">
      <div className="admin-head">
        <h1>Lesson edit</h1>
        <div className="admin-actions">
          {edited && (
            <button className="btn btn-ghost" onClick={reset} disabled={busy}>
              ↺ Original e ferot
            </button>
          )}
          <Link to={backTo} className="btn btn-ghost">
            Cancel
          </Link>
          <button className="btn btn-primary" onClick={save} disabled={busy}>
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <p className="muted small">
        {course ? `Binary · ${course.title.en} · Lesson ${lesson.number}` : `Binary · ${lesson.title.en}`}
        {edited ? ' · edited copy' : ' · original'}
        {course && COURSES.filter((c) => c.lessons.some((l) => l.key === lesson.key)).length > 1 &&
          ' · ei lesson duita course ei ache, duita jaygay-i bodlabe'}
      </p>

      {message && <p className="error">{message}</p>}

      <div className="tabs">
        {LANGS.map((lang) => (
          <button key={lang} className={tab === lang ? 'tab active' : 'tab'} onClick={() => setTab(lang)}>
            {LANG_LABEL[lang]}
            {form[lang].title.trim() ? ' ✓' : ''}
          </button>
        ))}
      </div>

      {/* Both editors stay mounted so each keeps its own undo history while switching tabs. */}
      {LANGS.map((lang) => (
        <section key={lang} className="panel version-form" hidden={tab !== lang} lang={lang}>
          <label>
            Title
            <input value={form[lang].title} onChange={(e) => setVersion(lang, { title: e.target.value })} />
          </label>
          <div className="field-label">
            Content <span className="muted small">(sketch gula chhobir moto tene shorano ba muchhe fela jay)</span>
          </div>
          <Editor
            content={form[lang].content}
            onChange={(html) => setVersion(lang, { content: html })}
            placeholder={lang === 'bn' ? 'এখানে লিখুন…' : 'Write here…'}
            extensions={LESSON_EXTENSIONS}
            headingLevels={LESSON_HEADINGS}
            className="lesson-body"
          />
        </section>
      ))}
    </main>
  )
}
