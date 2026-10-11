export type BookingStatus = 'created' | 'paid' | 'failed'
export type PayoutStatus = 'pending' | 'settled'
export type BookingSource = 'online' | 'manual'
export type PaymentMode = 'cash' | 'upi' | 'bank_transfer' | 'cheque' | 'other'
export type DurationUnit = 'day' | 'week' | 'month'

export interface BookingPg {
  _id: string
  name: string
  area: string
  images?: string[]
  price?: number
}

export interface BookingRoom {
  _id: string
  roomNumber: string
  sharingType: string
  rentPerBed: number
}

export interface BookingPerson {
  _id: string
  name: string
  email: string
}

export interface Booking {
  _id: string
  pg: BookingPg
  room: BookingRoom | string
  tenant: BookingPerson | string
  owner: BookingPerson | string
  amount: number
  currency: string
  platformFeeAmount: number
  ownerPayoutAmount: number
  status: BookingStatus
  payoutStatus: PayoutStatus
  source: BookingSource
  tenantPhone?: string
  checkIn: string
  checkOut: string
  durationUnit?: DurationUnit
  durationQuantity?: number
  securityDeposit?: number
  paymentMode?: PaymentMode
  idProofDocument?: string
  notes?: string
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
