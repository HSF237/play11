import { useState } from 'react'
import { Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { inr } from '../utils/format.js'
import { STORE } from '../storeConfig.js'
import { saveOrder } from '../services/productService.js'

const STEP_DETAILS  = 'details'
const STEP_PAYMENT  = 'payment'
const STEP_SUCCESS  = 'success'

async function sendNtfy(form, items, subtotal, utr) {
  const itemSummary = items.map((i) => `${i.qty}x ${i.name} (${i.size})`).join(', ')
  const msg = `${form.name} | ${form.phone} | Rs.${subtotal} | UTR: ${utr} | ${itemSummary} | ${form.address}, ${form.city} ${form.pincode}`

  try {
    const res = await fetch(`https://ntfy.sh/${STORE.ntfyTopic}`, {
      method: 'POST',
      headers: {
        Title: 'New Play11 Order!',
        Priority: 'high',
        Tags: 'shopping,football',
      },
      body: msg,
    })
    if (!res.ok) console.warn('ntfy response:', res.status, await res.text())
  } catch (e) {
    console.warn('ntfy notification failed:', e)
  }
}

export default function Checkout() {
  const { items, subtotal, clear } = useCart()
  const { user, loginWithGoogle }  = useAuth()
  const [step, setStep]     = useState(STEP_DETAILS)
  const [busy, setBusy]     = useState(false)
  const [utr, setUtr]       = useState('')
  const [utrError, setUtrError] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [form, setForm]     = useState({
    name: '', email: '', phone: '', address: '',
    city: '', state: '', pincode: '', country: 'India',
  })

  const upiLink = `upi://pay?pa=${encodeURIComponent(STORE.upiId)}&pn=${encodeURIComponent(STORE.name)}&am=${subtotal}&cu=INR&tn=${encodeURIComponent('Play11 Order - ' + form.name)}`

  function updateForm(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleDetails(e) {
    e.preventDefault()
    setStep(STEP_PAYMENT)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handlePayment(e) {
    e.preventDefault()
    const cleaned = utr.trim().replace(/\s/g, '')
    if (!/^\d{12,}$/.test(cleaned)) {
      setUtrError('UTR must be numbers only (no letters or spaces). Check your UPI app for the 12-digit reference.')
      return
    }
    if (/^(\d)\1+$/.test(cleaned)) {
      setUtrError('This doesn\'t look like a real UTR. Please copy the exact reference number from your UPI app.')
      return
    }
    setUtrError('')
    setBusy(true)
    try {
      await saveOrder({ form, items, subtotal, utr: cleaned })
      await sendNtfy(form, items, subtotal, cleaned)
      clear()
      setStep(STEP_SUCCESS)
    } catch (err) {
      console.error(err)
    } finally {
      setBusy(false)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /* ── Empty cart ─────────────────────────────── */
  if (items.length === 0 && step !== STEP_SUCCESS) {
    return (
      <div className="cart cart--empty">
        <h1>Nothing to check out</h1>
        <Link to="/shop" className="btn btn--primary btn--lg">Shop Jerseys</Link>
      </div>
    )
  }

  /* ── Success ────────────────────────────────── */
  if (step === STEP_SUCCESS) {
    return (
      <div className="checkout-success">
        <div className="checkout-success__tick">✓</div>
        <h1>Order received!</h1>
        <p>
          Thank you, <strong>{form.name}</strong>! Your order has been placed and
          Play11 will verify your payment shortly. Once confirmed, your jersey
          will be packed and shipped. 🚀
        </p>
        <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginTop: '0.4rem' }}>
          ⏳ Payment verification usually takes a few hours. If there's any issue with the UTR, Play11 will contact you on WhatsApp.
        </p>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
          Questions? WhatsApp us at <strong>{STORE.phone}</strong>
        </p>
        <div className="checkout-success__actions">
          <Link to="/shop" className="btn btn--primary">Keep Shopping</Link>
        </div>
      </div>
    )
  }

  /* ── Payment step ───────────────────────────── */
  if (step === STEP_PAYMENT) {
    return (
      <div className="checkout">
        <h1 className="cart__title">Complete Payment</h1>
        <div className="checkout__layout">
          <form className="checkout__form" onSubmit={handlePayment}>

            <div className="pay-box">
              <h2 className="pay-box__title">Scan & Pay</h2>
              <p className="pay-box__sub">
                Use <strong>GPay, PhonePe, Paytm</strong> or any UPI app to scan the QR code below.
              </p>

              <div className="pay-box__qr">
                <QRCodeSVG
                  value={upiLink}
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#0a0a0b"
                  level="M"
                />
                <p className="pay-box__amount">Pay ₹{Number(subtotal).toLocaleString('en-IN')}</p>
                <p className="pay-box__upi">UPI: {STORE.upiId}</p>
              </div>

              <div className="pay-box__steps">
                <span>1️⃣ Scan QR with your UPI app</span>
                <span>2️⃣ Confirm the payment of ₹{Number(subtotal).toLocaleString('en-IN')}</span>
                <span>3️⃣ Copy the <strong>UTR / reference number</strong> shown after payment</span>
                <span>4️⃣ Paste it below and submit</span>
              </div>

              <div className="field" style={{ marginTop: '1.5rem' }}>
                <label>UTR / Transaction Reference Number *</label>
                <input
                  value={utr}
                  onChange={(e) => { setUtr(e.target.value); setUtrError('') }}
                  placeholder="12-digit reference from your UPI app"
                  required
                  maxLength={30}
                />
                <small className="field__hint">
                  After paying, your UPI app shows a 12-digit number called UTR or Reference ID — copy and paste it here exactly. Numbers only, no letters.
                </small>
                {utrError && <p className="pay-box__error">{utrError}</p>}
              </div>

              <label className="pay-box__confirm-check">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                />
                I confirm I have paid <strong>₹{Number(subtotal).toLocaleString('en-IN')}</strong> to Play11 UPI and the UTR above is correct.
              </label>
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--lg btn--block"
              disabled={busy || !confirmed}
              style={{ opacity: !confirmed ? 0.5 : 1 }}
            >
              {busy ? 'Submitting…' : `Confirm Order — ₹${Number(subtotal).toLocaleString('en-IN')}`}
            </button>

            <button
              type="button"
              className="btn btn--ghost btn--block"
              style={{ marginTop: '0.75rem' }}
              onClick={() => setStep(STEP_DETAILS)}
            >
              ← Back to details
            </button>
          </form>

          <aside className="checkout__summary">
            <h2>Your order</h2>
            {items.map((i) => (
              <div className="checkout-line" key={i.key}>
                <span>{i.qty}× {i.name} <em>({i.size}{i.sleeve ? `, ${i.sleeve}` : ''})</em></span>
                <span>{inr(i.price * i.qty)}</span>
              </div>
            ))}
            <div className="summary-row summary-row--total"><span>Total</span><span>{inr(subtotal)}</span></div>
            <div className="summary-row"><span>Payment</span><span style={{ color: 'var(--gold)' }}>UPI only</span></div>
          </aside>
        </div>
      </div>
    )
  }

  /* ── Sign-in gate ───────────────────────────── */
  if (!user) {
    return (
      <div className="checkout-signin">
        <div className="checkout-signin__card">
          <div className="checkout-signin__icon">🔐</div>
          <h2>Sign in to place your order</h2>
          <p>We need your Google account to confirm your order and send updates.</p>
          <button className="btn btn--google btn--lg btn--block" onClick={loginWithGoogle}>
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z"/>
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>
          <Link to="/cart" className="checkout-signin__back">← Back to cart</Link>
        </div>
      </div>
    )
  }

  /* ── Delivery details step ──────────────────── */
  return (
    <div className="checkout">
      <h1 className="cart__title">Checkout</h1>
      <div className="checkout__layout">
        <form className="checkout__form" onSubmit={handleDetails}>
          <h2>Delivery details</h2>
          <div className="field">
            <label>Full name *</label>
            <input name="name" required value={form.name} onChange={updateForm} />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Phone / WhatsApp *</label>
              <input name="phone" required value={form.phone} onChange={updateForm} placeholder="+91 …" />
            </div>
            <div className="field">
              <label>Email <span className="field-opt">(optional)</span></label>
              <input type="email" name="email" value={form.email} onChange={updateForm} placeholder="Optional" />
            </div>
          </div>
          <div className="field">
            <label>Address *</label>
            <input name="address" required value={form.address} onChange={updateForm} placeholder="House / street / landmark" />
          </div>
          <div className="field-row">
            <div className="field">
              <label>City / Town *</label>
              <input name="city" required value={form.city} onChange={updateForm} />
            </div>
            <div className="field">
              <label>State *</label>
              <input name="state" required value={form.state} onChange={updateForm} placeholder="Kerala" />
            </div>
            <div className="field">
              <label>PIN code *</label>
              <input name="pincode" required value={form.pincode} onChange={updateForm} placeholder="670307" />
            </div>
          </div>

          <div className="checkout__note">
            💳 <strong>Online payment only.</strong> After filling your details, you'll be shown a UPI QR code to complete payment. Order is confirmed only after payment.
          </div>

          <button type="submit" className="btn btn--primary btn--lg btn--block">
            Proceed to Payment →
          </button>
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
          <div className="summary-row"><span>Delivery</span><span>Free above ₹999</span></div>
          <div className="summary-row summary-row--total"><span>Total</span><span>{inr(subtotal)}</span></div>
        </aside>
      </div>
    </div>
  )
}
