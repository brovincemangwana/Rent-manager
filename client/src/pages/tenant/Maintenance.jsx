import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import RequestForm from '../../components/RequestForm'
import { subscribeToTenantUnits } from '../../services/unitService'
import { addRequest, subscribeToTenantRequests } from '../../services/maintenanceService'
import { statusLabel } from '../../utils/maintenance'

export default function Maintenance() {
  const { user, profile } = useAuth()
  const [units, setUnits] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)
  const [formKey, setFormKey] = useState(0)

  useEffect(() => {
    const stopUnits = subscribeToTenantUnits(user.uid, setUnits, () =>
      setError('Could not load your unit.')
    )
    const stopRequests = subscribeToTenantRequests(
      user.uid,
      (list) => {
        setRequests(list)
        setLoading(false)
      },
      () => {
        setError('Could not load your requests. Refresh and try again.')
        setLoading(false)
      }
    )
    return () => {
      stopUnits()
      stopRequests()
    }
  }, [user.uid])

  async function handleSubmit(values) {
    setSaving(true)
    setError('')
    setNotice('')
    const unit = units.find((u) => u.id === values.unitId)
    try {
      await addRequest({ uid: user.uid, name: profile?.name ?? '' }, values, unit)
      setNotice('Request sent. Your landlord will update its status here.')
      setFormKey((k) => k + 1)
    } catch {
      setError('Could not send the request. Try again.')
    }
    setSaving(false)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-brand-700">Maintenance requests</h1>

      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="mb-4 rounded-lg bg-brand-50 p-3 text-sm text-brand-800">
          {notice}
        </p>
      )}

      {!loading && units.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-600">
          You are not linked to a unit yet. Ask your landlord to add your email to your unit.
        </p>
      ) : (
        <RequestForm key={formKey} units={units} onSubmit={handleSubmit} saving={saving} />
      )}

      <h2 className="mb-3 mt-10 text-lg font-semibold text-slate-800">Your requests</h2>

      {loading && <p className="text-slate-600">Loading requests...</p>}
      {!loading && requests.length === 0 && (
        <p className="text-sm text-slate-600">You have not sent any requests yet.</p>
      )}

      <ul className="space-y-3">
        {requests.map((request) => (
          <li key={request.id} className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="font-semibold text-slate-800">{request.title}</p>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                {statusLabel(request.status)}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600">{request.description}</p>
            <p className="mt-2 text-xs text-slate-500">
              {request.unitName} · {request.propertyName}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
