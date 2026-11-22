import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import PropertyForm from '../../components/PropertyForm'
import {
  addProperty,
  deleteProperty,
  subscribeToProperties,
  updateProperty,
} from '../../services/propertyService'

export default function Properties() {
  const { user } = useAuth()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formKey, setFormKey] = useState(0)

  useEffect(() => {
    return subscribeToProperties(
      user.uid,
      (list) => {
        setProperties(list)
        setLoading(false)
      },
      () => {
        setError('Could not load your properties. Refresh and try again.')
        setLoading(false)
      }
    )
  }, [user.uid])

  async function handleSubmit(values) {
    setSaving(true)
    setError('')
    try {
      if (editing) {
        await updateProperty(editing.id, values)
        setEditing(null)
      } else {
        await addProperty(user.uid, values)
      }
      setFormKey((k) => k + 1)
    } catch {
      setError('Could not save the property. Try again.')
    }
    setSaving(false)
  }

  async function handleDelete(property) {
    if (!window.confirm(`Delete ${property.name}?`)) return
    setError('')
    try {
      await deleteProperty(property.id)
      if (editing?.id === property.id) setEditing(null)
    } catch {
      setError('Could not delete the property. Try again.')
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-brand-700">Properties</h1>

      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <PropertyForm
          key={editing ? editing.id : `new-${formKey}`}
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
          saving={saving}
        />

        <section aria-label="Your properties">
          {loading && <p className="text-slate-600">Loading properties...</p>}

          {!loading && properties.length === 0 && (
            <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-600">
              No properties yet. Add your first one to get started.
            </p>
          )}

          <ul className="space-y-3">
            {properties.map((property) => (
              <li key={property.id} className="rounded-lg border border-slate-200 p-4">
                <p className="font-semibold text-slate-800">{property.name}</p>
                <p className="text-sm text-slate-600">{property.address}</p>
                <div className="mt-3 flex gap-4 text-sm">
                  <button onClick={() => setEditing(property)} className="font-medium text-brand-700 hover:underline">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(property)} className="font-medium text-red-600 hover:underline">
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
