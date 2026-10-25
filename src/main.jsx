import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const root = createRoot(document.getElementById('root'))
const configured = import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID

// Without Firebase keys, getAuth() throws on import and the page stays blank,
// so show setup instructions instead of loading the app.
if (!configured) {
  root.render(
    <main className="container narrow page-pad">
      <div className="panel">
        <h1>Firebase config nei</h1>
        <p>
          Project folder e <code>.env.example</code> copy kore <code>.env.local</code> naam din, tarpor Firebase
          console er Web app config theke value gulo boshan. Tarpor dev server bondho kore abar{' '}
          <code>npm run dev</code> chalan.
        </p>
      </div>
    </main>,
  )
} else {
  const [{ BrowserRouter }, { default: App }, { AuthProvider }, { LangProvider }] = await Promise.all([
    import('react-router-dom'),
    import('./App.jsx'),
    import('./context/AuthContext'),
    import('./context/LangContext'),
  ])
  root.render(
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <LangProvider>
            <App />
          </LangProvider>
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>,
  )
}
