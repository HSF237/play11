// -----------------------------------------------------------------------------
// Play11 — Firebase setup (FREE Spark plan friendly)
// -----------------------------------------------------------------------------
// 1. Go to https://console.firebase.google.com  ->  Add project (free).
// 2. Build > Firestore Database  ->  Create database  ->  Start in test mode.
// 3. Build > Authentication > Sign-in method  ->  enable "Email/Password".
//    Then Authentication > Users > Add user  -> create Nashid's admin login.
// 4. Project settings (gear icon) > "Your apps" > Web (</>) -> register app
//    and copy the config values into the object below.
//
// NOTE: We intentionally do NOT use Firebase Storage (it now asks for billing).
//       Admin adds products using image URLs instead — 100% free.
// -----------------------------------------------------------------------------

import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyA0d-NjNu7eTl8OOASJHuXrixGhtnuPpXg',
  authDomain: 'play11-ed7b4.firebaseapp.com',
  projectId: 'play11-ed7b4',
  storageBucket: 'play11-ed7b4.firebasestorage.app',
  messagingSenderId: '737823503054',
  appId: '1:737823503054:web:490dbb48443e44746c169f',
  measurementId: 'G-315T8F895R',
}

// If the config still has the placeholder values, the site runs in "demo mode"
// using built-in sample jerseys so it looks great before Firebase is connected.
export const isFirebaseConfigured = firebaseConfig.apiKey !== 'YOUR_API_KEY'

let app = null
let db = null
let auth = null

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig)
  db = getFirestore(app)
  auth = getAuth(app)
}

export { app, db, auth }
