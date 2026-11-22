import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardRedirect from './components/DashboardRedirect'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import LandlordDashboard from './pages/landlord/LandlordDashboard'
import TenantDashboard from './pages/tenant/TenantDashboard'
import Properties from './pages/landlord/Properties'

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardRedirect />} />
        </Route>

        <Route element={<ProtectedRoute role="landlord" />}>
          <Route path="/landlord" element={<LandlordDashboard />} />
          <Route path="/landlord/properties" element={<Properties />} />
        </Route>

        <Route element={<ProtectedRoute role="tenant" />}>
          <Route path="/tenant" element={<TenantDashboard />} />
        </Route>
      </Routes>
    </>
  )
}
