import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FormField from '../components/FormField'
import { loginUser, loginWithGoogle, getAuthErrorMessage } from '../services/authService'
import { validateLogin } from '../utils/validate'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError('')

    const found = validateLogin(form)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSubmitting(true)
    try {
      await loginUser(form)
      navigate('/')
    } catch (err) {
      setSubmitError(getAuthErrorMessage(err.code))
      setSubmitting(false)
    }
  }

  async function handleGoogle() {
    setSubmitError('')
    setSubmitting(true)
    try {
      await loginWithGoogle()
      navigate('/')
    } catch (err) {
      setSubmitError(getAuthErrorMessage(err.code))
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold text-brand-700">Log in</h1>

      {submitError && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {submitError}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <FormField label="Email" id="email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} />
        <FormField label="Password" id="password" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} />

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-brand-700 px-4 py-2 font-medium text-white hover:bg-brand-800 disabled:opacity-50"
        >
          {submitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <p className="my-4 text-center text-sm text-slate-500">or</p>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={submitting}
        className="w-full rounded-lg border border-brand-700 px-4 py-2 font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-50"
      >
        Continue with Google
      </button>

      <p className="mt-4 text-sm text-slate-600">
        No account yet?{' '}
        <Link to="/register" className="font-medium text-brand-700 hover:underline">
          Register
        </Link>
      </p>
    </div>
  )
}
