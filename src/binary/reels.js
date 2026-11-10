import REELS from './data/reels.json'
import REELS_BN from './data/reels-bn.json'

// A lesson's reel in the reader's language: the Bangla reel when there is one, else the English reel.
export const reelFor = (slug, lang) => (lang === 'bn' && REELS_BN[slug]) || REELS[slug] || ''
