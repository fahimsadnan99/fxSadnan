import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import { ADMIN_EMAIL } from '../config'
import { useLang } from '../context/LangContext'

// Asks for the secret code before the dashboard opens. The code is the admin account's
// Firebase password, so a wrong code fails at Firebase and nothing is checked in the browser.
export default function AdminCodeModal({ onClose }) {
  const { t } = useLang()
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await signInWithEmailAndPassword(auth, ADMIN_EMAIL, code.trim())
      onClose()
      navigate('/admin')
    } catch (err) {
      // Only a rejected password means a wrong code; anything else is a setup problem worth seeing.
      const wrong = ['auth/invalid-credential', 'auth/wrong-password', 'auth/invalid-login-credentials']
      setError(wrong.includes(err.code) ? t('wrongCode') : `Login failed (${err.code ?? err.message})`)
      setBusy(false)
    }
  }

  return (
    <div className="code-modal" role="dialog" aria-modal="true" onClick={onClose}>
      <form className="panel" onSubmit={submit} onClick={(e) => e.stopPropagation()}>
        <h2>{t('dashboard')}</h2>
        <p>{t('adminOnly')}</p>
        <label>
          {t('secretCode')}
          <input
            type="password"
            inputMode="numeric"
            autoComplete="off"
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </label>
        {error && <p className="error">{error}</p>}
        <div className="code-modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            {t('cancel')}
          </button>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? '…' : t('enter')}
          </button>
        </div>
      </form>
    </div>
  )
}
