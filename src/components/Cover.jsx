import { useEffect, useRef } from 'react'
import { srcSet } from '../lib/images'
import { coverVideoSrc } from '../lib/video'

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// A post's cover: the looping animated version when the post has one, else the still image
// (which is also the video's poster). The video only plays while it is on screen.
export default function Cover({ post, className, sizes, eager = false }) {
  const video = useRef(null)
  const animated = !!post.coverVideoUrl && !reducedMotion()

  useEffect(() => {
    const el = video.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? el.play().catch(() => {}) : el.pause()))
    io.observe(el)
    return () => io.disconnect()
  }, [animated])

  if (animated) {
    return (
      <video
        ref={video}
        className={className}
        src={coverVideoSrc(post.coverVideoUrl)}
        poster={post.coverUrl}
        muted
        loop
        playsInline
        preload={eager ? 'auto' : 'metadata'}
        aria-hidden="true"
      />
    )
  }
  return (
    <img
      className={className}
      src={post.coverUrl}
      srcSet={srcSet(post.coverUrl)}
      sizes={sizes}
      alt=""
      loading={eager ? 'eager' : 'lazy'}
    />
  )
}
