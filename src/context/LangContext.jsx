import { createContext, useContext, useEffect, useState } from 'react'

const STRINGS = {
  bn: {
    siteName: 'FxSadnan',
    tagline: 'তোমার ট্রেডিং এজ, এখান থেকে শুরু।',
    featured: 'বিশেষ লেখা',
    latest: 'সাম্প্রতিক লেখা',
    readMore: 'পড়ুন',
    ctaRead: 'ব্লগ পড়ুন',
    allTopics: 'সব বিষয়',
    noPosts: 'এখনো কোনো লেখা নেই।',
    loading: 'লোড হচ্ছে…',
    keyPoints: 'মূল বিষয়গুলো',
    back: '← সব লেখা',
    notFound: 'লেখাটি পাওয়া যায়নি।',
    fallback: 'এই লেখার বাংলা সংস্করণ এখনো নেই, তাই ইংরেজিটি দেখানো হচ্ছে।',
    dashboard: 'ড্যাশবোর্ড',
    logout: 'লগআউট',
    admin: 'অ্যাডমিন',
    fxRates: 'ফরেক্স রেট',
    daily: 'দৈনিক',
    sessions: 'মার্কেট সেশন',
    sydney: 'সিডনি',
    tokyo: 'টোকিও',
    london: 'লন্ডন',
    newyork: 'নিউ ইয়র্ক',
    open: 'খোলা',
    closed: 'বন্ধ',
    weekend: 'উইকেন্ড — মার্কেট বন্ধ, সোমবার আবার খুলবে',
  },
  en: {
    siteName: 'FxSadnan',
    tagline: 'Your trading edge starts here.',
    featured: 'Featured',
    latest: 'Latest stories',
    readMore: 'Read',
    ctaRead: 'Read the blog',
    allTopics: 'All topics',
    noPosts: 'No posts yet.',
    loading: 'Loading…',
    keyPoints: 'Key points',
    back: '← All posts',
    notFound: 'Post not found.',
    fallback: 'This post has no English version yet, so the Bangla one is shown.',
    dashboard: 'Dashboard',
    logout: 'Log out',
    admin: 'Admin',
    fxRates: 'FX rates',
    daily: 'daily',
    sessions: 'Market sessions',
    sydney: 'Sydney',
    tokyo: 'Tokyo',
    london: 'London',
    newyork: 'New York',
    open: 'Open',
    closed: 'Closed',
    weekend: 'Weekend — market closed, reopens Monday',
  },
}

const LangContext = createContext(null)

function readSavedLang() {
  try {
    return localStorage.getItem('lang') === 'en' ? 'en' : 'bn'
  } catch {
    return 'bn'
  }
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState(readSavedLang)

  useEffect(() => {
    document.documentElement.lang = lang
    try {
      localStorage.setItem('lang', lang)
    } catch {
      // Storage unavailable (private mode); the toggle still works for this visit.
    }
  }, [lang])

  const t = (key) => STRINGS[lang][key] ?? key

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>
}

export const useLang = () => useContext(LangContext)
