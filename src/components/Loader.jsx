import Logo from './Logo'
import { useLang } from '../context/LangContext'

// Animated logo used while pages and data load: the candles bounce in turn and the wordmark breathes.
export default function Loader({ page = false }) {
  const { t } = useLang()
  return (
    <div className={page ? 'loader loader-page' : 'loader'} role="status" aria-live="polite">
      <Logo size="lg" />
      <span className="loader-bar" aria-hidden="true" />
      <span className="sr-only">{t('loading')}</span>
    </div>
  )
}
