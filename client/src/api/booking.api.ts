import api from './axios'
import type { Booking, CreateBookingResponse, OwnerEarningsSummary } from '../types/booking'

export function createBookingRequest(pgId: string): Promise<CreateBookingResponse> {
  return api.post('/bookings', { pgId }).then((res) => res.data)
}

export function verifyBookingPaymentRequest(
  bookingId: string,
  payload: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string },
): Promise<{ booking: Booking }> {
  return api.post(`/bookings/${bookingId}/verify`, payload).then((res) => res.data)
}

export function listMyBookingsRequest(): Promise<{ bookings: Booking[] }> {
  return api.get('/bookings/mine').then((res) => res.data)
}

export function listOwnerBookingsRequest(): Promise<{ bookings: Booking[]; summary: OwnerEarningsSummary }> {
  return api.get('/bookings/owner').then((res) => res.data)
}

export function listAllBookingsRequest(): Promise<{ bookings: Booking[]; summary: OwnerEarningsSummary }> {
  return api.get('/bookings/all').then((res) => res.data)
}

export function settleBookingRequest(bookingId: string): Promise<{ booking: Booking }> {
  return api.patch(`/bookings/${bookingId}/settle`).then((res) => res.data)
}
