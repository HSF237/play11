import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase.js";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "../components/Logo.jsx";
import PreparedJerseys from "./PreparedJerseys.jsx";
import {
  useStore,
  Image,
  money,
  saveProduct,
  removeProduct,
  coupons,
  saveCoupon,
  removeCoupon,
  saveSettings,
  confirmOrder,
  cancelOrder,
  updateOrder,
} from "./core.jsx";
const blankProduct = {
  name: "",
  club: "",
  type: "Club",
  category: "Regular",
  sleeve: "Half Sleeve",
  price: "",
  originalPrice: "",
  sizes: "S, M, L, XL, XXL",
  stock: "",
  badge: "",
  description: "",
  fabric: "",
  sizeChart: "",
  images: "",
  available: true,
  published: true,
  featured: false,
};
const blankCoupon = {
  code: "",
  discountType: "percentage",
  discountValue: 10,
  minSpend: 0,
  maxDiscount: "",
  validity: "",
  applicableProduct: "all",
  active: true,
};
function Field({
  label,
  name,
  value,
  change,
  type = "text",
  wide = false,
  ...props
}) {
  return (
    <label className={wide ? "span-two" : ""}>
      {label}
      <input
        name={name}
        type={type}
        value={value ?? ""}
        onChange={change}
        {...props}
      />
    </label>
  );
}
function Text({ label, name, value, change, rows = 3 }) {
  return (
    <label className="span-two">
      {label}
      <textarea
        name={name}
        value={value || ""}
        onChange={change}
        rows={rows}
        required
      />
    </label>
  );
}
export function AdminLogin() {
  const { isAdmin, login, loginWithGoogle } = useAuth(),
    navigate = useNavigate(),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [show, setShow] = useState(false);
  useEffect(() => {
    if (isAdmin) navigate("/admin", { replace: true });
  }, [isAdmin, navigate]);
  async function run(fn) {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(
        e.code === "auth/unauthorized-domain"
          ? "Add this domain to Firebase Authentication’s authorised domains."
          : e.code === "auth/popup-blocked"
            ? "Allow sign-in popups, or use email and password."
            : e.code === "auth/invalid-credential"
              ? "Check your email and password."
              : e.message,
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="admin-login">
      <div className="login-story">
        <Logo />
        <span className="eyebrow">PLAY11 / BEHIND THE SCENES</span>
        <h1>
          Your store.
          <br />
          Your rules.
        </h1>
        <p>The control room for the beautiful game.</p>
      </div>
      <div className="login-panel">
        <Link className="text-link" to="/">
          ← Back to store
        </Link>
        <span className="eyebrow">AUTHORISED STAFF ONLY</span>
        <h2>Welcome back.</h2>
        <p>Sign in with your existing PLAY11 admin account.</p>
        {error && (
          <div className="notice error" role="alert">
            {error}
          </div>
        )}
        <button
          className="btn full"
          disabled={busy}
          onClick={() => run(() => loginWithGoogle(true))}
        >
          {busy ? "Signing in…" : "Continue with Google ↗"}
        </button>
        <button className="text-link" onClick={() => setShow((v) => !v)}>
          {show ? "Hide email sign-in" : "Use email & password"}
        </button>
        {show && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              run(() => login(email, password));
            }}
          >
            <label>
              Email
              <input
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label>
              Password
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <button className="btn btn-red full" disabled={busy}>
              {busy ? "Signing in…" : "Sign in →"}
            </button>
          </form>
        )}
        <p className="small">
          Only verified, authorised accounts can manage the store.
        </p>
      </div>
    </div>
  );
}
export function Admin() {
  const { user, logout } = useAuth(),
    { liveProducts, settings, isSampleCatalogue, backendError, refresh, notify } = useStore(),
    [tab, setTab] = useState("overview"),
    [orders, setOrders] = useState([]),
    [legacy, setLegacy] = useState([]),
    [legacyError, setLegacyError] = useState(""),
    [orderError, setOrderError] = useState(""),
    [codes, setCodes] = useState([]),
    [couponError, setCouponError] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [product, setProduct] = useState(blankProduct),
    [productId, setProductId] = useState(null),
    [coupon, setCoupon] = useState(blankCoupon),
    [couponId, setCouponId] = useState(null),
    [draft, setDraft] = useState(settings),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState("all"),
    [orderDraft, setOrderDraft] = useState({}),
    [remove, setRemove] = useState(null);
  useEffect(() => {
    const history = onSnapshot(
      collection(db, "orders"),
      (snapshot) => {
        setLegacy(snapshot.docs.map((d) => ({ ...d.data(), id: d.id })));
        setLegacyError("");
      },
      () => setLegacyError("Legacy history could not load."),
    );
    const un = onSnapshot(
      collection(db, "orderRequests"),
      (s) => {
        setOrders(
          s.docs
            .map((d) => ({ ...d.data(), id: d.id }))
            .sort(
              (a, b) =>
                (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
            ),
        );
        setOrderError("");
      },
      () =>
        setOrderError(
          "Requests unavailable. Publish the supplied Firestore rules to enable this collection.",
        ),
    );
    coupons()
      .then(setCodes)
      .catch(() =>
        setCouponError("Coupons could not load. Check database access."),
      );
    return () => {
      un();
      history();
    };
  }, []);
  useEffect(() => setDraft(settings), [settings]);
  useEffect(() => {
    if (!remove) return;
    const previous = document.activeElement;
    const handler = (e) => {
      if (e.key === "Escape" && !busy) setRemove(null);
      if (e.key === "Tab") {
        const controls = [
          ...document.querySelectorAll(".modal button:not(:disabled)"),
        ];
        const first = controls[0],
          last = controls.at(-1);
        if (!first) {
          e.preventDefault();
          return;
        }
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      previous?.focus();
    };
  }, [remove, busy]);
  const change = (setter) => (e) =>
    setter((v) => ({
      ...v,
      [e.target.name]:
        e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));
  const cp = change(setProduct),
    cc = change(setCoupon),
    cs = change(setDraft);
  async function run(fn, message) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await fn();
      notify(message);
    } catch (e) {
      setError(
        e.code === "permission-denied"
          ? "Database access denied. Publish firestore.rules to the PLAY11 Firebase project to enable these controls."
          : e.message,
      );
    } finally {
      setBusy(false);
    }
  }
  async function submitProduct(e) {
    e.preventDefault();
    await run(async () => {
      const images = product.images
          .split("\n")
          .map((v) => v.trim())
          .filter(Boolean),
        sizes = [
          ...new Set(
            product.sizes
              .split(",")
              .map((v) => v.trim())
              .filter(Boolean),
          ),
        ];
      if (
        !images.length ||
        images.some(
          (v) =>
            !/^https:\/\//i.test(v) &&
            !(v.startsWith("/") && !v.startsWith("//")),
        )
      )
        throw new Error("Use valid HTTPS or local photo URLs.");
      if (!sizes.length) throw new Error("Add at least one size.");
      if (Number(product.price) <= 0)
        throw new Error("Price must be positive.");
      if (
        product.stock !== "" &&
        (!Number.isInteger(Number(product.stock)) || Number(product.stock) < 0)
      )
        throw new Error("Stock must be a non-negative whole number.");
      const data = {
        ...product,
        price: Number(product.price),
        originalPrice:
          product.originalPrice === "" ? null : Number(product.originalPrice),
        stock: product.stock === "" ? null : Number(product.stock),
        sizes,
        images,
        image: images[0],
        mockCell: null,
        isMock: false,
      };
      delete data.id;
      delete data.createdAt;
      await saveProduct(productId, data);
      setProduct(blankProduct);
      setProductId(null);
    }, "Product saved.");
  }
  function edit(p) {
    setProductId(p.id);
    setProduct({
      ...blankProduct,
      ...p,
      sizes: (p.sizes || []).join(", "),
      images: (p.images?.length ? p.images : [p.image || ""]).join("\n"),
      stock: p.stock ?? "",
      originalPrice: p.originalPrice ?? "",
    });
    window.scrollTo(0, 0);
  }
  async function submitCoupon(e) {
    e.preventDefault();
    await run(async () => {
      if (
        coupon.discountType === "percentage" &&
        Number(coupon.discountValue) > 100
      )
        throw new Error("Percentage cannot exceed 100.");
      const code = coupon.code.trim().toUpperCase();
      if (codes.some((c) => c.code === code && c.id !== couponId))
        throw new Error("This coupon code already exists.");
      await saveCoupon(couponId, {
        ...coupon,
        code,
        discountValue: Number(coupon.discountValue),
        minSpend: Number(coupon.minSpend),
        maxDiscount:
          coupon.maxDiscount === "" ? null : Number(coupon.maxDiscount),
      });
      setCodes(await coupons());
      setCoupon(blankCoupon);
      setCouponId(null);
    }, "Coupon saved.");
  }
  async function submitSettings(e) {
    e.preventDefault();
    await run(async () => {
      if (!/^\d{10,15}$/.test(draft.whatsapp))
        throw new Error("WhatsApp number needs country code and digits only.");
      if (
        !/^https:\/\//i.test(draft.heroImage) &&
        !(draft.heroImage.startsWith("/") && !draft.heroImage.startsWith("//"))
      )
        throw new Error("Use a valid homepage photo URL.");
      const list = (
        Array.isArray(draft.collections)
          ? draft.collections
          : draft.collections.split(",")
      )
        .map((v) => v.trim())
        .filter(Boolean);
      if (!list.length || list.length > 8)
        throw new Error("Add between one and eight collections.");
      await saveSettings({
        ...draft,
        collections: [...new Set(list)],
        freeShippingThreshold: Number(draft.freeShippingThreshold),
        deliveryCharge:
          draft.deliveryCharge === "" || draft.deliveryCharge == null
            ? null
            : Number(draft.deliveryCharge),
      });
    }, "Store settings published.");
  }
  const pending = orders.filter((o) => o.status === "requested").length,
    low = liveProducts.filter((p) => p.stock != null && p.stock <= 5).length;
  const od = (o) => ({
      deliveryCharge: o.deliveryCharge ?? "",
      trackingId: o.trackingId || "",
      note: o.adminNote || "",
      ...(orderDraft[o.id] || {}),
    }),
    patch = (id, key, value) =>
      setOrderDraft((prev) => ({
        ...prev,
        [id]: { ...prev[id], [key]: value },
      }));
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" to="/">
          <Logo variant="black" />
          <span>CONTROL ROOM</span>
        </Link>
        <nav aria-label="Admin sections">
          {[
            ["overview", "Overview"],
            ["products", "Products"],
            ["orders", "Orders"],
            ["coupons", "Coupons"],
            ["content", "Content & collections"],
            ["settings", "Store settings"],
            ["history", "Legacy history"],
          ].map(([key, label], i) => (
            <button
              key={key}
              className={tab === key ? "active" : ""}
              onClick={() => {
                setTab(key);
                setError("");
                setSearch("");
              }}
            >
              <span>0{i + 1}</span>
              {label}
              {key === "orders" && pending > 0 && <b>{pending}</b>}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-foot">
          <span>{user?.email}</span>
          <Link to="/">View storefront ↗</Link>
          <button onClick={logout}>Sign out</button>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-header">
          <div>
            <span className="eyebrow">PLAY11 / STORE ADMIN</span>
            <h1>
              {tab === "overview"
                ? "The control room."
                : tab === "content"
                  ? "Make it yours."
                  : `${tab.charAt(0).toUpperCase() + tab.slice(1)}.`}
            </h1>
          </div>
          <Link className="btn btn-small" to="/">
            View store ↗
          </Link>
        </header>
        {backendError && (
          <div className="notice error">
            {backendError}
            <button onClick={refresh}>Retry</button>
          </div>
        )}
        {error && (
          <div className="notice error" role="alert">
            {error}
          </div>
        )}
        {isSampleCatalogue && (
          <div className="notice">
            <b>Sample catalogue is visible.</b> Publish a real product to replace
            the samples automatically. Draft products stay hidden.
          </div>
        )}
        {tab === "overview" && (
          <>
            <div className="admin-stats">
              {[
                ["Live products", liveProducts.length],
                ["New requests", pending],
                ["Low-stock jerseys", low],
                [
                  "Paid sales",
                  money(
                    orders
                      .filter(
                        (o) =>
                          o.paymentStatus === "paid" &&
                          o.status !== "cancelled",
                      )
                      .reduce((n, o) => n + Number(o.total || 0), 0),
                  ),
                ],
              ].map(([label, n]) => (
                <div key={label}>
                  <span>{label}</span>
                  <b>{n}</b>
                </div>
              ))}
            </div>
            <section className="admin-panel">
              <span className="eyebrow">THE NEXT PLAY</span>
              <h2>Your store, under control.</h2>
              <p>
                Add jerseys with front and back photos, prices, sizes and stock.
                Review order requests, confirm the final amount, verify payment,
                then ship.
              </p>
              <div className="form-actions">
                <button
                  className="btn btn-red"
                  onClick={() => setTab("products")}
                >
                  Add a jersey →
                </button>
                <button className="btn" onClick={() => setTab("orders")}>
                  Review requests →
                </button>
              </div>
            </section>
            <section className="admin-panel">
              <h2>Launch setup</h2>
              <p>
                Publish the supplied database rules, add real products, confirm
                delivery and return terms, then turn off the sample catalogue.
              </p>
              <a
                className="text-link"
                href="https://console.firebase.google.com/project/play11-ed7b4/firestore/rules"
                target="_blank"
                rel="noreferrer"
              >
                Open Firebase rules ↗
              </a>
            </section>
          </>
        )}
        {tab === "products" && (
          <div className="admin-two-col">
            <section className="admin-panel">
              <h2>{productId ? "Edit jersey" : "Add a jersey"}</h2>
              <PreparedJerseys />
              <form onSubmit={submitProduct}>
                <div className="form-grid">
                  <Field
                    label="Product name"
                    name="name"
                    value={product.name}
                    change={cp}
                    required
                    wide
                    maxLength={160}
                  />
                  <Field
                    label="Club / team"
                    name="club"
                    value={product.club}
                    change={cp}
                    required
                  />
                  <label>
                    Type
                    <select name="type" value={product.type} onChange={cp}>
                      <option>Club</option>
                      <option>National</option>
                    </select>
                  </label>
                  <label>
                    Collection
                    <select
                      name="category"
                      value={product.category}
                      onChange={cp}
                    >
                      {[
                        "Regular",
                        "Retro",
                        "Limited",
                        ...settings.collections.filter(
                          (c) =>
                            !["Club", "National", "Retro", "Limited"].includes(
                              c,
                            ),
                        ),
                      ].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Sleeve
                    <select name="sleeve" value={product.sleeve} onChange={cp}>
                      <option>Half Sleeve</option>
                      <option>Five Sleeve</option>
                      <option>Full Sleeve</option>
                    </select>
                  </label>
                  <Field
                    label="Sale price (₹)"
                    name="price"
                    value={product.price}
                    change={cp}
                    type="number"
                    min="1"
                    max="100000"
                    step="0.01"
                    required
                  />
                  <Field
                    label="Original price (₹, optional)"
                    name="originalPrice"
                    value={product.originalPrice}
                    change={cp}
                    type="number"
                    min="0"
                    step="0.01"
                  />
                  <Field
                    label="Sizes, separated by commas"
                    name="sizes"
                    value={product.sizes}
                    change={cp}
                    wide
                    required
                  />
                  <Field
                    label="Stock (blank = untracked)"
                    name="stock"
                    value={product.stock}
                    change={cp}
                    type="number"
                    min="0"
                    step="1"
                  />
                  <Field
                    label="Badge (optional)"
                    name="badge"
                    value={product.badge}
                    change={cp}
                    maxLength={30}
                  />
                  <Text
                    label="Photo URLs (one per line; front first)"
                    name="images"
                    value={product.images}
                    change={cp}
                  />
                  <Text
                    label="Description"
                    name="description"
                    value={product.description}
                    change={cp}
                  />
                  <Field
                    label="Fabric"
                    name="fabric"
                    value={product.fabric}
                    change={cp}
                    wide
                  />
                  <label className="span-two">
                    Actual size measurements
                    <textarea
                      name="sizeChart"
                      value={product.sizeChart}
                      onChange={cp}
                      rows="3"
                    />
                  </label>
                </div>
                {[
                  ["published", "Publish to store"],
                  ["available", "Available for sale"],
                  ["featured", "Feature on homepage"],
                ].map(([key, label]) => (
                  <label className="check-label" key={key}>
                    <input
                      name={key}
                      type="checkbox"
                      checked={product[key]}
                      onChange={cp}
                    />
                    {label}
                  </label>
                ))}
                <div className="form-actions">
                  <button className="btn btn-red" disabled={busy}>
                    {busy
                      ? "Saving…"
                      : productId
                        ? "Save changes"
                        : "Add product"}
                  </button>
                  {productId && (
                    <button
                      className="btn"
                      type="button"
                      onClick={() => {
                        setProduct(blankProduct);
                        setProductId(null);
                      }}
                    >
                      Cancel edit
                    </button>
                  )}
                </div>
              </form>
            </section>
            <section className="admin-panel">
              <h2>The live catalogue ({liveProducts.length})</h2>
              <input
                className="admin-search"
                aria-label="Search products"
                placeholder="Search products…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {liveProducts
                .filter((p) =>
                  `${p.name} ${p.club}`
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                )
                .map((p) => (
                  <article className="admin-product" key={p.id}>
                    <div className="admin-product-image">
                      <Image product={p} />
                    </div>
                    <div>
                      <strong>{p.name}</strong>
                      <p>
                        {money(p.price)} ·{" "}
                        {p.published === false ? "Draft" : "Published"}
                      </p>
                      <span>
                        {p.stock == null
                          ? "Stock untracked"
                          : `${p.stock} in stock`}
                      </span>
                    </div>
                    <div className="admin-product-actions">
                      <button className="btn btn-small" onClick={() => edit(p)}>
                        Edit
                      </button>
                      <button
                        className="text-link danger"
                        onClick={() =>
                          setRemove({ kind: "product", id: p.id, name: p.name })
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              {!liveProducts.length && (
                <p>Add your first real jersey to the live catalogue.</p>
              )}
            </section>
          </div>
        )}
        {tab === "orders" && (
          <>
            <div className="admin-order-toolbar">
              <input
                aria-label="Search requests"
                placeholder="Customer, phone or reference…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                aria-label="Filter order status"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                {[
                  "all",
                  "requested",
                  "confirmed",
                  "shipped",
                  "delivered",
                  "cancelled",
                ].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            {orderError && <div className="notice error">{orderError}</div>}
            {orders
              .filter(
                (o) =>
                  (filter === "all" || filter === o.status) &&
                  `${o.id} ${o.form?.name} ${o.form?.phone}`
                    .toLowerCase()
                    .includes(search.toLowerCase()),
              )
              .map((o) => {
                const d = od(o),
                  message = `Hi ${o.form?.name}, this is PLAY11. Reference: ${o.id}. Status: ${o.status}. ${o.status !== "requested" ? `Confirmed total: ₹${o.total}. ` : ""}${o.trackingId ? `Tracking: ${o.trackingId}.` : ""}`;
                return (
                  <article className="admin-panel order-card" key={o.id}>
                    <div className="order-head">
                      <div>
                        <span className="eyebrow">
                          {o.createdAt?.toDate?.().toLocaleString("en-IN") ||
                            "Pending timestamp"}
                        </span>
                        <h2>{o.form?.name}</h2>
                        <span className="order-ref">{o.id}</span>
                      </div>
                      <span className={`status status-${o.status}`}>
                        {o.status}
                      </span>
                    </div>
                    {o.isMock && (
                      <div className="notice">
                        Sample request. Sample products cannot be fulfilled.
                      </div>
                    )}
                    <div className="order-items">
                      {o.items?.map((i, n) => (
                        <div key={n}>
                          <span>
                            {i.qty} × {i.name} / {i.size}
                          </span>
                          <b>{money(i.price * i.qty)}</b>
                        </div>
                      ))}
                    </div>
                    <p>
                      {o.form?.address}, {o.form?.city}, {o.form?.state}{" "}
                      {o.form?.pincode}
                      <br />
                      {o.form?.phone} {o.form?.email}
                    </p>
                    <div className="form-grid">
                      <Field
                        label="Delivery quote (₹)"
                        type="number"
                        min="0"
                        value={d.deliveryCharge}
                        change={(e) =>
                          patch(o.id, "deliveryCharge", e.target.value)
                        }
                        disabled={o.status !== "requested"}
                      />
                      <Field
                        label="Tracking reference"
                        value={d.trackingId}
                        change={(e) =>
                          patch(o.id, "trackingId", e.target.value)
                        }
                      />
                      <Field
                        label="Private admin note"
                        value={d.note}
                        change={(e) => patch(o.id, "note", e.target.value)}
                        wide
                        maxLength={1000}
                      />
                    </div>
                    <p>
                      <b>
                        {o.status === "requested"
                          ? "Customer estimate"
                          : "Confirmed total"}
                        : {money(o.total || o.subtotal)}
                      </b>{" "}
                      · Payment: {o.paymentStatus || "unpaid"}
                    </p>
                    <div className="form-actions">
                      <button
                        className="btn btn-small"
                        disabled={busy}
                        onClick={() =>
                          run(
                            () =>
                              updateOrder(o.id, {
                                trackingId: d.trackingId,
                                adminNote: d.note,
                              }),
                            "Details saved.",
                          )
                        }
                      >
                        Save details
                      </button>
                      {o.status === "requested" && (
                        <button
                          className="btn btn-red btn-small"
                          disabled={busy || o.isMock}
                          onClick={() =>
                            run(async () => {
                              if (d.deliveryCharge === "")
                                throw new Error(
                                  "Enter delivery charge (0 for free).",
                                );
                              await confirmOrder(
                                o.id,
                                d.deliveryCharge,
                                codes.find((c) => c.code === o.couponCode),
                              );
                            }, "Order confirmed and stock reserved.")
                          }
                        >
                          Confirm & reserve stock
                        </button>
                      )}
                      {o.status === "confirmed" &&
                        o.paymentStatus !== "paid" && (
                          <button
                            className="btn btn-small"
                            disabled={busy}
                            onClick={() =>
                              setRemove({
                                kind: "payment",
                                id: o.id,
                                name: `payment for ${o.form?.name}`,
                              })
                            }
                          >
                            I verified payment
                          </button>
                        )}
                      {o.status === "confirmed" && (
                        <button
                          className="btn btn-small"
                          disabled={busy || o.paymentStatus !== "paid"}
                          onClick={() =>
                            run(async () => {
                              if (!d.trackingId.trim())
                                throw new Error(
                                  "Add tracking before shipping.",
                                );
                              await updateOrder(o.id, {
                                status: "shipped",
                                trackingId: d.trackingId,
                              });
                            }, "Marked shipped.")
                          }
                        >
                          Mark shipped
                        </button>
                      )}
                      {o.status === "shipped" && (
                        <button
                          className="btn btn-small"
                          disabled={busy}
                          onClick={() =>
                            run(
                              () => updateOrder(o.id, { status: "delivered" }),
                              "Marked delivered.",
                            )
                          }
                        >
                          Mark delivered
                        </button>
                      )}
                      {["requested", "confirmed"].includes(o.status) && (
                        <button
                          className="text-link danger"
                          onClick={() =>
                            setRemove({
                              kind: "cancel",
                              id: o.id,
                              name: `order for ${o.form?.name}`,
                            })
                          }
                        >
                          Cancel
                        </button>
                      )}
                      <a
                        className="btn btn-small"
                        href={`https://wa.me/91${(o.form?.phone || "").replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(message)}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open WhatsApp ↗
                      </a>
                    </div>
                  </article>
                );
              })}
            {!orders.length && !orderError && (
              <div className="empty compact">
                <h2>No requests yet.</h2>
                <p>Saved customer requests appear here.</p>
              </div>
            )}
          </>
        )}
        {tab === "history" && (
          <section className="admin-panel">
            <h2>Previous store orders ({legacy.length})</h2>
            <p>
              Historical records are preserved separately from the new request
              workflow.
            </p>
            {legacyError && <p className="error-text">{legacyError}</p>}
            {legacy.map((o) => (
              <article className="coupon-card" key={o.id}>
                <b>
                  {o.form?.name || "Customer"} / {o.status || "pending"}
                </b>
                <p>
                  Reference: {o.id}
                  <br />
                  {o.form?.phone} · {money(o.total || o.subtotal || 0)}
                  <br />
                  {o.items
                    ?.map((i) => `${i.qty} × ${i.name} / ${i.size}`)
                    .join(", ")}
                  <br />
                  {o.form?.address}, {o.form?.city}, {o.form?.state}{" "}
                  {o.form?.pincode}
                </p>
                <a
                  className="btn btn-small"
                  href={`https://wa.me/91${(o.form?.phone || "").replace(/\D/g, "").slice(-10)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Contact customer ↗
                </a>
              </article>
            ))}
          </section>
        )}
        {tab === "coupons" && (
          <div className="admin-two-col">
            <section className="admin-panel">
              <h2>{couponId ? "Edit coupon" : "Create a coupon"}</h2>
              <form onSubmit={submitCoupon}>
                <div className="form-grid">
                  <Field
                    label="Code"
                    name="code"
                    value={coupon.code}
                    change={cc}
                    required
                    maxLength={40}
                  />
                  <label>
                    Type
                    <select
                      name="discountType"
                      value={coupon.discountType}
                      onChange={cc}
                    >
                      <option value="percentage">Percentage</option>
                      <option value="flat">Flat amount</option>
                    </select>
                  </label>
                  {[
                    ["discountValue", "Discount value", 1],
                    ["minSpend", "Minimum spend (₹)", 0],
                    ["maxDiscount", "Maximum discount (₹, optional)", 0],
                  ].map(([key, label, min]) => (
                    <Field
                      key={key}
                      label={label}
                      name={key}
                      value={coupon[key]}
                      change={cc}
                      type="number"
                      min={min}
                      required={key === "discountValue"}
                    />
                  ))}
                  <Field
                    label="Expires on"
                    name="validity"
                    value={coupon.validity}
                    change={cc}
                    type="date"
                    required
                  />
                  <label className="span-two">
                    Applies to
                    <select
                      name="applicableProduct"
                      value={coupon.applicableProduct}
                      onChange={cc}
                    >
                      <option value="all">Entire order</option>
                      {liveProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="check-label">
                  <input
                    name="active"
                    type="checkbox"
                    checked={coupon.active}
                    onChange={cc}
                  />
                  Active
                </label>
                <div className="form-actions">
                  <button className="btn btn-red" disabled={busy}>
                    {busy ? "Saving…" : "Save coupon"}
                  </button>
                  {couponId && (
                    <button
                      className="btn"
                      type="button"
                      onClick={() => {
                        setCouponId(null);
                        setCoupon(blankCoupon);
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </section>
            <section className="admin-panel">
              <h2>Your coupons</h2>
              {couponError && <p className="error-text">{couponError}</p>}
              {codes.map((c) => (
                <div className="coupon-card" key={c.id}>
                  <b>{c.code}</b>
                  <p>
                    {c.discountValue}
                    {["percentage", "percent"].includes(c.discountType)
                      ? "%"
                      : " rupees"}{" "}
                    off · {c.validity} ·{" "}
                    {c.active === false ? "Inactive" : "Active"}
                  </p>
                  <div className="form-actions">
                    <button
                      className="btn btn-small"
                      onClick={() => {
                        setCouponId(c.id);
                        setCoupon({
                          ...blankCoupon,
                          ...c,
                          discountType:
                            c.discountType === "percent"
                              ? "percentage"
                              : c.discountType,
                          maxDiscount: c.maxDiscount ?? "",
                        });
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="text-link danger"
                      onClick={() =>
                        setRemove({ kind: "coupon", id: c.id, name: c.code })
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {!codes.length && <p>No coupons created yet.</p>}
            </section>
          </div>
        )}
        {["content", "settings"].includes(tab) && (
          <section className="admin-panel settings-panel">
            <h2>
              {tab === "content"
                ? "Homepage & collections"
                : "Contacts, delivery & policies"}
            </h2>
            <form onSubmit={submitSettings}>
              <div className="form-grid">
                {tab === "content" ? (
                  <>
                    <Field
                      label="Announcement bar"
                      name="announcement"
                      value={draft.announcement}
                      change={cs}
                      wide
                      required
                      maxLength={160}
                    />
                    <Field
                      label="Hero label"
                      name="heroLabel"
                      value={draft.heroLabel}
                      change={cs}
                      wide
                      required
                      maxLength={60}
                    />
                    <Text
                      label="Hero heading (one line per row)"
                      name="heroTitle"
                      value={draft.heroTitle}
                      change={cs}
                      rows={2}
                    />
                    <Text
                      label="Hero description"
                      name="heroText"
                      value={draft.heroText}
                      change={cs}
                      rows={2}
                    />
                    <Field
                      label="Hero photo URL"
                      name="heroImage"
                      value={draft.heroImage}
                      change={cs}
                      wide
                      required
                    />
                    <Field
                      label="Collections, separated by commas"
                      name="collections"
                      value={
                        Array.isArray(draft.collections)
                          ? draft.collections.join(", ")
                          : draft.collections
                      }
                      change={cs}
                      wide
                      required
                    />
                    <Text
                      label="Our story"
                      name="story"
                      value={draft.story}
                      change={cs}
                      rows={5}
                    />
                  </>
                ) : (
                  <>
                    {[
                      ["whatsapp", "WhatsApp number (country code + digits)"],
                      ["phone", "Display phone"],
                      ["email", "Contact email"],
                      ["instagram", "Instagram username"],
                      ["location", "Store location"],
                    ].map(([key, label]) => (
                      <Field
                        key={key}
                        label={label}
                        name={key}
                        value={draft[key]}
                        change={cs}
                        type={key === "email" ? "email" : "text"}
                        required
                        pattern={
                          key === "instagram" ? "[A-Za-z0-9_.]+" : undefined
                        }
                      />
                    ))}
                    <Field
                      label="Free delivery above (₹)"
                      name="freeShippingThreshold"
                      value={draft.freeShippingThreshold}
                      change={cs}
                      type="number"
                      min="0"
                      required
                    />
                    <Field
                      label="Delivery below threshold (blank = quote)"
                      name="deliveryCharge"
                      value={draft.deliveryCharge}
                      change={cs}
                      type="number"
                      min="0"
                    />
                    {[
                      ["deliveryPolicy", "Delivery policy"],
                      ["returnPolicy", "Exchange & return policy"],
                      ["privacyPolicy", "Privacy policy"],
                    ].map(([key, label]) => (
                      <Text
                        key={key}
                        label={label}
                        name={key}
                        value={draft[key]}
                        change={cs}
                        rows={4}
                      />
                    ))}
                  </>
                )}
              </div>
              {tab === "settings" && (
                <label className="check-label">
                  <input
                    name="sampleCatalogue"
                    type="checkbox"
                    checked={draft.sampleCatalogue}
                    onChange={cs}
                  />
                  Show samples only when there are no published products
                </label>
              )}
              <button className="btn btn-red" disabled={busy}>
                {busy ? "Publishing…" : "Publish settings"}
              </button>
            </form>
          </section>
        )}
      </div>
      {remove && (
        <div
          className="modal-backdrop"
          onClick={() => !busy && setRemove(null)}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="confirm-title">
              {remove.kind === "payment"
                ? "Verify"
                : remove.kind === "cancel"
                  ? "Cancel"
                  : "Delete"}{" "}
              {remove.name}?
            </h2>
            <p>
              {remove.kind === "payment"
                ? "Only mark paid after independently checking that the money arrived in your bank account."
                : remove.kind === "cancel"
                  ? "Reserved stock will be restored."
                  : "This removes the record. Existing order history is preserved."}
            </p>
            <div className="form-actions">
              <button
                className="btn"
                autoFocus
                disabled={busy}
                onClick={() => setRemove(null)}
              >
                Go back
              </button>
              <button
                className="btn btn-red"
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    if (remove.kind === "product")
                      await removeProduct(remove.id);
                    else if (remove.kind === "coupon") {
                      await removeCoupon(remove.id);
                      setCodes(await coupons());
                    } else if (remove.kind === "cancel")
                      await cancelOrder(remove.id);
                    else
                      await updateOrder(remove.id, { paymentStatus: "paid" });
                    setRemove(null);
                  }, "Changes saved.")
                }
              >
                {busy ? "Saving…" : "Confirm"}
              </button>
            </div>
            {error && <p className="error-text">{error}</p>}
          </section>
        </div>
      )}
    </div>
  );
}
