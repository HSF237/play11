import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext.jsx'
import { fetchProducts } from '../services/productService.js'
import ProductCard from '../components/ProductCard.jsx'

export default function WishlistPage() {
  const { ids } = useWishlist()
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    fetchProducts().then((all) => {
      setProducts(all.filter((p) => ids.includes(p.id)))
      setLoading(false)
    })
  }, [ids])

  if (loading) {
    return (
      <div className="my-orders my-orders--loading">
        <div className="spinner" />
      </div>
    )
  }

  if (ids.length === 0 || products.length === 0) {
    return (
      <div className="my-orders my-orders--empty">
        <div className="my-orders__empty-icon">🤍</div>
        <h2>Your wishlist is empty</h2>
        <p>Tap the heart on any jersey to save it here.</p>
        <Link to="/shop" className="btn btn--primary btn--lg">Browse Jerseys</Link>
      </div>
    )
  }

  return (
    <div className="wishlist-page">
      <h1 className="my-orders__title">My Wishlist <span>({products.length})</span></h1>
      <div className="shop__grid">
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  )
}
