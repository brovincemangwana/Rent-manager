import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import UnitForm from '../../components/UnitForm'
import { subscribeToProperties } from '../../services/propertyService'
import { addUnit, deleteUnit, subscribeToUnits, updateUnit } from '../../services/unitService'

function getErrorMessage(err) {
  if (err.message === 'TENANT_NOT_FOUND') {
    return 'No account found with that email. Ask the tenant to register first.'
  }
  if (err.message === 'NOT_A_TENANT') {
    return 'That email belongs to a landlord account, not a tenant.'
  }
  return 'Could not save the unit. Try again.'
}

export default function Units() {
  const { user } = useAuth()
  const [properties, setProperties] = useState([])
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formKey, setFormKey] = useState(0)

  useEffect(() => {
    const stopProperties = subscribeToProperties(user.uid, setProperties, () =>
      setError('Could not load your properties.')
    )
    const stopUnits = subscribeToUnits(
      user.uid,
      (list) => {
        setUnits(list)
        setLoading(false)
      },
      () => {
        setError('Could not load your units. Refresh and try again.')
        setLoading(false)
      }
    )
    return () => {
      stopProperties()
      stopUnits()
    }
  }, [user.uid])

  async function handleSubmit(values) {
    setSaving(true)
    setError('')
    const property = properties.find((p) => p.id === values.propertyId)
    try {
      if (editing) {
        await updateUnit(editing.id, values, property)
        setEditing(null)
      } else {
        await addUnit(user.uid, values, property)
      }
      setFormKey((k) => k + 1)
    } catch (err) {
      setError(getErrorMessage(err))
    }
    setSaving(false)
  }

  async function handleDelete(unit) {
    if (!window.confirm(`Delete unit ${unit.name}?`)) return
    setError('')
    try {
      await deleteUnit(unit.id)
      if (editing?.id === unit.id) setEditing(null)
    } catch {
      setError('Could not delete the unit. Try again.')
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-brand-700">Units and tenants</h1>

      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {!loading && properties.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-600">
          Add a property first, then come back to add units.{' '}
          <Link to="/landlord/properties" className="font-medium text-brand-700 hover:underline">
            Go to properties
          </Link>
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <UnitForm
            key={editing ? editing.id : `new-${formKey}`}
            properties={properties}
            initial={editing}
            onSubmit={handleSubmit}
            onCancel={() => setEditing(null)}
            saving={saving}
          />

          <section aria-label="Your units">
            {loading && <p className="text-slate-600">Loading units...</p>}

            {!loading && units.length === 0 && (
              <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-600">
                No units yet. Add your first one.
              </p>
            )}

            <ul className="space-y-3">
              {units.map((unit) => (
                <li key={unit.id} className="rounded-lg border border-slate-200 p-4">
                  <p className="font-semibold text-slate-800">
                    {unit.name} <span className="font-normal text-slate-500">· {unit.propertyName}</span>
                  </p>
                  <p className="text-sm text-slate-600">KES {unit.monthlyRent.toLocaleString()} per month</p>
                  <p className="text-sm text-slate-600">
                    {unit.tenantId ? `Tenant: ${unit.tenantName}` : 'Vacant'}
                  </p>
                  <div className="mt-3 flex gap-4 text-sm">
                    <button onClick={() => setEditing(unit)} className="font-medium text-brand-700 hover:underline">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(unit)} className="font-medium text-red-600 hover:underline">
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  )
}
