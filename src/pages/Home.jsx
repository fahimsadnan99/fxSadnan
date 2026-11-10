import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import HeroChart from '../components/HeroChart'
import MarketSessions from '../components/MarketSessions'
import { useLang } from '../context/LangContext'

export default function Home() {
  const { t } = useLang()
  return (
    <main className="container page-pad">
      <section className="masthead">
        <HeroChart />
        <h1 className="masthead-title">
          <Logo size="xl" />
        </h1>
        <p className="masthead-tagline">{t('tagline')}</p>
        <h2 className="market-choice-title">{t('chooseMarket')}</h2>
        <div className="market-choice">
          <Link to="/forex" className="market-card market-forex">
            <span className="market-card-mark" aria-hidden="true">
              FX
            </span>
            <span className="market-card-name">{t('forex')}</span>
            <span className="market-card-desc">{t('forexDesc')}</span>
            <span className="read-more">
              {t('ctaRead')} <span aria-hidden="true">→</span>
            </span>
          </Link>
          <Link to="/binary" className="market-card market-binary">
            <span className="market-card-mark" aria-hidden="true">
              B
            </span>
            <span className="market-card-name">{t('binary')}</span>
            <span className="market-card-desc">{t('binaryDesc')}</span>
            <span className="read-more">
              {t('explore')} <span aria-hidden="true">→</span>
            </span>
          </Link>
        </div>
        <MarketSessions />
        <div className="double-rule" />
      </section>
    </main>
  )
}
