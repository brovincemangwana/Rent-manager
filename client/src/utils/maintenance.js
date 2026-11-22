export const REQUEST_STATUSES = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
]

export function statusLabel(value) {
  return REQUEST_STATUSES.find((s) => s.value === value)?.label ?? value
}
