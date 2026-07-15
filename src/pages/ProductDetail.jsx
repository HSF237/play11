import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { fetchProductById } from '../services/productService.js'
import { useCart } from '../context/CartContext.jsx'
import { inr } from '../utils/format.js'
import { stockInfo } from '../utils/stock.js'
import ProductCard from '../components/ProductCard.jsx'

const RECENT_KEY = 'play11_recent'

function trackRecent(product) {
  try {
    const prev = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')
    const mini = {
      id: product.id,
      name: product.name,
      club: product.club,
      price: product.price,
      category: product.category,
      badge: product.badge,
      image: (product.images && product.images[0]) || product.image,
    }
    const next = [mini, ...prev.filter((p) => p.id !== product.id)].slice(0, 5)
    localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  } catch {}
}

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [size, setSize] = useState('')
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [activeImg, setActiveImg] = useState(0)
  const [recentlyViewed, setRecentlyViewed] = useState([])

  useEffect(() => {
    setLoading(true)
    setActiveImg(0)
    try {
      const items = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')
      setRecentlyViewed(items.filter((p) => p.id !== id).slice(0, 4))
    } catch {}
    fetchProductById(id)
      .then((p) => {
        setProduct(p)
        if (p?.sizes?.length) setSize(p.sizes[0])
        if (p) trackRecent(p)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="shop__loading">
        <div className="spinner" />
        <p>Loading…</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="pdp-missing">
        <h2>Jersey not found</h2>
        <Link to="/shop" className="btn btn--primary">Back to Shop</Link>
      </div>
    )
  }

  const ALL_SIZES = ['S', 'M', 'L', 'XL', 'XXL']
  const sleeve = product.sleeve || 'Half Sleeve'
  const stock = stockInfo(product)
  const available = new Set(product.sizes?.length ? product.sizes : ALL_SIZES)
  const gallery = (product.images && product.images.length ? product.images : [product.image]).filter(Boolean)
  const FALLBACK =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="700" height="800"><rect width="100%" height="100%" fill="#15161a"/><text x="50%" y="50%" fill="#5a5d68" font-family="Arial" font-size="32" text-anchor="middle">Play11 Jersey</text></svg>'
    )

  function handleAdd() {
    addItem(product, size, qty, sleeve)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <div className="pdp">
      <div className="pdp__crumbs">
        <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / <span>{product.name}</span>
      </div>

      <div className="pdp__grid">
        <div className="pdp__gallery" data-reveal>
          <div className="pdp__media">
            {product.badge && <span className="card__badge">{product.badge}</span>}
            <img
              src={gallery[activeImg] || FALLBACK}
              alt={product.name}
              onError={(e) => { e.currentTarget.src = FALLBACK }}
            />
          </div>
          {gallery.length > 1 && (
            <div className="pdp__thumbs">
              {gallery.map((src, i) => (
                <button
                  key={i}
                  className={`pdp__thumb ${i === activeImg ? 'is-active' : ''}`}
                  onClick={() => setActiveImg(i)}
                  aria-label={`View image ${i + 1}`}
                >
                  <img src={src} alt="" onError={(e) => { e.currentTarget.src = FALLBACK }} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pdp__info" data-reveal>
          <span className="pdp__club">{product.club || product.category}</span>
          <h1 className="pdp__name">{product.name}</h1>
          <div className="pdp__price">{inr(product.price)}</div>
          {stock.soldOut ? (
            <div className="pdp__limited pdp__limited--sold">● Sold out — currently unavailable</div>
          ) : stock.low ? (
            <div className="pdp__limited">
              ⚠️ {stock.count === 1 ? 'Last piece — only 1 left in stock' : `Hurry — only ${stock.count} left in stock`}
            </div>
          ) : null}
          <p className="pdp__desc">{product.description}</p>

          <div className="pdp__sizes">
            <label>Select Size</label>
            <div className="pdp__size-row">
              {ALL_SIZES.map((s) => {
                const out = !available.has(s)
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={out}
                    title={out ? 'Out of stock' : ''}
                    className={`size-btn ${size === s ? 'size-btn--active' : ''} ${out ? 'size-btn--out' : ''}`}
                    onClick={() => !out && setSize(s)}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="pdp__meta">
            <span className="pdp__meta-label">Sleeve</span>
            <span className="pdp__meta-value">{sleeve}</span>
          </div>

          <div className="pdp__qty">
            <label>Quantity</label>
            <div className="qty-stepper">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => q + 1)}>+</button>
            </div>
          </div>

          <ul className="pdp__perks">
            <li>✓ 100% authentic, match-grade quality</li>
            <li>✓ Fast delivery across India</li>
            <li>✓ Secure, protected checkout</li>
            <li>✓ Dedicated WhatsApp support</li>
          </ul>

          <div className="pdp__bar-spacer" aria-hidden="true" />

          <div className="pdp__actions">
            <button className="btn btn--primary btn--lg" onClick={handleAdd} disabled={stock.soldOut}>
              {stock.soldOut ? 'Sold Out' : added ? '✓ Added to Cart' : 'Add to Cart'}
            </button>
            <button
              className="btn btn--ghost btn--lg"
              disabled={stock.soldOut}
              onClick={() => {
                addItem(product, size, qty, sleeve)
                navigate('/cart')
              }}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {recentlyViewed.length > 0 && (
        <section className="pdp__recent" data-reveal>
          <p className="pdp__recent-title">Recently Viewed</p>
          <div className="grid grid--4">
            {recentlyViewed.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
