import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import LangToggle from './LangToggle'
import Logo from './Logo'
import AdminCodeModal from './AdminCodeModal'

export default function Navbar() {
  const { user, isAdmin } = useAuth()
  const { t } = useLang()
  const [askCode, setAskCode] = useState(false)

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand" aria-label="FxSadnan home" onClick={() => window.scrollTo(0, 0)}>
          <Logo />
        </Link>
        <div className="nav-right">
          <NavLink to="/reels" className="btn btn-ghost btn-sm nav-link">
            {t('reels')}
          </NavLink>
          <NavLink to="/posts" className="btn btn-ghost btn-sm nav-link">
            {t('posts')}
          </NavLink>
          <NavLink to="/news" className="btn btn-ghost btn-sm nav-link">
            {t('news')}
          </NavLink>
          <LangToggle />
          {isAdmin ? (
            <Link to="/admin" className="btn btn-ghost btn-sm">
              {t('dashboard')}
            </Link>
          ) : (
            <button className="btn btn-ghost btn-sm" onClick={() => setAskCode(true)}>
              {t('dashboard')}
            </button>
          )}
          {user && (
            <button className="btn btn-ghost btn-sm" onClick={() => signOut(auth)}>
              {t('logout')}
            </button>
          )}
        </div>
      </div>
      {askCode && <AdminCodeModal onClose={() => setAskCode(false)} />}
    </header>
  )
}
