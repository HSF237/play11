import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)

// Hide the branded splash once the app has mounted (min. on-screen time so the
// loading screen is actually seen, then a smooth fade-out).
const SPLASH_MIN_MS = 1600
const start = performance.now()
function hideSplash() {
  const el = document.getElementById('p11-splash')
  if (!el) return
  const wait = Math.max(0, SPLASH_MIN_MS - (performance.now() - start))
  setTimeout(() => {
    el.classList.add('hide')
    setTimeout(() => el.remove(), 700)
  }, wait)
}
if (document.readyState === 'complete') hideSplash()
else window.addEventListener('load', hideSplash)
