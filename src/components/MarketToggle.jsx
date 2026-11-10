import { Link, useLocation } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { marketOf } from '../binary/sections'

// Forex | Binary switch in the navbar. Neither is active on the shared home page and news.
export default function MarketToggle() {
  const { t } = useLang()
  const market = marketOf(useLocation().pathname)
  const item = (id, label) => (
    <Link to={`/${id}`} className={market === id ? 'active' : ''} aria-current={market === id ? 'true' : undefined}>
      {label}
    </Link>
  )
  return (
    <nav className="market-toggle" aria-label={t('marketSwitch')}>
      {item('forex', t('forex'))}
      {item('binary', t('binary'))}
    </nav>
  )
}
