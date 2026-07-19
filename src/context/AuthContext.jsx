import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../firebase.js'
import { ADMIN_EMAILS } from '../storeConfig.js'

function isAdminEmail(email) {
  return !!email && ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(email.toLowerCase())
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured) { setLoading(false); return }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null)   // store ANY signed-in user, not just admins
      setLoading(false)
    })
    return unsub
  }, [])

  const isAdmin = isAdminEmail(user?.email)

  // Signs in any Google account (customers + admins)
  async function loginWithGoogle() {
    if (!isFirebaseConfigured) throw new Error('Firebase not connected.')
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    const cred = await signInWithPopup(auth, provider)
    return cred.user
  }

  // Admin-only email/password login
  async function login(email, password) {
    if (!isFirebaseConfigured) throw new Error('Firebase not connected.')
    const cred = await signInWithEmailAndPassword(auth, email, password)
    if (!isAdminEmail(cred.user.email)) {
      await signOut(auth)
      throw new Error('This account is not an authorised Play11 admin.')
    }
    return cred.user
  }

  async function logout() {
    if (isFirebaseConfigured) await signOut(auth)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, login, loginWithGoogle, logout, isFirebaseConfigured }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
