export interface AdminUser {
  _id: string
  name: string
  email: string
  role: string
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

export interface CreateUserPayload {
  name: string
  email: string
  password: string
  role?: string
}
