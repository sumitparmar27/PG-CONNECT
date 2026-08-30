import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LogoutIcon, PlusIcon } from '../components/icons'
import './MainLayout.css'

export function MainLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="site">
      <header className="site-header">
        <Link to="/properties" className="site-logo">
          <span className="site-logo__mark">PG</span>
          Connect
        </Link>

        <nav className="site-nav">
          <NavLink to="/properties" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Browse PGs
          </NavLink>
          {user && (
            <>
              <NavLink to="/dashboard/properties" className={({ isActive }) => (isActive ? 'active' : '')}>
                My Properties
              </NavLink>
              <NavLink to="/dashboard/bookings" className={({ isActive }) => (isActive ? 'active' : '')}>
                My Bookings
              </NavLink>
              <NavLink to="/dashboard/earnings" className={({ isActive }) => (isActive ? 'active' : '')}>
                Earnings
              </NavLink>
              {user.role === 'admin' && (
                <NavLink to="/admin" className={({ isActive }) => (isActive ? 'active' : '')}>
                  Admin
                </NavLink>
              )}
            </>
          )}
        </nav>

        <div className="site-actions">
          {user ? (
            <>
              <Link to="/dashboard/properties/new" className="site-cta">
                <PlusIcon width={16} height={16} />
                Add property
              </Link>
              <button type="button" className="site-icon-btn" onClick={logout} aria-label="Log out">
                <LogoutIcon />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="site-link">
                Log in
              </Link>
              <Link to="/register" className="site-cta">
                Register
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="site-main">
        <Outlet />
      </main>
    </div>
  )
}
