import { describe, it, expect } from 'vitest'
import { validateUnit } from './validate'

const valid = { propertyId: 'p1', name: 'A1', monthlyRent: '15000' }

describe('validateUnit', () => {
  it('returns no errors for valid input', () => {
    expect(validateUnit(valid)).toEqual({})
  })

  it('requires a property', () => {
    expect(validateUnit({ ...valid, propertyId: '' }).propertyId).toBeDefined()
  })

  it('rejects a rent of zero or less', () => {
    expect(validateUnit({ ...valid, monthlyRent: '0' }).monthlyRent).toBeDefined()
  })
})
