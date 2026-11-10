import { sectionTitle } from './sections'
import titlesEn from './data/titlesEn.json'
// Course photos with their printed titles removed; CourseCover draws the titles as animated text.
import priceActionCover from './assets/img/covers/priceAction-clean.jpg'
import otcCover from './assets/img/covers/otc-clean.jpg'
import psyCover from './assets/img/covers/psy-clean.jpg'
import moneyCover from './assets/img/covers/MoneyManagement-clean.jpg'

// The Binary section: two lesson courses and two single articles. Each lesson's text lives in
// ./content/<slug>.json (Bangla + English) and can be edited by the admin (see store.js).
// Lists below: [lesson key, Bangla title as shown in that course].

const PRICE_ACTION = [
  ['priceAction1', 'প্রাইস অ্যাকশন কী?'],
  ['candleInformation', 'ক্যান্ডেল ইনফরমেশন বা তথ্য'],
  ['candleIdentification', 'ক্যান্ডেল আইডেন্টিফিকেশন'],
  ['allLevels', 'অল লেভেলস'],
  ['support&Resistance', 'সাপোর্ট অ্যান্ড রেজিস্ট্যান্স'],
  ['scl', 'SCL'],
  ['dcl', 'DCL'],
  ['tcl', 'TCL'],
  ['trend', 'ট্রেন্ড'],
  ['openArea', 'টার্গেট'],
  ['internalStructure', 'ইন্টারনাল স্ট্রাকচার'],
  ['zone', 'জোন'],
  ['chart1', 'চার্ট-১'],
  ['chart2', 'চার্ট-২'],
  ['roundNumber', 'রাউন্ড নাম্বার'],
  ['reaction', 'রিঅ্যাকশন'],
  ['fiveSecConfirmation', 'ফাইভ সেকেন্ড কনফার্মেশন'],
  ['analysis', 'অ্যানালাইসিস'],
]

const MASTER_CLASS = [
  ['candleInformation', 'ক্যান্ডেল ইনফরমেশন বা তথ্য'],
  ['strongCandle', 'শক্তিশালী ক্যান্ডেল'],
  ['weakCandle', 'উইক বা দুর্বল ক্যান্ডেল'],
  ['symmetrical', 'সিমেট্রিক্যাল (ভারসাম্য)'],
  ['orderFlow', 'অর্ডারফ্লো'],
  ['disOrderFlow', 'ডিসঅর্ডারফ্লো'],
  ['normalMarket', 'স্বাভাবিক মার্কেট'],
  ['pressureMarket', 'চাপের মার্কেট'],
  ['weakMarket', 'উইক বা দুর্বল মার্কেট'],
  ['marketStrength', 'মার্কেট স্ট্রেংথ / মার্কেট নাম্বারিং'],
  ['trend', 'ট্রেন্ড'],
  ['openArea', 'ওপেন এরিয়া'],
  ['strongReflection', 'স্বাভাবিক রিফ্লেকশন'],
  ['pressureReflection', 'চাপের রিফ্লেকশন'],
  ['weakReflection', 'উইক বা দুর্বল রিফ্লেকশন'],
  ['directionalizom', 'দিকনির্দেশনা (Move Catch/ Direction)'],
  ['trapAbsent', 'ট্র্যাপ অ্যাবসেন্ট'],
  ['trapOne', 'ট্র্যাপ ১'],
  ['trapTwo', 'ট্র্যাপ ২'],
  ['trapThree', 'ট্র্যাপ ৩'],
  ['trapFour', 'ট্র্যাপ ৪'],
  ['trapFive', 'ট্র্যাপ ৫'],
  ['trapSix', 'ট্র্যাপ ৬'],
  ['trapSeven', 'ট্র্যাপ ৭'],
  ['miniZone', 'মিনিজোন'],
  ['influence&Hints', 'ইনফ্লুয়েন্স ও হিন্টস'],
  ['liquidity', 'লিকুইডিটি'],
  ['liquidityHunt', 'লিকুইডিটি হান্ট'],
  ['sellSideLiquidity', 'এস এস লিকুইডিটি (সেল সাইড)'],
  ['buySideLiquidity', 'বি এস লিকুইডিটি (বাই সাইড)'],
  ['pressureGenerate', 'প্রেসার জেনারেট'],
  ['measurement&DemandArea', 'মেজারমেন্ট ও ডিমান্ড এরিয়া'],
  ['measurement&SupplyArea', 'মেজারমেন্ট ও সাপ্লাই এরিয়া'],
  ['areaFillUp', 'এরিয়া ফিল-আপ'],
  ['fiveSecConfirmation', '৫ সেকেন্ড কনফার্মেশন'],
  ['optimalPressure', 'অপ্টিমাল প্রেসার'],
]

// URL-friendly name for a lesson key: "support&Resistance" -> "support-and-resistance".
export const slugOf = (key) =>
  key
    .replace(/&/g, '-and-')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()

const withSlugs = (list) =>
  list.map(([key, bn], i) => ({ key, slug: slugOf(key), title: { bn, en: titlesEn[key] ?? bn }, number: i + 1 }))

export const COURSES = [
  {
    id: 'price-action',
    title: sectionTitle('price-action'),
    cover: priceActionCover,
    hue: 165,
    intro: {
      bn: 'ক্যান্ডেল, লেভেল, জোন ও চার্ট প্যাটার্ন — দাম কীভাবে চলে তার ভিত্তি।',
      en: 'Candles, levels, zones and chart patterns — the basics of how price moves.',
    },
    lessons: withSlugs(PRICE_ACTION),
  },
  {
    id: 'master-class',
    title: sectionTitle('master-class'),
    cover: otcCover,
    hue: 140,
    intro: {
      bn: 'ক্যান্ডেল, অর্ডারফ্লো, ট্র্যাপ, লিকুইডিটি ও এরিয়া — ধাপে ধাপে বিস্তারিত পাঠ।',
      en: 'Candles, order flow, traps, liquidity and areas — step-by-step lessons.',
    },
    lessons: withSlugs(MASTER_CLASS),
  },
]

// Single-page topics, shown like a lesson without a course list. Their slug is their id.
export const ARTICLES = [
  {
    id: 'psychology',
    title: sectionTitle('psychology'),
    cover: psyCover,
    hue: 190,
    intro: { bn: 'ভয়, লোভ, শৃঙ্খলা ও ধৈর্য — ট্রেডিংয়ের মানসিক দিক।', en: 'Fear, greed, discipline and patience — the mental side of trading.' },
  },
  {
    id: 'money-management',
    title: sectionTitle('money-management'),
    cover: moneyCover,
    hue: 300,
    intro: {
      bn: 'রিস্ক রুল, কম্পাউন্ডিং ও ডেইলি লিমিট — অ্যাকাউন্ট টিকিয়ে রাখার নিয়ম।',
      en: 'Risk rules, compounding and daily limits — keeping the account alive.',
    },
  },
].map((a) => ({ ...a, key: a.id, slug: a.id }))

export const findCourse = (id) => COURSES.find((c) => c.id === id)
export const findArticle = (id) => ARTICLES.find((a) => a.id === id)

// Every editable page once: shared lessons (in both courses) appear a single time.
export const ALL_LESSONS = [...new Map([...COURSES.flatMap((c) => c.lessons.map((l) => [l.slug, { ...l, course: c }])), ...ARTICLES.map((a) => [a.slug, { ...a, number: null, course: null }])]).values()]

// Hand-picked starting points, as on the original course home page.
export const START_HERE = [
  ['price-action', 'priceAction1'],
  ['price-action', 'support&Resistance'],
  ['price-action', 'zone'],
  ['master-class', 'orderFlow'],
  ['master-class', 'liquidityHunt'],
  ['master-class', 'trapOne'],
].map(([courseId, key]) => {
  const course = findCourse(courseId)
  return { course, lesson: course.lessons.find((l) => l.key === key) }
})
