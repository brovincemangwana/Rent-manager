import { useAuth } from '../../context/AuthContext'

export default function TenantDashboard() {
  const { profile } = useAuth()

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-700">Tenant dashboard</h1>
      <p className="mt-2 text-slate-600">Welcome, {profile?.name}.</p>
    </div>
  )
}
