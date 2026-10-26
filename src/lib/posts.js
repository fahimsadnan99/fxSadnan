import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'

// Post shape in Firestore:
// {
//   coverUrl, coverVideoUrl (optional animated loop of the cover), published, createdAt, updatedAt,
//   bn: { title, topic, keyPoints: [], content: '<html>' },
//   en: { title, topic, keyPoints: [], content: '<html>' },
// }

const postsCol = collection(db, 'posts')

export const LANGS = ['bn', 'en']

export const emptyVersion = () => ({ title: '', topic: '', keyPoints: [], content: '', reelUrl: '' })

const toPost = (snap) => ({ id: snap.id, ...snap.data() })

const newestFirst = (posts) =>
  posts.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))

// Sorted on the client so no composite Firestore index is needed.
export async function listPublishedPosts() {
  const snap = await getDocs(query(postsCol, where('published', '==', true)))
  return newestFirst(snap.docs.map(toPost).filter((p) => !p.deleted))
}

export async function listAllPosts() {
  const snap = await getDocs(postsCol)
  return newestFirst(snap.docs.map(toPost))
}

export async function getPost(id) {
  const snap = await getDoc(doc(db, 'posts', id))
  return snap.exists() ? toPost(snap) : null
}

export function createPost(data) {
  return addDoc(postsCol, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
}

export function updatePost(id, data) {
  return updateDoc(doc(db, 'posts', id), { ...data, updatedAt: serverTimestamp() })
}

// Trash: the post is hidden from readers (unpublished) but kept, so it can be restored.
// `wasPublished` remembers whether to republish it on restore.
export function trashPost(post) {
  return updateDoc(doc(db, 'posts', post.id), {
    deleted: true,
    deletedAt: serverTimestamp(),
    wasPublished: !!post.published,
    published: false,
  })
}

export function restorePost(post) {
  return updateDoc(doc(db, 'posts', post.id), {
    deleted: false,
    deletedAt: null,
    published: !!post.wasPublished,
  })
}

// Permanent delete — only used from the Trash.
export function deletePost(id) {
  return deleteDoc(doc(db, 'posts', id))
}

// Returns the version for `lang`, falling back to the other language if it was left empty.
export function pickVersion(post, lang) {
  const other = lang === 'bn' ? 'en' : 'bn'
  const wanted = post[lang]
  if (wanted?.title) return { ...emptyVersion(), ...wanted, lang, isFallback: false }
  return { ...emptyVersion(), ...post[other], lang: other, isFallback: true }
}

// Reels are English-only and shown for every language. bn.reelUrl is only a fallback for
// older posts that never got an English reel.
export const reelOf = (post) => post.en?.reelUrl || post.bn?.reelUrl || ''

export function formatDate(timestamp, lang) {
  if (!timestamp?.toDate) return ''
  return timestamp.toDate().toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
    dateStyle: 'medium',
  })
}
