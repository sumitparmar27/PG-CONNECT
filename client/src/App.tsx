import { Navigate, Route, Routes } from 'react-router-dom'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { PropertyGrid } from './pages/PropertyGrid'
import { PropertyDetails } from './pages/PropertyDetails'
import { MyProperties } from './pages/dashboard/MyProperties'
import { PgForm } from './pages/dashboard/PgForm'
import { OwnerEarnings } from './pages/dashboard/OwnerEarnings'
import { MyBookings } from './pages/MyBookings'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'
import { MainLayout } from './layouts/MainLayout'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/properties" replace />} />
        <Route path="/properties" element={<PropertyGrid />} />
        <Route path="/properties/:id" element={<PropertyDetails />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/properties" element={<MyProperties />} />
          <Route path="/dashboard/properties/new" element={<PgForm />} />
          <Route path="/dashboard/properties/:id/edit" element={<PgForm />} />
          <Route path="/dashboard/bookings" element={<MyBookings />} />
          <Route path="/dashboard/earnings" element={<OwnerEarnings />} />
        </Route>
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
