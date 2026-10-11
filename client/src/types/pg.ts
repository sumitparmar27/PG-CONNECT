export interface PgType {
  _id: string
  name: string
}

export interface PgOwner {
  _id: string
  name: string
  email: string
}

export type PgStatus = 'available' | 'not available'
export type ModerationStatus = 'pending' | 'approved' | 'rejected'

export interface Pg {
  _id: string
  name: string
  type: PgType
  sharing?: string
  area: string
  landmark?: string
  address: string
  pincode: string
  price: number
  dailyRate?: number
  weeklyRate?: number
  status: PgStatus
  moderationStatus: ModerationStatus
  description: string
  rooms: number
  bed: number
  bathroom: number
  kitchen: number
  balcony: number
  parking: number
  facilities: string[]
  images: string[]
  video?: string
  owner: PgOwner
  createdAt: string
  updatedAt: string
}

export interface PgListResponse {
  items: Pg[]
  total: number
  page: number
  pages: number
}

export interface PgFilters {
  area?: string
  type?: string
  minPrice?: number
  maxPrice?: number
  page?: number
}

export interface AdminListingFilters {
  status?: ModerationStatus
  page?: number
  limit?: number
}

export interface AdminListingListResponse {
  items: Pg[]
  total: number
  page: number
  pages: number
}

export interface PgFormValues {
  name: string
  type: string
  sharing: string
  area: string
  landmark: string
  address: string
  pincode: string
  price: string
  dailyRate: string
  weeklyRate: string
  status: PgStatus
  description: string
  bed: string
  bathroom: string
  kitchen: string
  balcony: string
  parking: string
  facilities: string[]
}
