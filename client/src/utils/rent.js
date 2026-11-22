const DUE_DAY = 5

export function getMonthKey(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${date.getFullYear()}-${month}`
}

export function formatMonth(key) {
  const [year, month] = key.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleString('en-GB', {
    month: 'long',
    year: 'numeric',
  })
}

export function getRentStatus(record, today = new Date()) {
  if (record.amountPaid >= record.amountDue) return 'paid'
  if (record.amountPaid > 0) return 'partial'

  const [year, month] = record.month.split('-').map(Number)
  const dueDate = new Date(year, month - 1, DUE_DAY, 23, 59, 59)
  return today > dueDate ? 'overdue' : 'pending'
}

export function summariseRecords(records, today = new Date()) {
  const totals = { paid: 0, partial: 0, overdue: 0, pending: 0 }
  records.forEach((record) => {
    totals[getRentStatus(record, today)] += 1
  })
  return totals
}
