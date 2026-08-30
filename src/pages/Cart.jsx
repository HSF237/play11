import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { fetchCoupons } from '../services/couponService.js'
import { inr } from '../utils/format.js'

export default function Cart() {
  const { items, subtotal, discount, total, appliedCoupon, applyCoupon, removeCoupon, setQty, removeItem, count } = useCart()
  const [coupons, setCoupons] = useState([])

  useEffect(() => {
    async function load() {
      const allCoupons = await fetchCoupons()
      const now = new Date().toISOString().split('T')[0]
      const valid = allCoupons.filter(c => c.validity >= now)
      setCoupons(valid)
    }
    load()
  }, [])

  if (items.length === 0) {
    return (
      <div className="cart cart--empty">
        <h1>Your cart is empty</h1>
        <p>Looks like you haven't added your legend yet.</p>
        <Link to="/shop" className="btn btn--primary btn--lg">Shop Jerseys</Link>
      </div>
    )
  }

  return (
    <div className="cart">
      <h1 className="cart__title">Your Cart ({count})</h1>
      <div className="cart__layout">
        <div className="cart__items">
          {items.map((i) => (
            <div className="cart-item" key={i.key}>
              <img
                src={i.image}
                alt={i.name}
                onError={(e) => {
                  e.currentTarget.src =
                    'data:image/svg+xml;utf8,' +
                    encodeURIComponent(
                      '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="140"><rect width="100%" height="100%" fill="#15161a"/></svg>'
                    )
                }}
              />
              <div className="cart-item__info">
                <h3>{i.name}</h3>
                <span className="cart-item__size">Size: {i.size}{i.sleeve ? ` · ${i.sleeve}` : ''}</span>
                <span className="cart-item__price">{inr(i.price)}</span>
              </div>
              <div className="cart-item__controls">
                <div className="qty-stepper qty-stepper--sm">
                  <button onClick={() => setQty(i.key, i.qty - 1)}>−</button>
                  <span>{i.qty}</span>
                  <button onClick={() => setQty(i.key, i.qty + 1)}>+</button>
                </div>
                <button className="cart-item__remove" onClick={() => removeItem(i.key)}>
                  Remove
                </button>
              </div>
              <div className="cart-item__line">{inr(i.price * i.qty)}</div>
            </div>
          ))}

          {/* Coupons Section */}
          {coupons.length > 0 && (
            <div className="cart__coupons" style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--surface)', borderRadius: '12px' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Available Coupons</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {coupons.map(c => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
                    <div>
                      <strong style={{ display: 'block', color: 'var(--primary)', marginBottom: '0.25rem' }}>{c.code}</strong>
                      <span style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                        {c.discountType === 'percent' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                        {c.applicableProduct !== 'all' ? ' on specific product' : ' on all products'}
                      </span>
                    </div>
                    {appliedCoupon?.id === c.id ? (
                      <button className="btn btn--sm" style={{ background: 'var(--border)' }} onClick={removeCoupon}>Applied (Remove)</button>
                    ) : (
                      <button className="btn btn--sm btn--primary" onClick={() => applyCoupon(c)}>Apply</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="cart__summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal</span><span>{inr(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="summary-row" style={{ color: 'var(--primary)' }}>
              <span>Discount ({appliedCoupon?.code})</span>
              <span>-{inr(discount)}</span>
            </div>
          )}
          <div className="summary-row">
            <span>Delivery (All India)</span>
            <span>Confirmed after order</span>
          </div>
          <p className="summary-hint">
            Delivery charge depends on your location — Play11 confirms it right
            after you place the order.
          </p>
          <div className="summary-row summary-row--total">
            <span>Total</span><span>{inr(total)}</span>
          </div>
          <Link to="/checkout" className="btn btn--primary btn--lg btn--block">
            Checkout
          </Link>
          <Link to="/shop" className="cart__continue">← Continue shopping</Link>
        </aside>
      </div>
    </div>
  )
}
