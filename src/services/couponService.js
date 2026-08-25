import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase.js'

const COLLECTION = 'coupons'
const LS_KEY = 'play11_coupons'

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

export async function fetchCoupons() {
  if (!isFirebaseConfigured) return readLocal()
  try {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch (err) {
    console.warn('Coupon fetch failed:', err.message)
    return readLocal()
  }
}

export async function addCoupon(couponData) {
  const base = {
    ...couponData,
    createdAt: isFirebaseConfigured ? serverTimestamp() : Date.now(),
  }
  if (!isFirebaseConfigured) {
    const list = readLocal()
    const withId = { id: 'local-coupon-' + Date.now(), ...base }
    writeLocal([withId, ...list])
    return withId.id
  }
  const ref = await addDoc(collection(db, COLLECTION), base)
  return ref.id
}

export async function updateCoupon(id, data) {
  if (!isFirebaseConfigured) {
    const list = readLocal().map((c) => (c.id === id ? { ...c, ...data } : c))
    writeLocal(list)
    return
  }
  await updateDoc(doc(db, COLLECTION, id), data)
}

export async function deleteCoupon(id) {
  if (!isFirebaseConfigured) {
    const list = readLocal().filter((c) => c.id !== id)
    writeLocal(list)
    return
  }
  await deleteDoc(doc(db, COLLECTION, id))
}
