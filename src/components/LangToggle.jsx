import { useLang } from '../context/LangContext'

export default function LangToggle() {
  const { lang, setLang } = useLang()
  return (
    <div className="lang-toggle" role="group" aria-label="Language">
      <button className={lang === 'bn' ? 'active' : ''} onClick={() => setLang('bn')}>
        বাংলা
      </button>
      <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>
        English
      </button>
    </div>
  )
}
