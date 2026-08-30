export type BookingStatus = 'created' | 'paid' | 'failed'
export type PayoutStatus = 'pending' | 'settled'

export interface BookingPg {
  _id: string
  name: string
  area: string
  images?: string[]
  price?: number
}

export interface BookingPerson {
  _id: string
  name: string
  email: string
}

export interface Booking {
  _id: string
  pg: BookingPg
  tenant: BookingPerson | string
  owner: BookingPerson | string
  amount: number
  currency: string
  platformFeeAmount: number
  ownerPayoutAmount: number
  status: BookingStatus
  payoutStatus: PayoutStatus
  createdAt: string
}

export interface CreateBookingResponse {
  booking: Booking
  razorpayOrder: { id: string; amount: number; currency: string }
  razorpayKeyId: string
}

export interface OwnerEarningsSummary {
  totalGross: number
  totalPlatformFee: number
  totalOwnerPayout: number
  pendingPayout: number
  settledPayout: number
}
