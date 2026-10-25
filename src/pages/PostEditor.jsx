import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Editor from '../components/Editor'
import { createPost, emptyVersion, getPost, LANGS, updatePost } from '../lib/posts'
import { uploadImage, uploadVideo } from '../lib/upload'
import ReelPlayer from '../components/ReelPlayer'
import Loader from '../components/Loader'

const LANG_LABEL = { bn: 'বাংলা', en: 'English' }

// Optional vertical reel video for this language version.
function ReelField({ value, onChange }) {
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState('')
  const input = useRef(null)

  async function pick(file) {
    if (!file) return
    setError('')
    setProgress(0)
    try {
      onChange(await uploadVideo(file, setProgress))
    } catch (e) {
      setError(e.message)
    } finally {
      setProgress(null)
    }
  }

  return (
    <div className="reel-field">
      <div className="field-label">
        Reel video <span className="muted small">(optional · vertical 9:16 · English voice · Bangla page eo eta-i dekhabe)</span>
      </div>
      <div className="reel-field-body">
        {value && <ReelPlayer url={value} />}
        <div className="admin-actions">
          <button type="button" className="btn btn-ghost" disabled={progress !== null} onClick={() => input.current.click()}>
            {progress !== null ? `Uploading ${Math.round(progress * 100)}%…` : value ? 'Change video' : '🎬 Upload video'}
          </button>
          {value && progress === null && (
            <button type="button" className="btn btn-ghost" onClick={() => onChange('')}>
              Remove
            </button>
          )}
        </div>
        {error && <p className="error small">{error}</p>}
      </div>
      <input
        ref={input}
        type="file"
        accept="video/*"
        hidden
        onChange={(e) => {
          pick(e.target.files[0])
          e.target.value = ''
        }}
      />
    </div>
  )
}

// Key points are edited as text (one per line) and stored as an array.
const toForm = (version) => {
  const v = { ...emptyVersion(), ...version }
  return { ...v, keyPointsText: v.keyPoints.join('\n') }
}
const fromForm = ({ keyPointsText, ...v }) => ({
  ...v,
  title: v.title.trim(),
  topic: v.topic.trim(),
  keyPoints: keyPointsText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean),
})

export default function PostEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(null)
  const [tab, setTab] = useState('bn')
  const [saving, setSaving] = useState(false)
  const [coverBusy, setCoverBusy] = useState(false)
  const [message, setMessage] = useState('')
  const coverInput = useRef(null)

  useEffect(() => {
    if (!id) {
      setForm({ coverUrl: '', published: false, bn: toForm(), en: toForm() })
      return
    }
    getPost(id).then((post) => {
      if (!post) return setMessage('Post pawa jayni.')
      setForm({ coverUrl: post.coverUrl || '', published: !!post.published, bn: toForm(post.bn), en: toForm(post.en) })
    }).catch((e) => setMessage(e.message))
  }, [id])

  if (!form) return message ? <p className="container page-pad muted">{message}</p> : <Loader page />

  const setVersion = (lang, patch) => setForm((f) => ({ ...f, [lang]: { ...f[lang], ...patch } }))

  async function changeCover(file) {
    if (!file) return
    setCoverBusy(true)
    setMessage('')
    try {
      const url = await uploadImage(file)
      setForm((f) => ({ ...f, coverUrl: url }))
    } catch (e) {
      setMessage(e.message)
    } finally {
      setCoverBusy(false)
    }
  }

  async function save() {
    if (!form.bn.title.trim() && !form.en.title.trim()) {
      setMessage('Kompokkhe ekta language er title din.')
      return
    }
    setSaving(true)
    setMessage('')
    const data = { coverUrl: form.coverUrl, published: form.published, bn: fromForm(form.bn), en: fromForm(form.en) }
    try {
      if (id) await updatePost(id, data)
      else await createPost(data)
      navigate('/admin')
    } catch (e) {
      setMessage(e.message)
      setSaving(false)
    }
  }

  return (
    <main className="container page-pad">
      <div className="admin-head">
        <h1>{id ? 'Blog edit' : 'Notun blog'}</h1>
        <div className="admin-actions">
          <label className="check">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
            />
            Publish
          </label>
          <button className="btn btn-ghost" onClick={() => navigate('/admin')}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={save} disabled={saving || coverBusy}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {message && <p className="error">{message}</p>}

      <section className="panel cover-panel">
        <div className="cover-preview">
          {form.coverUrl ? <img src={form.coverUrl} alt="" /> : <span className="muted">Cover photo nei</span>}
        </div>
        <div>
          <h3>Cover photo</h3>
          <p className="muted small">Card ar post er upore ei chhobi dekhabe.</p>
          <button className="btn btn-ghost" onClick={() => coverInput.current.click()} disabled={coverBusy}>
            {coverBusy ? 'Uploading…' : form.coverUrl ? 'Change' : 'Upload'}
          </button>
          {form.coverUrl && (
            <button className="btn btn-ghost" onClick={() => setForm((f) => ({ ...f, coverUrl: '' }))}>
              Remove
            </button>
          )}
          <input
            ref={coverInput}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              changeCover(e.target.files[0])
              e.target.value = ''
            }}
          />
        </div>
      </section>

      <div className="tabs">
        {LANGS.map((lang) => (
          <button key={lang} className={tab === lang ? 'tab active' : 'tab'} onClick={() => setTab(lang)}>
            {LANG_LABEL[lang]}
            {form[lang].title.trim() ? ' ✓' : ''}
          </button>
        ))}
      </div>

      {/* Both editors stay mounted so each keeps its own undo history while switching tabs. */}
      {LANGS.map((lang) => (
        <section key={lang} className="panel version-form" hidden={tab !== lang} lang={lang}>
          <div className="row">
            <label>
              Title
              <input value={form[lang].title} onChange={(e) => setVersion(lang, { title: e.target.value })} />
            </label>
            <label>
              Topic
              <input
                value={form[lang].topic}
                placeholder={lang === 'bn' ? 'যেমন: ভ্রমণ' : 'e.g. Travel'}
                onChange={(e) => setVersion(lang, { topic: e.target.value })}
              />
            </label>
          </div>
          <div className="field-label">Content</div>
          <Editor
            content={form[lang].content}
            onChange={(html) => setVersion(lang, { content: html })}
            placeholder={lang === 'bn' ? 'এখানে লিখুন… (ছবি টেনে এনে ছাড়তে পারেন)' : 'Write here… (you can drop photos in)'}
          />
          <label>
            Key points / Summary <span className="muted small">(protiti line e ekta point)</span>
            <textarea
              rows={4}
              value={form[lang].keyPointsText}
              onChange={(e) => setVersion(lang, { keyPointsText: e.target.value })}
            />
          </label>
          {/* Reels are English-only; the same reel plays for Bangla readers too. */}
          {lang === 'en' && <ReelField value={form.en.reelUrl} onChange={(url) => setVersion('en', { reelUrl: url })} />}
        </section>
      ))}
    </main>
  )
}
