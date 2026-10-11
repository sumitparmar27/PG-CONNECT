export const Permissions = {
  MANAGE_USERS: 'manage_users',
  MANAGE_LISTINGS: 'manage_listings',
  MANAGE_BOOKINGS: 'manage_bookings',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_SETTINGS: 'manage_settings',
  MANAGE_ROLES: 'manage_roles',
} as const

export type Permission = (typeof Permissions)[keyof typeof Permissions]

export const PERMISSION_LABELS: Record<Permission, string> = {
  [Permissions.MANAGE_USERS]: 'Manage users',
  [Permissions.MANAGE_LISTINGS]: 'Manage listings',
  [Permissions.MANAGE_BOOKINGS]: 'Manage bookings',
  [Permissions.VIEW_ANALYTICS]: 'View analytics',
  [Permissions.MANAGE_SETTINGS]: 'Manage settings',
  [Permissions.MANAGE_ROLES]: 'Manage roles',
}

export function hasAnyAdminAccess(permissions: string[]) {
  return permissions.length > 0
}
