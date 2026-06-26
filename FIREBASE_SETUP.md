# 🔥 Play11 — Firebase setup (free) — do this once

Firebase is what powers your **admin login**, your **products**, and your
**orders** in the cloud. It's free (Spark plan). This takes ~10 minutes.

> I can't create the Firebase project *for* you — it has to be made inside
> **your own Google account** (it asks for your Google login for security).
> But the steps below are exact, and the website is already 100% wired to use
> it the moment you paste your keys.

---

## Step 1 — Create the project
1. Go to **https://console.firebase.google.com** and sign in with your Google account.
2. Click **“Add project”**.
3. Name it **play11** → Continue.
4. Google Analytics: you can **turn it off** (not needed) → **Create project**.

## Step 2 — Create the database (Firestore)
1. Left menu → **Build → Firestore Database**.
2. Click **Create database**.
3. Choose location **asia-south1 (Mumbai)** (closest to India) → Next.
4. Start in **Test mode** → **Enable**.

## Step 3 — Turn on admin login (Authentication)
1. Left menu → **Build → Authentication → Get started**.
2. Open the **Sign-in method** tab → click **Email/Password** → **Enable** → Save.
3. Go to the **Users** tab → **Add user**:
   - Email: `play11official@gmail.com`
   - Password: choose a strong password (this is your admin password)
   - **Add user**.
   ➜ This is the login Nashid uses at `/admin/login`.

## Step 4 — Get your config keys
1. Click the **⚙️ gear (top-left) → Project settings**.
2. Scroll to **“Your apps”** → click the **web icon `</>`**.
3. App nickname: `play11-web` → **Register app**.
4. Firebase shows a `firebaseConfig = { … }` block. **Copy those values.**

## Step 5 — Paste keys into the site
Open **`src/firebase.js`** and replace the placeholder values with yours:

```js
const firebaseConfig = {
  apiKey: "AIza...your key...",
  authDomain: "play11-xxxx.firebaseapp.com",
  projectId: "play11-xxxx",
  storageBucket: "play11-xxxx.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abc123",
}
```

Save the file. Done — the site now runs on your live backend.

## Step 6 — Lock it down before going public (recommended)
In Firestore → **Rules** tab, paste this and **Publish**. It lets anyone view
products + place orders, but only your logged-in admin can edit products and
read/manage orders:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{id} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /orders/{id} {
      allow create: if true;                 // customers can place orders
      allow read, update, delete: if request.auth != null;  // only admin
    }
  }
}
```

---

## How the whole thing works once live
1. **Nashid logs in** at `/admin/login` with the email/password from Step 3.
2. In **Products**, he adds jerseys — name, club, price (₹), **multiple image
   URLs**, sizes, fabric, description. They appear instantly in the shop.
3. A **customer** browses, adds to cart, and checks out by entering their
   **name, phone, address, city, state, PIN**. No payment is taken.
4. The order lands in the admin **Orders** tab. Nashid sees the customer's
   **location**, sets the **delivery charge** for that area + a note, and saves.
   (Connect WhatsApp/UPI later to collect payment.)

That's the complete loop: list → order → quote delivery → fulfil.

---

### Want me to set up Firebase in your browser for you?
If your Chrome is connected to Claude and you're logged into your Google
account, I can drive the Firebase console and do Steps 1–4 with you watching,
then paste the keys into `firebase.js`. Just say **“do the Firebase setup in my
browser.”** (You'll still approve each step.)
