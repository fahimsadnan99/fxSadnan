import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { ADMIN_LOCK } from '../config'

const AuthContext = createContext(null)

// A user is an admin when a document with their UID exists in the `admins` collection.
// Firestore rules enforce the same check, so this flag only controls what the UI shows.
export function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, isAdmin: false, loading: true })

  useEffect(
    () =>
      onAuthStateChanged(auth, async (user) => {
        if (!ADMIN_LOCK) {
          setState({ user, isAdmin: true, loading: false })
          return
        }
        if (!user) {
          setState({ user: null, isAdmin: false, loading: false })
          return
        }
        let isAdmin = false
        try {
          isAdmin = (await getDoc(doc(db, 'admins', user.uid))).exists()
        } catch {
          isAdmin = false
        }
        setState({ user, isAdmin, loading: false })
      }),
    [],
  )

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
