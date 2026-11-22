import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/StatusBadge'
import { subscribeToUnits } from '../../services/unitService'
import { generateRentRecords, subscribeToOwnerRecords } from '../../services/rentService'
import { formatMonth, getMonthKey, getRentStatus, summariseRecords } from '../../utils/rent'

export default function RentLedger() {
  const { user } = useAuth()
  const [units, setUnits] = useState([])
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [generating, setGenerating] = useState(false)

  const month = getMonthKey()

  useEffect(() => {
    const stopUnits = subscribeToUnits(user.uid, setUnits, () =>
      setError('Could not load your units.')
    )
    const stopRecords = subscribeToOwnerRecords(
      user.uid,
      (list) => {
        setRecords(list)
        setLoading(false)
      },
      () => {
        setError('Could not load the rent ledger. Refresh and try again.')
        setLoading(false)
      }
    )
    return () => {
      stopUnits()
      stopRecords()
    }
  }, [user.uid])

  async function handleGenerate() {
    setGenerating(true)
    setError('')
    setNotice('')
    try {
      const created = await generateRentRecords(user.uid, units, month, records)
      setNotice(
        created > 0
          ? `Created ${created} rent record${created === 1 ? '' : 's'} for ${formatMonth(month)}.`
          : `${formatMonth(month)} is already up to date, or no units have a tenant yet.`
      )
    } catch {
      setError('Could not generate rent records. Try again.')
    }
    setGenerating(false)
  }

  const totals = summariseRecords(records)
  const cards = [
    { key: 'paid', label: 'Paid', color: 'border-green-600' },
    { key: 'partial', label: 'Partial', color: 'border-amber-600' },
    { key: 'overdue', label: 'Overdue', color: 'border-red-600' },
    { key: 'pending', label: 'Pending', color: 'border-slate-400' },
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-700">Rent ledger</h1>
        <button
          onClick={handleGenerate}
          disabled={generating || loading}
          className="rounded-lg bg-accent-500 px-4 py-2 font-bold text-white hover:bg-accent-600 disabled:opacity-50"
        >
          {generating ? 'Generating...' : `Generate ${formatMonth(month)} rent`}
        </button>
      </div>

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

      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map((card) => (
          <div key={card.key} className={`rounded-lg border border-slate-200 border-t-4 p-4 ${card.color}`}>
            <p className="text-sm text-slate-600">{card.label}</p>
            <p className="text-2xl font-bold text-slate-800">{totals[card.key]}</p>
          </div>
        ))}
      </div>

      {loading && <p className="text-slate-600">Loading rent records...</p>}

      {!loading && records.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-600">
          No rent records yet. Link a tenant to a unit, then generate this month's rent.
        </p>
      )}

      {records.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Month</th>
                <th className="px-4 py-3 font-medium">Unit</th>
                <th className="px-4 py-3 font-medium">Tenant</th>
                <th className="px-4 py-3 font-medium">Due</th>
                <th className="px-4 py-3 font-medium">Paid</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-t border-slate-200">
                  <td className="px-4 py-3">{formatMonth(record.month)}</td>
                  <td className="px-4 py-3">
                    {record.unitName}
                    <span className="block text-xs text-slate-500">{record.propertyName}</span>
                  </td>
                  <td className="px-4 py-3">{record.tenantName}</td>
                  <td className="px-4 py-3">{record.amountDue.toLocaleString()}</td>
                  <td className="px-4 py-3">{record.amountPaid.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={getRentStatus(record)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
