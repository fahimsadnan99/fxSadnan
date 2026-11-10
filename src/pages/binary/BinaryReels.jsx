import { useLang } from '../../context/LangContext'
import BinaryReelsRow from '../../binary/BinaryReelsRow'
import { useEdits } from '../../binary/useEdits'

// Every Binary lesson reel in one grid.
export default function BinaryReels() {
  const { t } = useLang()
  const edits = useEdits()
  return (
    <main className="container page-pad">
      <header className="news-head">
        <h1>🎬 {t('reels')}</h1>
        <p className="news-intro">{t('reelsIntro')}</p>
      </header>
      <BinaryReelsRow edits={edits} title={false} grid />
    </main>
  )
}
