import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'play11_cart'
const COUPON_KEY = 'play11_coupon'

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function loadInitialCoupon() {
  try {
    const raw = localStorage.getItem(COUPON_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const { product, size, sleeve, qty } = action
      const key = `${product.id}__${size}__${sleeve || ''}`
      const existing = state.find((i) => i.key === key)
      if (existing) {
        return state.map((i) =>
          i.key === key ? { ...i, qty: i.qty + qty } : i
        )
      }
      return [
        ...state,
        {
          key,
          id: product.id,
          name: product.name,
          price: Number(product.price) || 0,
          image: product.image,
          size,
          sleeve: sleeve || '',
          qty,
        },
      ]
    }
    case 'REMOVE':
      return state.filter((i) => i.key !== action.key)
    case 'SET_QTY':
      return state
        .map((i) =>
          i.key === action.key ? { ...i, qty: Math.max(1, action.qty) } : i
        )
        .filter((i) => i.qty > 0)
    case 'CLEAR':
      return []
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, [], loadInitial)
  const [appliedCoupon, setAppliedCoupon] = useState(loadInitialCoupon)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem(COUPON_KEY, JSON.stringify(appliedCoupon))
    } else {
      localStorage.removeItem(COUPON_KEY)
    }
  }, [appliedCoupon])

  const value = useMemo(() => {
    const count = items.reduce((n, i) => n + i.qty, 0)
    const subtotal = items.reduce((n, i) => n + i.price * i.qty, 0)

    let discount = 0
    if (appliedCoupon) {
      let applicableSubtotal = 0
      if (appliedCoupon.applicableProduct === 'all') {
        applicableSubtotal = subtotal
      } else {
        applicableSubtotal = items
          .filter((i) => i.id === appliedCoupon.applicableProduct)
          .reduce((sum, i) => sum + i.price * i.qty, 0)
      }

      if (applicableSubtotal > 0) {
        if (appliedCoupon.discountType === 'percent') {
          discount = (applicableSubtotal * appliedCoupon.discountValue) / 100
        } else {
          discount = appliedCoupon.discountValue
          if (discount > applicableSubtotal) discount = applicableSubtotal
        }
      }
    }

    const total = Math.max(0, subtotal - discount)

    return {
      items,
      count,
      subtotal,
      discount,
      total,
      appliedCoupon,
      applyCoupon: (coupon) => setAppliedCoupon(coupon),
      removeCoupon: () => setAppliedCoupon(null),
      addItem: (product, size, qty = 1, sleeve = '') =>
        dispatch({ type: 'ADD', product, size, sleeve, qty }),
      removeItem: (key) => dispatch({ type: 'REMOVE', key }),
      setQty: (key, qty) => dispatch({ type: 'SET_QTY', key, qty }),
      clear: () => {
        dispatch({ type: 'CLEAR' })
        setAppliedCoupon(null)
      },
    }
  }, [items, appliedCoupon])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
