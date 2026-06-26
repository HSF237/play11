import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import { fetchProducts } from '../services/productService.js'

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

const TESTIMONIALS = [
  { q: 'The quality is unreal — feels exactly like the stadium kit. Reached Kochi in 3 days.', n: 'Arjun M.', c: 'Kochi' },
  { q: 'Best jersey plug in India, no debate. The Madrid kit is pure heat.', n: 'Sneha R.', c: 'Bengaluru' },
  { q: 'Ordered the Argentina kit, COD was smooth. Play11 is the real deal.', n: 'Faisal K.', c: 'Kannur' },
]

export default function Home() {
  const [featured, setFeatured] = useState([])

  useEffect(() => {
    fetchProducts().then((all) => {
      const f = all.filter((p) => p.featured)
      setFeatured((f.length ? f : all).slice(0, 4))
    })
  }, [])

  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]')
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12 }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [featured])

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
              <span className="hero__flag">🇮🇳</span> Free delivery across India over ₹2,999 · COD available
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
              <div><strong>120+</strong><span>Jersey designs</span></div>
              <div><strong>50k+</strong><span>Fans across India</span></div>
              <div><strong>100%</strong><span>Authentic</span></div>
            </div>
          </div>

          <div className="hero__right" aria-hidden="true">
            <div className="hero__ring" />
            <div className="hero__ring hero__ring--2" />
            <div className="hero__jersey">
              <img
                src="https://media.cnn.com/api/v1/images/stellar/prod/170810160912-david-beckham.jpg?q=w_3260,h_4763,x_0,y_0,c_fill"
                alt=""
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </div>
            <span className="hero__chip hero__chip--1">✦ Authentic</span>
            <span className="hero__chip hero__chip--2">⚡ Fast India delivery</span>
            <span className="hero__chip hero__chip--3">★ 4.9/5 fans</span>
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
            <span className="section__eyebrow">Handpicked</span>
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
            <p>Shipped pan-India and packed with care. Cash on Delivery available everywhere.</p>
          </div>
          <div className="feature" data-reveal>
            <div className="feature__icon">♻</div>
            <h3>Easy Returns</h3>
            <p>Not the right fit? Simple, hassle-free exchanges within 14 days.</p>
          </div>
        </div>
      </section>

      {/* ================= STORY ================= */}
      <section className="story" id="story">
        <div className="story__inner">
          <div className="story__media" data-reveal>
            <img
              src="https://images.unsplash.com/photo-1760885985017-af7a49dcfb48?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
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

      {/* ================= TESTIMONIALS ================= */}
      <section className="section">
        <div className="section__head section__head--center" data-reveal>
          <div>
            <span className="section__eyebrow">Fans across India</span>
            <h2 className="section__title">Loved by the faithful</h2>
          </div>
        </div>
        <div className="testimonials" data-reveal>
          {TESTIMONIALS.map((t) => (
            <figure className="testimonial" key={t.n}>
              <div className="testimonial__stars">★★★★★</div>
              <blockquote>“{t.q}”</blockquote>
              <figcaption>
                <strong>{t.n}</strong>
                <span>{t.c}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="cta-band" data-reveal>
        <span className="cta-band__eyebrow">Your kit is waiting</span>
        <h2>Wear the legend.</h2>
        <p>Join thousands of fans across India who trust Play11. Free delivery over ₹2,999.</p>
        <Link to="/shop" className="btn btn--primary btn--lg">Shop Now</Link>
      </section>
    </div>
  )
}
