import { describe, it, expect, vi, beforeEach } from 'vitest'
import { addDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import {
  addRequest,
  subscribeToOwnerRequests,
  subscribeToTenantRequests,
  updateRequestStatus,
} from './maintenanceService'

vi.mock('./firebase', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({
  addDoc: vi.fn(),
  collection: vi.fn(() => 'ref'),
  doc: vi.fn(() => 'doc-ref'),
  onSnapshot: vi.fn(),
  query: vi.fn(() => 'query-ref'),
  serverTimestamp: vi.fn(() => 'timestamp'),
  updateDoc: vi.fn(),
  where: vi.fn(() => 'where-clause'),
}))

function feed() {
  onSnapshot.mockImplementation((q, onNext) => {
    onNext({
      docs: [
        { id: 'first', data: () => ({ createdAt: { toMillis: () => 1 } }) },
        { id: 'second', data: () => ({ createdAt: { toMillis: () => 2 } }) },
      ],
    })
    return () => {}
  })
}

describe('maintenanceService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates an open request linked to the tenant, unit and landlord', async () => {
    await addRequest(
      { uid: 't1', name: 'Amina' },
      { title: ' Leaking tap ', description: ' Drips ' },
      { id: 'u1', ownerId: 'l1', name: 'A1', propertyName: 'Sunrise' }
    )

    expect(addDoc).toHaveBeenCalledWith('ref', {
      ownerId: 'l1',
      tenantId: 't1',
      tenantName: 'Amina',
      unitId: 'u1',
      unitName: 'A1',
      propertyName: 'Sunrise',
      title: 'Leaking tap',
      description: 'Drips',
      status: 'open',
      createdAt: 'timestamp',
    })
  })

  it('updates only the status', async () => {
    await updateRequestStatus('m1', 'resolved')
    expect(updateDoc).toHaveBeenCalledWith('doc-ref', { status: 'resolved' })
  })

  it('lists tenant requests newest first', () => {
    feed()
    const onData = vi.fn()

    subscribeToTenantRequests('t1', onData, vi.fn())

    expect(onData.mock.calls[0][0].map((r) => r.id)).toEqual(['second', 'first'])
  })

  it('lists owner requests newest first', () => {
    feed()
    const onData = vi.fn()

    subscribeToOwnerRequests('l1', onData, vi.fn())

    expect(onData.mock.calls[0][0].map((r) => r.id)).toEqual(['second', 'first'])
  })
})
