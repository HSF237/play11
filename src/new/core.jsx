import { createContext, useContext, useState, useEffect, useRef } from "react";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  addDoc,
  serverTimestamp,
  getDocs,
  runTransaction,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase.js";
import { catalogueState } from "./catalogue.js";
export const defaults = {
  whatsapp: "917736308424",
  phone: "+91 77363 08424",
  email: "play11official@gmail.com",
  instagram: "play11official",
  location: "Payyanur, Kerala",
  sampleCatalogue: true,
  freeShippingThreshold: 999,
  deliveryCharge: null,
  announcement: "ALL INDIA. ALL FOOTBALL. FREE DELIVERY ABOVE ₹999.",
  heroTitle: "YOUR CLUB.\nYOUR COLOURS.",
  heroText:
    "For the ninety minutes. And everything after. Find the jersey that feels like you.",
  heroImage: "/story-cr7.jpg",
  heroLabel: "THE MATCHDAY EDIT",
  collections: ["Club", "National", "Retro", "Limited"],
  story:
    "Football is more than a result. It is the colours you grew up with, the nights you never forget, and the jersey you reach for every weekend. PLAY11 brings that feeling to fans across India, from our home in Kerala.",
  deliveryPolicy:
    "We deliver across India. Delivery is free on merchandise totals above ₹999 after discounts. For smaller orders, the delivery charge and estimated arrival date are confirmed on WhatsApp before payment.",
  returnPolicy:
    "Contact us before paying to confirm exchange and return terms for your order. If an item arrives damaged or incorrect, share your order reference and photos with our team.",
  privacyPolicy:
    "We use the contact and delivery details you submit to process your order. Your bag and wishlist are saved on your device. Order requests are stored in Firebase and shared with our team through WhatsApp when you choose to send them. Contact us to request correction or deletion of your details.",
};
export const samples = [
  "Madrid White / Home",
  "Manchester Red / Home",
  "Barcelona Stripes / Home",
  "Argentina Sky / Home",
  "Brazil Canary / Home",
  "France Navy / Archive",
].map((name, i) => ({
  id: `sample-${i + 1}`,
  name,
  club: [
    "Real Madrid",
    "Manchester United",
    "FC Barcelona",
    "Argentina",
    "Brazil",
    "France",
  ][i],
  price: [349, 449, 499, 449, 349, 599][i],
  originalPrice: [699, 799, 899, 799, 699, 999][i],
  type: i < 3 ? "Club" : "National",
  category: i === 5 ? "Retro" : i === 4 ? "Limited" : "Regular",
  badge:
    i === 0
      ? "FAN FAVOURITE"
      : i === 2
        ? "NEW IN"
        : i === 5
          ? "THE ARCHIVE"
          : "",
  sleeve: "Half Sleeve",
  sizes: ["S", "M", "L", "XL", "XXL"],
  stock: 20,
  available: true,
  published: true,
  featured: i < 4,
  mockCell: i,
  isMock: true,
  image: "/jersey-catalogue.webp",
  images: [],
  description:
    "A fictional sample jersey for the PLAY11 preview collection. Images, prices and fabric are illustrative. Final product details will be supplied by the store.",
  fabric: "Illustrative performance fabric",
}));
const Context = createContext(null);
export function StoreProvider({ children }) {
  const [settings, setSettings] = useState(defaults),
    [liveProducts, setLive] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [settingsError, setSettingsError] = useState(""),
    [retry, setRetry] = useState(0),
    [toast, setToast] = useState(""),
    timer = useRef();
  useEffect(() => {
    setLoading(true);
    setError("");
    setSettingsError("");
    const a = onSnapshot(
      doc(db, "settings", "store"),
      (s) => setSettings({ ...defaults, ...(s.exists() ? s.data() : {}) }),
      () =>
        setSettingsError(
          "Settings could not load. Default settings are being shown.",
        ),
    );
    const b = onSnapshot(
      collection(db, "products"),
      (s) => {
        setLive(s.docs.map((d) => ({ ...d.data(), id: d.id })));
        setLoading(false);
      },
      () => {
        setError("The live catalogue could not load. Please retry.");
        setLoading(false);
      },
    );
    return () => {
      a();
      b();
    };
  }, [retry]);
  useEffect(() => () => clearTimeout(timer.current), []);
  function notify(text) {
    clearTimeout(timer.current);
    setToast(text);
    timer.current = setTimeout(() => setToast(""), 4000);
  }
  const { products, isSampleCatalogue } = catalogueState(
    liveProducts, samples, settings.sampleCatalogue, loading, error,
  );
  return (
    <Context.Provider
      value={{
        products,
        isSampleCatalogue,
        liveProducts,
        settings,
        error,
        backendError: error || settingsError,
        loading,
        refresh: () => setRetry((n) => n + 1),
        notify,
      }}
    >
      {children}
      <div className={`toast ${toast ? "show" : ""}`} role="status">
        {toast}
      </div>
    </Context.Provider>
  );
}
export const useStore = () => useContext(Context);
export const money = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(n) || 0);
export const deliveryFor = (total, s = defaults) =>
  total > Number(s.freeShippingThreshold)
    ? 0
    : s.deliveryCharge == null
      ? null
      : Number(s.deliveryCharge);
export function discountFor(items, coupon, now = new Date()) {
  if (
    !coupon ||
    coupon.active === false ||
    (coupon.validity && new Date(coupon.validity + "T23:59:59") < now)
  )
    return 0;
  const subtotal = items.reduce((n, i) => n + i.price * i.qty, 0);
  if (subtotal < Number(coupon.minSpend || 0)) return 0;
  const eligible = items
    .filter(
      (i) =>
        !coupon.applicableProduct ||
        coupon.applicableProduct === "all" ||
        i.id === coupon.applicableProduct,
    )
    .reduce((n, i) => n + i.price * i.qty, 0);
  let discount = ["percentage", "percent"].includes(coupon.discountType)
    ? (eligible * Math.min(100, Math.max(0, Number(coupon.discountValue)))) /
      100
    : Number(coupon.discountValue);
  if (coupon.maxDiscount > 0)
    discount = Math.min(discount, Number(coupon.maxDiscount));
  return Math.round(Math.max(0, Math.min(eligible, discount)) * 100) / 100;
}
export function reconcile(items, products) {
  return items.map((i) => {
    const p = products.find((p) => p.id === i.id);
    if (!p || p.available === false || p.stock === 0 || p.published === false)
      throw new Error(`${i.name} is unavailable. Please update your bag.`);
    if (!p.sizes?.includes(i.size))
      throw new Error(`${i.name}: size ${i.size} is unavailable.`);
    const qty = items
      .filter((x) => x.id === i.id)
      .reduce((n, x) => n + x.qty, 0);
    if (p.stock != null && qty > p.stock)
      throw new Error(`${p.name}: only ${p.stock} pieces available.`);
    return { ...i, price: Number(p.price), name: p.name, isMock: !!p.isMock };
  });
}
export async function coupons() {
  const s = await getDocs(collection(db, "coupons"));
  return s.docs.map((d) => ({ ...d.data(), id: d.id }));
}
export async function findCoupon(code) {
  return (
    (await coupons()).find(
      (c) => c.code.toUpperCase() === code.trim().toUpperCase(),
    ) || null
  );
}
export async function saveSettings(s) {
  await setDoc(
    doc(db, "settings", "store"),
    { ...s, updatedAt: serverTimestamp() },
    { merge: true },
  );
}
export async function saveProduct(id, data) {
  if (id)
    await setDoc(
      doc(db, "products", id),
      { ...data, updatedAt: serverTimestamp() },
      { merge: true },
    );
  else
    await addDoc(collection(db, "products"), {
      ...data,
      createdAt: serverTimestamp(),
    });
}
export async function removeProduct(id) {
  await deleteDoc(doc(db, "products", id));
}
export async function saveCoupon(id, data) {
  if (id) await setDoc(doc(db, "coupons", id), data, { merge: true });
  else
    await addDoc(collection(db, "coupons"), {
      ...data,
      createdAt: serverTimestamp(),
    });
}
export async function removeCoupon(id) {
  await deleteDoc(doc(db, "coupons", id));
}
export async function requestOrder(order) {
  const ref = doc(collection(db, "orderRequests"));
  await setDoc(ref, {
    ...order,
    status: "requested",
    paymentStatus: "unpaid",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}
export async function updateOrder(id, fields) {
  await setDoc(
    doc(db, "orderRequests", id),
    { ...fields, updatedAt: serverTimestamp() },
    { merge: true },
  );
}
export async function confirmOrder(id, quote, coupon) {
  return runTransaction(db, async (tx) => {
    const ref = doc(db, "orderRequests", id),
      snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("Order no longer exists.");
    const o = snap.data();
    if (o.status !== "requested")
      throw new Error("This request has already been handled.");
    const counts = new Map();
    for (const i of o.items) counts.set(i.id, (counts.get(i.id) || 0) + i.qty);
    const records = new Map();
    for (const [pid, qty] of counts) {
      const pRef = doc(db, "products", pid),
        pSnap = await tx.get(pRef);
      if (!pSnap.exists())
        throw new Error("Sample or removed product cannot be confirmed.");
      const p = pSnap.data();
      if (p.isMock) throw new Error("Sample products cannot be fulfilled.");
      if (
        p.available === false ||
        p.published === false ||
        (p.stock != null && p.stock < qty)
      )
        throw new Error(`${p.name}: insufficient stock.`);
      records.set(pid, { pRef, p, qty });
    }
    const items = o.items.map((i) => {
      const p = records.get(i.id).p;
      if (!p.sizes?.includes(i.size))
        throw new Error(`${p.name}: unavailable size.`);
      return { ...i, name: p.name, price: Number(p.price), isMock: false };
    });
    let c = null;
    if (coupon?.id) {
      const cs = await tx.get(doc(db, "coupons", coupon.id));
      if (cs.exists()) c = cs.data();
    }
    const ss = await tx.get(doc(db, "settings", "store")),
      threshold = ss.exists()
        ? Number(ss.data().freeShippingThreshold ?? 999)
        : 999,
      subtotal = items.reduce((n, i) => n + i.price * i.qty, 0),
      discount = discountFor(items, c),
      shipping = subtotal - discount > threshold ? 0 : Number(quote);
    if (!Number.isFinite(shipping) || shipping < 0)
      throw new Error("Enter a valid delivery quote.");
    for (const { pRef, p, qty } of records.values())
      if (p.stock != null) tx.update(pRef, { stock: p.stock - qty });
    tx.update(ref, {
      items,
      subtotal,
      discount,
      deliveryCharge: shipping,
      total: subtotal - discount + shipping,
      status: "confirmed",
      stockReserved: true,
      updatedAt: serverTimestamp(),
    });
  });
}
export async function cancelOrder(id) {
  return runTransaction(db, async (tx) => {
    const ref = doc(db, "orderRequests", id),
      snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("Order missing.");
    const o = snap.data();
    if (o.status === "cancelled") return;
    if (["shipped", "delivered"].includes(o.status))
      throw new Error("Shipped orders need a return review.");
    const stock = new Map();
    if (o.stockReserved)
      for (const i of o.items) stock.set(i.id, (stock.get(i.id) || 0) + i.qty);
    const records = [];
    for (const [pid, qty] of stock) {
      const r = doc(db, "products", pid),
        s = await tx.get(r);
      if (s.exists() && s.data().stock != null)
        records.push({ r, qty, current: s.data().stock });
    }
    for (const i of records) tx.update(i.r, { stock: i.current + i.qty });
    tx.update(ref, {
      status: "cancelled",
      stockReserved: false,
      updatedAt: serverTimestamp(),
    });
  });
}
export function whatsappLink(
  form,
  items,
  subtotal,
  s,
  ref,
  discount = 0,
  code = "",
) {
  const delivery = deliveryFor(subtotal - discount, s),
    lines = [
      "*PLAY11 ORDER REQUEST* ⚽",
      `Reference: ${ref}`,
      "",
      ...items.map(
        (i) => `${i.qty} × ${i.name} | ${i.size} | ₹${i.price * i.qty}`,
      ),
      "",
      `Merchandise: ₹${subtotal}`,
      discount ? `Requested coupon ${code}: −₹${discount}` : "",
      `Delivery: ${delivery === null ? "To be confirmed" : delivery === 0 ? "FREE" : "₹" + delivery}`,
      `Merchandise estimate: ₹${subtotal - discount}`,
      "",
      `Name: ${form.name}`,
      `WhatsApp: ${form.phone}`,
      form.email ? `Email: ${form.email}` : "",
      `Address: ${form.address}, ${form.city}, ${form.state} ${form.pincode}, India`,
      "",
      "Please confirm stock, delivery and the final amount before I pay. No cash on delivery.",
    ];
  return `https://wa.me/${s.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
}
export function Image({
  product: p,
  index = 0,
  className = "",
  priority = false,
}) {
  if (p.mockCell != null)
    return (
      <div
        className={`jersey-sheet ${className}`}
        role="img"
        aria-label={`${p.name} — illustrative sample`}
        style={{
          backgroundPosition: `${(p.mockCell % 3) * 50}% ${Math.floor(p.mockCell / 3) * 100}%`,
        }}
      />
    );
  return (
    <img
      className={className}
      src={p.images?.[index] || p.image || "/product-unavailable.svg"}
      alt={p.name}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = "/product-unavailable.svg";
      }}
    />
  );
}
export function Icon({ name, size = 22 }) {
  const paths = {
    search: (
      <>
        <circle cx="10" cy="10" r="6.5" />
        <path d="m15 15 6 6" />
      </>
    ),
    heart: (
      <path d="M20 5a5 5 0 0 0-7 0l-1 1-1-1a5 5 0 0 0-7 7l8 9 8-9a5 5 0 0 0 0-7Z" />
    ),
    bag: (
      <>
        <path d="M5 7h14l1 14H4L5 7Z" />
        <path d="M8 8V6a4 4 0 0 1 8 0v2" />
      </>
    ),
    menu: <path d="M3 6h18M3 12h18M3 18h18" />,
    close: <path d="m5 5 14 14M19 5 5 19" />,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.arrow}
    </svg>
  );
}
