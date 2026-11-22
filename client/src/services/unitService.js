import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from './firebase'

const unitsRef = collection(db, 'units')

export function subscribeToUnits(ownerId, onData, onError) {
  const q = query(unitsRef, where('ownerId', '==', ownerId))
  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      list.sort((a, b) => a.name.localeCompare(b.name))
      onData(list)
    },
    onError
  )
}

async function findTenant(email) {
  const cleaned = email.trim().toLowerCase()
  if (!cleaned) return { tenantId: '', tenantName: '', tenantEmail: '' }

  const q = query(collection(db, 'users'), where('email', '==', cleaned))
  const snapshot = await getDocs(q)
  if (snapshot.empty) throw new Error('TENANT_NOT_FOUND')

  const found = snapshot.docs[0]
  if (found.data().role !== 'tenant') throw new Error('NOT_A_TENANT')

  return { tenantId: found.id, tenantName: found.data().name, tenantEmail: cleaned }
}

function buildUnit(values, property, tenant) {
  return {
    propertyId: property.id,
    propertyName: property.name,
    name: values.name.trim(),
    monthlyRent: Number(values.monthlyRent),
    ...tenant,
  }
}

export async function addUnit(ownerId, values, property) {
  const tenant = await findTenant(values.tenantEmail)
  return addDoc(unitsRef, {
    ownerId,
    ...buildUnit(values, property, tenant),
    createdAt: serverTimestamp(),
  })
}

export async function updateUnit(id, values, property) {
  const tenant = await findTenant(values.tenantEmail)
  return updateDoc(doc(db, 'units', id), buildUnit(values, property, tenant))
}

export function deleteUnit(id) {
  return deleteDoc(doc(db, 'units', id))
}
