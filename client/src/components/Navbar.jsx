import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { logoutUser } from '../services/authService'

const landlordLinks = [
  { to: '/landlord', label: 'Dashboard' },
  { to: '/landlord/properties', label: 'Properties' },
  { to: '/landlord/units', label: 'Units' },
  { to: '/landlord/rent', label: 'Rent' },
  { to: '/landlord/maintenance', label: 'Maintenance' },
]

const tenantLinks = [
  { to: '/tenant', label: 'My rent' },
  { to: '/tenant/maintenance', label: 'Maintenance' },
]

export default function Navbar() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logoutUser()
    navigate('/login')
  }

  const links =
    profile?.role === 'landlord' ? landlordLinks : profile?.role === 'tenant' ? tenantLinks : []

  return (
    <nav className="bg-brand-700 text-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
        <Link to="/" className="text-lg font-bold">
          Rent Manager
        </Link>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm sm:text-base">
          {user ? (
            <>
              {links.map((link) => (
                <Link key={link.to} to={link.to} className="hover:underline">
                  {link.label}
                </Link>
              ))}
              <button onClick={handleLogout} className="hover:underline">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">
                Log in
              </Link>
              <Link to="/register" className="hover:underline">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
