import { describe, it, expect } from 'vitest'
import { validateRequest } from './validate'

const valid = { unitId: 'u1', title: 'Leaking tap', description: 'Kitchen tap drips all day' }

describe('validateRequest', () => {
  it('returns no errors for valid input', () => {
    expect(validateRequest(valid)).toEqual({})
  })

  it('requires a unit', () => {
    expect(validateRequest({ ...valid, unitId: '' }).unitId).toBeDefined()
  })

  it('requires a title and a description', () => {
    const result = validateRequest({ ...valid, title: ' ', description: '' })
    expect(result.title).toBeDefined()
    expect(result.description).toBeDefined()
  })
})
