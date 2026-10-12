import { useState, useEffect, useRef, useMemo } from "react";
import {
  Link,
  NavLink,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "../components/Logo.jsx";
import {
  useStore,
  Icon,
  Image,
  money,
  deliveryFor,
  discountFor,
  findCoupon,
  reconcile,
  requestOrder,
  whatsappLink,
} from "./core.jsx";
export function Navbar() {
  const { count } = useCart(),
    { ids } = useWishlist(),
    { settings: s } = useStore(),
    [open, setOpen] = useState(false),
    { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const f = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, []);
  return (
    <>
      <div className="announcement">
        <span>{s.announcement}</span>
        <span className="announcement-right">
          PAY AFTER WHATSAPP CONFIRMATION ↗
        </span>
      </div>
      <header className="nav">
        <Link className="brand" to="/" aria-label="PLAY11 home">
          <Logo variant="black" />
        </Link>
        <nav className="nav-links" aria-label="Main navigation">
          <NavLink to="/shop">All jerseys</NavLink>
          <Link to="/shop?collection=Club">Club kits</Link>
          <Link to="/shop?collection=Retro">Retro archive</Link>
          <NavLink to="/story">Our story</NavLink>
        </nav>
        <div className="nav-actions">
          <Link
            className="icon-btn"
            to="/shop?search=1"
            aria-label="Search jerseys"
          >
            <Icon name="search" />
          </Link>
          <Link className="icon-btn" to="/wishlist" aria-label="Your wishlist">
            <Icon name="heart" />
            {ids.length > 0 && <span className="count">{ids.length}</span>}
          </Link>
          <Link
            className="bag-btn"
            to="/cart"
            aria-label={`Shopping bag, ${count} items`}
          >
            <Icon name="bag" />
            <span className="bag-word">Bag</span>
            <b>{count}</b>
          </Link>
          <button
            className="icon-btn mobile-toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name={open ? "close" : "menu"} />
          </button>
        </div>
      </header>
      {open && (
        <nav
          id="mobile-nav"
          className="mobile-menu"
          aria-label="Mobile navigation"
        >
          <Link to="/shop">
            All jerseys <span>↗</span>
          </Link>
          {s.collections.map((c) => (
            <Link key={c} to={`/shop?collection=${c}`}>
              {c === "National" ? "National teams" : `${c} kits`}
              <span>↗</span>
            </Link>
          ))}
          <Link to="/story">Our story ↗</Link>
          <Link to="/help">Help & sizing ↗</Link>
        </nav>
      )}
    </>
  );
}
export function Footer() {
  const { settings: s } = useStore();
  return (
    <footer className="footer">
      <div className="footer-top">
        <div>
          <Logo />
          <p>
            Different clubs.
            <br />
            Same beautiful game.
          </p>
          <span>{s.location} · Delivering across India</span>
        </div>
        <div>
          <h3>The lineup</h3>
          <Link to="/shop">All jerseys</Link>
          <Link to="/shop?collection=Club">Club kits</Link>
          <Link to="/shop?collection=National">National teams</Link>
          <Link to="/shop?collection=Retro">Retro archive</Link>
        </div>
        <div>
          <h3>Off the pitch</h3>
          <Link to="/story">Our story</Link>
          <Link to="/help">Help & size guide</Link>
          <Link to="/policies">Delivery & returns</Link>
          <Link to="/policies#privacy">Privacy</Link>
        </div>
        <div>
          <h3>Talk football</h3>
          <a
            href={`https://wa.me/${s.whatsapp}`}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp ↗
          </a>
          <a href={`mailto:${s.email}`}>{s.email}</a>
          <a
            href={`https://instagram.com/${s.instagram}`}
            target="_blank"
            rel="noreferrer"
          >
            Instagram ↗
          </a>
          <Link to="/admin">Store admin</Link>
        </div>
      </div>
      <div className="footer-word" aria-hidden="true">
        PLAY YOUR GAME.
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} PLAY11</span>
        <span>NO COD · PAY AFTER CONFIRMATION</span>
        <span>Made for the love of football.</span>
      </div>
    </footer>
  );
}
export function ProductCard({ product: p }) {
  const { has, toggle } = useWishlist(),
    { notify } = useStore(),
    sold = p.available === false || p.stock === 0;
  return (
    <article className="product-card">
      <div className="product-photo">
        <Link to={`/product/${p.id}`} aria-label={`View ${p.name}`}>
          <Image product={p} />
        </Link>
        {(p.badge || sold) && (
          <span className="product-tag">{sold ? "SOLD OUT" : p.badge}</span>
        )}
        <button
          className={`wish-btn ${has(p.id) ? "saved" : ""}`}
          aria-label={`${has(p.id) ? "Remove" : "Save"} ${p.name} ${has(p.id) ? "from" : "to"} wishlist`}
          aria-pressed={has(p.id)}
          onClick={() => {
            toggle(p.id);
            notify(
              has(p.id) ? "Removed from wishlist" : "Saved to your wishlist",
            );
          }}
        >
          <Icon name="heart" />
        </button>
        <Link className="product-choose" to={`/product/${p.id}`}>
          Choose your size <Icon name="arrow" size={18} />
        </Link>
      </div>
      <div className="product-meta">
        <span>
          {p.club} / {p.category}
        </span>
        {p.isMock && <span>Sample</span>}
      </div>
      <Link className="product-name" to={`/product/${p.id}`}>
        {p.name}
      </Link>
      <div className="product-price">
        <b>{money(p.price)}</b>
        {p.originalPrice > p.price && <del>{money(p.originalPrice)}</del>}
        <span>{p.sizes?.length || 0} sizes</span>
      </div>
    </article>
  );
}
function CatalogueError() {
  const { error, refresh } = useStore();
  return error ? (
    <div className="notice error">
      {error}
      <button onClick={refresh}>Retry</button>
    </div>
  ) : null;
}
export function Home() {
  const { products, settings: s, loading, isSampleCatalogue } = useStore(),
    featured = products.filter((p) => p.featured).slice(0, 4),
    picks = featured.length ? featured : products.slice(0, 4);
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="hero-kicker">
            <span className="live-dot" />
            {s.heroLabel}
            <span>VOL. 11 / FOOTBALL CULTURE</span>
          </div>
          <h1>
            {s.heroTitle.split("\n").map((line, i) => (
              <span key={i} className={i ? "outline-text" : ""}>
                {line}
              </span>
            ))}
          </h1>
          <p>{s.heroText}</p>
          <Link to="/shop" className="btn btn-red">
            Find your jersey <Icon name="arrow" />
          </Link>
          <div className="hero-foot">
            <span>01 — FOR THE FANS</span>
            <span>CLUB. COUNTRY. CULTURE.</span>
          </div>
        </div>
        <div className="hero-image">
          <img
            src={s.heroImage}
            fetchPriority="high"
            alt="Football heritage and the colours that bring fans together"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/story-cr7.jpg";
            }}
          />
          <div className="hero-image-top">
            <span>PLAY11 / ON & OFF THE PITCH</span>
            <span>↗</span>
          </div>
          <div className="hero-image-bottom">
            <span>
              IT’S NEVER
              <br />
              JUST A JERSEY.
            </span>
            <b>11</b>
          </div>
        </div>
      </section>
      <div className="ticker">
        <div>
          CLUB <span>✳</span> COUNTRY <span>✳</span> CULTURE <span>✳</span>{" "}
          FOOTBALL BELONGS TO YOU <span>✳</span> CLUB <span>✳</span> COUNTRY{" "}
          <span>✳</span> CULTURE <span>✳</span>
        </div>
      </div>
      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">02 / THE STARTING LINEUP</span>
            <h2>Matchday essentials.</h2>
          </div>
          <Link className="text-link" to="/shop">
            Shop the full lineup <Icon name="arrow" />
          </Link>
        </div>
        {isSampleCatalogue && (
          <p className="sample-note">
            Preview collection · Sample jerseys and prices. Real products coming
            soon.
          </p>
        )}
        <CatalogueError />
        {loading ? (
          <div className="loading">Loading jerseys…</div>
        ) : (
          <div className="product-grid">
            {picks.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
        {!loading && !products.length && (
          <div className="empty compact">
            <h3>The next drop is on its way.</h3>
            <p>Check back soon or ask our team on WhatsApp.</p>
          </div>
        )}
      </section>
      <section className="collection-section collection-editorial">
        <div className="collection-heading">
          <div>
            <span className="eyebrow">03 / PICK YOUR SIDE</span>
            <h2>A game of <em>belonging.</em></h2>
          </div>
          <p>Some things you choose.<br />Your colours choose you.</p>
        </div>
        <div className="collection-grid">
          {[
            { key: "Club", number: "01", title: "Club allegiance.", line: "CLUB KITS", note: "Your badge. Your people.", tone: "club" },
            { key: "National", number: "02", title: "Country first.", line: "NATIONAL TEAMS", note: "More than a jersey.", tone: "national" },
            { key: "Retro", number: "03", title: "Never forgotten.", line: "RETRO KITS", note: "Classics that stay with us.", tone: "retro" },
            { key: "Limited", number: "04", title: "Limited edition.", line: "LIMITED KITS", note: "For the ones who know.", tone: "limited" },
          ].map((card) => {
            const eligible = products.filter((product) => {
              const identity = `${product.name || ""} ${product.club || ""}`.toLowerCase();
              return !identity.includes("france") && !identity.includes("dembélé") && !identity.includes("dembele");
            });
            const p = eligible.find((product) =>
              (["Club", "National"].includes(card.key) ? product.type : product.category) === card.key
            ) || eligible.find((product) => product.type === (card.key === "National" ? "National" : "Club")) || eligible[0];
            return (
              <Link className={`collection-tile collection-card-${card.tone}`} key={card.key} to={`/shop?collection=${card.key}`}>
                <div className="collection-card-top">
                  <span>{card.number} <i>/</i> {card.line}</span>
                  <span className="collection-arrow"><Icon name="arrow" /></span>
                </div>
                <div className="collection-card-copy">
                  <h3>{card.title}</h3>
                  <p>{card.note}</p>
                  <span className="collection-cta">{card.line} <b>↗</b></span>
                </div>
                <div className="collection-product">
                  {p ? <Image product={p} /> : <span className="collection-empty">New kits<br/>coming soon</span>}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
      <section className="manifesto">
        <div className="manifesto-photo">
          <img
            loading="lazy"
            src="/team11-hero.jpg"
            alt="A classic football moment"
          />
        </div>
        <div className="manifesto-copy">
          <span className="eyebrow">04 / MORE THAN A SHIRT</span>
          <h2>
            Ninety minutes.
            <br />
            <span>A lifetime of feeling.</span>
          </h2>
          <p>
            That first match. That last-minute winner. That one jersey you’ll
            never let go of. We’re here for all of it.
          </p>
          <Link to="/story" className="text-link">
            The PLAY11 story ↗
          </Link>
          <div className="manifesto-mark">P11 / EST. FOR THE FANS</div>
        </div>
      </section>
      <section className="service-strip">
        <div>
          <span>↗</span>
          <b>Across India</b>
          <p>Free delivery above ₹{s.freeShippingThreshold}</p>
        </div>
        <div>
          <span>◎</span>
          <b>Keep it personal</b>
          <p>Order directly with our team on WhatsApp</p>
        </div>
        <div>
          <span>✓</span>
          <b>Confirm. Then pay.</b>
          <p>Check stock and your final amount first</p>
        </div>
      </section>
      <section className="faq-section section">
        <div>
          <span className="eyebrow">05 / BEFORE KICK-OFF</span>
          <h2>Good questions.</h2>
          <Link className="text-link" to="/help">
            Visit the help desk ↗
          </Link>
        </div>
        <div className="faq-list">
          <details>
            <summary>How do I place an order?</summary>
            <p>
              Select a jersey and size, add it to your bag, and send your
              request on WhatsApp. Our team confirms stock, delivery and payment
              details.
            </p>
          </details>
          <details>
            <summary>Is cash on delivery available?</summary>
            <p>No. Pay after our team confirms your order on WhatsApp.</p>
          </details>
          <details>
            <summary>Can I add my name or number?</summary>
            <p>
              We do not offer custom names or numbers. Existing player prints
              are shown in product details.
            </p>
          </details>
          <details>
            <summary>How much is delivery?</summary>
            <p>{s.deliveryPolicy}</p>
          </details>
        </div>
      </section>
    </>
  );
}
export function Shop() {
  const { products, settings, loading, isSampleCatalogue } = useStore(),
    [params, setParams] = useSearchParams(),
    [filters, setFilters] = useState(false),
    input = useRef(),
    search = params.get("q") || "",
    collection = params.get("collection") || "All",
    size = params.get("size") || "All",
    sort = params.get("sort") || "featured",
    club = params.get("club") || "All";
  const set = (key, value) => {
    const p = new URLSearchParams(params);
    value && value !== "All" ? p.set(key, value) : p.delete(key);
    setParams(p, { replace: true });
  };
  useEffect(() => {
    if (params.has("search")) input.current?.focus();
  }, [params]);
  const visible = useMemo(
    () =>
      products
        .filter(
          (p) =>
            (!search ||
              `${p.name} ${p.club} ${p.category}`
                .toLowerCase()
                .includes(search.toLowerCase())) &&
            (collection === "All" ||
              (["Club", "National"].includes(collection)
                ? p.type === collection
                : p.category === collection)) &&
            (size === "All" || p.sizes?.includes(size)) &&
            (club === "All" || p.club === club),
        )
        .sort((a, b) =>
          sort === "low"
            ? a.price - b.price
            : sort === "high"
              ? b.price - a.price
              : sort === "name"
                ? a.name.localeCompare(b.name)
                : Number(!!b.featured) - Number(!!a.featured),
        ),
    [products, search, collection, size, sort, club],
  );
  return (
    <div className="section shop">
      <div className="shop-heading">
        <span className="eyebrow">THE PLAY11 LINEUP / FIND YOUR COLOURS</span>
        <h1>
          {collection === "All"
            ? "Every fan. Every feeling."
            : collection === "National"
              ? "Country first."
              : `${collection} collection.`}
        </h1>
        <p>From your first kit to your forever favourite.</p>
      </div>
      <div className="shop-search">
        <Icon name="search" />
        <input
          ref={input}
          aria-label="Search jerseys or teams"
          placeholder="Search your team, player or jersey…"
          value={search}
          onChange={(e) => set("q", e.target.value)}
        />
        {search && (
          <button
            className="icon-btn"
            aria-label="Clear search"
            onClick={() => set("q", "")}
          >
            <Icon name="close" />
          </button>
        )}
      </div>
      <div className="shop-tabs">
        {["All", ...settings.collections].map((c) => (
          <button
            key={c}
            className={c === collection ? "active" : ""}
            onClick={() => set("collection", c)}
          >
            {c === "All"
              ? "All jerseys"
              : c === "National"
                ? "National teams"
                : c}
          </button>
        ))}
      </div>
      <div className="shop-toolbar">
        <span>
          {visible.length} jerseys{" "}
          {isSampleCatalogue && "· Sample collection"}
        </span>
        <div>
          <button
            className="filter-toggle"
            aria-expanded={filters}
            onClick={() => setFilters((v) => !v)}
          >
            Filters +
          </button>
          <select
            aria-label="Sort jerseys"
            value={sort}
            onChange={(e) => set("sort", e.target.value)}
          >
            <option value="featured">Featured first</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
            <option value="name">Name: A–Z</option>
          </select>
        </div>
      </div>
      {filters && (
        <div className="filter-panel">
          <label>
            Size
            <select value={size} onChange={(e) => set("size", e.target.value)}>
              {["All", ...new Set(products.flatMap((p) => p.sizes || []))].map(
                (s) => (
                  <option key={s}>{s}</option>
                ),
              )}
            </select>
          </label>
          <label>
            Team
            <select value={club} onChange={(e) => set("club", e.target.value)}>
              {[
                "All",
                ...new Set(products.map((p) => p.club).filter(Boolean)),
              ].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <button className="text-link" onClick={() => setParams({})}>
            Reset filters ↺
          </button>
        </div>
      )}
      <CatalogueError />
      {loading ? (
        <div className="loading">Loading jerseys…</div>
      ) : (
        <div className="product-grid">
          {visible.map((p) => (
            <ProductCard product={p} key={p.id} />
          ))}
        </div>
      )}
      {!loading && !visible.length && (
        <div className="empty">
          <h2>No jerseys in this lineup.</h2>
          <p>Try another team or clear your filters.</p>
          <button className="btn" onClick={() => setParams({})}>
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
export function ProductDetail() {
  const { id } = useParams(),
    { products, settings, loading, notify } = useStore(),
    p = products.find((p) => p.id === id),
    { items, addItem } = useCart(),
    { has, toggle } = useWishlist(),
    [size, setSize] = useState(""),
    [qty, setQty] = useState(1),
    [view, setView] = useState(0),
    [error, setError] = useState("");
  useEffect(() => {
    setSize("");
    setQty(1);
    setView(0);
    setError("");
  }, [id]);
  if (loading) return <div className="loading">Loading your jersey…</div>;
  if (!p)
    return (
      <div className="empty">
        <h1>That jersey is off the lineup.</h1>
        <CatalogueError />
        <Link className="btn" to="/shop">
          Explore the store →
        </Link>
      </div>
    );
  const sold = p.available === false || p.stock === 0,
    limit = Math.min(20, p.stock ?? 20),
    already = items.filter((i) => i.id === id).reduce((n, i) => n + i.qty, 0);
  function add() {
    if (!size) {
      setError("Select your size first.");
      return;
    }
    if (already + qty > limit) {
      setError(`Only ${limit} pieces available across all sizes.`);
      return;
    }
    addItem(p, size, qty, p.sleeve);
    notify(`${qty} × ${p.name} added to your bag`);
  }
  return (
    <div className="section detail-page">
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/shop">The lineup</Link>
        <span>/</span>
        <span>{p.name}</span>
      </div>
      <div className="detail-layout">
        <div className="detail-gallery">
          <div className="detail-image">
            <Image product={p} index={view} priority />
            {p.badge && <span className="product-tag">{p.badge}</span>}
            <span className="image-caption">
              {p.isMock
                ? "ILLUSTRATIVE SAMPLE / FRONT VIEW"
                : `PLAY11 / VIEW ${view + 1}`}
            </span>
          </div>
          {p.images?.length > 1 && (
            <div className="thumbnails">
              {p.images.map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => setView(i)}
                  className={i === view ? "active" : ""}
                  aria-label={`View product image ${i + 1}`}
                  aria-pressed={i === view}
                >
                  <Image product={p} index={i} />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="detail-copy">
          <span className="eyebrow">
            {p.club} / {p.category}
          </span>
          <h1>{p.name}</h1>
          <div className="detail-price">
            <b>{money(p.price)}</b>
            {p.originalPrice > p.price && <del>{money(p.originalPrice)}</del>}
            <span>
              {sold
                ? "Sold out"
                : p.isMock
                  ? "Sample collection"
                  : "In the lineup"}
            </span>
          </div>
          <p className="description">{p.description}</p>
          {p.isMock && (
            <div className="notice">
              Sample product. This image and price are illustrative. Ask our
              team about real availability before ordering.
            </div>
          )}
          <div className="size-heading">
            <b>SELECT YOUR SIZE {size && `/ ${size}`}</b>
            <a
              href="#size-guide"
              className="text-link"
              onClick={() => {
                document.getElementById("size-guide").open = true;
              }}
            >
              Size guide ↗
            </a>
          </div>
          <div className="sizes">
            {(p.sizes || []).map((s) => (
              <button
                key={s}
                className={size === s ? "active" : ""}
                aria-pressed={size === s}
                disabled={sold}
                onClick={() => {
                  setSize(s);
                  setError("");
                }}
              >
                {s}
              </button>
            ))}
          </div>
          {error && (
            <p className="error-text" role="alert">
              {error}
            </p>
          )}
          <div className="detail-qty">
            <span>{p.sleeve || "Half Sleeve"}</span>
            <div className="qty">
              <button
                aria-label="Decrease quantity"
                disabled={qty <= 1}
                onClick={() => setQty((n) => Math.max(1, n - 1))}
              >
                −
              </button>
              <span>{qty}</span>
              <button
                aria-label="Increase quantity"
                disabled={qty >= limit}
                onClick={() => setQty((n) => Math.min(limit, n + 1))}
              >
                +
              </button>
            </div>
          </div>
          <div className="detail-buy">
            <button className="btn btn-red" disabled={sold} onClick={add}>
              {sold ? "Sold out" : "Add to bag"}
              <Icon name="bag" />
            </button>
            <button
              className={`icon-btn outline-btn ${has(id) ? "saved" : ""}`}
              aria-label="Toggle wishlist"
              aria-pressed={has(id)}
              onClick={() => {
                toggle(id);
                notify(has(id) ? "Removed from wishlist" : "Saved to wishlist");
              }}
            >
              <Icon name="heart" />
            </button>
          </div>
          <p className="detail-order-note">
            Order on WhatsApp. Confirm stock and delivery. Then pay.
            <br />
            No cash on delivery · No custom names or numbers
          </p>
          <div className="detail-accordions">
            <details open>
              <summary>Delivery & payment</summary>
              <p>{settings.deliveryPolicy}</p>
            </details>
            <details>
              <summary>Fabric & care</summary>
              <p>
                {p.fabric || "Contact us for fabric details."} Follow the
                garment care label. Wash with similar colours and avoid ironing
                directly over any print.
              </p>
            </details>
            <details id="size-guide">
              <summary>Size guide</summary>
              <p>
                {p.sizeChart ||
                  "Measurements vary by jersey. Request the exact chest width and length from our team before paying. Compare with a shirt you like, laid flat."}
              </p>
            </details>
            <details>
              <summary>Exchanges & returns</summary>
              <p>{settings.returnPolicy}</p>
            </details>
          </div>
        </div>
      </div>
      <section className="related">
        <div className="section-heading">
          <h2>You might also love.</h2>
        </div>
        <div className="product-grid">
          {products
            .filter((x) => x.id !== id)
            .slice(0, 4)
            .map((x) => (
              <ProductCard product={x} key={x.id} />
            ))}
        </div>
      </section>
    </div>
  );
}
export function Cart() {
  const cart = useCart(),
    { products, settings, notify } = useStore(),
    [code, setCode] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    discount = discountFor(cart.items, cart.appliedCoupon),
    total = cart.subtotal - discount,
    delivery = deliveryFor(total, settings);
  async function apply(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const c = await findCoupon(code);
      if (!c || !discountFor(cart.items, c))
        throw new Error(
          "Coupon unavailable, expired or not applicable to your bag.",
        );
      cart.applyCoupon(c);
      notify("Coupon applied. Our team will confirm the final amount.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (!cart.items.length)
    return (
      <div className="empty">
        <span className="eyebrow">YOUR MATCHDAY BAG</span>
        <h1>
          A little empty.
          <br />A lot of possibility.
        </h1>
        <p>Your next favourite jersey is waiting.</p>
        <Link className="btn btn-red" to="/shop">
          Explore the lineup →
        </Link>
      </div>
    );
  return (
    <div className="section cart-page">
      <div className="section-heading">
        <div>
          <span className="eyebrow">READY FOR KICK-OFF</span>
          <h1>
            Your bag. <small>({cart.count})</small>
          </h1>
        </div>
        <Link className="text-link" to="/shop">
          Keep exploring ↗
        </Link>
      </div>
      <div className="checkout-layout">
        <div>
          {cart.items.map((i) => {
            const p = products.find((p) => p.id === i.id);
            return (
              <article className="cart-item" key={i.key}>
                <Link className="cart-image" to={`/product/${i.id}`}>
                  <Image product={p || i} />
                </Link>
                <div className="cart-item-info">
                  <span className="eyebrow">{p?.club || "PLAY11"}</span>
                  <Link to={`/product/${i.id}`}>
                    <h3>{i.name}</h3>
                  </Link>
                  <p>
                    Size {i.size} · {i.sleeve || "Half Sleeve"}
                  </p>
                  {(!p ||
                    p.available === false ||
                    p.stock === 0 ||
                    p.price !== i.price) && (
                    <p className="error-text">
                      Availability or price changed. Remove and re-add.
                    </p>
                  )}
                  <div className="cart-item-actions">
                    <div className="qty">
                      <button
                        aria-label={`Decrease ${i.name} quantity`}
                        disabled={i.qty <= 1}
                        onClick={() => cart.setQty(i.key, i.qty - 1)}
                      >
                        −
                      </button>
                      <span>{i.qty}</span>
                      <button
                        aria-label={`Increase ${i.name} quantity`}
                        disabled={i.qty >= Math.min(20, p?.stock ?? 20)}
                        onClick={() => cart.setQty(i.key, i.qty + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="text-link"
                      onClick={() => cart.removeItem(i.key)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <b>{money(i.price * i.qty)}</b>
              </article>
            );
          })}
          <p className="cart-reminder">
            Your bag is saved on this device. Stock is confirmed before payment.
          </p>
        </div>
        <aside className="order-summary">
          <span className="eyebrow">THE SCOREBOARD</span>
          <h2>Order summary</h2>
          <div className="summary-row">
            <span>Merchandise</span>
            <b>{money(cart.subtotal)}</b>
          </div>
          {discount > 0 && (
            <div className="summary-row">
              <span>Coupon {cart.appliedCoupon?.code}</span>
              <b>−{money(discount)}</b>
            </div>
          )}
          <div className="summary-row">
            <span>Delivery</span>
            <b>
              {delivery === null
                ? "Quoted on WhatsApp"
                : delivery === 0
                  ? "Free"
                  : money(delivery)}
            </b>
          </div>
          <div className="summary-row total">
            <span>
              {delivery === null ? "Merchandise estimate" : "Estimated total"}
            </span>
            <b>{money(total + (delivery || 0))}</b>
          </div>
          <div className="shipping-progress">
            <div>
              <span
                style={{
                  width: `${Math.min(100, (total / (Number(settings.freeShippingThreshold) + 1)) * 100)}%`,
                }}
              />
            </div>
            <p>
              {delivery === 0
                ? "Your bag qualifies for free delivery."
                : `Free delivery on merchandise above ${money(settings.freeShippingThreshold)} after discounts.`}
            </p>
          </div>
          <form className="coupon-form" onSubmit={apply}>
            <input
              aria-label="Coupon code"
              placeholder="Have a coupon?"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={40}
              required
            />
            <button disabled={busy}>{busy ? "…" : "Apply"}</button>
          </form>
          {error && (
            <p className="error-text" role="alert">
              {error}
            </p>
          )}
          {cart.appliedCoupon && (
            <button className="text-link" onClick={cart.removeCoupon}>
              Remove coupon ×
            </button>
          )}
          <Link className="btn btn-red full" to="/checkout">
            Continue to WhatsApp →
          </Link>
          <p className="summary-note">
            No payment collected here.
            <br />
            Confirm with our team first.
          </p>
        </aside>
      </div>
    </div>
  );
}
export function Checkout() {
  const cart = useCart(),
    { products, settings } = useStore(),
    { user } = useAuth(),
    [form, setForm] = useState({
      name: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    }),
    [consent, setConsent] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(null),
    lock = useRef(false),
    discount = discountFor(cart.items, cart.appliedCoupon),
    delivery = deliveryFor(cart.subtotal - discount, settings);
  async function submit(e) {
    e.preventDefault();
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      if (!/^\d{10}$/.test(form.phone.replace(/\s/g, "")))
        throw new Error("Enter a valid 10-digit Indian WhatsApp number.");
      if (!/^[1-9]\d{5}$/.test(form.pincode))
        throw new Error("Enter a valid 6-digit PIN code.");
      if (cart.items.length > 10)
        throw new Error(
          "Please limit each request to 10 jersey and size combinations, or contact us for a bulk order.",
        );
      const items = reconcile(cart.items, products),
        subtotal = items.reduce((n, i) => n + i.price * i.qty, 0);
      if (items.some((i, n) => i.price !== cart.items[n].price))
        throw new Error(
          "A price changed. Return to your bag and re-add the jersey.",
        );
      const coupon = cart.appliedCoupon
          ? await findCoupon(cart.appliedCoupon.code)
          : null,
        d = discountFor(items, coupon);
      if (d !== discount)
        throw new Error(
          "Your coupon changed or expired. Return to your bag and reapply it.",
        );
      const f = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, v.trim()]),
      );
      f.phone = f.phone.replace(/\s/g, "");
      const id = await requestOrder({
        form: f,
        items,
        subtotal,
        discount: d,
        total: subtotal - d,
        deliveryCharge: deliveryFor(subtotal - d, settings),
        couponCode: coupon?.code || "",
        userId: user?.uid || "",
        isMock: items.some((i) => i.isMock),
        source: "whatsapp",
        consent: true,
      });
      setSuccess({
        id,
        url: whatsappLink(
          f,
          items,
          subtotal,
          settings,
          id,
          d,
          coupon?.code || "",
        ),
      });
      cart.clear();
    } catch (e) {
      setError(
        e.code === "permission-denied"
          ? "Your request could not be saved. Contact our team on WhatsApp or try again shortly."
          : e.message,
      );
    } finally {
      setBusy(false);
      lock.current = false;
    }
  }
  if (success)
    return (
      <div className="empty request-success">
        <span className="success-mark">✓</span>
        <span className="eyebrow">REQUEST SAVED / NOT YET CONFIRMED</span>
        <h1>One more pass.</h1>
        <p>
          Your request is saved. Open WhatsApp and{" "}
          <strong>send the message</strong> to confirm stock, delivery and
          payment with our team.
        </p>
        <div className="reference">Reference: {success.id}</div>
        <a
          className="btn btn-red"
          href={success.url}
          target="_blank"
          rel="noreferrer"
        >
          Send order on WhatsApp ↗
        </a>
        <p className="small">
          Opening WhatsApp does not send the message automatically.
        </p>
        <Link className="text-link" to="/shop">
          Back to the lineup →
        </Link>
      </div>
    );
  if (!cart.items.length)
    return (
      <div className="empty">
        <h1>Your bag is empty.</h1>
        <Link className="btn" to="/shop">
          Find your jersey →
        </Link>
      </div>
    );
  return (
    <div className="section checkout-page">
      <span className="eyebrow">
        DETAILS → WHATSAPP → CONFIRMATION → PAYMENT
      </span>
      <h1>Let’s make it yours.</h1>
      <p className="page-intro">
        Leave your delivery details. Save your request, then send it to our team
        on WhatsApp.
      </p>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={submit}>
          <h2>Your delivery details</h2>
          <div className="form-grid">
            {[
              ["name", "Full name", "text", "name"],
              ["phone", "WhatsApp number (10 digits)", "tel", "tel-national"],
              ["email", "Email (optional)", "email", "email"],
              ["pincode", "PIN code", "text", "postal-code"],
              ["address", "House, street & landmark", "text", "street-address"],
              ["city", "City / town", "text", "address-level2"],
              ["state", "State", "text", "address-level1"],
            ].map(([key, label, type, auto]) => (
              <label className={key === "address" ? "span-two" : ""} key={key}>
                {label}
                <input
                  name={key}
                  type={type}
                  autoComplete={auto}
                  value={form[key]}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [key]: e.target.value }))
                  }
                  required={key !== "email"}
                  maxLength={key === "pincode" ? 6 : key === "phone" ? 15 : 200}
                  inputMode={
                    ["phone", "pincode"].includes(key) ? "numeric" : undefined
                  }
                />
              </label>
            ))}
          </div>
          <div className="notice">
            Payment is arranged <strong>after WhatsApp confirmation</strong>. No
            cash on delivery. No custom names or numbers.
          </div>
          <label className="check-label">
            <input
              type="checkbox"
              required
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            <span>
              I agree to share my order and delivery details with PLAY11 to
              process this request.{" "}
              <Link to="/policies#privacy">Privacy details</Link>.
            </span>
          </label>
          {error && (
            <div className="notice error" role="alert">
              {error}
              <a
                href={`https://wa.me/${settings.whatsapp}`}
                target="_blank"
                rel="noreferrer"
              >
                Contact our team ↗
              </a>
            </div>
          )}
          <button className="btn btn-red full" disabled={busy || !consent}>
            {busy ? "Saving your request…" : "Save request & continue →"}
          </button>
          <Link className="text-link" to="/cart">
            ← Back to your bag
          </Link>
        </form>
        <aside className="order-summary">
          <span className="eyebrow">YOUR MATCHDAY LINEUP</span>
          <h2>{cart.count} jerseys</h2>
          {cart.items.map((i) => (
            <div className="checkout-line" key={i.key}>
              <span>
                {i.qty} × {i.name}
                <small>
                  {i.size} / {i.sleeve}
                </small>
              </span>
              <b>{money(i.price * i.qty)}</b>
            </div>
          ))}
          <div className="summary-row">
            <span>Merchandise</span>
            <b>{money(cart.subtotal)}</b>
          </div>
          {discount > 0 && (
            <div className="summary-row">
              <span>Coupon estimate</span>
              <b>−{money(discount)}</b>
            </div>
          )}
          <div className="summary-row">
            <span>Delivery</span>
            <b>
              {delivery === null
                ? "To be confirmed"
                : delivery === 0
                  ? "Free"
                  : money(delivery)}
            </b>
          </div>
          <div className="summary-row total">
            <span>Estimate</span>
            <b>{money(cart.subtotal - discount + (delivery || 0))}</b>
          </div>
          <p className="summary-note">
            Our team confirms the final amount before payment. Sample products
            are illustrative.
          </p>
        </aside>
      </div>
    </div>
  );
}
export function Wishlist() {
  const { ids, toggle } = useWishlist(),
    { products, loading } = useStore(),
    picks = products.filter((p) => ids.includes(p.id)),
    missing = ids.filter((id) => !products.some((p) => p.id === id));
  return (
    <div className="section">
      <span className="eyebrow">YOUR PERSONAL SHORTLIST</span>
      <h1>On your radar.</h1>
      <p className="page-intro">The jerseys worth coming back for.</p>
      <CatalogueError />
      {loading ? (
        <div className="loading">Loading wishlist…</div>
      ) : (
        <div className="product-grid">
          {picks.map((p) => (
            <ProductCard product={p} key={p.id} />
          ))}
        </div>
      )}
      {!loading && !picks.length && (
        <div className="empty compact">
          <h2>Your next favourite is out there.</h2>
          <Link className="btn btn-red" to="/shop">
            Explore jerseys →
          </Link>
        </div>
      )}
      {missing.length > 0 && (
        <button className="text-link" onClick={() => missing.forEach(toggle)}>
          Remove unavailable saved jerseys
        </button>
      )}
    </div>
  );
}
export function Info({ page }) {
  const { settings: s } = useStore(),
    { hash } = useLocation();
  useEffect(() => {
    if (hash)
      requestAnimationFrame(() =>
        document.getElementById(hash.slice(1))?.scrollIntoView(),
      );
  }, [hash, page]);
  return (
    <div className="section info-page">
      <span className="eyebrow">PLAY11 / OFF THE PITCH</span>
      <h1>
        {page === "story"
          ? "For the love of the game."
          : page === "help"
            ? "The help desk."
            : page === "orders"
              ? "Your order. Our team."
              : "The small print."}
      </h1>
      {page === "story" ? (
        <div className="story-layout">
          <img src="/team11-hero.jpg" alt="Football heritage" />
          <div>
            <p className="story-text">{s.story}</p>
            <span className="eyebrow">{s.location} / ALL INDIA DELIVERY</span>
            <Link className="btn btn-red" to="/shop">
              Find your colours →
            </Link>
          </div>
        </div>
      ) : page === "help" ? (
        <div className="info-content">
          <h2>Choose. Confirm. Wear.</h2>
          <ol>
            <li>Find your jersey, select a size and add it to your bag.</li>
            <li>Enter delivery details and save your order request.</li>
            <li>Send the prepared message on WhatsApp.</li>
            <li>
              Our team confirms stock, delivery and payment details. Pay after
              confirmation.
            </li>
          </ol>
          <h2>Find your fit</h2>
          <p>
            Sizes and cuts vary by jersey. Request exact chest width and length
            before payment. Compare with a shirt you like, laid flat.
          </p>
          <h2>Need an assist?</h2>
          <a
            className="btn btn-red"
            href={`https://wa.me/${s.whatsapp}`}
            target="_blank"
            rel="noreferrer"
          >
            Chat on WhatsApp ↗
          </a>
        </div>
      ) : page === "orders" ? (
        <div className="info-content">
          <p>
            Send your order reference to our team on WhatsApp for confirmation,
            payment or tracking updates.
          </p>
          <a
            className="btn btn-red"
            href={`https://wa.me/${s.whatsapp}?text=${encodeURIComponent("Hi PLAY11, I would like an update on my order. Reference: ")}`}
            target="_blank"
            rel="noreferrer"
          >
            Ask about my order ↗
          </a>
        </div>
      ) : (
        <div className="info-content">
          <section>
            <h2>Delivery</h2>
            <p>{s.deliveryPolicy}</p>
          </section>
          <section>
            <h2>Payment</h2>
            <p>
              Payment details are provided after stock and the final amount are
              confirmed on WhatsApp. Cash on delivery is unavailable.
            </p>
          </section>
          <section>
            <h2>Exchanges & returns</h2>
            <p>{s.returnPolicy}</p>
          </section>
          <section>
            <h2>Customisation</h2>
            <p>Custom names and numbers are unavailable.</p>
          </section>
          <section id="privacy">
            <h2>Privacy</h2>
            <p>{s.privacyPolicy}</p>
            <p>
              Contact <a href={`mailto:${s.email}`}>{s.email}</a> about your
              data.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
