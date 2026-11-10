import { collection, deleteDoc, doc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore'
import { db } from '../firebase'

// Binary lesson content. Every lesson ships with a default Bangla + English version
// (./content/<slug>.json). When the admin edits one, the edited copy is saved in the
// `posts` collection as `binary-<slug>` with market: 'binary', so the existing Firestore
// rules cover it, and it replaces the default for everyone.

const docId = (slug) => `binary-${slug}`
const defaults = import.meta.glob('./content/*.json')

export const loadDefault = (slug) => {
  const load = defaults[`./content/${slug}.json`]
  return load ? load().then((m) => m.default) : Promise.resolve(null)
}

let edits = null

// { slug: { bn: {title, content}, en: {title, content}, updatedAt } } for every edited lesson.
// Fetched once per visit; an error (offline, rules) just means the defaults are shown.
export function loadEdits() {
  edits ??= getDocs(query(collection(db, 'posts'), where('market', '==', 'binary'), where('published', '==', true)))
    .then((snap) => Object.fromEntries(snap.docs.map((d) => [d.data().slug, d.data()])))
    .catch(() => {
      edits = null
      return {}
    })
  return edits
}

// The version readers see: the admin's edit when there is one, else the default.
export async function loadLesson(slug) {
  const [def, all] = await Promise.all([loadDefault(slug), loadEdits()])
  const edit = all[slug]
  if (!def && !edit) return null
  return { bn: edit?.bn ?? def?.bn, en: edit?.en ?? def?.en, edited: !!edit, updatedAt: edit?.updatedAt ?? null }
}

export async function saveLesson(slug, { bn, en }) {
  await setDoc(doc(db, 'posts', docId(slug)), {
    market: 'binary',
    slug,
    published: true,
    bn,
    en,
    updatedAt: serverTimestamp(),
  })
  edits = null
}

// Drops the admin's edit so the default version shows again.
export async function resetLesson(slug) {
  await deleteDoc(doc(db, 'posts', docId(slug)))
  edits = null
}
