import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function AdminLogin() {
  const { login, loginWithGoogle, user, isFirebaseConfigured } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [showEmail, setShowEmail] = useState(false)

  useEffect(() => {
    if (user) navigate('/admin', { replace: true })
  }, [user, navigate])

  function cleanErr(err) {
    return err.message.replace('Firebase:', '').trim()
  }

  async function handleGoogle() {
    setError('')
    setBusy(true)
    try {
      await loginWithGoogle()
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(cleanErr(err))
    } finally {
      setBusy(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(email, password)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(cleanErr(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <Link to="/" className="auth__logo">PLAY<span>11</span></Link>
        <h1>Admin Portal</h1>
        <p className="auth__sub">Sign in with your Play11 Google account.</p>

        {!isFirebaseConfigured && (
          <div className="auth__warn">
            Firebase isn't connected yet. Add your config in <code>src/firebase.js</code>{' '}
            to enable login.
          </div>
        )}

        {error && <div className="auth__error">{error}</div>}

        <button className="btn btn--google btn--block" onClick={handleGoogle} disabled={busy}>
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z"/>
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/>
          </svg>
          {busy ? 'Signing in…' : 'Continue with Google'}
        </button>

        <button className="auth__toggle" onClick={() => setShowEmail((v) => !v)}>
          {showEmail ? 'Hide email/password' : 'Use email & password instead'}
        </button>

        {showEmail && (
          <form onSubmit={handleSubmit} className="auth__emailform">
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="play11official@gmail.com"
                required
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <button className="btn btn--primary btn--block" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        )}

        <Link to="/" className="auth__back">← Back to store</Link>
      </div>
    </div>
  )
}
