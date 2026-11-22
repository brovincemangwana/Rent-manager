import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function LandlordDashboard() {
  const { profile } = useAuth()

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-700">Landlord dashboard</h1>
      <p className="mt-2 text-slate-600">Welcome, {profile?.name}.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to="/landlord/properties"
          className="rounded-lg bg-brand-700 px-4 py-2 font-medium text-white hover:bg-brand-800"
        >
          Manage properties
        </Link>
        <Link
          to="/landlord/units"
          className="rounded-lg bg-brand-700 px-4 py-2 font-medium text-white hover:bg-brand-800"
        >
          Units and tenants
        </Link>
        <Link
          to="/landlord/rent"
          className="rounded-lg bg-accent-500 px-4 py-2 font-bold text-white hover:bg-accent-600"
        >
          Rent ledger
        </Link>
      </div>
    </div>
  )
}
