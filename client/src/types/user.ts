export interface AdminUser {
  _id: string
  name: string
  email: string
  role: 'user' | 'admin'
  isActive: boolean
  createdAt: string
}

export interface AdminUserListResponse {
  items: AdminUser[]
  total: number
  page: number
  pages: number
}

export interface AdminUserFilters {
  q?: string
  role?: string
  status?: 'active' | 'suspended'
  page?: number
}
