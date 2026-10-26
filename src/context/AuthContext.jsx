import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'
import { ADMIN_EMAIL, ADMIN_LOCK } from '../config'

const AuthContext = createContext(null)

// The admin is whoever is signed in as ADMIN_EMAIL.
// Firestore rules enforce the same check, so this flag only controls what the UI shows.
export function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, isAdmin: false, loading: true })

  useEffect(
    () =>
      onAuthStateChanged(auth, (user) => {
        const isAdmin = !ADMIN_LOCK || user?.email === ADMIN_EMAIL
        setState({ user, isAdmin, loading: false })
      }),
    [],
  )

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
