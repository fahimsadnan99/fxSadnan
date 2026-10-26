import { useLang } from '../context/LangContext'

// "All topics" plus one pill per topic; `topic` is '' when showing everything.
export default function TopicFilter({ topics, topic, onChange }) {
  const { t } = useLang()
  if (topics.length < 2) return null

  return (
    <nav className="topic-filter" aria-label="Topics">
      <button className={!topic ? 'pill active' : 'pill'} onClick={() => onChange('')}>
        {t('allTopics')}
      </button>
      {topics.map((name) => (
        <button key={name} className={topic === name ? 'pill active' : 'pill'} onClick={() => onChange(name)}>
          {name}
        </button>
      ))}
    </nav>
  )
}
