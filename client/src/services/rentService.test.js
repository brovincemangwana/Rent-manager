import { describe, it, expect, vi, beforeEach } from 'vitest'
import { onSnapshot } from 'firebase/firestore'
import {
  generateRentRecords,
  recordPayment,
  subscribeToOwnerRecords,
  subscribeToTenantPayments,
  subscribeToTenantRecords,
} from './rentService'

const { batch } = vi.hoisted(() => ({
  batch: { set: vi.fn(), update: vi.fn(), commit: vi.fn() },
}))

vi.mock('./firebase', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => 'ref'),
  doc: vi.fn(() => 'doc-ref'),
  increment: vi.fn((n) => `inc:${n}`),
  onSnapshot: vi.fn(),
  query: vi.fn(() => 'query-ref'),
  serverTimestamp: vi.fn(() => 'timestamp'),
  where: vi.fn(() => 'where-clause'),
  writeBatch: vi.fn(() => batch),
}))

const units = [
  { id: 'u1', name: 'A1', propertyName: 'Sunrise', monthlyRent: 15000, tenantId: 't1', tenantName: 'Amina' },
  { id: 'u2', name: 'B2', propertyName: 'Sunrise', monthlyRent: 10000, tenantId: '', tenantName: '' },
]

function feed(docs) {
  onSnapshot.mockImplementation((q, onNext) => {
    onNext({ docs: docs.map((d) => ({ id: d.id, data: () => d.data })) })
    return () => {}
  })
}

describe('rentService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates rent only for units that have a tenant', async () => {
    const created = await generateRentRecords('l1', units, '2026-11', [])

    expect(created).toBe(1)
    expect(batch.set).toHaveBeenCalledTimes(1)
    expect(batch.set).toHaveBeenCalledWith(
      'doc-ref',
      expect.objectContaining({ unitId: 'u1', month: '2026-11', amountDue: 15000, amountPaid: 0 })
    )
    expect(batch.commit).toHaveBeenCalledTimes(1)
  })

  it('does not create a record that already exists', async () => {
    const created = await generateRentRecords('l1', units, '2026-11', [{ id: 'u1_2026-11' }])

    expect(created).toBe(0)
    expect(batch.commit).not.toHaveBeenCalled()
  })

  it('records a payment and updates the amount paid together', async () => {
    const record = {
      id: 'r1',
      ownerId: 'l1',
      tenantId: 't1',
      unitId: 'u1',
      unitName: 'A1',
      month: '2026-11',
    }

    const reference = await recordPayment(record, 5000)

    expect(batch.update).toHaveBeenCalledWith('doc-ref', { amountPaid: 'inc:5000' })
    expect(batch.set).toHaveBeenCalledWith(
      'doc-ref',
      expect.objectContaining({ amount: 5000, tenantId: 't1', rentRecordId: 'r1' })
    )
    expect(batch.commit).toHaveBeenCalledTimes(1)
    expect(reference).toMatch(/^SIM/)
  })

  it('lists owner records newest month first', () => {
    feed([
      { id: 'old', data: { month: '2026-10', unitName: 'A1' } },
      { id: 'new', data: { month: '2026-11', unitName: 'A1' } },
    ])
    const onData = vi.fn()

    subscribeToOwnerRecords('l1', onData, vi.fn())

    expect(onData.mock.calls[0][0].map((r) => r.id)).toEqual(['new', 'old'])
  })

  it('lists tenant records', () => {
    feed([{ id: 'r1', data: { month: '2026-11', unitName: 'A1' } }])
    const onData = vi.fn()

    subscribeToTenantRecords('t1', onData, vi.fn())

    expect(onData.mock.calls[0][0]).toHaveLength(1)
  })

  it('lists payments newest first', () => {
    feed([
      { id: 'first', data: { createdAt: { toMillis: () => 1 } } },
      { id: 'second', data: { createdAt: { toMillis: () => 2 } } },
    ])
    const onData = vi.fn()

    subscribeToTenantPayments('t1', onData, vi.fn())

    expect(onData.mock.calls[0][0].map((p) => p.id)).toEqual(['second', 'first'])
  })
})
