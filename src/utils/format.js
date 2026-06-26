// Indian Rupee formatter — e.g. inr(1299) -> "₹1,299"
export function inr(value) {
  const n = Number(value) || 0
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

// Free delivery threshold (₹) and flat delivery fee (₹) — all-India.
export const FREE_DELIVERY_OVER = 999
export const DELIVERY_FEE = 79
