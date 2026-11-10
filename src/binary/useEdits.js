import { useEffect, useState } from 'react'
import { loadEdits } from './store'

// The admin's edited lessons ({ slug: {bn, en} }), or null while loading.
export function useEdits() {
  const [edits, setEdits] = useState(null)
  useEffect(() => {
    let live = true
    loadEdits().then((e) => live && setEdits(e))
    return () => {
      live = false
    }
  }, [])
  return edits
}

// A lesson's title in `lang`: the admin's edit, else the built-in title.
export const titleOf = (lesson, lang, edits) => edits?.[lesson.slug]?.[lang]?.title || lesson.title[lang] || lesson.title.bn
