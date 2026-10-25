import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loader from './Loader'

export default function AdminRoute({ children }) {
  const { isAdmin, loading } = useAuth()

  if (loading) return <Loader page />
  if (!isAdmin) return <Navigate to="/login" replace />
  return children
}
