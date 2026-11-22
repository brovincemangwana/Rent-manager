import { describe, it, expect } from 'vitest'
import { getMonthKey, formatMonth, getRentStatus, summariseRecords } from './rent'
import { validatePayment } from './validate'

const record = { month: '2026-11', amountDue: 15000, amountPaid: 0 }
const afterDue = new Date(2026, 10, 23)
const beforeDue = new Date(2026, 10, 3)

describe('month helpers', () => {
  it('builds a month key', () => {
    expect(getMonthKey(new Date(2026, 10, 23))).toBe('2026-11')
  })

  it('formats a month key for display', () => {
    expect(formatMonth('2026-11')).toContain('November')
  })
})

describe('getRentStatus', () => {
  it('is paid when the full amount is paid', () => {
    expect(getRentStatus({ ...record, amountPaid: 15000 }, afterDue)).toBe('paid')
  })

  it('is partial when some rent is paid', () => {
    expect(getRentStatus({ ...record, amountPaid: 5000 }, afterDue)).toBe('partial')
  })

  it('is overdue when nothing is paid after the due date', () => {
    expect(getRentStatus(record, afterDue)).toBe('overdue')
  })

  it('is pending when nothing is paid before the due date', () => {
    expect(getRentStatus(record, beforeDue)).toBe('pending')
  })
})

describe('summariseRecords', () => {
  it('counts records by status', () => {
    const records = [
      { ...record, amountPaid: 15000 },
      { ...record, amountPaid: 100 },
      record,
    ]
    expect(summariseRecords(records, afterDue)).toEqual({
      paid: 1,
      partial: 1,
      overdue: 1,
      pending: 0,
    })
  })
})

describe('validatePayment', () => {
  it('rejects an empty or zero amount', () => {
    expect(validatePayment('', 1000)).not.toBe('')
  })

  it('rejects an amount above the balance', () => {
    expect(validatePayment('5000', 1000)).toContain('more than the balance')
  })

  it('accepts a valid amount', () => {
    expect(validatePayment('500', 1000)).toBe('')
  })
})
