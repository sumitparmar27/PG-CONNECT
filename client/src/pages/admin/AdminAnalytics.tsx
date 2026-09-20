import { useEffect, useState } from 'react'
import { getAnalyticsRequest } from '../../api/admin.api'
import type { PlatformAnalytics } from '../../types/admin'
import { gridErrorClass } from '../../lib/ui'

const DONUT_COLORS = ['var(--accent)', 'var(--accent-blue)', 'var(--border)', 'var(--text)']

function money(value: number) {
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

function formatShortDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getAnalyticsRequest()
      .then((data) => setAnalytics(data.analytics))
      .catch(() => setError('Could not load analytics.'))
  }, [])

  if (error) return <p className={gridErrorClass}>{error}</p>
  if (!analytics) return null

  const { bookingsByDay, listingsByArea, bookingStatusBreakdown, payoutBreakdown } = analytics

  const maxDayCount = Math.max(1, ...bookingsByDay.map((d) => d.count))
  const maxAreaCount = Math.max(1, ...listingsByArea.map((a) => a.count))
  const statusTotal = Math.max(1, bookingStatusBreakdown.reduce((sum, s) => sum + s.count, 0))
  const payoutTotal = Math.max(1, payoutBreakdown.pending + payoutBreakdown.settled)

  let cumulativePct = 0
  const donutStops = bookingStatusBreakdown.map((row, i) => {
    const startPct = cumulativePct
    const pct = (row.count / statusTotal) * 100
    cumulativePct += pct
    return { ...row, color: DONUT_COLORS[i % DONUT_COLORS.length], startPct, endPct: cumulativePct }
  })
  const donutGradient = donutStops.length
    ? `conic-gradient(${donutStops.map((s) => `${s.color} ${s.startPct}% ${s.endPct}%`).join(', ')})`
    : 'var(--code-bg)'

  const pendingPct = (payoutBreakdown.pending / payoutTotal) * 100
  const settledPct = (payoutBreakdown.settled / payoutTotal) * 100

  const cardClass = 'flex flex-col gap-4 rounded border border-border p-6'

  return (
    <div className="flex flex-col gap-6">
      <h1 className="m-0 text-[26px]">Analytics</h1>

      <div className="grid grid-cols-[repeat(2,minmax(280px,1fr))] gap-6 max-[880px]:grid-cols-1">
        <section className={cardClass}>
          <h2 className="m-0 text-[15px]">Bookings — last 30 days</h2>
          {bookingsByDay.length === 0 ? (
            <p className="m-0 text-[13.5px] text-text">No paid bookings in this window yet.</p>
          ) : (
            <div className="mb-5 flex h-[140px] items-end gap-[3px]">
              {bookingsByDay.map((day, i) => (
                <div
                  key={day.date}
                  className="relative min-w-[4px] flex-1 rounded-t-[3px] bg-accent-blue opacity-85 hover:opacity-100"
                  title={`${formatShortDate(day.date)}: ${day.count} booking${day.count === 1 ? '' : 's'}, ${money(day.revenue)}`}
                  style={{ height: `${Math.max(4, (day.count / maxDayCount) * 100)}%` }}
                >
                  {i % 5 === 0 && (
                    <span className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap text-text">
                      {formatShortDate(day.date)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className={cardClass}>
          <h2 className="m-0 text-[15px]">Top areas by listings</h2>
          {listingsByArea.length === 0 ? (
            <p className="m-0 text-[13.5px] text-text">No listings yet.</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {listingsByArea.map((row) => (
                <div className="grid grid-cols-[90px_1fr_24px] items-center gap-2.5" key={row.area}>
                  <span className="truncate text-[12.5px] text-text-h">{row.area}</span>
                  <div className="h-2.5 overflow-hidden rounded-full bg-code-bg">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${Math.max(4, (row.count / maxAreaCount) * 100)}%` }}
                    />
                  </div>
                  <span className="text-right text-[12.5px] text-text">{row.count}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className={cardClass}>
          <h2 className="m-0 text-[15px]">Booking status</h2>
          {donutStops.length === 0 ? (
            <p className="m-0 text-[13.5px] text-text">No bookings yet.</p>
          ) : (
            <div className="flex items-center gap-6">
              <div className="relative h-[120px] w-[120px] shrink-0 rounded-full" style={{ background: donutGradient }}>
                <div className="absolute inset-[22px] rounded-full bg-bg" />
              </div>
              <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[13px] text-text-h capitalize">
                {donutStops.map((row) => (
                  <li key={row.status} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: row.color }} />
                    {row.status} · {row.count}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className={cardClass}>
          <h2 className="m-0 text-[15px]">Owner payouts</h2>
          <div className="flex h-4 overflow-hidden rounded-full bg-code-bg">
            <div className="bg-accent" style={{ flexBasis: `${pendingPct}%` }} />
            <div className="bg-accent-blue" style={{ flexBasis: `${settledPct}%` }} />
          </div>
          <div className="flex gap-6 text-[13px] text-text-h">
            <span className="inline-flex items-center gap-1.5">
              <i className="inline-block h-2.5 w-2.5 rounded-[3px] bg-accent" />
              Pending: {money(payoutBreakdown.pending)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="inline-block h-2.5 w-2.5 rounded-[3px] bg-accent-blue" />
              Settled: {money(payoutBreakdown.settled)}
            </span>
          </div>
        </section>
      </div>
    </div>
  )
}
