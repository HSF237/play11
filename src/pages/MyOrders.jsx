import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { fetchOrdersByUser } from '../services/productService.js'
import { inr } from '../utils/format.js'

const STATUS_COLORS = {
  pending:   { bg: '#3b2e00', text: '#f59e0b' },
  confirmed: { bg: '#0a2e1a', text: '#34d399' },
  shipped:   { bg: '#0a1a2e', text: '#60a5fa' },
  delivered: { bg: '#0f1f0a', text: '#86efac' },
  cancelled: { bg: '#2e0a0a', text: '#f87171' },
}

export default function MyOrders() {
  const { user } = useAuth()
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchOrdersByUser(user.uid).then((data) => {
      setOrders(data)
      setLoading(false)
    })
  }, [user])

  if (loading) {
    return (
      <div className="my-orders my-orders--loading">
        <div className="spinner" />
        <p>Loading your orders…</p>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="my-orders my-orders--empty">
        <div className="my-orders__empty-icon">📦</div>
        <h2>No orders yet</h2>
        <p>You haven't placed any orders. Go grab a jersey!</p>
        <Link to="/shop" className="btn btn--primary btn--lg">Shop Now</Link>
      </div>
    )
  }

  return (
    <div className="my-orders">
      <h1 className="my-orders__title">My Orders</h1>
      <div className="my-orders__list">
        {orders.map((order) => {
          const statusStyle = STATUS_COLORS[order.status] || STATUS_COLORS.pending
          const date = order.createdAt?.toDate
            ? order.createdAt.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            : '—'

          return (
            <div className="order-card" key={order.id}>
              <div className="order-card__head">
                <div>
                  <span className="order-card__date">{date}</span>
                  <span className="order-card__id">#{order.id.slice(-6).toUpperCase()}</span>
                </div>
                <span
                  className="order-card__status"
                  style={{ background: statusStyle.bg, color: statusStyle.text }}
                >
                  {order.status || 'pending'}
                </span>
              </div>

              <div className="order-card__items">
                {order.items?.map((item, i) => (
                  <div className="order-card__item" key={i}>
                    <span className="order-card__qty">{item.qty}×</span>
                    <span className="order-card__name">{item.name}</span>
                    <span className="order-card__size">({item.size}{item.sleeve ? `, ${item.sleeve}` : ''})</span>
                    <span className="order-card__price">{inr(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>

              <div className="order-card__foot">
                <span className="order-card__addr">
                  📍 {order.form?.city}, {order.form?.state}
                </span>
                <span className="order-card__total">{inr(order.subtotal)}</span>
              </div>

              {order.status === 'pending' && (
                <p className="order-card__note">
                  ⏳ Payment is being verified. Play11 will confirm soon.
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
