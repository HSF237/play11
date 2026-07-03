// Single source of truth for stock / availability badges.
//
// How it works:
//  - Admin enters a "Stock (pieces)" number per jersey.
//  - Leave it blank  => stock is NOT tracked (always available, no count badge).
//  - Enter a number  => the storefront automatically shows:
//        0      -> "Sold out"   (Buy button disabled)
//        1      -> "Last piece!"
//        2..5   -> "Only N left"
//        6+     -> in stock, no urgency badge
//  - The "available" flag can still force a jersey out of stock manually.
//
// Stock only ever changes when the owner taps − / + in the admin panel,
// so window-shoppers who open WhatsApp but don't buy never reduce it.

export const LOW_STOCK = 5

export function stockInfo(p = {}) {
  // Prefer the new `stock` field; fall back to the legacy `stockLeft`.
  const raw = p.stock ?? p.stockLeft
  const tracked = raw !== null && raw !== undefined && raw !== ''
  const count = tracked ? Math.max(0, Math.floor(Number(raw) || 0)) : null

  const forcedOut = p.available === false
  const soldOut = forcedOut || (tracked && count <= 0)

  let badge = null
  let variant = null // 'sold' | 'last' | 'low'
  if (soldOut) {
    badge = 'Sold out'
    variant = 'sold'
  } else if (tracked) {
    if (count === 1) {
      badge = 'Last piece!'
      variant = 'last'
    } else if (count <= LOW_STOCK) {
      badge = `Only ${count} left`
      variant = 'low'
    }
  }

  const low = !soldOut && tracked && count <= LOW_STOCK
  return { tracked, count, soldOut, badge, variant, low }
}
