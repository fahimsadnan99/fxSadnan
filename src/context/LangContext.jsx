import { createContext, useContext, useEffect, useState } from 'react'

const STRINGS = {
  bn: {
    siteName: 'FxSadnan',
    tagline: 'তোমার ট্রেডিং এজ, এখান থেকে শুরু।',
    featured: 'বিশেষ লেখা',
    latest: 'সাম্প্রতিক লেখা',
    readMore: 'পড়ুন',
    ctaRead: 'ব্লগ পড়ুন',
    reels: 'রিলস',
    posts: 'পোস্ট',
    reelsIntro: 'সব রিলস এক জায়গায় — যেকোনোটায় ট্যাপ করে সাউন্ডসহ দেখুন।',
    postsIntro: 'সব লেখা এক জায়গায়।',
    noReels: 'এখনো কোনো রিল নেই।',
    readPost: 'পুরো পোস্ট পড়ুন',
    close: 'বন্ধ করুন',
    noPosts: 'এখনো কোনো লেখা নেই।',
    loading: 'লোড হচ্ছে…',
    keyPoints: 'মূল বিষয়গুলো',
    back: '← সব লেখা',
    notFound: 'লেখাটি পাওয়া যায়নি।',
    fallback: 'এই লেখার বাংলা সংস্করণ এখনো নেই, তাই ইংরেজিটি দেখানো হচ্ছে।',
    dashboard: 'ড্যাশবোর্ড',
    logout: 'লগআউট',
    admin: 'অ্যাডমিন',
    adminOnly: 'ড্যাশবোর্ড শুধু অ্যাডমিনের জন্য। সিক্রেট কোড দিন।',
    secretCode: 'সিক্রেট কোড',
    enter: 'প্রবেশ',
    cancel: 'বাতিল',
    wrongCode: 'কোড ভুল।',
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
    news: 'নিউজ',
    newsIntro: 'আজ থেকে সামনের কোন তারিখে কোন বড় নিউজ আছে, আর সেটা মার্কেটে কী প্রভাব ফেলতে পারে।',
    prevMonth: 'আগের মাস',
    nextMonth: 'পরের মাস',
    impact: 'প্রভাব',
    allImpact: 'সব',
    impact_high: 'উচ্চ প্রভাব',
    impact_medium: 'মাঝারি প্রভাব',
    today: 'আজ',
    approxDate: 'আনুমানিক তারিখ',
    affectedPairs: 'যে পেয়ারগুলোতে প্রভাব পড়ে',
    noNews: 'এই মাসে আর কোনো আসন্ন নিউজ নেই।',
    noFixedDates: 'এই বছরের সেন্ট্রাল ব্যাংক মিটিংয়ের তারিখ এখনো যোগ করা হয়নি — শুধু মাসিক ডেটা রিলিজ দেখানো হচ্ছে।',
    pair_up: 'উপরে যেতে পারে',
    pair_down: 'নিচে নামতে পারে',
    legendUp: 'উপরে / শক্তিশালী',
    legendDown: 'নিচে / দুর্বল',
    legendFlat: 'অপরিবর্তিত',
    ffSource: 'চলতি সপ্তাহের নিউজ ও সময় ForexFactory থেকে নেওয়া (কয়েক ঘণ্টা পরপর আপডেট হয়)। সময় আপনার নিজের টাইমজোনে দেখানো হচ্ছে।',
    genericEffect: 'সংখ্যা প্রত্যাশার চেয়ে ভালো (বেশি) হলে {cur} শক্তিশালী হতে পারে, খারাপ (কম) হলে {cur} দুর্বল হতে পারে।',
    genericEffectInverse: 'এখানে সংখ্যা কম হওয়াই ভালো: প্রত্যাশার চেয়ে কম হলে {cur} শক্তিশালী, বেশি হলে {cur} দুর্বল হতে পারে।',
    expertView: 'বিশেষজ্ঞদের মত',
    expertSame: 'একই সিদ্ধান্তের অংশ — বিস্তারিত উপরের কার্ডে।',
    bias_up: 'শক্তিশালী হওয়ার দিকে',
    bias_down: 'দুর্বল হওয়ার দিকে',
    bias_mixed: 'মত বিভক্ত / প্রভাব সীমিত',
    expectedMoves: 'প্রত্যাশিত দিক',
    sources: 'সূত্র',
    asset_XAU: 'গোল্ড (XAU)',
    asset_XAG: 'সিলভার (XAG)',
    weekSummary: 'এই সপ্তাহে বিশেষজ্ঞরা যা বলছেন',
    colNews: 'নিউজ',
    colExperts: 'বিশেষজ্ঞরা যা বলছেন',
    colMoves: 'যা হতে পারে',
    expertLoading: 'বিশেষজ্ঞদের বিশ্লেষণ আনা হচ্ছে… সাধারণত ১-২ সেকেন্ড লাগে।',
    expertUpdated: 'বিশেষজ্ঞদের তথ্য সর্বশেষ সংগ্রহ',
    pair_flat: 'সীমিত মুভ',
    newsDisclaimer: 'মাসিক রিলিজগুলোর তারিখ সাধারণ নিয়ম অনুযায়ী আনুমানিক; ট্রেড করার আগে অফিসিয়াল ইকোনমিক ক্যালেন্ডারে সময় মিলিয়ে নিন। প্রভাবের বর্ণনা, বিশেষজ্ঞদের মত ও ▲▼ চিহ্নগুলো সম্ভাবনা মাত্র, নিশ্চয়তা নয় — এটা বিনিয়োগ পরামর্শ নয়।',
  },
  en: {
    siteName: 'FxSadnan',
    tagline: 'Your trading edge starts here.',
    featured: 'Featured',
    latest: 'Latest stories',
    readMore: 'Read',
    ctaRead: 'Read the blog',
    reels: 'Reels',
    posts: 'Posts',
    reelsIntro: 'Every reel in one place — tap one to watch it with sound.',
    postsIntro: 'Every post in one place.',
    noReels: 'No reels yet.',
    readPost: 'Read the full post',
    close: 'Close',
    noPosts: 'No posts yet.',
    loading: 'Loading…',
    keyPoints: 'Key points',
    back: '← All posts',
    notFound: 'Post not found.',
    fallback: 'This post has no English version yet, so the Bangla one is shown.',
    dashboard: 'Dashboard',
    logout: 'Log out',
    admin: 'Admin',
    adminOnly: 'The dashboard is for the admin only. Enter the secret code.',
    secretCode: 'Secret code',
    enter: 'Enter',
    cancel: 'Cancel',
    wrongCode: 'Wrong code.',
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
    news: 'News',
    newsIntro: 'Which big news is coming up from today on, and how it can move the market.',
    prevMonth: 'Previous month',
    nextMonth: 'Next month',
    impact: 'Impact',
    allImpact: 'All',
    impact_high: 'High impact',
    impact_medium: 'Medium impact',
    today: 'Today',
    approxDate: 'Approx. date',
    affectedPairs: 'Pairs affected',
    noNews: 'No upcoming news left this month.',
    noFixedDates: "This year's central-bank meeting dates haven't been added yet — only monthly data releases are shown.",
    pair_up: 'may rise',
    pair_down: 'may fall',
    legendUp: 'Up / stronger',
    legendDown: 'Down / weaker',
    legendFlat: 'Unchanged',
    ffSource: "This week's news and times come from ForexFactory (updated every few hours). Times are shown in your own time zone.",
    genericEffect: 'A better (higher) number than expected can strengthen {cur}; a worse (lower) one can weaken {cur}.',
    genericEffectInverse: 'Lower is better here: below forecast can strengthen {cur}, above forecast can weaken {cur}.',
    expertView: 'What experts expect',
    expertSame: 'Part of the same decision — details in the card above.',
    bias_up: 'leaning stronger',
    bias_down: 'leaning weaker',
    bias_mixed: 'views split / limited impact',
    expectedMoves: 'Expected direction',
    sources: 'Sources',
    asset_XAU: 'Gold (XAU)',
    asset_XAG: 'Silver (XAG)',
    weekSummary: 'What experts are saying this week',
    colNews: 'News',
    colExperts: 'What experts say',
    colMoves: 'Likely move',
    expertLoading: 'Loading expert analysis… usually takes 1-2 seconds.',
    expertUpdated: 'Expert views last collected',
    pair_flat: 'limited move',
    newsDisclaimer: 'Monthly release dates are estimated from their usual schedule; check an official economic calendar for exact times before trading. Impact notes, expert views and ▲▼ arrows are possibilities, not guarantees — this is not investment advice.',
  },
}

const LangContext = createContext(null)

// English is the default; Bangla only when the visitor picked it with the toggle.
// The key was 'lang' before, which held an auto-saved 'bn' for every past visitor.
const LANG_KEY = 'siteLang'

function readSavedLang() {
  try {
    return localStorage.getItem(LANG_KEY) === 'bn' ? 'bn' : 'en'
  } catch {
    return 'en'
  }
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState(readSavedLang)

  useEffect(() => {
    document.documentElement.lang = lang
    try {
      localStorage.setItem(LANG_KEY, lang)
    } catch {
      // Storage unavailable (private mode); the toggle still works for this visit.
    }
  }, [lang])

  const t = (key) => STRINGS[lang][key] ?? key

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>
}

export const useLang = () => useContext(LangContext)
