import { useEffect, useMemo, useState } from 'react'
import { useLang } from '../context/LangContext'
import { eventsForMonth, hasFixedDates } from '../lib/newsCalendar'
import { isCovered, loadFFMonth, loadOutlook } from '../lib/forexFactory'

const pad = (n) => String(n).padStart(2, '0')
const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const ARROW = { up: '▲', down: '▼', flat: '◆' }
const NO_EXPERTS = {}
const anchorOf = (expert) => `expert-${expert.keys[0].replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`

// Month-by-month calendar of market-moving news, with what analysts expect each one to do to price.
export default function NewsImpact() {
  const { lang, t } = useLang()
  const [today] = useState(() => new Date())
  const todayKey = dayKey(today)
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [filter, setFilter] = useState('all')
  const [ff, setFF] = useState(null)
  const [experts, setExperts] = useState(null)
  const viewKey = `${view.year}-${view.month}`

  useEffect(() => {
    let live = true
    loadFFMonth(view.year, view.month)
      .then((data) => live && setFF({ key: `${view.year}-${view.month}`, ...data }))
      // Without ForexFactory data the estimated calendar is shown on its own.
      .catch(() => {})
    // loadOutlook never rejects; a missing file just means no expert views.
    loadOutlook(view.year, view.month).then((data) => live && setExperts({ key: `${view.year}-${view.month}`, ...data }))
    return () => {
      live = false
    }
  }, [view])

  const locale = lang === 'bn' ? 'bn-BD' : 'en-US'
  const monthLabel = new Date(view.year, view.month, 1).toLocaleDateString(locale, { month: 'long', year: 'numeric' })
  const expertsReady = experts?.key === viewKey
  const byKey = expertsReady ? experts.byKey : NO_EXPERTS

  // ForexFactory events replace the estimated ones for the weeks it covers.
  const events = useMemo(() => {
    const live = ff?.key === viewKey ? ff : { weeks: [], events: [] }
    const estimated = eventsForMonth(view.year, view.month).filter((e) => !isCovered(live.weeks, e.date))
    const rank = { high: 0, medium: 1 }
    return [...live.events, ...estimated].sort(
      (a, b) => a.date.localeCompare(b.date) || (a.when ?? 0) - (b.when ?? 0) || rank[a.impact] - rank[b.impact],
    )
  }, [view, viewKey, ff])

  const days = useMemo(() => {
    const byDate = {}
    for (const e of events) if (filter === 'all' || e.impact === filter) (byDate[e.date] ??= []).push(e)
    return Object.entries(byDate)
  }, [events, filter])

  // One summary row per expert entry for the week around today, at its first event.
  const weekRows = useMemo(() => {
    const week = ff?.key === viewKey && ff.weeks.find(([first, last]) => todayKey >= first && todayKey <= last)
    if (!week) return []
    const seen = new Set()
    const rows = []
    for (const e of events) {
      const expert = e.outlookKey && byKey[e.outlookKey]
      if (!expert || seen.has(expert) || !isCovered([week], e.date)) continue
      seen.add(expert)
      rows.push({ event: e, expert })
    }
    return rows
  }, [events, byKey, ff, viewKey, todayKey])

  const shift = (step) =>
    setView(({ year, month }) => {
      const d = new Date(year, month + step, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })

  const dayLabel = (date) => {
    const [y, m, d] = date.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })
  }

  // A decision, its statement and press conference share one expert entry; write it out only once.
  const shownExperts = new Set()

  return (
    <main className="container page-pad news-page">
      <header className="news-head">
        <h1>{t('newsImpact')}</h1>
        <p className="news-intro">{t('newsIntro')}</p>
      </header>

      <div className="news-controls">
        <div className="news-month">
          <button className="btn btn-ghost btn-sm" onClick={() => shift(-1)} aria-label={t('prevMonth')}>
            ←
          </button>
          <h2>{monthLabel}</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => shift(1)} aria-label={t('nextMonth')}>
            →
          </button>
        </div>
        <div className="lang-toggle" role="group" aria-label={t('impact')}>
          {['all', 'high', 'medium'].map((f) => (
            <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
              {t(f === 'all' ? 'allImpact' : `impact_${f}`)}
            </button>
          ))}
        </div>
      </div>

      <ul className="news-legend">
        <li className="move-up">
          {ARROW.up} {t('legendUp')}
        </li>
        <li className="move-down">
          {ARROW.down} {t('legendDown')}
        </li>
        <li className="move-flat">
          {ARROW.flat} {t('legendFlat')}
        </li>
      </ul>

      {expertsReady ? (
        experts.updated && (
          <p className="news-note">
            {t('expertUpdated')}: {new Date(experts.updated).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        )
      ) : (
        <p className="news-loading" role="status">
          <span className="news-spinner" aria-hidden="true" />
          {t('expertLoading')}
        </p>
      )}

      {weekRows.length > 0 && <WeekSummary rows={weekRows} />}

      {ff?.key === viewKey && ff.weeks.length > 0 && <p className="news-note">{t('ffSource')}</p>}
      {!hasFixedDates(view.year) && <p className="news-note">{t('noFixedDates')}</p>}

      {days.length === 0 ? (
        <p className="news-note">{t('noNews')}</p>
      ) : (
        <ol className="news-days">
          {days.map(([date, dayEvents]) => (
            <li key={date} className={date === todayKey ? 'news-day today' : 'news-day'}>
              <h3 className="news-date">
                {dayLabel(date)}
                {date === todayKey && <span className="news-today">{t('today')}</span>}
              </h3>
              {dayEvents.map((e) => {
                const expert = e.outlookKey && byKey[e.outlookKey]
                const repeat = shownExperts.has(expert)
                if (expert) shownExperts.add(expert)
                return <NewsEvent key={`${e.id}-${e.date}`} event={e} expert={expert} expertRepeat={repeat} />
              })}
            </li>
          ))}
        </ol>
      )}

      <p className="news-disclaimer">{t('newsDisclaimer')}</p>
    </main>
  )
}

// Table of this week's expert views, one row per decision or report.
function WeekSummary({ rows }) {
  const { lang, t } = useLang()
  const locale = lang === 'bn' ? 'bn-BD' : 'en-US'
  return (
    <section className="week-summary" aria-labelledby="week-summary-title">
      <h2 id="week-summary-title">{t('weekSummary')}</h2>
      <table>
        <thead>
          <tr>
            <th scope="col">{t('colNews')}</th>
            <th scope="col">{t('colExperts')}</th>
            <th scope="col">{t('colMoves')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ event: e, expert }) => (
            <tr key={anchorOf(expert)}>
              <th scope="row">
                <span className="news-currency">{e.currency}</span>
                <a href={`#${anchorOf(expert)}`}>{expert.event?.[lang] ?? e.title[lang]}</a>
                <span className="week-summary-date">
                  {e.when.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
              </th>
              <td>{expert.headline?.[lang] ?? expert.summary[lang]}</td>
              <td>
                <Moves moves={expert.moves} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

function Moves({ moves }) {
  const { t } = useLang()
  return (
    <ul className="news-pairs" aria-label={t('expectedMoves')}>
      {moves.map((m) => (
        <li key={m.asset} className={`news-pair move-${m.dir}`}>
          <span aria-hidden="true">{ARROW[m.dir]} </span>
          {t(`asset_${m.asset}`) === `asset_${m.asset}` ? m.asset : t(`asset_${m.asset}`)}
          <span className="sr-only"> {t(`pair_${m.dir}`)}</span>
        </li>
      ))}
    </ul>
  )
}

function NewsEvent({ event: e, expert, expertRepeat }) {
  const { lang, t } = useLang()
  const locale = lang === 'bn' ? 'bn-BD' : 'en-US'

  return (
    <article
      className={`news-event impact-${e.impact}`}
      id={expert && !expertRepeat ? anchorOf(expert) : undefined}
    >
      <div className="news-event-top">
        <span className="news-currency">{e.currency}</span>
        <span className="news-impact">
          <span className="news-impact-dot" aria-hidden="true" />
          {t(`impact_${e.impact}`)}
        </span>
        {e.when && (
          <span className="news-time">{e.when.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' })}</span>
        )}
        {e.approx && <span className="news-approx">{t('approxDate')}</span>}
        {e.source === 'ff' && <span className="news-source">ForexFactory</span>}
      </div>
      <h4>{e.title[lang]}</h4>

      {expert ? (
        <ExpertView expert={expert} brief={expertRepeat} />
      ) : (
        <>
          <p>{e.effect ? e.effect[lang] : t(e.inverse ? 'genericEffectInverse' : 'genericEffect').replaceAll('{cur}', e.currency)}</p>
          <ul className="news-pairs" aria-label={t('affectedPairs')}>
            {e.pairs.map((p) => (
              <li key={p} className="news-pair">
                {p}
              </li>
            ))}
          </ul>
        </>
      )}
    </article>
  )
}

// What analysts expect, with the expected direction for each currency and metal.
function ExpertView({ expert, brief }) {
  const { lang, t } = useLang()
  const bias = expert.bias === 'mixed' ? 'flat' : expert.bias
  return (
    <section className="news-expert">
      <h5>
        {t('expertView')}
        <span className={`news-expert-bias move-${bias}`}>
          {ARROW[bias]} {t(`bias_${expert.bias}`)}
        </span>
      </h5>
      <p className={brief ? 'news-expert-same' : undefined}>{brief ? t('expertSame') : expert.summary[lang]}</p>
      <Moves moves={expert.moves} />
      {!brief && expert.sources.length > 0 && (
        <p className="news-expert-sources">
          {t('sources')}:{' '}
          {expert.sources.map((s, i) => (
            <span key={s.url}>
              {i > 0 && ' · '}
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                {s.title}
              </a>
            </span>
          ))}
        </p>
      )}
    </section>
  )
}
