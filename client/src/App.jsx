import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardRedirect from './components/DashboardRedirect'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import LandlordDashboard from './pages/landlord/LandlordDashboard'
import Properties from './pages/landlord/Properties'
import Units from './pages/landlord/Units'
import RentLedger from './pages/landlord/RentLedger'
import TenantDashboard from './pages/tenant/TenantDashboard'

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
          <Route path="/landlord/units" element={<Units />} />
          <Route path="/landlord/rent" element={<RentLedger />} />
        </Route>

        <Route element={<ProtectedRoute role="tenant" />}>
          <Route path="/tenant" element={<TenantDashboard />} />
        </Route>
      </Routes>
    </>
  )
}
