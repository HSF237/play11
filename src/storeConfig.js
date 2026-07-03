// Admin allowlist — ONLY these Google accounts can enter the admin panel.
// Add or remove Gmail addresses here (lowercase). Anyone else who signs in with
// Google is rejected automatically.
export const ADMIN_EMAILS = [
  'play11official@gmail.com',
  'zerox9861@gmail.com',
]

// ====================================================================
// HOMEPAGE IMAGES — change these links to swap the photos on the home page.
// Use a DIRECT image link (ends in .jpg / .png / .webp).
// ====================================================================
export const HERO_IMAGE =
  'https://media.cnn.com/api/v1/images/stellar/prod/170810160912-david-beckham.jpg?q=w_3260,h_4763,x_0,y_0,c_fill'
export const STORY_IMAGE =
  'https://images.unsplash.com/photo-1760885985017-af7a49dcfb48?fm=jpg&q=60&w=3000&auto=format&fit=crop'

// Play11 store contact config — edit here if the number/details change.
export const STORE = {
  name: 'Play11',
  // WhatsApp number in international format, digits only (91 = India).
  whatsapp: '917736308424',
  phone: '+91 77363 08424',
  email: 'play11official@gmail.com',
  instagram: 'play11official',
  location: 'Payyanur, Kannur, Kerala',
}

// Builds the pre-filled WhatsApp order message and returns a wa.me link.
export function buildWhatsAppOrderLink(form, items, subtotal) {
  const lines = []
  lines.push('*NEW PLAY11 ORDER* ⚽')
  lines.push('')
  lines.push('*Items:*')
  items.forEach((i) => {
    lines.push(`• ${i.qty}× ${i.name} (Size ${i.size}${i.sleeve ? ', ' + i.sleeve : ''}) — ₹${(i.price * i.qty).toLocaleString('en-IN')}`)
  })
  lines.push('')
  lines.push(`*Items total:* ₹${Number(subtotal).toLocaleString('en-IN')}`)
  lines.push('*Delivery:* to be confirmed by Play11')
  lines.push('')
  lines.push('*Deliver to:*')
  lines.push(`Name: ${form.name}`)
  lines.push(`Phone: ${form.phone}`)
  if (form.email) lines.push(`Email: ${form.email}`)
  lines.push(`Address: ${form.address}`)
  lines.push(`${form.city}, ${form.state} - ${form.pincode}`)
  lines.push(form.country || 'India')
  lines.push('')
  lines.push('Please confirm the delivery charge for my location. Thank you!')

  const text = encodeURIComponent(lines.join('\n'))
  return `https://wa.me/${STORE.whatsapp}?text=${text}`
}
