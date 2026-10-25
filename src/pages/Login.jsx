import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { useAuth } from '../context/AuthContext'

// Admin-only login. Readers never need an account.
export default function Login() {
  const { user, isAdmin, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (!loading && isAdmin) return <Navigate to="/admin" replace />

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch {
      setError('Email ba password vul.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="container page-pad">
      <form className="panel login" onSubmit={submit}>
        <h1>Admin login</h1>
        {user && !loading && !isAdmin && (
          <p className="error">
            {user.email} admin na.{' '}
            <button type="button" className="link-btn" onClick={() => signOut(auth)}>
              Logout
            </button>
          </p>
        )}
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary" disabled={busy}>
          {busy ? '…' : 'Login'}
        </button>
      </form>
    </main>
  )
}
