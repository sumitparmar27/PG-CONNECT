export interface PlatformStats {
  totalUsers: number
  totalProperties: number
  totalBookings: number
  totalPaidBookings: number
  totalPlatformRevenue: number
  pendingPayoutTotal: number
  pendingListingsCount: number
}

export interface AnalyticsBookingDay {
  date: string
  count: number
  revenue: number
}

export interface AnalyticsAreaCount {
  area: string
  count: number
}

export interface AnalyticsStatusCount {
  status: string
  count: number
}

export interface PlatformAnalytics {
  bookingsByDay: AnalyticsBookingDay[]
  listingsByArea: AnalyticsAreaCount[]
  bookingStatusBreakdown: AnalyticsStatusCount[]
  payoutBreakdown: { pending: number; settled: number }
}
