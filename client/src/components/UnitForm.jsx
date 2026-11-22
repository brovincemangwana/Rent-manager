import { useState } from 'react'
import FormField from './FormField'
import { validateUnit } from '../utils/validate'

export default function UnitForm({ properties, initial, onSubmit, onCancel, saving }) {
  const [form, setForm] = useState({
    propertyId: initial?.propertyId ?? '',
    name: initial?.name ?? '',
    monthlyRent: initial?.monthlyRent ?? '',
    tenantEmail: initial?.tenantEmail ?? '',
  })
  const [errors, setErrors] = useState({})

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    const found = validateUnit(form)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-lg border border-slate-200 p-4">
      <h2 className="mb-4 text-lg font-semibold text-slate-800">
        {initial ? 'Edit unit' : 'Add unit'}
      </h2>

      <div className="mb-4">
        <label htmlFor="propertyId" className="mb-1 block text-sm font-medium text-slate-700">
          Property
        </label>
        <select
          id="propertyId"
          name="propertyId"
          value={form.propertyId}
          onChange={handleChange}
          aria-invalid={errors.propertyId ? 'true' : 'false'}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">Choose a property</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {errors.propertyId && <p className="mt-1 text-sm text-red-600">{errors.propertyId}</p>}
      </div>

      <FormField label="Unit name" id="name" name="name" value={form.name} onChange={handleChange} error={errors.name} />
      <FormField label="Monthly rent (KES)" id="monthlyRent" name="monthlyRent" type="number" value={form.monthlyRent} onChange={handleChange} error={errors.monthlyRent} />
      <FormField label="Tenant email (optional)" id="tenantEmail" name="tenantEmail" type="email" value={form.tenantEmail} onChange={handleChange} />

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand-700 px-4 py-2 font-medium text-white hover:bg-brand-800 disabled:opacity-50"
        >
          {saving ? 'Saving...' : initial ? 'Save changes' : 'Add unit'}
        </button>
        {initial && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
