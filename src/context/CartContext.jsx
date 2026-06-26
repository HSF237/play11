import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'play11_cart'

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const { product, size, qty } = action
      const key = `${product.id}__${size}`
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const value = useMemo(() => {
    const count = items.reduce((n, i) => n + i.qty, 0)
    const subtotal = items.reduce((n, i) => n + i.price * i.qty, 0)
    return {
      items,
      count,
      subtotal,
      addItem: (product, size, qty = 1) =>
        dispatch({ type: 'ADD', product, size, qty }),
      removeItem: (key) => dispatch({ type: 'REMOVE', key }),
      setQty: (key, qty) => dispatch({ type: 'SET_QTY', key, qty }),
      clear: () => dispatch({ type: 'CLEAR' }),
    }
  }, [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
