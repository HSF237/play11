import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import { fetchProducts } from '../services/productService.js'
import { HERO_IMAGE, STORY_IMAGE } from '../storeConfig.js'

const REVIEWS = [
  {
    name: 'Nashid',
    location: 'Payyanur',
    avatar: 'NA',
    rating: 5,
    text: 'Bro quality is actually very good only. After washing also colour didn\'t go anywhere. Fast delivery also. I already told my friends to order from here itself.',
  },
  {
    name: 'Hassan',
    location: 'Kannur',
    avatar: 'HA',
    rating: 5,
    text: 'Came in 4 days only. Badge and stitching is looking very premium for this price. Whatsapp they are replying fast, no delay nothing. Will order again for sure.',
  },
  {
    name: 'Fadi',
    location: 'Kozhikode',
    avatar: 'FA',
    rating: 5,
    text: 'Wore to the match, everyone was asking where I bought it. Honestly the feel is different da, like you won\'t feel it\'s a copy. Super happy with it machan.',
  },
  {
    name: 'Samad',
    location: 'Malappuram',
    avatar: 'SM',
    rating: 5,
    text: 'Bought two jerseys as gift for my friends. Both of them loved it only. Size was also correct, no issue. Packing also came properly. Good experience overall.',
  },
  {
    name: 'Sanah',
    location: 'Kochi',
    avatar: 'SN',
    rating: 5,
    text: 'Exactly like the photo only it came. Colour is very nice and fabric is comfortable also. No sweating problem. Delivery was on time. Will definitely order again!',
  },
  {
    name: 'Yadunandh',
    location: 'Thrissur',
    avatar: 'YN',
    rating: 5,
    text: 'Third order from Play11 itself this is. Not even one time they disappointed. Quality is consistent and on WhatsApp they reply properly. Best jersey place in Kerala no doubt.',
  },
]

const CATEGORIES = [
  {
    name: 'Club Kits',
    tag: 'Madrid · Barça · United',
    img: 'https://www.shutterstock.com/editorial/image-editorial/OfT1I6w8NfTeU4y8NzYxOA==/cristiano-ronaldo-real-madrid-points-440nw-9140847av.jpg',
    span: 'bento--tall',
  },
  {
    name: 'National Teams',
    tag: 'Argentina · Brazil · France',
    img: 'https://cached.imagescaler.hbpl.co.uk/resize/scaleWidth/743/cached.offlinehbpl.hbpl.co.uk/news/OMC/NeymarNike-20140611105309134.jpg',
  },
  {
    name: 'Retro Classics',
    tag: 'The legends never fade',
    img: 'https://wallpaperaccess.com/full/11022590.jpg',
  },
  {
    name: 'Limited Drops',
    tag: 'Rare · Numbered · Iconic',
    img: 'https://pbs.twimg.com/media/DeYCKikVQAIfrpm.jpg',
    span: 'bento--wide',
  },
]

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }
const BADGES = [
  {
    title: 'Fast Delivery',
    sub: 'Shipped fast, all-India',
    icon: (
      <svg viewBox="0 0 24 24" {...S}>
        <path d="M3 6.5h10.5v9H3z" />
        <path d="M13.5 9.5H17l3.5 3v3h-7z" />
        <circle cx="7" cy="18" r="1.7" />
        <circle cx="17.3" cy="18" r="1.7" />
      </svg>
    ),
  },
  {
    title: 'Secure Payment',
    sub: 'Safe, protected checkout',
    icon: (
      <svg viewBox="0 0 24 24" {...S}>
        <path d="M12 3l7 3v5.2c0 4.4-3 7.4-7 8.8-4-1.4-7-4.4-7-8.8V6z" />
        <path d="M9 12l2.1 2.1L15.2 10" />
      </svg>
    ),
  },
  {
    title: 'High-Quality Jerseys',
    sub: 'Match-grade fabric',
    icon: (
      <svg viewBox="0 0 24 24" {...S}>
        <circle cx="12" cy="9.5" r="5.5" />
        <path d="M12 6.6l1 2 2.2.3-1.6 1.5.4 2.2-2-1.1-2 1.1.4-2.2-1.6-1.5 2.2-.3z" />
        <path d="M8.4 14.6 7 21l5-2.6L17 21l-1.4-6.4" />
      </svg>
    ),
  },
  {
    title: 'Embroidery Jerseys',
    sub: 'Premium stitched crests',
    icon: (
      <svg viewBox="0 0 24 24" {...S}>
        <path d="M8.5 4 4.5 7l2 3.2 2-1.4V20h6V8.8l2 1.4 2-3.2-4-3-3 2-3-2z" />
        <path d="M10.4 12.5h3.2" strokeDasharray="1.3 1.3" />
        <path d="M10.4 15h3.2" strokeDasharray="1.3 1.3" />
      </svg>
    ),
  },
]

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [activeReview, setActiveReview] = useState(0)
  const carouselRef = useRef(null)

  useEffect(() => {
    fetchProducts().then((all) => {
      const f = all.filter((p) => p.featured)
      setFeatured((f.length ? f : all).slice(0, 4))
    })
  }, [])

  return (
    <div className="home">
      {/* ================= HERO ================= */}
      <section className="hero">
        <div className="hero__bg" />
        <div className="hero__glow" />
        <span className="hero__watermark" aria-hidden="true">11</span>

        <div className="hero__content">
          <div className="hero__left">
            <span className="hero__pill">
              <span className="hero__pill-dot" /> Free delivery all-India above ₹999
            </span>
            <h1 className="hero__title">
              WEAR THE
              <br />
              <span className="hero__title-accent">LEGEND</span>
            </h1>
            <p className="hero__sub">
              India's home for match-grade football jerseys. Iconic club kits and
              world-cup national teams — authentic, premium, and delivered to your door.
            </p>
            <div className="hero__cta">
              <Link to="/shop" className="btn btn--primary btn--lg">
                Shop Now
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <a href="#categories" className="btn btn--ghost btn--lg">Browse Collections</a>
            </div>
            <div className="hero__stats">
              <div><strong>130+</strong><span>Kits & jerseys</span></div>
              <div><strong>All&nbsp;India</strong><span>Fast delivery</span></div>
              <div><strong>100%</strong><span>Authentic</span></div>
            </div>
          </div>

          <div className="hero__right" aria-hidden="true">
            <div className="hero__jersey">
              <img
                src={HERO_IMAGE}
                alt=""
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </div>
          </div>
        </div>

        <div className="hero__scroll">Scroll <span /></div>
      </section>

      {/* ================= MARQUEE ================= */}
      <div className="marquee">
        <div className="marquee__track">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i}>
              REAL MADRID • BARCELONA • MAN UNITED • LIVERPOOL • ARGENTINA •
              BRAZIL • FRANCE • MAN CITY • FREE DELIVERY ACROSS INDIA •&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ================= TRUST BADGES ================= */}
      <section className="trustbar">
        <div className="trustbar__inner" data-reveal>
          {BADGES.map((b) => (
            <div className="trust" key={b.title}>
              <span className="trust__icon">{b.icon}</span>
              <div className="trust__text">
                <strong>{b.title}</strong>
                <span>{b.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= CATEGORIES (BENTO) ================= */}
      <section className="section" id="categories">
        <div className="section__head" data-reveal>
          <div>
            <span className="section__eyebrow">Find your colours</span>
            <h2 className="section__title">Shop by Collection</h2>
          </div>
          <Link to="/shop" className="section__link">View all →</Link>
        </div>
        <div className="bento" data-reveal>
          {CATEGORIES.map((c) => (
            <Link to="/shop" key={c.name} className={`bento__tile ${c.span || ''}`}>
              <img src={c.img} alt={c.name} loading="lazy" onError={(e) => (e.currentTarget.style.opacity = 0.15)} />
              <div className="bento__overlay">
                <span className="bento__tag">{c.tag}</span>
                <h3>{c.name}</h3>
                <span className="bento__cta">Shop now →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= FEATURED ================= */}
      <section className="section section--tight">
        <div className="section__head" data-reveal>
          <div>
            <h2 className="section__title">Featured Jerseys</h2>
          </div>
          <Link to="/shop" className="section__link">View all →</Link>
        </div>
        <div className="grid grid--4" data-reveal>
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* ================= BIG STATEMENT ================= */}
      <section className="statement" data-reveal>
        <p>
          <span>Every thread</span> tells a story. <span>Every crest</span> carries a legacy.
          When you pull on a Play11 jersey, <span>you wear the legend.</span>
        </p>
      </section>

      {/* ================= VALUE PROPS ================= */}
      <section className="features">
        <div className="features__grid">
          <div className="feature" data-reveal>
            <div className="feature__icon">✦</div>
            <h3>Authentic Quality</h3>
            <p>Match-grade fabrics, heat-pressed crests, and tournament-spec detailing on every kit.</p>
          </div>
          <div className="feature" data-reveal>
            <div className="feature__icon">⚡</div>
            <h3>Fast Delivery — All India</h3>
            <p>Shipped pan-India and packed with care, delivered right to your door.</p>
          </div>
          <div className="feature" data-reveal>
            <div className="feature__icon">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8 8 0 0 1-11.6 7.1L4 20l1.4-5.4A8 8 0 1 1 21 11.5z" />
                <path d="M8.5 12h.01M12 12h.01M15.5 12h.01" />
              </svg>
            </div>
            <h3>Dedicated Support</h3>
            <p>Real humans on WhatsApp — quick help before and after you buy.</p>
          </div>
        </div>
      </section>

      {/* ================= STORY ================= */}
      <section className="story" id="story">
        <div className="story__inner">
          <div className="story__media" data-reveal>
            <img
              src={STORY_IMAGE}
              alt="Football stadium"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          </div>
          <div className="story__text" data-reveal>
            <span className="section__eyebrow">The Play11 Story</span>
            <h2 className="section__title">Built by fans, for fans.</h2>
            <p>
              Play11 started in Payyanur, Kannur with one belief: every fan in
              India deserves to wear the same legend their heroes do. We obsess
              over the details — the weight of the fabric, the crispness of the
              crest, the perfect fit.
            </p>
            <p>
              From iconic club kits to world-cup national jerseys, every piece is
              curated for authenticity, built to last, and delivered to your
              doorstep anywhere in India.
            </p>
            <Link to="/shop" className="btn btn--primary">Explore the Collection</Link>
          </div>
        </div>
      </section>

      {/* ================= REVIEWS ================= */}
      <section className="section" id="reviews">
        <div className="section__head" data-reveal>
          <div>
            <span className="section__eyebrow">What fans say</span>
            <h2 className="section__title">Real Reviews</h2>
          </div>
          <div className="reviews__summary">
            <span className="reviews__stars">★★★★★</span>
            <strong>5.0</strong>
            <span className="reviews__count">· {REVIEWS.length} reviews</span>
          </div>
        </div>
        <div
          className="reviews__grid"
          data-reveal
          ref={carouselRef}
          onScroll={() => {
            const el = carouselRef.current
            if (!el) return
            const idx = Math.round(el.scrollLeft / el.offsetWidth)
            setActiveReview(idx)
          }}
        >
          {REVIEWS.map((r) => (
            <div className="review" key={r.name}>
              <div className="review__top">
                <div className="review__avatar">{r.avatar}</div>
                <div>
                  <strong className="review__name">{r.name}</strong>
                  <span className="review__loc">{r.location}</span>
                </div>
                <div className="review__stars">{'★'.repeat(r.rating)}</div>
              </div>
              <p className="review__text">"{r.text}"</p>
            </div>
          ))}
        </div>
        <div className="reviews__dots">
          {REVIEWS.map((_, i) => (
            <button
              key={i}
              className={`reviews__dot${i === activeReview ? ' reviews__dot--active' : ''}`}
              aria-label={`Review ${i + 1}`}
              onClick={() => {
                const el = carouselRef.current
                if (!el) return
                el.scrollTo({ left: el.offsetWidth * i, behavior: 'smooth' })
                setActiveReview(i)
              }}
            />
          ))}
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="cta-band" data-reveal>
        <span className="cta-band__eyebrow">Your kit is waiting</span>
        <h2>Wear the legend.</h2>
        <p>Authentic football kits, delivered across India. Free delivery above ₹999.</p>
        <Link to="/shop" className="btn btn--primary btn--lg">Shop Now</Link>
      </section>
    </div>
  )
}
