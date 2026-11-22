import { useState } from 'react'
import FormField from './FormField'
import { validateProperty } from '../utils/validate'

export default function PropertyForm({ initial, onSubmit, onCancel, saving }) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    address: initial?.address ?? '',
  })
  const [errors, setErrors] = useState({})

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    const found = validateProperty(form)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-lg border border-slate-200 p-4">
      <h2 className="mb-4 text-lg font-semibold text-slate-800">
        {initial ? 'Edit property' : 'Add property'}
      </h2>
      <FormField label="Property name" id="name" name="name" value={form.name} onChange={handleChange} error={errors.name} />
      <FormField label="Address" id="address" name="address" value={form.address} onChange={handleChange} error={errors.address} />
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand-700 px-4 py-2 font-medium text-white hover:bg-brand-800 disabled:opacity-50"
        >
          {saving ? 'Saving...' : initial ? 'Save changes' : 'Add property'}
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
