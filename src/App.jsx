import { lazy, Suspense } from 'react'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Logo from './components/Logo'
import Loader from './components/Loader'
import Ticker from './components/Ticker'
import AdminRoute from './components/AdminRoute'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'
import ForexHome from './pages/ForexHome'
import PostPage from './pages/PostPage'
import NewsImpact from './pages/NewsImpact'
import Reels from './pages/Reels'
import Posts from './pages/Posts'
import { useLang } from './context/LangContext'

// Admin pages (and the heavy editor) load only when an admin opens them.
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const PostEditor = lazy(() => import('./pages/PostEditor'))
// The Binary course section loads only when a visitor opens it.
const BinaryHome = lazy(() => import('./pages/binary/BinaryHome'))
const BinaryCourse = lazy(() => import('./pages/binary/CoursePage'))
const BinaryLesson = lazy(() => import('./pages/binary/LessonPage'))
const BinaryReels = lazy(() => import('./pages/binary/BinaryReels'))
const BinaryPosts = lazy(() => import('./pages/binary/BinaryPosts'))
const LessonEditor = lazy(() => import('./pages/binary/LessonEditor'))

export default function App() {
  const { t } = useLang()
  return (
    <>
      <Navbar />
      <Ticker />
      <ErrorBoundary>
        <Suspense fallback={<Loader page />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/post/:id" element={<PostPage />} />
            <Route path="/forex" element={<ForexHome />} />
            <Route path="/forex/reels" element={<Reels />} />
            <Route path="/forex/posts" element={<Posts />} />
            <Route path="/reels" element={<Navigate to="/forex/reels" replace />} />
            <Route path="/posts" element={<Navigate to="/forex/posts" replace />} />
            <Route path="/news" element={<NewsImpact />} />
            <Route path="/binary" element={<BinaryHome />} />
            <Route path="/binary/reels" element={<BinaryReels />} />
            <Route path="/binary/posts" element={<BinaryPosts />} />
            <Route path="/binary/:courseId" element={<BinaryCourse />} />
            <Route path="/binary/:courseId/:slug" element={<BinaryLesson />} />
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
            <Route
              path="/admin/binary/:courseId/:slug?"
              element={
                <AdminRoute>
                  <LessonEditor />
                </AdminRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
      <footer className="footer">
        <div className="container footer-inner">
          <Link to="/" className="brand" onClick={() => window.scrollTo(0, 0)}>
            <Logo />
          </Link>
          <p className="footer-tagline">{t('tagline')}</p>
          <p className="footer-meta">
            © {new Date().getFullYear()} FxSadnan
          </p>
        </div>
      </footer>
    </>
  )
}
