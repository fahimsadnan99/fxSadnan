// Responsive images: Cloudinary URLs are stored at w_1600; the browser picks a
// smaller copy (w_400 / w_800 / w_1200) on phones and tablets via srcset.
const WIDTHS = [400, 800, 1200, 1600]

export function srcSet(url) {
  if (!url?.includes('res.cloudinary.com') || !url.includes('w_1600')) return undefined
  return WIDTHS.map((w) => `${url.replace('w_1600', `w_${w}`)} ${w}w`).join(', ')
}

// `sizes` hints for each layout, matching the breakpoints in index.css.
export const SIZES = {
  postBody: '(max-width: 760px) 100vw, 704px',
  postCover: '(max-width: 1000px) 100vw, 1000px',
  card: '(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 380px',
  featured: '(max-width: 859px) 100vw, 680px',
}

// Adds srcset/sizes and lazy loading to every <img> in already-sanitized post HTML.
export function withResponsiveImages(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  doc.querySelectorAll('img').forEach((img) => {
    const set = srcSet(img.getAttribute('src'))
    if (set) {
      img.setAttribute('srcset', set)
      img.setAttribute('sizes', SIZES.postBody)
    }
    img.setAttribute('loading', 'lazy')
    img.setAttribute('decoding', 'async')
  })
  return doc.body.innerHTML
}
