import { reelPoster, reelSrc } from '../lib/video'

// Vertical (9:16) video player with sound and native controls.
export default function ReelPlayer({ url, autoPlay = false }) {
  return (
    <video
      className="reel-video"
      src={reelSrc(url)}
      poster={reelPoster(url)}
      controls
      playsInline
      preload="metadata"
      autoPlay={autoPlay}
    />
  )
}
