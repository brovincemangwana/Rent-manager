import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from './firebase'

const requestsRef = collection(db, 'maintenanceRequests')

const newestFirst = (a, b) =>
  (b.createdAt?.toMillis?.() ?? Date.now()) - (a.createdAt?.toMillis?.() ?? Date.now())

function subscribeTo(field, value, onData, onError) {
  const q = query(requestsRef, where(field, '==', value))
  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      list.sort(newestFirst)
      onData(list)
    },
    onError
  )
}

export function subscribeToTenantRequests(tenantId, onData, onError) {
  return subscribeTo('tenantId', tenantId, onData, onError)
}

export function subscribeToOwnerRequests(ownerId, onData, onError) {
  return subscribeTo('ownerId', ownerId, onData, onError)
}

export function addRequest(tenant, values, unit) {
  return addDoc(requestsRef, {
    ownerId: unit.ownerId,
    tenantId: tenant.uid,
    tenantName: tenant.name,
    unitId: unit.id,
    unitName: unit.name,
    propertyName: unit.propertyName,
    title: values.title.trim(),
    description: values.description.trim(),
    status: 'open',
    createdAt: serverTimestamp(),
  })
}

export function updateRequestStatus(id, status) {
  return updateDoc(doc(db, 'maintenanceRequests', id), { status })
}
