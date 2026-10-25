import { useEffect, useState } from 'react'
import { useLang } from '../context/LangContext'
import { fetchForexRates } from '../lib/forex'

function TickerItems({ rates }) {
  return rates.map(({ pair, price, changePct }) => {
    const up = changePct >= 0
    return (
      <span key={pair} className="tick">
        <span className="tick-pair">{pair}</span>
        <span className="tick-price">{price}</span>
        <span className={up ? 'tick-change up' : 'tick-change down'}>
          {up ? '▲' : '▼'} {Math.abs(changePct).toFixed(2)}%
        </span>
      </span>
    )
  })
}

// Scrolling bar of major pairs. Hidden if the rates API can't be reached.
export default function Ticker() {
  const { t } = useLang()
  const [rates, setRates] = useState(null)

  useEffect(() => {
    fetchForexRates()
      .then(setRates)
      .catch(() => setRates([]))
  }, [])

  if (!rates?.length) return null

  return (
    <div className="ticker" aria-label={t('fxRates')}>
      <div className="ticker-label">
        <span className="live-dot" aria-hidden="true" />
        {t('fxRates')}
        <span className="ticker-note">{t('daily')}</span>
      </div>
      <div className="ticker-viewport">
        {/* Rendered twice so the loop scrolls seamlessly */}
        <div className="ticker-track">
          <TickerItems rates={rates} />
          <span aria-hidden="true" className="ticker-copy">
            <TickerItems rates={rates} />
          </span>
        </div>
      </div>
    </div>
  )
}
