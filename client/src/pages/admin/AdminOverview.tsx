import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPlatformStatsRequest } from '../../api/admin.api'
import type { PlatformStats } from '../../types/admin'
import { tileAccentClass, tileClass, tileLabelClass } from '../../lib/ui'
import { cn } from '../../lib/utils'

function money(value: number) {
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

export function AdminOverview() {
  const [stats, setStats] = useState<PlatformStats | null>(null)

  useEffect(() => {
    getPlatformStatsRequest().then((data) => setStats(data.stats))
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="m-0 text-[26px]">Overview</h1>

      {stats && (
        <>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3.5">
            <div className={tileClass}>
              <span className={tileLabelClass}>Total users</span>
              <b className="text-[22px] text-text-h [font-variant-numeric:tabular-nums]">{stats.totalUsers}</b>
            </div>
            <div className={tileClass}>
              <span className={tileLabelClass}>Listed properties</span>
              <b className="text-[22px] text-text-h [font-variant-numeric:tabular-nums]">{stats.totalProperties}</b>
            </div>
            <div className={tileClass}>
              <span className={tileLabelClass}>Paid bookings</span>
              <b className="text-[22px] text-text-h [font-variant-numeric:tabular-nums]">{stats.totalPaidBookings}</b>
            </div>
            <div className={cn(tileClass, tileAccentClass)}>
              <span className={tileLabelClass}>Platform revenue (5%)</span>
              <b className="text-[22px] text-accent [font-variant-numeric:tabular-nums]">{money(stats.totalPlatformRevenue)}</b>
            </div>
            <div className={tileClass}>
              <span className={tileLabelClass}>Owed to owners (pending)</span>
              <b className="text-[22px] text-text-h [font-variant-numeric:tabular-nums]">{money(stats.pendingPayoutTotal)}</b>
            </div>
          </div>

          {stats.pendingListingsCount > 0 && (
            <Link
              to="/admin/listings?status=pending"
              className="inline-flex items-center gap-2 self-start rounded-sm border border-accent-border bg-accent-bg px-3.5 py-2.5 text-[13.5px] font-semibold text-accent no-underline"
            >
              {stats.pendingListingsCount} listing{stats.pendingListingsCount === 1 ? '' : 's'} waiting for
              moderation review
            </Link>
          )}
        </>
      )}
    </div>
  )
}
