import { useEffect, useState } from 'react'
import { isAxiosError } from 'axios'
import { listOwnerBookingsRequest } from '../../api/booking.api'
import type { Booking, OwnerEarningsSummary } from '../../types/booking'
import './OwnerEarnings.css'

function money(value: number) {
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

export function OwnerEarnings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [summary, setSummary] = useState<OwnerEarningsSummary | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    listOwnerBookingsRequest()
      .then((data) => {
        setBookings(data.bookings)
        setSummary(data.summary)
      })
      .catch((err) => {
        const message = isAxiosError(err) ? err.response?.data?.message : undefined
        setError(message || 'Could not load your earnings.')
      })
  }, [])

  return (
    <div className="earnings-page">
      <h1>Earnings</h1>
      <p className="earnings-page__sub">The platform keeps a 5% fee on every paid booking; the rest is owed to you.</p>

      {error && <p className="grid-error">{error}</p>}

      {summary && (
        <div className="earnings-tiles">
          <div className="earnings-tile">
            <span>Gross rent collected</span>
            <b>{money(summary.totalGross)}</b>
          </div>
          <div className="earnings-tile">
            <span>Platform fee (5%)</span>
            <b>{money(summary.totalPlatformFee)}</b>
          </div>
          <div className="earnings-tile earnings-tile--accent">
            <span>Your payout</span>
            <b>{money(summary.totalOwnerPayout)}</b>
          </div>
          <div className="earnings-tile">
            <span>Pending settlement</span>
            <b>{money(summary.pendingPayout)}</b>
          </div>
          <div className="earnings-tile">
            <span>Already settled</span>
            <b>{money(summary.settledPayout)}</b>
          </div>
        </div>
      )}

      {summary && bookings.length === 0 && !error && <p className="earnings-page__empty">No paid bookings yet.</p>}

      {bookings.length > 0 && (
        <div className="table-wrap">
          <table className="earnings-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Tenant</th>
                <th>Rent</th>
                <th>Platform fee</th>
                <th>Your payout</th>
                <th>Payout status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const tenant = typeof booking.tenant === 'string' ? null : booking.tenant
                return (
                  <tr key={booking._id}>
                    <td>{booking.pg.name}</td>
                    <td>{tenant?.name || '—'}</td>
                    <td>{money(booking.amount)}</td>
                    <td>{money(booking.platformFeeAmount)}</td>
                    <td>
                      <b>{money(booking.ownerPayoutAmount)}</b>
                    </td>
                    <td>
                      <span className={`status-badge status-badge--${booking.payoutStatus === 'settled' ? 'ok' : 'pending'}`}>
                        {booking.payoutStatus === 'settled' ? 'Settled' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
