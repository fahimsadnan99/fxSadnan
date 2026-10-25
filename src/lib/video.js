// Reels are stored as the raw Cloudinary video URL; these derive what the browser loads.
// 720px wide is plenty for a phone-sized vertical player and keeps files small.
export const reelSrc = (url) => url.replace('/video/upload/', '/video/upload/q_auto,w_720/')

// A frame from 1s in, as a JPEG, used as the poster before the video plays.
export const reelPoster = (url) =>
  url.replace('/video/upload/', '/video/upload/so_1,w_540,q_auto/').replace(/\.\w+$/, '.jpg')
