import { Link, NavLink } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import LangToggle from './LangToggle'
import Logo from './Logo'

export default function Navbar() {
  const { user, isAdmin } = useAuth()
  const { t } = useLang()

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand" aria-label="FxSadnan home">
          <Logo />
        </Link>
        <div className="nav-right">
          <NavLink to="/news" className="btn btn-ghost btn-sm nav-link">
            <span className="nav-label-full">{t('newsImpact')}</span>
            <span className="nav-label-short">{t('news')}</span>
          </NavLink>
          <LangToggle />
          {isAdmin && (
            <Link to="/admin" className="btn btn-ghost btn-sm">
              {t('dashboard')}
            </Link>
          )}
          {user && (
            <button className="btn btn-ghost btn-sm" onClick={() => signOut(auth)}>
              {t('logout')}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
