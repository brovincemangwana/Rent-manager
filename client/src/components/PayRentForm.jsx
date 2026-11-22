import { useId, useState } from 'react'
import { validatePayment } from '../utils/validate'

export default function PayRentForm({ balance, onPay, paying }) {
  const id = useId()
  const [amount, setAmount] = useState(String(balance))
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const message = validatePayment(amount, balance)
    setError(message)
    if (message) return
    onPay(Number(amount))
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-4">
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
        Amount (KES)
      </label>
      <div className="flex gap-3">
        <input
          id={id}
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          aria-invalid={error ? 'true' : 'false'}
          className="w-40 rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
        />
        <button
          type="submit"
          disabled={paying}
          className="rounded-lg bg-accent-500 px-4 py-2 font-bold text-white hover:bg-accent-600 disabled:opacity-50"
        >
          {paying ? 'Paying...' : 'Pay rent'}
        </button>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </form>
  )
}
