import { useMemo } from 'react'
import DOMPurify from 'dompurify'
import { withResponsiveImages } from '../lib/images'
import Sketch from './component/Sketch/Sketch'

// Splits sanitized lesson HTML at its sketch placeholders (<div data-sketch="name">) so each
// sketch is drawn by the Sketch component and the rest is plain HTML.
function splitAtSketches(html) {
  const doc = new DOMParser().parseFromString(withResponsiveImages(DOMPurify.sanitize(html)), 'text/html')
  // Chart images open larger on click (LessonPage), so they are reachable by keyboard too.
  doc.querySelectorAll('img').forEach((img) => {
    img.setAttribute('tabindex', '0')
    img.setAttribute('role', 'button')
  })
  const parts = []
  let buf = ''
  const wrap = doc.createElement('div')
  for (const node of [...doc.body.childNodes]) {
    if (node.nodeType === 1 && node.matches('div[data-sketch]')) {
      if (buf) parts.push({ html: buf })
      buf = ''
      parts.push({ sketch: node.getAttribute('data-sketch') })
    } else {
      wrap.replaceChildren(node)
      buf += wrap.innerHTML
    }
  }
  if (buf) parts.push({ html: buf })
  return parts
}

export default function LessonContent({ html }) {
  const parts = useMemo(() => splitAtSketches(html || ''), [html])
  return parts.map((p, i) =>
    p.sketch ? (
      <Sketch key={i} name={p.sketch} />
    ) : (
      <div key={i} className="lesson-chunk" dangerouslySetInnerHTML={{ __html: p.html }} />
    ),
  )
}
