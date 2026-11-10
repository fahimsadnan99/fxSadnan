// Names of the Binary section's pages. Kept apart from courses.js so the navbar can show
// them without loading the lesson lists.
export const SECTIONS = [
  { id: 'price-action', title: { bn: 'প্রাইস অ্যাকশন', en: 'Price Action' } },
  { id: 'master-class', title: { bn: 'মাস্টার ক্লাস (OTC)', en: 'Master Class (OTC)' }, short: { bn: 'মাস্টার ক্লাস', en: 'Master Class' } },
  { id: 'psychology', title: { bn: 'ট্রেডিং সাইকোলজি', en: 'Trading Psychology' }, short: { bn: 'সাইকোলজি', en: 'Psychology' } },
  { id: 'money-management', title: { bn: 'মানি ম্যানেজমেন্ট', en: 'Money Management' } },
]

export const sectionTitle = (id) => SECTIONS.find((s) => s.id === id)?.title

export const isBinaryPath = (pathname) => pathname === '/binary' || pathname.startsWith('/binary/')

export const isForexPath = (pathname) =>
  pathname === '/forex' || pathname.startsWith('/forex/') || pathname.startsWith('/post/')

// Which part of the site a path belongs to: 'binary', 'forex' or the shared 'home' (home page, news, admin).
export const marketOf = (pathname) => (isBinaryPath(pathname) ? 'binary' : isForexPath(pathname) ? 'forex' : 'home')
