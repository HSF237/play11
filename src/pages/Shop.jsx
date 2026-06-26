import { useEffect, useMemo, useState } from 'react'
import ProductCard from '../components/ProductCard.jsx'
import { fetchProducts } from '../services/productService.js'

const CATEGORIES = ['All', 'Club', 'National', 'Retro', 'Limited']
const SLEEVES = ['All', 'Half Sleeve', 'Five Sleeve', 'Full Sleeve']

export default function Shop() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('All')
  const [sleeve, setSleeve] = useState('All')
  const [sort, setSort] = useState('featured')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [])

  const visible = useMemo(() => {
    let list = [...products]
    if (category !== 'All') list = list.filter((p) => p.category === category)
    if (sleeve !== 'All') list = list.filter((p) => (p.sleeve || 'Half Sleeve') === sleeve)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.club?.toLowerCase().includes(q)
      )
    }
    if (sort === 'price-low') list.sort((a, b) => a.price - b.price)
    if (sort === 'price-high') list.sort((a, b) => b.price - a.price)
    if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [products, category, sort, search])

  return (
    <div className="shop">
      <header className="shop__hero" data-reveal>
        <span className="section__eyebrow">The Collection</span>
        <h1>Shop Jerseys</h1>
        <p>Authentic club & national team kits. Find your legend.</p>
      </header>

      <div className="shop__toolbar">
        <div className="shop__filters">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`chip ${category === c ? 'chip--active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="shop__controls">
          <input
            className="shop__search"
            placeholder="Search jerseys…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="shop__sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name: A–Z</option>
          </select>
        </div>
      </div>

      <div className="shop__sleeves">
        <span className="shop__sleeves-label">Sleeve:</span>
        {SLEEVES.map((s) => (
          <button
            key={s}
            className={`chip chip--sm ${sleeve === s ? 'chip--active' : ''}`}
            onClick={() => setSleeve(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="shop__loading">
          <div className="spinner" />
          <p>Loading jerseys…</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="shop__empty">
          <p>No jerseys match your search.</p>
        </div>
      ) : (
        <div className="grid grid--4" data-reveal>
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
