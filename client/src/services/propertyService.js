import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from './firebase'

const propertiesRef = collection(db, 'properties')

export function subscribeToProperties(ownerId, onData, onError) {
  const q = query(propertiesRef, where('ownerId', '==', ownerId))
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

export function addProperty(ownerId, { name, address }) {
  return addDoc(propertiesRef, {
    ownerId,
    name: name.trim(),
    address: address.trim(),
    createdAt: serverTimestamp(),
  })
}

export function updateProperty(id, { name, address }) {
  return updateDoc(doc(db, 'properties', id), {
    name: name.trim(),
    address: address.trim(),
  })
}

export function deleteProperty(id) {
  return deleteDoc(doc(db, 'properties', id))
}
