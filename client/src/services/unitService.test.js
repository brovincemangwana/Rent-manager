import { describe, it, expect, vi, beforeEach } from 'vitest'
import { addDoc, deleteDoc, getDocs, onSnapshot, updateDoc } from 'firebase/firestore'
import {
  addUnit,
  deleteUnit,
  subscribeToTenantUnits,
  subscribeToUnits,
  updateUnit,
} from './unitService'

vi.mock('./firebase', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({
  addDoc: vi.fn(),
  collection: vi.fn(() => 'ref'),
  deleteDoc: vi.fn(),
  doc: vi.fn(() => 'doc-ref'),
  getDocs: vi.fn(),
  onSnapshot: vi.fn(),
  query: vi.fn(() => 'query-ref'),
  serverTimestamp: vi.fn(() => 'timestamp'),
  updateDoc: vi.fn(),
  where: vi.fn(() => 'where-clause'),
}))

const property = { id: 'p1', name: 'Sunrise' }
const values = { name: ' A1 ', monthlyRent: '15000', tenantEmail: '' }

function tenantFound(role = 'tenant') {
  getDocs.mockResolvedValue({
    empty: false,
    docs: [{ id: 't1', data: () => ({ name: 'Amina', role }) }],
  })
}

describe('unitService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('adds a vacant unit when no tenant email is given', async () => {
    await addUnit('l1', values, property)

    expect(getDocs).not.toHaveBeenCalled()
    expect(addDoc).toHaveBeenCalledWith('ref', {
      ownerId: 'l1',
      propertyId: 'p1',
      propertyName: 'Sunrise',
      name: 'A1',
      monthlyRent: 15000,
      tenantId: '',
      tenantName: '',
      tenantEmail: '',
      createdAt: 'timestamp',
    })
  })

  it('links the tenant found by email', async () => {
    tenantFound()

    await addUnit('l1', { ...values, tenantEmail: ' Amina@Example.com ' }, property)

    expect(addDoc).toHaveBeenCalledWith(
      'ref',
      expect.objectContaining({
        tenantId: 't1',
        tenantName: 'Amina',
        tenantEmail: 'amina@example.com',
      })
    )
  })

  it('rejects an email with no account', async () => {
    getDocs.mockResolvedValue({ empty: true, docs: [] })

    await expect(addUnit('l1', { ...values, tenantEmail: 'nobody@example.com' }, property)).rejects.toThrow(
      'TENANT_NOT_FOUND'
    )
    expect(addDoc).not.toHaveBeenCalled()
  })

  it('rejects an email that belongs to a landlord', async () => {
    tenantFound('landlord')

    await expect(addUnit('l1', { ...values, tenantEmail: 'lan@example.com' }, property)).rejects.toThrow(
      'NOT_A_TENANT'
    )
  })

  it('updates a unit', async () => {
    await updateUnit('u1', values, property)

    expect(updateDoc).toHaveBeenCalledWith('doc-ref', expect.objectContaining({ name: 'A1', monthlyRent: 15000 }))
  })

  it('deletes a unit', async () => {
    await deleteUnit('u1')
    expect(deleteDoc).toHaveBeenCalledWith('doc-ref')
  })

  it('returns units sorted by name', () => {
    onSnapshot.mockImplementation((q, onNext) => {
      onNext({
        docs: [
          { id: 'b', data: () => ({ name: 'B2' }) },
          { id: 'a', data: () => ({ name: 'A1' }) },
        ],
      })
      return () => {}
    })
    const onData = vi.fn()

    subscribeToUnits('l1', onData, vi.fn())

    expect(onData.mock.calls[0][0].map((u) => u.id)).toEqual(['a', 'b'])
  })

  it('returns the units linked to a tenant', () => {
    onSnapshot.mockImplementation((q, onNext) => {
      onNext({ docs: [{ id: 'u1', data: () => ({ name: 'A1' }) }] })
      return () => {}
    })
    const onData = vi.fn()

    subscribeToTenantUnits('t1', onData, vi.fn())

    expect(onData).toHaveBeenCalledWith([{ id: 'u1', name: 'A1' }])
  })
})
