// Existing PLAY11 Firebase project. Publish firestore.rules before opening orders.
// Web app identifiers are public; never add service-account credentials here.
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA0d-NjNu7eTl8OOASJHuXrixGhtnuPpXg",
  authDomain: "play11-ed7b4.firebaseapp.com",
  projectId: "play11-ed7b4",
  storageBucket: "play11-ed7b4.firebasestorage.app",
  messagingSenderId: "737823503054",
  appId: "1:737823503054:web:490dbb48443e44746c169f",
  measurementId: "G-315T8F895R",
};

// If the config still has the placeholder values, the site runs in "demo mode"
// using built-in sample jerseys so it looks great before Firebase is connected.
export const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

let app = null;
let db = null;
let auth = null;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
}

export { app, db, auth };
