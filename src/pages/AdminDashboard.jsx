import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import {
  fetchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from '../services/productService.js'
import { fetchOrders, updateOrder } from '../services/orderService.js'
import { isFirebaseConfigured } from '../firebase.js'
import { inr } from '../utils/format.js'

const EMPTY = {
  name: '',
  club: '',
  category: 'Club',
  price: '',
  images: '',
  description: '',
  sizes: 'S, M, L, XL',
  fabric: '',
  badge: '',
  available: true,
  featured: false,
}

const STATUS = {
  awaiting_delivery_quote: 'Awaiting delivery quote',
  quoted: 'Delivery quoted',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

function imagesToArray(str) {
  return str
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const [tab, setTab] = useState('products')

  // products
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const [loadingP, setLoadingP] = useState(true)

  // orders
  const [orders, setOrders] = useState([])
  const [loadingO, setLoadingO] = useState(true)

  const [msg, setMsg] = useState('')

  async function loadProducts() {
    setLoadingP(true)
    setProducts(await fetchProducts())
    setLoadingP(false)
  }
  async function loadOrders() {
    setLoadingO(true)
    setOrders(await fetchOrders())
    setLoadingO(false)
  }

  useEffect(() => {
    loadProducts()
    loadOrders()
  }, [])

  function flash(text) {
    setMsg(text)
    setTimeout(() => setMsg(''), 3200)
  }

  // ---------- products ----------
  function update(e) {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }
  function resetForm() {
    setForm(EMPTY)
    setEditingId(null)
  }
  async function handleSubmit(e) {
    e.preventDefault()
    const images = imagesToArray(form.images)
    const payload = {
      name: form.name,
      club: form.club,
      category: form.category,
      price: Number(form.price) || 0,
      images,
      image: images[0] || '', // first image kept for cards/back-compat
      description: form.description,
      sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
      fabric: form.fabric || '',
      badge: form.badge || null,
      available: !!form.available,
      featured: !!form.featured,
    }
    try {
      if (editingId) {
        await updateProduct(editingId, payload)
        flash('Jersey updated ✓')
      } else {
        await addProduct(payload)
        flash('Jersey added ✓')
      }
      resetForm()
      loadProducts()
    } catch (err) {
      flash(err.message)
    }
  }
  function startEdit(p) {
    setEditingId(p.id)
    setForm({
      name: p.name || '',
      club: p.club || '',
      category: p.category || 'Club',
      price: p.price ?? '',
      images: (p.images && p.images.length ? p.images : [p.image].filter(Boolean)).join('\n'),
      description: p.description || '',
      sizes: Array.isArray(p.sizes) ? p.sizes.join(', ') : 'S, M, L, XL',
      fabric: p.fabric || '',
      badge: p.badge || '',
      available: p.available !== false,
      featured: !!p.featured,
    })
    setTab('products')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  async function handleDelete(id) {
    if (!window.confirm('Delete this jersey?')) return
    try {
      await deleteProduct(id)
      flash('Jersey deleted')
      loadProducts()
    } catch (err) {
      flash(err.message)
    }
  }

  const previewImages = imagesToArray(form.images)

  return (
    <div className="admin">
      <header className="admin__bar">
        <Link to="/" className="admin__logo">PLAY<span>11</span> <em>Admin</em></Link>
        <div className="admin__bar-right">
          <span className="admin__user">{user?.email}</span>
          <Link to="/" className="btn btn--ghost btn--sm">View Store</Link>
          <button className="btn btn--sm" onClick={logout}>Logout</button>
        </div>
      </header>

      <div className="admin__tabs">
        <button className={tab === 'products' ? 'is-active' : ''} onClick={() => setTab('products')}>
          Products ({products.length})
        </button>
        <button className={tab === 'orders' ? 'is-active' : ''} onClick={() => setTab('orders')}>
          Orders ({orders.length})
        </button>
      </div>

      {!isFirebaseConfigured && (
        <div className="admin__warn">
          <strong>Demo mode.</strong> Connect Firebase in <code>src/firebase.js</code>{' '}
          to save products & orders to the cloud. Right now products are samples and
          orders are stored only in this browser.
        </div>
      )}

      {msg && <div className="admin__flash">{msg}</div>}

      {/* ============== PRODUCTS ============== */}
      {tab === 'products' && (
        <div className="admin__layout">
          <section className="admin__panel">
            <h2>{editingId ? 'Edit Jersey' : 'Add New Jersey'}</h2>
            <form className="admin__form" onSubmit={handleSubmit}>
              <div className="field">
                <label>Jersey name *</label>
                <input name="name" value={form.name} onChange={update} required placeholder="Madrid Home 25/26" />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Club / Team</label>
                  <input name="club" value={form.club} onChange={update} placeholder="Real Madrid" />
                </div>
                <div className="field">
                  <label>Category</label>
                  <select name="category" value={form.category} onChange={update}>
                    <option>Club</option><option>National</option>
                    <option>Retro</option><option>Limited</option>
                  </select>
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Price (₹) *</label>
                  <input name="price" type="number" step="1" value={form.price} onChange={update} required placeholder="1499" />
                </div>
                <div className="field">
                  <label>Badge (optional)</label>
                  <input name="badge" value={form.badge} onChange={update} placeholder="New / Bestseller" />
                </div>
              </div>
              <div className="field">
                <label>Image URLs * (one per line — add multiple)</label>
                <textarea name="images" rows="3" value={form.images} onChange={update} required
                  placeholder={'https://…/front.jpg\nhttps://…/back.jpg\nhttps://…/detail.jpg'} />
                <small className="field__hint">
                  Paste image links (free — no upload needed). First image is the
                  main photo; the rest show as gallery thumbnails.
                </small>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Sizes (comma separated)</label>
                  <input name="sizes" value={form.sizes} onChange={update} placeholder="S, M, L, XL" />
                </div>
                <div className="field">
                  <label>Fabric / Material</label>
                  <input name="fabric" value={form.fabric} onChange={update} placeholder="100% polyester dri-fit" />
                </div>
              </div>
              <div className="field">
                <label>Description</label>
                <textarea name="description" rows="3" value={form.description} onChange={update}
                  placeholder="Match-grade fabric, heat-pressed crest, tailored fit…" />
              </div>
              <label className="checkbox">
                <input type="checkbox" name="available" checked={form.available} onChange={update} />
                In stock / available
              </label>
              <label className="checkbox">
                <input type="checkbox" name="featured" checked={form.featured} onChange={update} />
                Show on homepage (Featured)
              </label>

              {previewImages.length > 0 && (
                <div className="admin__preview">
                  <span>Preview ({previewImages.length} image{previewImages.length > 1 ? 's' : ''})</span>
                  <div className="admin__preview-row">
                    {previewImages.map((src, i) => (
                      <img key={i} src={src} alt="" onError={(e) => (e.currentTarget.style.opacity = 0.2)} />
                    ))}
                  </div>
                </div>
              )}

              <div className="admin__form-actions">
                <button className="btn btn--primary" type="submit">
                  {editingId ? 'Save Changes' : 'Add Jersey'}
                </button>
                {editingId && (
                  <button type="button" className="btn btn--ghost" onClick={resetForm}>Cancel</button>
                )}
              </div>
            </form>
          </section>

          <section className="admin__panel">
            <h2>Products ({products.length})</h2>
            {loadingP ? (
              <div className="shop__loading"><div className="spinner" /></div>
            ) : (
              <div className="admin__list">
                {products.map((p) => (
                  <div className="admin-row" key={p.id}>
                    <img src={(p.images && p.images[0]) || p.image} alt={p.name}
                      onError={(e) => (e.currentTarget.style.opacity = 0.2)} />
                    <div className="admin-row__info">
                      <strong>{p.name}</strong>
                      <span>{p.club} · {p.category} · {inr(p.price)}{p.available === false ? ' · Out of stock' : ''}</span>
                    </div>
                    <div className="admin-row__actions">
                      <button className="btn btn--sm btn--ghost" onClick={() => startEdit(p)}>Edit</button>
                      <button className="btn btn--sm btn--danger" onClick={() => handleDelete(p.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ============== ORDERS ============== */}
      {tab === 'orders' && (
        <div className="admin__orders">
          {loadingO ? (
            <div className="shop__loading"><div className="spinner" /></div>
          ) : orders.length === 0 ? (
            <div className="admin__empty">
              <p>No orders yet. When a customer places an order, it shows here so
              you can review their location and set the delivery charge.</p>
            </div>
          ) : (
            orders.map((o) => (
              <OrderCard key={o.id} order={o} onSaved={(t) => { flash(t); loadOrders() }} />
            ))
          )}
        </div>
      )}
    </div>
  )
}

function OrderCard({ order, onSaved }) {
  const [charge, setCharge] = useState(order.deliveryCharge ?? '')
  const [note, setNote] = useState(order.deliveryNote || '')
  const [status, setStatus] = useState(order.status || 'awaiting_delivery_quote')
  const c = order.customer || {}
  const itemsTotal = (order.items || []).reduce((n, i) => n + i.price * i.qty, 0)
  const grand = itemsTotal + (Number(charge) || 0)

  async function save() {
    await updateOrder(order.id, {
      deliveryCharge: charge === '' ? null : Number(charge),
      deliveryNote: note,
      status: status === 'awaiting_delivery_quote' && charge !== '' ? 'quoted' : status,
    })
    onSaved('Order updated ✓')
  }

  return (
    <div className="order-card">
      <div className="order-card__head">
        <div>
          <strong>#{String(order.id).slice(-6)}</strong>
          <span className={`order-status order-status--${status}`}>{STATUS[status] || status}</span>
        </div>
        <span className="order-card__total">Items: {inr(itemsTotal)}</span>
      </div>

      <div className="order-card__body">
        <div className="order-card__col">
          <h4>Customer</h4>
          <p>{c.name}</p>
          <p>{c.phone}</p>
          <p>{c.email}</p>
        </div>
        <div className="order-card__col">
          <h4>Deliver to</h4>
          <p>{c.address}</p>
          <p>{c.city}{c.state ? `, ${c.state}` : ''} {c.pincode}</p>
          <p>{c.country || 'India'}</p>
        </div>
        <div className="order-card__col">
          <h4>Items</h4>
          {(order.items || []).map((i) => (
            <p key={i.key}>{i.qty}× {i.name} <em>({i.size})</em></p>
          ))}
        </div>
      </div>

      <div className="order-card__quote">
        <div className="field">
          <label>Delivery charge (₹) — based on location</label>
          <input type="number" value={charge} onChange={(e) => setCharge(e.target.value)} placeholder="e.g. 60" />
        </div>
        <div className="field">
          <label>Delivery details / message to customer</label>
          <input value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Delivered in 3–4 days via India Post. COD available." />
        </div>
        <div className="field">
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div className="order-card__foot">
          <span className="order-card__grand">Total with delivery: <strong>{inr(grand)}</strong></span>
          <button className="btn btn--primary btn--sm" onClick={save}>Save / Send quote</button>
        </div>
      </div>
    </div>
  )
}
