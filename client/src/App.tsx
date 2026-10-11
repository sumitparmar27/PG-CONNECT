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
import { AdminLayout } from './pages/admin/AdminLayout'
import { AdminOverview } from './pages/admin/AdminOverview'
import { AdminUsers } from './pages/admin/AdminUsers'
import { AdminRoles } from './pages/admin/AdminRoles'
import { AdminListings } from './pages/admin/AdminListings'
import { AdminListingForm } from './pages/admin/AdminListingForm'
import { AdminBookings } from './pages/admin/AdminBookings'
import { AdminAnalytics } from './pages/admin/AdminAnalytics'
import { AdminSettings } from './pages/admin/AdminSettings'
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
      </Route>
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="roles" element={<AdminRoles />} />
          <Route path="listings" element={<AdminListings />} />
          <Route path="listings/new" element={<AdminListingForm />} />
          <Route path="listings/:id/edit" element={<AdminListingForm />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
