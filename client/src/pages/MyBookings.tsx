import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { listMyBookingsRequest } from '../api/booking.api'
import type { Booking } from '../types/booking'
import { ImagePlaceholderIcon } from '../components/icons'
import './MyBookings.css'

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
    <div className="my-bookings">
      <h1>My bookings</h1>

      {error && <p className="grid-error">{error}</p>}

      {!loading && bookings.length === 0 && !error && (
        <div className="my-pgs__empty">
          <p>You haven't booked a PG yet.</p>
          <Link to="/properties" className="site-cta">
            Browse PGs
          </Link>
        </div>
      )}

      <div className="my-bookings__list">
        {bookings.map((booking) => (
          <div className="my-booking-row" key={booking._id}>
            <div className="my-pg-row__media">
              {booking.pg.images?.[0] ? (
                <img src={booking.pg.images[0]} alt={booking.pg.name} />
              ) : (
                <ImagePlaceholderIcon />
              )}
            </div>
            <div className="my-pg-row__body">
              <h3>{booking.pg.name}</h3>
              <p>
                {booking.pg.area} · Booked {new Date(booking.createdAt).toLocaleDateString('en-IN')}
              </p>
            </div>
            <div className="my-booking-row__amount">₹{booking.amount.toLocaleString('en-IN')}</div>
            <span className={`status-badge status-badge--${booking.status === 'paid' ? 'ok' : booking.status === 'failed' ? 'off' : 'pending'}`}>
              {STATUS_LABEL[booking.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
