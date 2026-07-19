// Data layer for jerseys. Talks to Firestore when configured, otherwise falls
// back to the built-in demo catalogue so the site always works.

import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase.js'
import seedProducts from '../data/seedProducts.js'

const COLLECTION = 'products'

export async function fetchProducts() {
  if (!isFirebaseConfigured) return seedProducts

  try {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    // If the store is empty, show the demo jerseys so the page isn't blank.
    return items.length ? items : seedProducts
  } catch (err) {
    console.warn('Falling back to demo products:', err.message)
    return seedProducts
  }
}

export async function fetchProductById(id) {
  if (!isFirebaseConfigured) {
    return seedProducts.find((p) => p.id === id) || null
  }
  try {
    const ref = doc(db, COLLECTION, id)
    const snap = await getDoc(ref)
    if (snap.exists()) return { id: snap.id, ...snap.data() }
    return seedProducts.find((p) => p.id === id) || null
  } catch (err) {
    console.warn('Product lookup failed:', err.message)
    return seedProducts.find((p) => p.id === id) || null
  }
}

export async function addProduct(data) {
  if (!isFirebaseConfigured) {
    throw new Error('Connect Firebase to save products (see src/firebase.js).')
  }
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateProduct(id, data) {
  if (!isFirebaseConfigured) {
    throw new Error('Connect Firebase to edit products (see src/firebase.js).')
  }
  await updateDoc(doc(db, COLLECTION, id), data)
}

export async function deleteProduct(id) {
  if (!isFirebaseConfigured) {
    throw new Error('Connect Firebase to delete products (see src/firebase.js).')
  }
  await deleteDoc(doc(db, COLLECTION, id))
}

export async function fetchOrdersByUser(userId) {
  if (!isFirebaseConfigured) return []
  try {
    const q = query(collection(db, 'orders'), where('userId', '==', userId))
    const snap = await getDocs(q)
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
  } catch (err) {
    console.warn('fetchOrdersByUser failed:', err.message)
    return []
  }
}

export async function saveOrder(orderData) {
  if (!isFirebaseConfigured) return null
  try {
    const ref = await addDoc(collection(db, 'orders'), {
      ...orderData,
      createdAt: serverTimestamp(),
      status: 'pending',
    })
    return ref.id
  } catch (err) {
    console.warn('Order save failed:', err.message)
    return null
  }
}
