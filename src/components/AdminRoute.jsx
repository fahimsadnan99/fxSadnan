import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'

export default function AdminRoute({ children }) {
  const { isAdmin, loading } = useAuth()
  const { t } = useLang()

  if (loading) return <p className="container muted page-pad">{t('loading')}</p>
  if (!isAdmin) return <Navigate to="/login" replace />
  return children
}
