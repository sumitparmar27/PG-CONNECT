import { useEffect, useState } from 'react'
import { isAxiosError } from 'axios'
import { listAllBookingsRequest, settleBookingRequest } from '../../api/booking.api'
import type { Booking, OwnerEarningsSummary } from '../../types/booking'
import { gridErrorClass, statusBadgeClass, tableClass, tableWrapClass, tdClass, thClass } from '../../lib/ui'

function money(value: number) {
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

export function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [summary, setSummary] = useState<OwnerEarningsSummary | null>(null)
  const [settlingId, setSettlingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  function loadBookings() {
    listAllBookingsRequest()
      .then((data) => {
        setBookings(data.bookings)
        setSummary(data.summary)
      })
      .catch((err) => {
        const message = isAxiosError(err) ? err.response?.data?.message : undefined
        setError(message || 'Could not load bookings.')
      })
  }

  useEffect(loadBookings, [])

  async function handleSettle(bookingId: string) {
    setSettlingId(bookingId)
    try {
      await settleBookingRequest(bookingId)
      loadBookings()
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined
      setError(message || 'Could not settle this payout.')
    } finally {
      setSettlingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <h1 className="m-0 text-[26px]">All bookings</h1>
      {error && <p className={gridErrorClass}>{error}</p>}
      {summary && (
        <p className="m-0 text-[13.5px] text-text">
          {money(summary.totalGross)} collected across {bookings.length} paid booking{bookings.length === 1 ? '' : 's'} ·{' '}
          {money(summary.pendingPayout)} still owed to owners
        </p>
      )}
      {bookings.length > 0 && (
        <div className={tableWrapClass}>
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>Property</th>
                <th className={thClass}>Tenant</th>
                <th className={thClass}>Owner</th>
                <th className={thClass}>Rent</th>
                <th className={thClass}>Platform fee</th>
                <th className={thClass}>Owner payout</th>
                <th className={thClass}>Payout status</th>
                <th className={thClass}></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const tenant = typeof booking.tenant === 'string' ? null : booking.tenant
                const owner = typeof booking.owner === 'string' ? null : booking.owner
                const isPending = booking.payoutStatus === 'pending'
                return (
                  <tr key={booking._id}>
                    <td className={tdClass}>{booking.pg.name}</td>
                    <td className={tdClass}>{tenant?.name || '—'}</td>
                    <td className={tdClass}>{owner?.name || '—'}</td>
                    <td className={tdClass}>{money(booking.amount)}</td>
                    <td className={tdClass}>{money(booking.platformFeeAmount)}</td>
                    <td className={tdClass}>{money(booking.ownerPayoutAmount)}</td>
                    <td className={tdClass}>
                      <span className={statusBadgeClass(isPending ? 'pending' : 'ok')}>
                        {isPending ? 'Pending' : 'Settled'}
                      </span>
                    </td>
                    <td className={tdClass}>
                      {isPending && (
                        <button
                          type="button"
                          className="cursor-pointer rounded-[7px] border border-accent-border bg-accent-bg px-2.5 py-1.5 text-[12.5px] font-semibold whitespace-nowrap text-accent not-disabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                          onClick={() => handleSettle(booking._id)}
                          disabled={settlingId === booking._id}
                        >
                          Mark settled
                        </button>
                      )}
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
