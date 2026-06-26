// Orders layer. Uses Firestore when configured; otherwise stores orders in the
// browser (localStorage) so the full "owner sets delivery charge" flow can be
// demoed before Firebase is connected.

import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase.js'

const COLLECTION = 'orders'
const LS_KEY = 'play11_orders'

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]')
  } catch {
    return []
  }
}
function writeLocal(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(list))
}

export async function createOrder(order) {
  const base = {
    ...order,
    status: 'awaiting_delivery_quote', // owner reviews location -> sets charge
    deliveryCharge: null,
    deliveryNote: '',
    createdAt: isFirebaseConfigured ? serverTimestamp() : Date.now(),
  }
  if (!isFirebaseConfigured) {
    const list = readLocal()
    const withId = { id: 'local-' + Date.now(), ...base }
    writeLocal([withId, ...list])
    return withId.id
  }
  const ref = await addDoc(collection(db, COLLECTION), base)
  return ref.id
}

export async function fetchOrders() {
  if (!isFirebaseConfigured) return readLocal()
  try {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch (err) {
    console.warn('Order fetch failed:', err.message)
    return []
  }
}

export async function updateOrder(id, data) {
  if (!isFirebaseConfigured) {
    const list = readLocal().map((o) => (o.id === id ? { ...o, ...data } : o))
    writeLocal(list)
    return
  }
  await updateDoc(doc(db, COLLECTION, id), data)
}
