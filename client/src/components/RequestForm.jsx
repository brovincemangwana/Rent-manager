import { useState } from 'react'
import FormField from './FormField'
import { validateRequest } from '../utils/validate'

export default function RequestForm({ units, onSubmit, saving }) {
  const [form, setForm] = useState({
    unitId: units.length === 1 ? units[0].id : '',
    title: '',
    description: '',
  })
  const [errors, setErrors] = useState({})

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    const found = validateRequest(form)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-lg border border-slate-200 p-4">
      <h2 className="mb-4 text-lg font-semibold text-slate-800">New request</h2>

      <div className="mb-4">
        <label htmlFor="unitId" className="mb-1 block text-sm font-medium text-slate-700">
          Unit
        </label>
        <select
          id="unitId"
          name="unitId"
          value={form.unitId}
          onChange={handleChange}
          aria-invalid={errors.unitId ? 'true' : 'false'}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">Choose your unit</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} - {u.propertyName}
            </option>
          ))}
        </select>
        {errors.unitId && <p className="mt-1 text-sm text-red-600">{errors.unitId}</p>}
      </div>

      <FormField label="Title" id="title" name="title" value={form.title} onChange={handleChange} error={errors.title} />

      <div className="mb-4">
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={form.description}
          onChange={handleChange}
          aria-invalid={errors.description ? 'true' : 'false'}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-brand-700 px-4 py-2 font-medium text-white hover:bg-brand-800 disabled:opacity-50"
      >
        {saving ? 'Sending...' : 'Send request'}
      </button>
    </form>
  )
}
