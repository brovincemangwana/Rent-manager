import { describe, it, expect, vi, beforeEach } from 'vitest'
import { addDoc, deleteDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import {
  addProperty,
  deleteProperty,
  subscribeToProperties,
  updateProperty,
} from './propertyService'

vi.mock('./firebase', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({
  addDoc: vi.fn(),
  collection: vi.fn(() => 'properties-ref'),
  deleteDoc: vi.fn(),
  doc: vi.fn(() => 'doc-ref'),
  onSnapshot: vi.fn(),
  query: vi.fn(() => 'query-ref'),
  serverTimestamp: vi.fn(() => 'timestamp'),
  updateDoc: vi.fn(),
  where: vi.fn(() => 'where-clause'),
}))

describe('propertyService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('adds a property with trimmed values and the owner id', async () => {
    await addProperty('l1', { name: ' Sunrise ', address: ' Kilimani ' })

    expect(addDoc).toHaveBeenCalledWith('properties-ref', {
      ownerId: 'l1',
      name: 'Sunrise',
      address: 'Kilimani',
      createdAt: 'timestamp',
    })
  })

  it('updates a property', async () => {
    await updateProperty('p1', { name: ' Moonrise ', address: 'Kilimani' })

    expect(updateDoc).toHaveBeenCalledWith('doc-ref', { name: 'Moonrise', address: 'Kilimani' })
  })

  it('deletes a property', async () => {
    await deleteProperty('p1')
    expect(deleteDoc).toHaveBeenCalledWith('doc-ref')
  })

  it('returns properties sorted by name', () => {
    onSnapshot.mockImplementation((q, onNext) => {
      onNext({
        docs: [
          { id: 'b', data: () => ({ name: 'Beta' }) },
          { id: 'a', data: () => ({ name: 'Alpha' }) },
        ],
      })
      return 'stop'
    })
    const onData = vi.fn()

    const stop = subscribeToProperties('l1', onData, vi.fn())

    expect(onData).toHaveBeenCalledWith([
      { id: 'a', name: 'Alpha' },
      { id: 'b', name: 'Beta' },
    ])
    expect(stop).toBe('stop')
  })

  it('passes the error callback to Firestore', () => {
    const onError = vi.fn()
    subscribeToProperties('l1', vi.fn(), onError)
    expect(onSnapshot).toHaveBeenCalledWith('query-ref', expect.any(Function), onError)
  })
})
