import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import {
  fetchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from '../services/productService.js'
import { collection, getDocs, orderBy, query, doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase.js'
import { STORE } from '../storeConfig.js'
import { isFirebaseConfigured } from '../firebase.js'
import { inr } from '../utils/format.js'
import { stockInfo } from '../utils/stock.js'

const EMPTY = {
  name: '',
  club: '',
  type: 'Club',
  category: 'Regular',
  sleeve: 'Half Sleeve',
  price: '',
  originalPrice: '',
  images: '',
  description: '',
  sizes: 'S, M, L, XL',
  fabric: '',
  badge: '',
  available: true,
  featured: false,
  stock: '',
}

// Turn a pasted link into a direct, embeddable image URL.
// Google Drive "share/view" links are web pages, not images — convert them to
// the direct googleusercontent form so they actually render in <img>.
function normalizeImageUrl(url) {
  const u = url.trim()
  const drive = u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:[^]*&)?id=)([\w-]+)/)
  if (drive) return `https://lh3.googleusercontent.com/d/${drive[1]}`
  return u
}

function imagesToArray(str) {
  return str
    .split(/\n+/)
    .map((s) => normalizeImageUrl(s.trim()))
    .filter(Boolean)
}

// Does the URL look like it will actually load as an image?
function looksLikeImage(u) {
  return /\.(jpe?g|png|webp|gif|avif)(\?|#|$)/i.test(u) || /googleusercontent\.com\/d\//.test(u)
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()

  const [tab, setTab]           = useState('orders')
  const [products, setProducts] = useState([])
  const [orders, setOrders]     = useState([])
  const [form, setForm]         = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const [loadingP, setLoadingP] = useState(true)
  const [loadingO, setLoadingO] = useState(true)
  const [msg, setMsg]           = useState('')

  async function loadOrders() {
    setLoadingO(true)
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    } catch (e) {
      console.warn('loadOrders failed:', e.message)
    }
    setLoadingO(false)
  }

  async function setOrderStatus(orderId, status) {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status })
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o))
    } catch (e) {
      console.warn('setOrderStatus failed:', e.message)
    }
  }

  async function confirmOrder(order) {
    await setOrderStatus(order.id, 'confirmed')
    // Draft WhatsApp message to customer
    const itemLines = order.items?.map(
      (i) => `• ${i.qty}× ${i.name} (${i.size}${i.sleeve ? ', ' + i.sleeve : ''})`
    ).join('\n') || ''
    const msg = [
      `Hey ${order.form?.name}! 👋`,
      ``,
      `Thanks for shopping from *Play11* ⚽`,
      ``,
      `Your order has been *confirmed* and we've received your payment of *₹${order.subtotal}*.`,
      ``,
      `*Items ordered:*`,
      itemLines,
      ``,
      `We'll pack and ship your jersey soon. You'll get an update once it's on the way! 🚀`,
      ``,
      `— Team Play11, ${STORE.location}`,
    ].join('\n')

    const phone = order.form?.phone?.replace(/\D/g, '')
    const intlPhone = phone?.startsWith('91') ? phone : `91${phone}`
    window.open(`https://wa.me/${intlPhone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  async function loadProducts() {
    setLoadingP(true)
    setProducts(await fetchProducts())
    setLoadingP(false)
  }

  useEffect(() => {
    loadProducts()
    loadOrders()
  }, [])

  function flash(text) {
    setMsg(text)
    setTimeout(() => setMsg(''), 3200)
  }

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
      type: form.type || 'Club',
      category: form.category || 'Regular',
      sleeve: form.sleeve || 'Half Sleeve',
      price: Number(form.price) || 0,
      originalPrice: form.originalPrice !== '' ? Number(form.originalPrice) : null,
      images,
      image: images[0] || '',
      description: form.description,
      sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
      fabric: form.fabric || '',
      badge: form.badge || null,
      available: !!form.available,
      featured: !!form.featured,
      stock: form.stock === '' ? null : Math.max(0, Math.floor(Number(form.stock) || 0)),
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
    // Handle old products: category was 'Club'/'National', new products have a `type` field
    const legacyType = !p.type && (p.category === 'Club' || p.category === 'National') ? p.category : null
    const resolvedType = p.type || legacyType || 'Club'
    const resolvedStyle = p.type
      ? (p.category || 'Regular')
      : (p.category === 'Retro' || p.category === 'Limited' ? p.category : 'Regular')
    setForm({
      name: p.name || '',
      club: p.club || '',
      type: resolvedType,
      category: resolvedStyle,
      sleeve: p.sleeve || 'Half Sleeve',
      price: p.price ?? '',
      originalPrice: p.originalPrice ?? '',
      images: (p.images && p.images.length ? p.images : [p.image].filter(Boolean)).join('\n'),
      description: p.description || '',
      sizes: Array.isArray(p.sizes) ? p.sizes.join(', ') : 'S, M, L, XL',
      fabric: p.fabric || '',
      badge: p.badge || '',
      available: p.available !== false,
      featured: !!p.featured,
      stock: p.stock ?? p.stockLeft ?? '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Quick stock adjust from the product list (− after a confirmed sale, + to restock).
  async function adjustStock(p, delta) {
    const info = stockInfo(p)
    const base = info.tracked ? info.count : 0
    const next = Math.max(0, base + delta)
    setProducts((list) => list.map((x) => (x.id === p.id ? { ...x, stock: next } : x)))
    try {
      await updateProduct(p.id, { stock: next })
    } catch (err) {
      flash(err.message)
      loadProducts()
    }
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

      {!isFirebaseConfigured && (
        <div className="admin__warn">
          <strong>Demo mode.</strong> Connect Firebase in <code>src/firebase.js</code>{' '}
          to save products to the cloud. Right now products are samples.
        </div>
      )}

      {msg && <div className="admin__flash">{msg}</div>}

      {/* ── Tab switcher ── */}
      <div className="admin__tabs">
        <button className={`admin__tab ${tab === 'orders' ? 'admin__tab--active' : ''}`} onClick={() => setTab('orders')}>
          📦 Orders {orders.length > 0 && <span className="admin__tab-badge">{orders.filter(o => o.status === 'pending').length || ''}</span>}
        </button>
        <button className={`admin__tab ${tab === 'products' ? 'admin__tab--active' : ''}`} onClick={() => setTab('products')}>
          👕 Products
        </button>
      </div>

      {/* ── ORDERS TAB ── */}
      {tab === 'orders' && (
        <div className="admin__orders">
          {loadingO ? (
            <div className="admin__orders-loading"><div className="spinner" /> Loading orders…</div>
          ) : orders.length === 0 ? (
            <p className="admin__orders-empty">No orders yet.</p>
          ) : orders.map((order) => {
            const date = order.createdAt?.toDate
              ? order.createdAt.toDate().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
              : '—'
            const isPending = !order.status || order.status === 'pending'
            return (
              <div className={`admin-order-card ${isPending ? 'admin-order-card--pending' : ''}`} key={order.id}>
                <div className="admin-order-card__head">
                  <div>
                    <strong>{order.form?.name}</strong>
                    <span className="admin-order-card__phone">📞 {order.form?.phone}</span>
                  </div>
                  <div className="admin-order-card__meta">
                    <span className="admin-order-card__date">{date}</span>
                    <span className={`admin-order-card__status admin-order-card__status--${order.status || 'pending'}`}>
                      {order.status || 'pending'}
                    </span>
                  </div>
                </div>

                <div className="admin-order-card__items">
                  {order.items?.map((item, i) => (
                    <span key={i}>{item.qty}× {item.name} ({item.size}{item.sleeve ? `, ${item.sleeve}` : ''})</span>
                  ))}
                </div>

                <div className="admin-order-card__foot">
                  <div>
                    <span className="admin-order-card__addr">📍 {order.form?.address}, {order.form?.city}, {order.form?.state} - {order.form?.pincode}</span>
                    <span className="admin-order-card__utr">UTR: {order.utr}</span>
                  </div>
                  <div className="admin-order-card__right">
                    <strong className="admin-order-card__total">₹{order.subtotal}</strong>
                    <div className="admin-order-card__confirm-box">
                      {isPending && (
                        <>
                          <p className="admin-order-card__confirm-q">Did you receive ₹{order.subtotal} from {order.form?.name}?</p>
                          <button className="btn btn--primary btn--sm" onClick={() => confirmOrder(order)}>
                            ✅ Yes — Send Confirmation on WhatsApp
                          </button>
                        </>
                      )}
                      {order.status === 'confirmed' && (
                        <button className="btn btn--sm admin-order-card__ship-btn" onClick={() => setOrderStatus(order.id, 'shipped')}>
                          🚚 Mark as Shipped
                        </button>
                      )}
                      {order.status === 'shipped' && (
                        <button className="btn btn--sm admin-order-card__deliver-btn" onClick={() => setOrderStatus(order.id, 'delivered')}>
                          ✅ Mark as Delivered
                        </button>
                      )}
                      {order.status === 'delivered' && (
                        <span className="admin-order-card__done">🎉 Delivered</span>
                      )}
                      {!isPending && (
                        <button className="btn btn--ghost btn--sm" onClick={() => confirmOrder(order)}>
                          💬 Resend WhatsApp
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── PRODUCTS TAB ── */}
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
                <label>Type</label>
                <select name="type" value={form.type} onChange={update}>
                  <option value="Club">Club</option>
                  <option value="National">National</option>
                </select>
              </div>
              <div className="field">
                <label>Style</label>
                <select name="category" value={form.category} onChange={update}>
                  <option value="Regular">Regular</option>
                  <option value="Retro">Retro</option>
                  <option value="Limited">Limited</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label>Sleeve type</label>
              <select name="sleeve" value={form.sleeve} onChange={update}>
                <option>Half Sleeve</option><option>Five Sleeve</option><option>Full Sleeve</option>
              </select>
            </div>
            <div className="field-row">
              <div className="field">
                <label>Sale Price (₹) *</label>
                <input name="price" type="number" step="1" value={form.price} onChange={update} required placeholder="1299" />
              </div>
              <div className="field">
                <label>Original Price (₹) <span className="field-opt">for strikethrough</span></label>
                <input name="originalPrice" type="number" step="1" value={form.originalPrice} onChange={update} placeholder="1799" />
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
                Use a <b>DIRECT image link</b> ending in <b>.jpg / .png</b>
                (ImgBB: starts with <b>i.ibb.co</b>). <b>Google Drive</b> links work
                too — paste the normal share link, just set the file to
                <b> "Anyone with the link."</b> First link = main photo.
              </small>
              {previewImages.some((u) => !looksLikeImage(u)) && (
                <div className="admin__imgwarn">
                  ⚠ One of these isn't a direct image link. Use a <b>.jpg/.png</b>
                  link (ImgBB: open photo → <b>Embed codes → Direct link</b>), or a
                  <b> Google Drive</b> link set to <b>"Anyone with the link."</b>
                </div>
              )}
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
            <div className="field" style={{ maxWidth: '260px' }}>
              <label>Stock — pieces in stock</label>
              <input name="stock" type="number" min="0" value={form.stock} onChange={update} placeholder="e.g. 10" />
              <small className="field__hint">
                Leave <b>blank</b> for unlimited. Enter a number and the store
                auto-shows <b>“Only N left”</b> → <b>“Last piece!”</b> → <b>“Sold out”</b>.
                After each confirmed WhatsApp sale, just tap <b>−</b> on the jersey
                in the list below.
              </small>
            </div>
            <label className="checkbox">
              <input type="checkbox" name="available" checked={form.available} onChange={update} />
              Available for sale (uncheck to force “Sold out”)
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
              {products.map((p) => {
                const s = stockInfo(p)
                return (
                <div className="admin-row" key={p.id}>
                  <img src={(p.images && p.images[0]) || p.image} alt={p.name}
                    onError={(e) => (e.currentTarget.style.opacity = 0.2)} />
                  <div className="admin-row__info">
                    <strong>{p.name}</strong>
                    <span>{p.club} · {p.category} · {inr(p.price)}</span>
                    <span className={`admin-row__stockline ${s.soldOut ? 'is-sold' : s.low ? 'is-low' : ''}`}>
                      {s.tracked ? (s.soldOut ? 'Sold out' : s.badge || `${s.count} in stock`) : 'Stock: unlimited'}
                    </span>
                  </div>
                  <div className="admin-row__stock" title="Adjust stock">
                    <button type="button" className="stock-btn" onClick={() => adjustStock(p, -1)}
                      disabled={s.tracked && s.count <= 0} aria-label="Reduce stock by one">−</button>
                    <span className={`stock-count ${s.soldOut ? 'is-sold' : s.low ? 'is-low' : ''}`}>
                      {s.tracked ? s.count : '∞'}
                    </span>
                    <button type="button" className="stock-btn" onClick={() => adjustStock(p, 1)}
                      aria-label="Add one to stock">+</button>
                  </div>
                  <div className="admin-row__actions">
                    <button className="btn btn--sm btn--ghost" onClick={() => startEdit(p)}>Edit</button>
                    <button className="btn btn--sm btn--danger" onClick={() => handleDelete(p.id)}>Delete</button>
                  </div>
                </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
      )}

    </div>
  )
}
