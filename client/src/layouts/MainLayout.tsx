import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LogoutIcon, PlusIcon } from '../components/icons'
import { navLinkClass, siteCtaClass, siteIconBtnClass } from '../lib/ui'

export function MainLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-svh flex-col text-left">
      <header className="sticky top-0 z-10 flex items-center gap-7 border-b border-border bg-bg px-8 py-3.5 max-[720px]:flex-wrap max-[720px]:gap-4 max-[720px]:px-4 max-[720px]:py-3">
        <Link to="/properties" className="inline-flex items-center no-underline">
          <img src="/logo.png" alt="PgConnect" className="block h-[34px] w-auto" />
        </Link>

        <nav className="flex flex-1 gap-5 max-[720px]:order-3 max-[720px]:w-full">
          <NavLink to="/properties" end className={navLinkClass}>
            Browse PGs
          </NavLink>
          {user && (
            <>
              <NavLink to="/dashboard/properties" className={navLinkClass}>
                My Properties
              </NavLink>
              <NavLink to="/dashboard/bookings" className={navLinkClass}>
                My Bookings
              </NavLink>
              <NavLink to="/dashboard/earnings" className={navLinkClass}>
                Earnings
              </NavLink>
              {user.role === 'admin' && (
                <NavLink to="/admin" className={navLinkClass}>
                  Admin
                </NavLink>
              )}
            </>
          )}
        </nav>

        <div className="flex items-center gap-2.5">
          {user ? (
            <>
              <Link to="/dashboard/properties/new" className={siteCtaClass}>
                <PlusIcon width={16} height={16} />
                Add property
              </Link>
              <button type="button" className={siteIconBtnClass} onClick={logout} aria-label="Log out">
                <LogoutIcon />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-1.5 py-2 text-[14.5px] font-semibold text-text-h no-underline">
                Log in
              </Link>
              <Link to="/register" className={siteCtaClass}>
                Register
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1180px] box-border px-8 pt-8 pb-16 flex-1 max-[720px]:px-4 max-[720px]:pt-6 max-[720px]:pb-12">
        <Outlet />
      </main>
    </div>
  )
}
