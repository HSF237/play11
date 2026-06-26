import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import Logo from './Logo.jsx'

export default function Navbar() {
  const { count } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        <Link to="/" className="navbar__logo" onClick={() => setOpen(false)}>
          <Logo size={32} />
          <span className="navbar__logo-word">PLAY<span>11</span></span>
        </Link>

        <nav className={`navbar__links ${open ? 'is-open' : ''}`}>
          <NavLink to="/" end onClick={() => setOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/shop" onClick={() => setOpen(false)}>
            Shop
          </NavLink>
          <a
            href="/#story"
            onClick={(e) => {
              e.preventDefault()
              setOpen(false)
              navigate('/#story')
              if (window.location.pathname === '/') {
                document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' })
              }
            }}
          >
            Story
          </a>
          <NavLink to="/cart" className="navbar__mobile-cart" onClick={() => setOpen(false)}>
            Cart ({count})
          </NavLink>
        </nav>

        <div className="navbar__actions">
          <Link to="/cart" className="navbar__cart" aria-label="Cart">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M6 6h15l-1.5 9h-12z" />
              <circle cx="9" cy="20" r="1.4" />
              <circle cx="18" cy="20" r="1.4" />
              <path d="M6 6 5 3H2" />
            </svg>
            {count > 0 && <span className="navbar__cart-badge">{count}</span>}
          </Link>
          <button
            className={`navbar__burger ${open ? 'is-open' : ''}`}
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  )
}
