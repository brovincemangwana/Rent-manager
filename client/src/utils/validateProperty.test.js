import { describe, it, expect } from 'vitest'
import { validateProperty } from './validate'

describe('validateProperty', () => {
  it('returns no errors for valid input', () => {
    expect(validateProperty({ name: 'Sunrise Apartments', address: 'Kilimani, Nairobi' })).toEqual({})
  })

  it('requires a name', () => {
    expect(validateProperty({ name: ' ', address: 'Kilimani' }).name).toBeDefined()
  })

  it('requires an address', () => {
    expect(validateProperty({ name: 'Sunrise', address: '' }).address).toBeDefined()
  })
})
