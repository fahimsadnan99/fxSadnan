// Images go to Cloudinary (free tier) because Firebase Storage needs the paid Blaze plan.
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

// In-post photos all share one size, so `crop` cuts them to 16:9. Cloudinary's g_auto
// picks the important part (faces, main subject) to keep. Keep in sync with --post-img-ratio.
const POST_IMAGE = 'f_auto,q_auto,c_fill,g_auto,ar_16:9,w_1600'
const ORIGINAL_SHAPE = 'f_auto,q_auto,w_1600,c_limit'

export async function uploadImage(file, { crop = false } = {}) {
  if (!file.type.startsWith('image/')) throw new Error(`${file.name} is not an image`)
  if (!CLOUD_NAME || !UPLOAD_PRESET) throw new Error('Cloudinary is not configured (.env.local)')

  const body = new FormData()
  body.append('file', file)
  body.append('upload_preset', UPLOAD_PRESET)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'Upload failed')

  // Serve a compressed, auto-format version at most 1600px wide.
  return data.secure_url.replace('/upload/', `/upload/${crop ? POST_IMAGE : ORIGINAL_SHAPE}/`)
}

// Videos can be large, so this uses XHR to report upload progress (0–1). Returns the raw
// secure_url; lib/video.js derives the playback and poster URLs from it.
export function uploadVideo(file, onProgress = () => {}) {
  if (!file.type.startsWith('video/')) return Promise.reject(new Error(`${file.name} is not a video`))
  if (!CLOUD_NAME || !UPLOAD_PRESET) return Promise.reject(new Error('Cloudinary is not configured (.env.local)'))

  const body = new FormData()
  body.append('file', file)
  body.append('upload_preset', UPLOAD_PRESET)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`)
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total)
    xhr.onerror = () => reject(new Error('Upload failed (network)'))
    xhr.onload = () => {
      let data = {}
      try {
        data = JSON.parse(xhr.responseText)
      } catch {
        // fall through to the generic error below
      }
      if (xhr.status >= 200 && xhr.status < 300 && data.secure_url) resolve(data.secure_url)
      else reject(new Error(data.error?.message || 'Upload failed'))
    }
    xhr.send(body)
  })
}
