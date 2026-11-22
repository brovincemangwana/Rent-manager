import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { logoutUser } from '../services/authService'

export default function Navbar() {
  const { user } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logoutUser()
    navigate('/login')
  }

  return (
    <nav className="bg-brand-700 text-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-bold">
          Rent Manager
        </Link>
        <div className="flex gap-4">
          {user ? (
            <button onClick={handleLogout} className="hover:underline">
              Log out
            </button>
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
