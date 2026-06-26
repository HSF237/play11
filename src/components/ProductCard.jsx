import { Link } from 'react-router-dom'
import { inr } from '../utils/format.js'

export default function ProductCard({ product }) {
  return (
    <Link to={`/product/${product.id}`} className="card">
      <div className="card__media">
        {product.limited ? (
          <span className="card__badge card__badge--limited">⚠️ Only {product.stockLeft || 1} left</span>
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
