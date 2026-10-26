import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
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
  const [menuOpen, setMenuOpen] = useState(false)
  const navRef = useRef(null)
  const { pathname } = useLocation()

  // Close the mobile dropdown on navigation, outside tap or Escape
  useEffect(() => setMenuOpen(false), [pathname])
  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setMenuOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  return (
    <header className="nav">
      <div className="container nav-inner" ref={navRef}>
        <Link to="/" className="brand" aria-label="FxSadnan home" onClick={() => window.scrollTo(0, 0)}>
          <Logo />
        </Link>
        <button
          type="button"
          className="btn btn-ghost btn-sm nav-menu-btn"
          aria-expanded={menuOpen}
          aria-controls="nav-menu"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="nav-menu-icon" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          {t('menu')}
        </button>
        <div id="nav-menu" className={`nav-right${menuOpen ? ' open' : ''}`}>
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
            <button className="btn btn-ghost btn-sm" onClick={() => { setMenuOpen(false); setAskCode(true) }}>
              {t('dashboard')}
            </button>
          )}
          {user && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setMenuOpen(false); signOut(auth) }}>
              {t('logout')}
            </button>
          )}
        </div>
      </div>
      {askCode && <AdminCodeModal onClose={() => setAskCode(false)} />}
    </header>
  )
}
