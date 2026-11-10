import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useLang } from '../../context/LangContext'
import { useAuth } from '../../context/AuthContext'
import { findArticle, findCourse } from '../../binary/courses'
import { loadLesson } from '../../binary/store'
import { titleOf } from '../../binary/useEdits'
import Loader from '../../components/Loader'
import LessonCover from '../../binary/LessonCover'
import CourseCover from '../../binary/CourseCover'
import LessonContent from '../../binary/LessonContent'
import { coverKicker } from '../../binary/LessonCard'
import ReelPlayer from '../../components/ReelPlayer'
import { reelFor } from '../../binary/reels'

// One Binary lesson (/binary/:courseId/:slug) or a single-page article (/binary/psychology),
// laid out like a blog post, in the language the reader picked (the other one if it is empty).
export default function LessonPage() {
  const { courseId, slug } = useParams()
  const { lang, t } = useLang()
  const { isAdmin } = useAuth()
  const [zoomed, setZoomed] = useState(null)
  const [data, setData] = useState({ slug: null, lesson: undefined })

  const course = findCourse(courseId)
  const article = !slug ? findArticle(courseId) : null
  const index = course && slug ? course.lessons.findIndex((l) => l.slug === slug) : -1
  const lesson = article ?? (index >= 0 ? course.lessons[index] : null)
  const lessonSlug = lesson?.slug

  useEffect(() => {
    window.scrollTo(0, 0)
    if (!lessonSlug) return
    let live = true
    loadLesson(lessonSlug).then((l) => live && setData({ slug: lessonSlug, lesson: l }))
    return () => {
      live = false
    }
  }, [lessonSlug])

  if (!lesson) return <Navigate to={course ? `/binary/${course.id}` : '/binary'} replace />

  const loaded = data.slug === lesson.slug ? data.lesson : undefined
  const wanted = loaded?.[lang]
  const other = lang === 'bn' ? 'en' : 'bn'
  const vLang = wanted?.content ? lang : loaded?.[other]?.content ? other : lang
  const v = loaded?.[vLang]
  const title = v?.title || titleOf(lesson, vLang)

  const prev = course && index > 0 ? course.lessons[index - 1] : null
  const next = course && index >= 0 && index < course.lessons.length - 1 ? course.lessons[index + 1] : null
  const num = (n) => n.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')
  const editPath = `/admin/binary/${course ? `${course.id}/${lesson.slug}` : lesson.id}`

  // Chart images open larger on click or Enter.
  const openImage = (e) => {
    if (e.target.tagName !== 'IMG') return
    if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return
    e.preventDefault()
    setZoomed({ src: e.target.currentSrc || e.target.src, alt: e.target.alt || '' })
  }

  return (
    <main className="page-pad">
      <div className="container narrow post-top">
        <Link to={course ? `/binary/${course.id}` : '/binary'} className="back-link">
          {course ? t('allLessons') : t('backBinary')}
        </Link>
        {isAdmin && (
          <Link to={editPath} className="btn btn-ghost btn-sm">
            ✎ {t('editLesson')}
          </Link>
        )}
      </div>

      <article lang={vLang}>
        <header className="container narrow post-header">
          <span className="kicker">
            {course ? `${course.title[lang]} · ${t('lesson')} ${num(lesson.number)}/${num(course.lessons.length)}` : t('binary')}
          </span>
          <h1 className="post-title">{title}</h1>
        </header>

        <div className="container wide">
          {/* Psychology and Money Management keep their own photo as the main image */}
          {article ? (
            <CourseCover id={article.id} src={article.cover} hue={article.hue} className="course-hero" />
          ) : (
          <LessonCover
            className="lcover--hero"
            coverKey={lesson.key}
            kicker={coverKicker(course, lesson)}
            subtitle={title}
            subtitleLang={vLang}
            chips={['Binary', course.id === 'master-class' ? 'OTC' : 'Price Action', `${lesson.number}/${course.lessons.length}`]}
          />
          )}
        </div>

        <div className="container narrow">
          {loaded && vLang !== lang && <p className="notice binary-lang-note">{t('fallback')}</p>}

          {/* The lesson's short video (Bangla or English by language), like the reel on a Forex post */}
          {reelFor(lesson.slug, lang) && (
            <div className="post-reel">
              <span className="kicker">🎬 {t('reels')}</span>
              <ReelPlayer url={reelFor(lesson.slug, lang)} />
            </div>
          )}

          {/* Click and key handling is delegated to the chart images inside */}
          <div className="prose lesson-body" onClick={openImage} onKeyDown={openImage}>
            {loaded === undefined ? <Loader /> : <LessonContent html={v?.content} />}
          </div>

          <div className="post-end">
            <span className="end-line" aria-hidden="true" />
          </div>

          {(prev || next) && (
            <nav className="post-nav" aria-label={`${t('prevLesson')} / ${t('nextLesson')}`}>
              {prev ? (
                <Link to={`/binary/${course.id}/${prev.slug}`} className="post-nav-link prev">
                  <span className="post-nav-label">← {t('prevLesson')}</span>
                  <span className="post-nav-title">{titleOf(prev, lang)}</span>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link to={`/binary/${course.id}/${next.slug}`} className="post-nav-link next">
                  <span className="post-nav-label">{t('nextLesson')} →</span>
                  <span className="post-nav-title">{titleOf(next, lang)}</span>
                </Link>
              )}
            </nav>
          )}
        </div>
      </article>

      {zoomed && <Lightbox image={zoomed} onClose={() => setZoomed(null)} />}
    </main>
  )
}

function Lightbox({ image, onClose }) {
  const { t } = useLang()
  const closeRef = useRef(null)

  useEffect(() => {
    const opener = document.activeElement
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      opener?.focus?.()
    }
  }, [onClose])

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={image.alt || t('enlarge')} onClick={onClose}>
      <button ref={closeRef} className="reel-close" onClick={onClose} aria-label={t('close')}>
        ✕
      </button>
      <img src={image.src} alt={image.alt} onClick={(e) => e.stopPropagation()} />
    </div>
  )
}
