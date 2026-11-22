import { describe, it, expect } from 'vitest'
import { statusLabel, REQUEST_STATUSES } from './maintenance'

describe('statusLabel', () => {
  it('returns the label for each status', () => {
    expect(statusLabel('open')).toBe('Open')
    expect(statusLabel('in_progress')).toBe('In progress')
    expect(statusLabel('resolved')).toBe('Resolved')
  })

  it('falls back to the raw value for an unknown status', () => {
    expect(statusLabel('mystery')).toBe('mystery')
  })

  it('lists three statuses', () => {
    expect(REQUEST_STATUSES).toHaveLength(3)
  })
})
