import { useEffect, useState } from 'react'
import { useLang } from '../context/LangContext'
import { isMarketWeekend, isSessionOpen, SESSIONS } from '../lib/forex'

// Shows which forex trading sessions are open right now; refreshes every minute.
export default function MarketSessions() {
  const { t } = useLang()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(id)
  }, [])

  if (isMarketWeekend(now))
    return (
      <div className="sessions" aria-label={t('sessions')}>
        <span className="session weekend">
          <span className="session-dot" aria-hidden="true" />
          {t('weekend')}
        </span>
      </div>
    )

  return (
    <div className="sessions" aria-label={t('sessions')}>
      {SESSIONS.map((s) => {
        const open = isSessionOpen(s, now)
        return (
          <span key={s.id} className={open ? 'session open' : 'session'}>
            <span className="session-dot" aria-hidden="true" />
            {t(s.id)}
            <span className="session-state">{open ? t('open') : t('closed')}</span>
          </span>
        )
      })}
    </div>
  )
}
