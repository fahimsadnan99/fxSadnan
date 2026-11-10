import { useEffect, useRef } from 'react'
import { useLang } from '../context/LangContext'

// Turns a click (or Enter / Space) on an <img> inside a post or lesson body into the image to show
// full screen; returns null for anything else. Use it from onClick / onKeyDown on the body.
export function imageFromEvent(e) {
  if (e.target.tagName !== 'IMG') return null
  if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return null
  e.preventDefault()
  return { src: e.target.currentSrc || e.target.src, alt: e.target.alt || '' }
}

// One image full screen with a close (✕) button on its top right corner. Closes on the button,
// a click outside the image, or Escape, and gives focus back to where it was.
export default function Lightbox({ image, onClose }) {
  const { t } = useLang()
  const closeRef = useRef(null)

  useEffect(() => {
    const opener = document.activeElement
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      opener?.focus?.()
    }
  }, [onClose])

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={image.alt || t('enlarge')} onClick={onClose}>
      {/* The frame hugs the image so the close button sits on the image's own corner */}
      <div className="lightbox-frame" onClick={(e) => e.stopPropagation()}>
        {/* Its shape is known once it loads; CSS then grows it to fill the screen */}
        <img
          src={image.src}
          alt={image.alt}
          onLoad={(e) => e.currentTarget.style.setProperty('--ar', e.currentTarget.naturalWidth / e.currentTarget.naturalHeight)}
        />
        <button ref={closeRef} className="reel-close" onClick={onClose} aria-label={t('close')}>
          ✕
        </button>
      </div>
    </div>
  )
}
