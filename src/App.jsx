import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import WhatsAppBubble from './components/WhatsAppBubble.jsx'
import AiChat from './components/AiChat.jsx'
import Home from './pages/Home.jsx'
import { useAuth } from './context/AuthContext.jsx'
import Shop from './pages/Shop.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import NotFound from './pages/NotFound.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

// Buttery inertia smooth-scroll via Lenis (loaded from CDN so no reinstall).
// Degrades gracefully to native scroll if the CDN is unavailable, and stays
// native on touch devices so mobile is never broken.
function useSmoothScroll() {
  useEffect(() => {
    let lenis
    let rafId
    let stopped = false
    import('https://cdn.jsdelivr.net/npm/lenis@1.1.14/+esm')
      .then((mod) => {
        if (stopped) return
        const Lenis = mod.default || mod.Lenis
        lenis = new Lenis({
          duration: 1.15,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          lerp: 0.09,
          wheelMultiplier: 1,
          anchors: true,
        })
        const raf = (time) => {
          lenis.raf(time)
          rafId = requestAnimationFrame(raf)
        }
        rafId = requestAnimationFrame(raf)
        window.__lenis = lenis
      })
      .catch(() => {})
    return () => {
      stopped = true
      if (rafId) cancelAnimationFrame(rafId)
      if (lenis) lenis.destroy()
      window.__lenis = null
    }
  }, [])
}

// Top scroll-progress bar — buttery, rAF-throttled, transform-only.
function useScrollProgress() {
  useEffect(() => {
    const bar = document.getElementById('scrollProgress')
    if (!bar) return
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        const doc = document.documentElement
        const max = doc.scrollHeight - doc.clientHeight
        const p = max > 0 ? doc.scrollTop / max : 0
        bar.style.transform = `scaleX(${p})`
        raf = 0
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])
}

// Reveal-on-scroll for any [data-reveal] element. Re-runs on route change and
// watches for async-loaded content (e.g. products) via a MutationObserver, so
// nothing is ever left stuck invisible.
function useReveal(pathname) {
  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -8% 0px' }
    )
    const observeAll = () =>
      document.querySelectorAll('[data-reveal]:not(.is-visible)').forEach((el) => io.observe(el))

    observeAll()
    // Catch elements rendered after async data loads.
    const mo = new MutationObserver(() => observeAll())
    mo.observe(document.body, { childList: true, subtree: true })
    const t = setTimeout(observeAll, 400)

    return () => {
      io.disconnect()
      mo.disconnect()
      clearTimeout(t)
    }
  }, [pathname])
}

export default function App() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')
  const { user } = useAuth()

  useSmoothScroll()
  useScrollProgress()
  useReveal(location.pathname)

  return (
    <div className="app-shell">
      <ScrollToTop />
      {!isAdmin && <div className="scroll-progress" id="scrollProgress" aria-hidden="true" />}
      {!isAdmin && <Navbar />}
      <main className="app-main">
        <Routes>
          <Route path="/" element={user ? <Navigate to="/shop" replace /> : <Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <WhatsAppBubble />}
      {!isAdmin && <AiChat />}
    </div>
  )
}
