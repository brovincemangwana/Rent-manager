import {
  collection,
  doc,
  increment,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'

const recordsRef = collection(db, 'rentRecords')
const paymentsRef = collection(db, 'payments')

function subscribeTo(ref, field, value, sorter, onData, onError) {
  const q = query(ref, where(field, '==', value))
  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      list.sort(sorter)
      onData(list)
    },
    onError
  )
}

const newestMonthFirst = (a, b) =>
  b.month.localeCompare(a.month) || a.unitName.localeCompare(b.unitName)

const newestPaymentFirst = (a, b) =>
  (b.createdAt?.toMillis?.() ?? Date.now()) - (a.createdAt?.toMillis?.() ?? Date.now())

export function subscribeToOwnerRecords(ownerId, onData, onError) {
  return subscribeTo(recordsRef, 'ownerId', ownerId, newestMonthFirst, onData, onError)
}

export function subscribeToTenantRecords(tenantId, onData, onError) {
  return subscribeTo(recordsRef, 'tenantId', tenantId, newestMonthFirst, onData, onError)
}

export function subscribeToTenantPayments(tenantId, onData, onError) {
  return subscribeTo(paymentsRef, 'tenantId', tenantId, newestPaymentFirst, onData, onError)
}

export async function generateRentRecords(ownerId, units, month, existingRecords) {
  const existingIds = new Set(existingRecords.map((r) => r.id))
  const batch = writeBatch(db)
  let created = 0

  units
    .filter((unit) => unit.tenantId)
    .forEach((unit) => {
      const id = `${unit.id}_${month}`
      if (existingIds.has(id)) return

      batch.set(doc(db, 'rentRecords', id), {
        ownerId,
        unitId: unit.id,
        unitName: unit.name,
        propertyName: unit.propertyName,
        tenantId: unit.tenantId,
        tenantName: unit.tenantName,
        month,
        amountDue: unit.monthlyRent,
        amountPaid: 0,
        createdAt: serverTimestamp(),
      })
      created += 1
    })

  if (created > 0) await batch.commit()
  return created
}

export async function recordPayment(record, amount) {
  const reference = `SIM${Date.now().toString(36).toUpperCase()}`
  const batch = writeBatch(db)

  batch.update(doc(db, 'rentRecords', record.id), {
    amountPaid: increment(amount),
  })
  batch.set(doc(paymentsRef), {
    ownerId: record.ownerId,
    tenantId: record.tenantId,
    unitId: record.unitId,
    unitName: record.unitName,
    rentRecordId: record.id,
    month: record.month,
    amount,
    reference,
    createdAt: serverTimestamp(),
  })

  await batch.commit()
  return reference
}
