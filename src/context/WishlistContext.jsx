import { createContext, useContext, useState, useCallback } from 'react'

const KEY = 'play11_wishlist'

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] }
}

const Ctx = createContext(null)

export function WishlistProvider({ children }) {
  const [ids, setIds] = useState(load)

  const toggle = useCallback((id) => {
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const has = useCallback((id) => ids.includes(id), [ids])

  return <Ctx.Provider value={{ ids, toggle, has }}>{children}</Ctx.Provider>
}

export const useWishlist = () => useContext(Ctx)
