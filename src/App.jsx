import { lazy, Suspense } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Logo from './components/Logo'
import Ticker from './components/Ticker'
import AdminRoute from './components/AdminRoute'
import Home from './pages/Home'
import PostPage from './pages/PostPage'
import Login from './pages/Login'
import { useLang } from './context/LangContext'

// Admin pages (and the heavy editor) load only when an admin opens them.
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const PostEditor = lazy(() => import('./pages/PostEditor'))

export default function App() {
  const { t } = useLang()
  return (
    <>
      <Navbar />
      <Ticker />
      <Suspense fallback={<p className="container page-pad muted">{t('loading')}</p>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post/:id" element={<PostPage />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/new"
            element={
              <AdminRoute>
                <PostEditor />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/edit/:id"
            element={
              <AdminRoute>
                <PostEditor />
              </AdminRoute>
            }
          />
          <Route path="*" element={<p className="container page-pad">{t('notFound')}</p>} />
        </Routes>
      </Suspense>
      <footer className="footer">
        <div className="container footer-inner">
          <Link to="/" className="brand">
            <Logo />
          </Link>
          <p className="footer-tagline">{t('tagline')}</p>
          <p className="footer-meta">
            © {new Date().getFullYear()} FxSadnan · <Link to="/login">{t('admin')}</Link>
          </p>
        </div>
      </footer>
    </>
  )
}
