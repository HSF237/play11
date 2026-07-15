import { Link } from 'react-router-dom'
import { inr } from '../utils/format.js'
import { stockInfo } from '../utils/stock.js'
import { useWishlist } from '../context/WishlistContext.jsx'

export default function ProductCard({ product }) {
  const stock = stockInfo(product)
  const { toggle, has } = useWishlist()
  const wished = has(product.id)

  return (
    <Link to={`/product/${product.id}`} className={`card ${stock.soldOut ? 'card--sold' : ''}`}>
      <div className="card__media">
        {stock.badge ? (
          <span className={`card__badge card__badge--${stock.variant}`}>
            {stock.variant === 'low' ? '⚠️ ' : ''}{stock.badge}
          </span>
        ) : product.badge ? (
          <span className="card__badge">{product.badge}</span>
        ) : null}
        <img
          src={(product.images && product.images[0]) || product.image}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src =
              'data:image/svg+xml;utf8,' +
              encodeURIComponent(
                '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="700"><rect width="100%" height="100%" fill="#15161a"/><text x="50%" y="50%" fill="#5a5d68" font-family="Arial" font-size="28" text-anchor="middle">Play11 Jersey</text></svg>'
              )
          }}
        />
        <button
          className={`card__wish ${wished ? 'is-wished' : ''}`}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toggle(product.id)
          }}
          aria-label={wished ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill={wished ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        <div className="card__overlay">
          <span className="card__view">View Jersey</span>
        </div>
      </div>
      <div className="card__body">
        <span className="card__club">{product.club || product.category}</span>
        <h3 className="card__name">{product.name}</h3>
        <span className="card__price">{inr(product.price)}</span>
      </div>
    </Link>
  )
}
