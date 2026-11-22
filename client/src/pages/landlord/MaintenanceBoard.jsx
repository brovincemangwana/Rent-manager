import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { subscribeToOwnerRequests, updateRequestStatus } from '../../services/maintenanceService'
import { REQUEST_STATUSES } from '../../utils/maintenance'

export default function MaintenanceBoard() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    return subscribeToOwnerRequests(
      user.uid,
      (list) => {
        setRequests(list)
        setLoading(false)
      },
      () => {
        setError('Could not load maintenance requests. Refresh and try again.')
        setLoading(false)
      }
    )
  }, [user.uid])

  async function handleStatusChange(id, status) {
    setError('')
    try {
      await updateRequestStatus(id, status)
    } catch {
      setError('Could not update the request. Try again.')
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-brand-700">Maintenance board</h1>

      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading && <p className="text-slate-600">Loading requests...</p>}

      {!loading && requests.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-600">
          No maintenance requests yet. They appear here when a tenant sends one.
        </p>
      )}

      {requests.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          {REQUEST_STATUSES.map((column) => {
            const items = requests.filter((r) => r.status === column.value)
            return (
              <section key={column.value} aria-label={column.label} className="rounded-lg bg-slate-50 p-3">
                <h2 className="mb-3 font-semibold text-slate-700">
                  {column.label} ({items.length})
                </h2>
                <ul className="space-y-3">
                  {items.map((request) => (
                    <li key={request.id} className="rounded-lg border border-slate-200 bg-white p-3">
                      <p className="font-semibold text-slate-800">{request.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{request.description}</p>
                      <p className="mt-2 text-xs text-slate-500">
                        {request.unitName} · {request.propertyName} · {request.tenantName}
                      </p>
                      <label htmlFor={`status-${request.id}`} className="sr-only">
                        Status for {request.title}
                      </label>
                      <select
                        id={`status-${request.id}`}
                        value={request.status}
                        onChange={(e) => handleStatusChange(request.id, e.target.value)}
                        className="mt-3 w-full rounded-lg border border-slate-300 px-2 py-1 text-sm"
                      >
                        {REQUEST_STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
