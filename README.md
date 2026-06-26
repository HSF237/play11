# Play11 — Premium Football Jersey Store

A sleek, premium e-commerce website for **Play11** built with **React + Vite**,
with a **Firebase** backend and an **admin portal** where the owner can add,
edit, and delete jerseys himself.

> Works out of the box in **demo mode** (sample jerseys) before Firebase is
> connected, so you can run it and see everything immediately.

**Business:** Play11 · Payyanur, Kannur · 📞 7736308424 · ✉️ play11official@gmail.com
· 🌐 play11.in · 📸 @play11official

---

## ✨ Features

- **Legendary homepage** — full-screen hero, animated marquee, featured
  jerseys, brand story, scroll reveals, and a big **Shop Now** button.
- **E-commerce store** — shop grid with category filters, search, sorting.
- **Product pages** — size + quantity selection, Add to Cart / Buy Now.
- **Cart & checkout** — persistent cart (saved in the browser), order summary,
  shipping logic, and a demo checkout flow.
- **Admin portal** (`/admin`) — secure login + full product manager
  (add / edit / delete jerseys) backed by Firebase.
- **Fully responsive** — looks great on phones, tablets, and desktop.

---

## 🚀 Run it locally

You need **Node.js 18+** installed.

```bash
cd play11
npm install
npm run dev
```

Then open the URL it prints (usually http://localhost:5173).

To build for production:

```bash
npm run build      # output goes to /dist
npm run preview    # preview the production build
```

---

## 🔌 Connect Firebase (free) — enables the admin portal

The site runs in **demo mode** until you add Firebase. To make the admin portal
save real products:

1. Go to https://console.firebase.google.com → **Add project** (free Spark plan).
2. **Build → Firestore Database → Create database →** start in **test mode**.
3. **Build → Authentication → Sign-in method →** enable **Email/Password**.
   Then **Authentication → Users → Add user** to create Nashid's admin login
   (e.g. `play11official@gmail.com` + a password).
4. **Project settings (⚙️) → Your apps → Web (`</>`)** → register the app and
   copy the config values.
5. Paste those values into **`src/firebase.js`** (replace the `YOUR_...`
   placeholders).

Restart `npm run dev` and the site is now live with a real backend.

### Important — keep it free
We do **not** use Firebase Storage (it now requires billing). Instead, the admin
adds a product by pasting an **image URL** (from Instagram, Google Drive, imgur,
etc.). This keeps everything on the **free** plan.

### Firestore security (recommended before going live)
In Firestore **Rules**, allow anyone to read products but only signed-in admins
to write:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{id} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 🛠 Using the admin portal

1. Go to `/admin/login` (also linked in the footer under **Company → Admin**).
2. Sign in with the admin user you created in Firebase.
3. Add a jersey: name, club, category, price, **image URL**, sizes, description.
   Tick **"Show on homepage"** to feature it in the hero section.
4. Edit or delete any product from the list on the right.

New products appear instantly in the shop.

---

## 📁 Project structure

```
play11/
├── index.html
├── package.json
├── vite.config.js
├── public/favicon.svg
├── _old-static-site/        # your earlier HTML version (archived, safe to delete)
└── src/
    ├── main.jsx             # app entry
    ├── App.jsx              # routes
    ├── firebase.js          # 🔑 put your Firebase config here
    ├── styles/index.css     # the full premium design system
    ├── context/             # CartContext + AuthContext
    ├── services/            # productService (Firestore + demo fallback)
    ├── data/seedProducts.js # demo jerseys
    ├── components/          # Navbar, Footer, ProductCard, ProtectedRoute
    └── pages/               # Home, Shop, ProductDetail, Cart, Checkout,
                             # AdminLogin, AdminDashboard, NotFound
```

---

## ➡️ Going further (optional)
- Connect **Stripe** for real payments in `Checkout.jsx`.
- Deploy free to **Vercel** or **Netlify** (`npm run build`, then drag `/dist`).
- Add an `orders` collection in Firestore to record real orders.

Built for Nashid. Wear the legend. ⚽
