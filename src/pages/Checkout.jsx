import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { inr } from '../utils/format.js'
import { buildWhatsAppOrderLink, STORE } from '../storeConfig.js'

export default function Checkout() {
  const { items, subtotal, clear } = useCart()
  const [placed, setPlaced] = useState(false)
  const [busy, setBusy] = useState(false)
  const [snapshot, setSnapshot] = useState(null)
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '',
    city: '', state: '', pincode: '', country: 'India',
  })

  function update(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  function placeOrder(e) {
    e.preventDefault()
    setBusy(true)
    // Send the order straight to Play11 on WhatsApp.
    const waLink = buildWhatsAppOrderLink(form, items, subtotal)
    const wa = window.open(waLink, '_blank')
    setSnapshot({ form: { ...form }, items: [...items], subtotal, waLink })
    // Fallback if the popup was blocked: redirect this tab to WhatsApp.
    if (!wa) window.location.href = waLink
    setPlaced(true)
    clear()
    setBusy(false)
  }

  if (placed) {
    return (
      <div className="checkout-success">
        <div className="checkout-success__tick">✓</div>
        <h1>Order received!</h1>
        <p>
          Thank you, {form.name || 'champion'}! Your order just opened in
          <strong> WhatsApp</strong> — tap <strong>send</strong> there to deliver
          it straight to Play11. We'll reply with the <strong>delivery charge for
          your location</strong> ({form.city || 'your area'}, {form.state || 'India'})
          and confirm the rest.
        </p>
        <div className="checkout-success__actions">
          {snapshot && (
            <a href={snapshot.waLink} className="btn btn--primary" target="_blank" rel="noreferrer">
              Open WhatsApp again
            </a>
          )}
          <Link to="/shop" className="btn btn--ghost">Keep Shopping</Link>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="cart cart--empty">
        <h1>Nothing to check out</h1>
        <Link to="/shop" className="btn btn--primary btn--lg">Shop Jerseys</Link>
      </div>
    )
  }

  return (
    <div className="checkout">
      <h1 className="cart__title">Checkout</h1>
      <div className="checkout__layout">
        <form className="checkout__form" onSubmit={placeOrder}>
          <h2>Delivery details</h2>
          <div className="field">
            <label>Full name *</label>
            <input name="name" required value={form.name} onChange={update} />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Phone / WhatsApp *</label>
              <input name="phone" required value={form.phone} onChange={update} placeholder="+91 …" />
            </div>
            <div className="field">
              <label>Email <span className="field-opt">(optional)</span></label>
              <input type="email" name="email" value={form.email} onChange={update} placeholder="Optional" />
            </div>
          </div>
          <div className="field">
            <label>Address *</label>
            <input name="address" required value={form.address} onChange={update} placeholder="House / street / landmark" />
          </div>
          <div className="field-row">
            <div className="field">
              <label>City / Town *</label>
              <input name="city" required value={form.city} onChange={update} />
            </div>
            <div className="field">
              <label>State *</label>
              <input name="state" required value={form.state} onChange={update} placeholder="Kerala" />
            </div>
            <div className="field">
              <label>PIN code *</label>
              <input name="pincode" required value={form.pincode} onChange={update} placeholder="670307" />
            </div>
          </div>

          <div className="checkout__note">
            📦 <strong>Delivery is all-India.</strong> Tapping the button sends your
            order to Play11 on <strong>WhatsApp</strong>. We review your location and
            reply with the exact <strong>delivery charge & details</strong>. No payment
            is taken now.
          </div>
          <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={busy}>
            {busy ? 'Opening WhatsApp…' : `Place Order on WhatsApp · ${inr(subtotal)} + delivery`}
          </button>
          <p className="checkout__wa-hint">You'll be taken to WhatsApp to send the order to {STORE.phone}.</p>
        </form>

        <aside className="checkout__summary">
          <h2>Your order</h2>
          {items.map((i) => (
            <div className="checkout-line" key={i.key}>
              <span>{i.qty}× {i.name} <em>({i.size}{i.sleeve ? `, ${i.sleeve}` : ''})</em></span>
              <span>{inr(i.price * i.qty)}</span>
            </div>
          ))}
          <div className="summary-row"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
          <div className="summary-row"><span>Delivery (All India)</span><span>Confirmed after order</span></div>
          <div className="summary-row summary-row--total"><span>Pay now</span><span>₹0</span></div>
          <p className="summary-hint">You pay items + delivery once Play11 confirms the charge for your location.</p>
        </aside>
      </div>
    </div>
  )
}
