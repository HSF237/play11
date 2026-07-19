import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { STORE } from '../storeConfig.js'

const WA = `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent('Hi! I need help with my Play11 order.')}`

const FLOWS = {
  start: {
    messages: ["Hey! I'm your Play11 guide. 👋", "What can I help you with today?"],
    options: [
      { label: '🛍️ Shop Jerseys',      next: 'shop' },
      { label: '📦 Order Help',         next: 'order' },
      { label: '🚚 Delivery Info',      next: 'delivery' },
      { label: '📐 Size Guide',         next: 'size' },
      { label: '💳 Payment & COD',      next: 'payment' },
      { label: '✅ Jersey Quality',     next: 'quality' },
      { label: '🔄 Returns & Exchange', next: 'returns' },
      { label: '💬 Talk to Play11',     next: 'whatsapp' },
    ],
  },

  // ── SHOP ──────────────────────────────────────────────
  shop: {
    messages: ['We have 4 premium collections ⚽ Which one?'],
    options: [
      { label: '🏟️ Club Kits',        next: 'shop_club' },
      { label: '🌍 National Teams',   next: 'shop_national' },
      { label: '🏆 Retro Classics',   next: 'shop_retro' },
      { label: '⭐ Limited Drops',    next: 'shop_limited' },
      { label: '← Back',              next: 'start' },
    ],
  },
  shop_club: {
    messages: [
      '🏟️ Club Kits',
      'We carry jerseys from Real Madrid, FC Barcelona, Man United, Liverpool, Man City and more!',
      'All kits are match-grade with heat-pressed crests and moisture-wicking fabric.',
    ],
    options: [
      { label: '🛍️ View Club Kits', nav: '/shop' },
      { label: '← Back',             next: 'shop' },
    ],
  },
  shop_national: {
    messages: [
      '🌍 National Teams',
      'Argentina, Brazil, France, Portugal and more world-cup national jerseys — all premium quality.',
      'The Argentina World Cup edition with 3-star crest is a fan favourite! ⭐⭐⭐',
    ],
    options: [
      { label: '🛍️ View National Kits', nav: '/shop' },
      { label: '← Back',                 next: 'shop' },
    ],
  },
  shop_retro: {
    messages: [
      '🏆 Retro Classics',
      'Iconic jerseys from legendary eras — Liverpool 2005, classic Barcelona strips, vintage national kits.',
      'Perfect for collectors and fans who love football history. The legends never fade.',
    ],
    options: [
      { label: '🛍️ View Retro Kits', nav: '/shop' },
      { label: '← Back',              next: 'shop' },
    ],
  },
  shop_limited: {
    messages: [
      '⭐ Limited Drops',
      'Rare, numbered, and iconic pieces — these sell out fast.',
      'Once they\'re gone, they\'re gone. Grab yours before it\'s too late! 🔥',
    ],
    options: [
      { label: '🛍️ View Limited Drops', nav: '/shop' },
      { label: '← Back',                 next: 'shop' },
    ],
  },

  // ── ORDER ─────────────────────────────────────────────
  order: {
    messages: ['Orders are placed via WhatsApp — simple and fast! What do you need?'],
    options: [
      { label: "📍 Where's my order?", next: 'order_track' },
      { label: '✏️ Change my order',   next: 'order_change' },
      { label: '❌ Cancel order',       next: 'order_cancel' },
      { label: '← Back',               next: 'start' },
    ],
  },
  order_track: {
    messages: [
      "📍 Tracking your order",
      'After you place your order on WhatsApp, our team sends you the tracking details once it\'s shipped.',
      'Usually shipped within 1–2 business days. Message us on WhatsApp with your name to get an update! ⏱️',
    ],
    options: [
      { label: '📲 Message Play11', wa: true },
      { label: '← Back',            next: 'order' },
    ],
  },
  order_change: {
    messages: [
      '✏️ Changing your order',
      'You can change size, colour, or jersey BEFORE it is shipped.',
      'Message us on WhatsApp immediately with your name and what you want to change. We\'ll sort it out!',
    ],
    options: [
      { label: '📲 Message Play11', wa: true },
      { label: '← Back',            next: 'order' },
    ],
  },
  order_cancel: {
    messages: [
      '❌ Cancelling your order',
      'You can cancel for free BEFORE shipping. After shipping, cancellation is not possible.',
      'Message us on WhatsApp with your name + "Cancel my order" and we\'ll confirm it right away.',
    ],
    options: [
      { label: '📲 Message Play11', wa: true },
      { label: '← Back',            next: 'order' },
    ],
  },

  // ── DELIVERY ──────────────────────────────────────────
  delivery: {
    messages: ['We deliver all across India! 🚀 What do you want to know?'],
    options: [
      { label: '📅 How long does it take?', next: 'delivery_time' },
      { label: '💰 Is delivery free?',       next: 'delivery_free' },
      { label: '🗺️ Do you deliver to me?',  next: 'delivery_where' },
      { label: '← Back',                     next: 'start' },
    ],
  },
  delivery_time: {
    messages: [
      '📅 Delivery time',
      '• Order processing: 1–2 business days\n• Delivery: 3–5 business days (most areas)',
      'Metro cities (Mumbai, Delhi, Bangalore, Chennai) are usually faster — 2–3 days. 🏙️',
    ],
    options: [
      { label: '💰 Is delivery free?', next: 'delivery_free' },
      { label: '🛍️ Shop Now',          nav: '/shop' },
      { label: '← Back',               next: 'delivery' },
    ],
  },
  delivery_free: {
    messages: [
      '💰 Delivery charges',
      'FREE delivery on all orders above ₹999! 🎉',
      'For orders below ₹999, a small delivery fee is added. Play11 will confirm the exact charge on WhatsApp after you place your order.',
    ],
    options: [
      { label: '🛍️ Shop Now', nav: '/shop' },
      { label: '← Back',      next: 'delivery' },
    ],
  },
  delivery_where: {
    messages: [
      '🗺️ We deliver pan-India!',
      'All states, all cities — from Kashmir to Kerala, Mumbai to Manipur. Anywhere in India is covered. 🇮🇳',
      'Just share your PIN code on WhatsApp and we\'ll confirm delivery to your exact location.',
    ],
    options: [
      { label: '📲 Confirm my location', wa: true },
      { label: '← Back',                 next: 'delivery' },
    ],
  },

  // ── SIZE ──────────────────────────────────────────────
  size: {
    messages: ['Need help finding your size? 👕'],
    options: [
      { label: '📏 Size chart',        next: 'size_chart' },
      { label: '🤔 Which size for me?', next: 'size_tips' },
      { label: '← Back',               next: 'start' },
    ],
  },
  size_chart: {
    messages: [
      '📏 Play11 Size Chart (chest in inches)',
      'S  → 36"\nM  → 38"\nL  → 40"\nXL → 42"\nXXL → 44"',
      'These are standard jersey sizes. Football jerseys are typically worn a bit loose.',
    ],
    options: [
      { label: '🤔 Which size for me?', next: 'size_tips' },
      { label: '🛍️ Shop Now',           nav: '/shop' },
      { label: '← Back',                next: 'size' },
    ],
  },
  size_tips: {
    messages: [
      '🤔 Choosing the right size',
      '• If you\'re between sizes → always go UP\n• For a snug athletic fit → pick your exact size\n• For a relaxed fan-wear look → go one size up',
      'Still unsure? Send your height & weight on WhatsApp and we\'ll suggest the perfect size! 💪',
    ],
    options: [
      { label: '📲 Ask on WhatsApp', wa: true },
      { label: '📏 View size chart',  next: 'size_chart' },
      { label: '← Back',             next: 'size' },
    ],
  },

  // ── PAYMENT ───────────────────────────────────────────
  payment: {
    messages: [
      '💳 How payment works at Play11',
      '1️⃣ Add jerseys to your cart\n2️⃣ Go to Checkout & fill your address\n3️⃣ Tap "Place Order" → WhatsApp opens\n4️⃣ Send the message to Play11\n5️⃣ We confirm your order & delivery charge\n6️⃣ Pay cash on delivery — no online payment needed!',
      'Simple, safe, and no hidden charges. 🙌',
    ],
    options: [
      { label: '🛍️ Start Shopping', nav: '/shop' },
      { label: '💬 More questions',  next: 'whatsapp' },
      { label: '← Back',             next: 'start' },
    ],
  },

  // ── QUALITY ───────────────────────────────────────────
  quality: {
    messages: [
      '✅ Play11 Jersey Quality',
      '• Match-grade polyester fabric — same as what players wear\n• Heat-pressed or embroidered club crests\n• Moisture-wicking technology keeps you cool\n• Durable stitching, true-to-size fit',
      'Our jerseys are curated for authenticity. Every detail is checked before shipping. 💯',
    ],
    options: [
      { label: '🛍️ Shop Now',        nav: '/shop' },
      { label: '📲 Ask on WhatsApp', wa: true },
      { label: '← Back',             next: 'start' },
    ],
  },

  // ── RETURNS ───────────────────────────────────────────
  returns: {
    messages: [
      '🔄 Returns & Exchange Policy',
      '• Wrong size? We\'ll exchange it — message us within 48 hours of delivery\n• Damaged item? Send a photo on WhatsApp — we\'ll replace it for free\n• Change of mind returns are not accepted once the jersey is delivered',
      'We want you to be 100% happy with your purchase! 😊',
    ],
    options: [
      { label: '📲 Raise a request', wa: true },
      { label: '← Back',             next: 'start' },
    ],
  },

  // ── WHATSAPP ──────────────────────────────────────────
  whatsapp: {
    messages: [
      "I'll connect you to the Play11 team! 💬",
      `📞 ${STORE.phone}\n📍 ${STORE.location}`,
      'They reply super fast — usually within an hour! ⚡',
    ],
    options: [
      { label: '📲 Open WhatsApp', wa: true },
      { label: '← Back',           next: 'start' },
    ],
  },
}

export default function AiChat() {
  const [open, setOpen] = useState(false)
  const [node, setNode] = useState('start')
  const [history, setHistory] = useState([])
  const bodyRef = useRef(null)
  const navigate = useNavigate()

  const current = FLOWS[node]

  useEffect(() => {
    setHistory(current.messages.map((m) => ({ text: m })))
  }, [node])

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [history, open])

  function handleOption(opt) {
    if (opt.wa) { window.open(WA, '_blank'); return }
    if (opt.nav) { navigate(opt.nav); setOpen(false); return }
    if (opt.next) setNode(opt.next)
  }

  function handleOpen() {
    setOpen(true)
    setNode('start')
  }

  return (
    <>
      {!open && (
        <div className="aichat__bubble-hint">
          Hey! I'm your Play11 guide 👋
        </div>
      )}
      <button
        className={`aichat__trigger ${open ? 'aichat__trigger--hide' : ''}`}
        onClick={handleOpen}
        aria-label="Open Play11 assistant"
      >
        <img src="/AI.png" alt="Play11 AI" />
        <span className="aichat__trigger-label">Ask me!</span>
      </button>

      {open && (
        <div className="aichat__panel">
          <div className="aichat__header">
            <img src="/AI.png" alt="" className="aichat__header-img" />
            <div>
              <strong>Play11 Guide</strong>
              <span>Always here to help</span>
            </div>
            <button className="aichat__close" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="aichat__body" ref={bodyRef}>
            {history.map((msg, i) => (
              <div className="aichat__msg" key={i}>
                <img src="/AI.png" alt="" className="aichat__msg-avatar" />
                <div className="aichat__bubble">{msg.text}</div>
              </div>
            ))}
          </div>

          <div className="aichat__options">
            {current.options.map((opt) => (
              <button key={opt.label} className="aichat__opt" onClick={() => handleOption(opt)}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
