import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { listMyBookingsRequest } from '../api/booking.api'
import type { Booking } from '../types/booking'
import { ImagePlaceholderIcon } from '../components/icons'
import { gridErrorClass, siteCtaClass, statusBadgeClass } from '../lib/ui'

const STATUS_LABEL: Record<Booking['status'], string> = {
  created: 'Awaiting payment',
  paid: 'Confirmed',
  failed: 'Payment failed',
}

export function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    listMyBookingsRequest()
      .then((data) => setBookings(data.bookings))
      .catch((err) => {
        const message = isAxiosError(err) ? err.response?.data?.message : undefined
        setError(message || 'Could not load your bookings.')
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-5">
      <h1 className="m-0 text-[26px]">My bookings</h1>

      {error && <p className={gridErrorClass}>{error}</p>}

      {!loading && bookings.length === 0 && !error && (
        <div className="flex flex-col items-center gap-4 rounded border border-dashed border-border px-5 py-14 text-text">
          <p>You haven't booked a PG yet.</p>
          <Link to="/properties" className={siteCtaClass}>
            Browse PGs
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {bookings.map((booking) => (
          <div className="flex items-center gap-4 rounded border border-border p-3" key={booking._id}>
            <div className="flex h-16 w-[84px] shrink-0 items-center justify-center overflow-hidden rounded-sm bg-code-bg text-text opacity-90">
              {booking.pg.images?.[0] ? (
                <img src={booking.pg.images[0]} alt={booking.pg.name} className="size-full object-cover" />
              ) : (
                <ImagePlaceholderIcon />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3>{booking.pg.name}</h3>
              <p>
                {booking.pg.area} · Booked {new Date(booking.createdAt).toLocaleDateString('en-IN')}
              </p>
            </div>
            <div className="shrink-0 text-[15px] font-semibold text-text-h">₹{booking.amount.toLocaleString('en-IN')}</div>
            <span
              className={statusBadgeClass(booking.status === 'paid' ? 'ok' : booking.status === 'failed' ? 'off' : 'pending')}
            >
              {STATUS_LABEL[booking.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
