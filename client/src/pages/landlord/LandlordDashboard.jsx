import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function LandlordDashboard() {
  const { profile } = useAuth()

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-700">Landlord dashboard</h1>
      <p className="mt-2 text-slate-600">Welcome, {profile?.name}.</p>
      <Link
        to="/landlord/properties"
        className="mt-6 inline-block rounded-lg bg-accent-500 px-4 py-2 font-medium text-white hover:bg-accent-600"
      >
        Manage properties
      </Link>
    </div>
  )
}
