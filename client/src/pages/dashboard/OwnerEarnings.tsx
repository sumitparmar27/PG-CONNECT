import { useEffect, useState } from 'react'
import { isAxiosError } from 'axios'
import { listOwnerBookingsRequest } from '../../api/booking.api'
import type { Booking, OwnerEarningsSummary } from '../../types/booking'
import { cn } from '../../lib/utils'
import { gridErrorClass, statusBadgeClass, tableClass, tableWrapClass, tdClass, thClass } from '../../lib/ui'

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

  const tileClass = 'flex flex-col gap-1.5 rounded border border-border bg-bg px-[18px] py-4'
  const tileLabelClass = 'text-xs uppercase tracking-[0.04em] text-text'

  return (
    <div className="flex flex-col gap-5">
      <h1 className="mb-0.5 text-[26px]">Earnings</h1>
      <p className="m-0 text-sm text-text">The platform keeps a 5% fee on every paid booking; the rest is owed to you.</p>

      {error && <p className={gridErrorClass}>{error}</p>}

      {summary && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3.5">
          <div className={tileClass}>
            <span className={tileLabelClass}>Gross rent collected</span>
            <b className="text-[22px] text-text-h [font-variant-numeric:tabular-nums]">{money(summary.totalGross)}</b>
          </div>
          <div className={tileClass}>
            <span className={tileLabelClass}>Platform fee (5%)</span>
            <b className="text-[22px] text-text-h [font-variant-numeric:tabular-nums]">{money(summary.totalPlatformFee)}</b>
          </div>
          <div className={cn(tileClass, 'border-accent-border bg-accent-bg')}>
            <span className={tileLabelClass}>Your payout</span>
            <b className="text-[22px] text-accent [font-variant-numeric:tabular-nums]">{money(summary.totalOwnerPayout)}</b>
          </div>
          <div className={tileClass}>
            <span className={tileLabelClass}>Pending settlement</span>
            <b className="text-[22px] text-text-h [font-variant-numeric:tabular-nums]">{money(summary.pendingPayout)}</b>
          </div>
          <div className={tileClass}>
            <span className={tileLabelClass}>Already settled</span>
            <b className="text-[22px] text-text-h [font-variant-numeric:tabular-nums]">{money(summary.settledPayout)}</b>
          </div>
        </div>
      )}

      {summary && bookings.length === 0 && !error && <p className="py-6 text-text">No paid bookings yet.</p>}

      {bookings.length > 0 && (
        <div className={tableWrapClass}>
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>Property</th>
                <th className={thClass}>Tenant</th>
                <th className={thClass}>Rent</th>
                <th className={thClass}>Platform fee</th>
                <th className={thClass}>Your payout</th>
                <th className={thClass}>Payout status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const tenant = typeof booking.tenant === 'string' ? null : booking.tenant
                return (
                  <tr key={booking._id}>
                    <td className={tdClass}>{booking.pg.name}</td>
                    <td className={tdClass}>{tenant?.name || '—'}</td>
                    <td className={tdClass}>{money(booking.amount)}</td>
                    <td className={tdClass}>{money(booking.platformFeeAmount)}</td>
                    <td className={tdClass}>
                      <b>{money(booking.ownerPayoutAmount)}</b>
                    </td>
                    <td className={tdClass}>
                      <span className={statusBadgeClass(booking.payoutStatus === 'settled' ? 'ok' : 'pending')}>
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
