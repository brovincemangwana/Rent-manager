import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import PayRentForm from '../../components/PayRentForm'
import StatusBadge from '../../components/StatusBadge'
import {
  recordPayment,
  subscribeToTenantPayments,
  subscribeToTenantRecords,
} from '../../services/rentService'
import { formatMonth, getRentStatus } from '../../utils/rent'

export default function TenantDashboard() {
  const { user, profile } = useAuth()
  const [records, setRecords] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [payingId, setPayingId] = useState('')

  useEffect(() => {
    const stopRecords = subscribeToTenantRecords(
      user.uid,
      (list) => {
        setRecords(list)
        setLoading(false)
      },
      () => {
        setError('Could not load your rent. Refresh and try again.')
        setLoading(false)
      }
    )
    const stopPayments = subscribeToTenantPayments(user.uid, setPayments, () =>
      setError('Could not load your payment history.')
    )
    return () => {
      stopRecords()
      stopPayments()
    }
  }, [user.uid])

  async function handlePay(record, amount) {
    setPayingId(record.id)
    setError('')
    setNotice('')
    try {
      const reference = await recordPayment(record, amount)
      setNotice(`Payment of KES ${amount.toLocaleString()} recorded. Reference: ${reference}`)
    } catch {
      setError('Could not record the payment. Try again.')
    }
    setPayingId('')
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-700">Tenant dashboard</h1>
      <p className="mt-2 text-slate-600">Welcome, {profile?.name}.</p>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="mt-4 rounded-lg bg-brand-50 p-3 text-sm text-brand-800">
          {notice}
        </p>
      )}

      <h2 className="mb-3 mt-8 text-lg font-semibold text-slate-800">Your rent</h2>

      {loading && <p className="text-slate-600">Loading your rent...</p>}

      {!loading && records.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-600">
          No rent records yet. Your landlord adds your rent each month.
        </p>
      )}

      <ul className="space-y-4">
        {records.map((record) => {
          const balance = record.amountDue - record.amountPaid
          return (
            <li key={record.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-800">{formatMonth(record.month)}</p>
                  <p className="text-sm text-slate-600">
                    {record.unitName} · {record.propertyName}
                  </p>
                </div>
                <StatusBadge status={getRentStatus(record)} />
              </div>
              <p className="mt-3 text-sm text-slate-600">
                Rent KES {record.amountDue.toLocaleString()} · Paid KES{' '}
                {record.amountPaid.toLocaleString()} ·{' '}
                <span className="font-semibold text-slate-800">
                  Balance KES {Math.max(balance, 0).toLocaleString()}
                </span>
              </p>
              {balance > 0 && (
                <PayRentForm
                  key={`${record.id}-${record.amountPaid}`}
                  balance={balance}
                  paying={payingId === record.id}
                  onPay={(amount) => handlePay(record, amount)}
                />
              )}
            </li>
          )
        })}
      </ul>

      {records.some((r) => r.amountDue > r.amountPaid) && (
        <p className="mt-3 text-xs text-slate-500">
          Demo payment: this records the payment in the app and does not move real money.
        </p>
      )}

      <h2 className="mb-3 mt-10 text-lg font-semibold text-slate-800">Payment history</h2>

      {payments.length === 0 ? (
        <p className="text-sm text-slate-600">No payments yet.</p>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200">
          {payments.map((payment) => (
            <li key={payment.id} className="flex items-center justify-between gap-3 p-3 text-sm">
              <div>
                <p className="font-medium text-slate-800">
                  KES {payment.amount.toLocaleString()} · {formatMonth(payment.month)}
                </p>
                <p className="text-slate-500">
                  {payment.unitName} · {payment.createdAt?.toDate?.().toLocaleDateString('en-GB') ?? 'Just now'}
                </p>
              </div>
              <span className="font-mono text-xs text-slate-600">{payment.reference}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
