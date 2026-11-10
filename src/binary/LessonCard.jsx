import { Link } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import LessonCover from './LessonCover'
import { titleOf } from './useEdits'

// English kicker printed on a lesson's cover, like the Forex covers: [lead, main].
// Small covers (cards) show only the main part.
export const coverKicker = (course, lesson) =>
  course ? [`${course.title.en.toUpperCase()} · `, `LESSON ${lesson.number}`] : ['BINARY · ', 'ARTICLE']

// A lesson as a blog card: animated cover, lesson number and title.
export default function LessonCard({ course, lesson, edits, showCourse = false }) {
  const { lang, t } = useLang()
  const title = titleOf(lesson, lang, edits)
  const label = showCourse ? course.title[lang] : `${t('lesson')} ${lesson.number.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}`
  return (
    <Link to={`/binary/${course.id}/${lesson.slug}`} className="card lesson-card">
      <div className="card-img">
        <LessonCover coverKey={lesson.key} kicker={coverKicker(course, lesson)} subtitle={title} subtitleLang={lang} />
      </div>
      <div className="card-body">
        <div className="card-meta">
          <span className="kicker">{label}</span>
        </div>
        <h3 className="card-title">{title}</h3>
      </div>
    </Link>
  )
}
