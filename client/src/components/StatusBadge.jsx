const styles = {
  paid: 'bg-green-100 text-green-800',
  partial: 'bg-amber-100 text-amber-800',
  overdue: 'bg-red-100 text-red-800',
  pending: 'bg-slate-100 text-slate-700',
}

const labels = {
  paid: 'Paid',
  partial: 'Partial',
  overdue: 'Overdue',
  pending: 'Pending',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}
