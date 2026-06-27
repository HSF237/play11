import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__grid">
        <div className="footer__brand">
          <div className="footer__logo"><Logo size={30} /> PLAY<span>11</span></div>
          <p>Premium authentic football jerseys. Wear the legend, own the moment.</p>
        </div>

        <div className="footer__col">
          <h4>Shop</h4>
          <Link to="/shop">All Jerseys</Link>
          <Link to="/shop">Club Kits</Link>
          <Link to="/shop">National Teams</Link>
        </div>

        <div className="footer__col">
          <h4>Company</h4>
          <a href="/#story">Our Story</a>
          <a href="/#story">Authenticity</a>
          <Link to="/admin/login">Admin</Link>
        </div>

        <div className="footer__col">
          <h4>Get in touch</h4>
          <a href="mailto:play11official@gmail.com">play11official@gmail.com</a>
          <a href="tel:+917736308424">+91 77363 08424</a>
          <a href="https://play11.in" target="_blank" rel="noreferrer">play11.in</a>
          <span className="footer__addr">Payyanur, Kannur, Kerala</span>
          <div className="footer__social">
            <a href="https://instagram.com/play11official" target="_blank" rel="noreferrer" aria-label="Instagram">IG</a>
            <a href="https://wa.me/917736308424" target="_blank" rel="noreferrer" aria-label="WhatsApp">WA</a>
            <a href="mailto:play11official@gmail.com" aria-label="Email">@</a>
          </div>
        </div>
      </div>
      <div className="footer__bottom">
        <span>© {new Date().getFullYear()} Play11 · Payyanur, Kannur. All rights reserved.</span>
        <span>Crafted for champions.</span>
      </div>
    </footer>
  )
}
