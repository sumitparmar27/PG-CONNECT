import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
  BuildingIcon,
  CalendarIcon,
  ChartIcon,
  DashboardIcon,
  GearIcon,
  LogoutIcon,
  ShieldIcon,
  UsersIcon,
} from '../../components/icons'
import { siteIconBtnClass } from '../../lib/ui'
import { cn } from '../../lib/utils'
import { Permissions } from '../../constants/permissions'

const NAV_ITEMS = [
  { to: '/admin', label: 'Overview', icon: DashboardIcon, end: true, permission: null },
  { to: '/admin/users', label: 'Users', icon: UsersIcon, end: false, permission: Permissions.MANAGE_USERS },
  { to: '/admin/roles', label: 'Roles', icon: ShieldIcon, end: false, permission: Permissions.MANAGE_ROLES },
  { to: '/admin/listings', label: 'Listings', icon: BuildingIcon, end: false, permission: Permissions.MANAGE_LISTINGS },
  { to: '/admin/bookings', label: 'Bookings', icon: CalendarIcon, end: false, permission: Permissions.MANAGE_BOOKINGS },
  { to: '/admin/analytics', label: 'Analytics', icon: ChartIcon, end: false, permission: Permissions.VIEW_ANALYTICS },
  { to: '/admin/settings', label: 'Settings', icon: GearIcon, end: false, permission: Permissions.MANAGE_SETTINGS },
] as const

function adminNavLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    'flex items-center gap-2.5 rounded-sm px-2 py-2.5 text-sm font-medium text-text no-underline hover:bg-code-bg hover:text-text-h max-[880px]:justify-center',
    isActive && 'bg-accent-bg text-accent',
  )
}

export function AdminLayout() {
  const { user, logout } = useAuth()
  const permissions = user?.permissions || []
  const visibleNavItems = NAV_ITEMS.filter((item) => !item.permission || permissions.includes(item.permission))

  return (
    <div className="flex min-h-svh text-left">
      <aside className="sticky top-0 flex h-svh w-55 shrink-0 flex-col gap-6 border-r border-border box-border px-3 py-6 max-[880px]:w-16 max-[880px]:items-center">
        <Link to="/admin" className="inline-flex items-center gap-2 px-2 font-heading text-base font-semibold text-text-h no-underline">
          <img src="/logo.png" alt="PgConnect" className="block h-12.5 w-auto max-w-full max-[880px]:h-auto max-[880px]:w-9" />
        </Link>
        <nav className="flex flex-col gap-1">
          {visibleNavItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={adminNavLinkClass}>
              <Icon width={18} height={18} />
              <span className="max-[880px]:hidden">{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-5 flex items-center justify-between border-b border-border bg-bg px-8 py-4 max-[880px]:px-4 max-[880px]:py-3">
          <span className="font-heading text-base font-semibold text-text-h">Admin panel</span>
          <div className="flex items-center gap-4">
            <Link to="/properties" className="text-[13.5px] font-semibold text-accent-blue no-underline">
              View public site
            </Link>
            <span className="text-[13.5px] font-semibold text-text-h">{user?.name}</span>
            <button type="button" className={siteIconBtnClass} onClick={logout} aria-label="Log out">
              <LogoutIcon />
            </button>
          </div>
        </header>
        <main className="flex-1 p-8 max-[880px]:p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
