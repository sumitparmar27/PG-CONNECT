import { useEffect, useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import { getPlatformStatsRequest } from '../../api/admin.api'
import { createPgTypeRequest, listPgTypesRequest } from '../../api/pg.api'
import { listAllBookingsRequest, settleBookingRequest } from '../../api/booking.api'
import type { PlatformStats } from '../../types/admin'
import type { PgType } from '../../types/pg'
import type { Booking, OwnerEarningsSummary } from '../../types/booking'
import { PlusIcon } from '../../components/icons'
import './AdminDashboard.css'

function money(value: number) {
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

export function AdminDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [types, setTypes] = useState<PgType[]>([])
  const [newType, setNewType] = useState('')
  const [typeError, setTypeError] = useState('')
  const [addingType, setAddingType] = useState(false)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [summary, setSummary] = useState<OwnerEarningsSummary | null>(null)
  const [settlingId, setSettlingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  function loadStats() {
    getPlatformStatsRequest().then((data) => setStats(data.stats))
  }
  function loadTypes() {
    listPgTypesRequest().then((data) => setTypes(data.types))
  }
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

  useEffect(() => {
    loadStats()
    loadTypes()
    loadBookings()
  }, [])

  async function handleAddType(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setTypeError('')
    if (!newType.trim()) return
    setAddingType(true)
    try {
      await createPgTypeRequest(newType.trim())
      setNewType('')
      loadTypes()
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined
      setTypeError(message || 'Could not add that PG type.')
    } finally {
      setAddingType(false)
    }
  }

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
    <div className="admin-page">
      <h1>Admin panel</h1>

      {stats && (
        <div className="earnings-tiles">
          <div className="earnings-tile">
            <span>Total users</span>
            <b>{stats.totalUsers}</b>
          </div>
          <div className="earnings-tile">
            <span>Listed properties</span>
            <b>{stats.totalProperties}</b>
          </div>
          <div className="earnings-tile">
            <span>Paid bookings</span>
            <b>{stats.totalPaidBookings}</b>
          </div>
          <div className="earnings-tile earnings-tile--accent">
            <span>Platform revenue (5%)</span>
            <b>{money(stats.totalPlatformRevenue)}</b>
          </div>
          <div className="earnings-tile">
            <span>Owed to owners (pending)</span>
            <b>{money(stats.pendingPayoutTotal)}</b>
          </div>
        </div>
      )}

      <section className="admin-section">
        <h2>PG types</h2>
        <div className="admin-type-chips">
          {types.map((t) => (
            <span key={t._id} className="status-badge status-badge--pending">
              {t.name}
            </span>
          ))}
        </div>
        <form className="admin-type-form" onSubmit={handleAddType}>
          <input
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            placeholder="e.g. Co-living for students"
          />
          <button type="submit" className="site-cta" disabled={addingType}>
            <PlusIcon width={16} height={16} />
            Add type
          </button>
        </form>
        {typeError && <p className="grid-error">{typeError}</p>}
      </section>

      <section className="admin-section">
        <h2>All bookings</h2>
        {error && <p className="grid-error">{error}</p>}
        {summary && (
          <p className="admin-section__sub">
            {money(summary.totalGross)} collected across {bookings.length} paid booking{bookings.length === 1 ? '' : 's'} ·{' '}
            {money(summary.pendingPayout)} still owed to owners
          </p>
        )}
        {bookings.length > 0 && (
          <div className="table-wrap">
            <table className="earnings-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Tenant</th>
                  <th>Owner</th>
                  <th>Rent</th>
                  <th>Platform fee</th>
                  <th>Owner payout</th>
                  <th>Payout status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => {
                  const tenant = typeof booking.tenant === 'string' ? null : booking.tenant
                  const owner = typeof booking.owner === 'string' ? null : booking.owner
                  const isPending = booking.payoutStatus === 'pending'
                  return (
                    <tr key={booking._id}>
                      <td>{booking.pg.name}</td>
                      <td>{tenant?.name || '—'}</td>
                      <td>{owner?.name || '—'}</td>
                      <td>{money(booking.amount)}</td>
                      <td>{money(booking.platformFeeAmount)}</td>
                      <td>{money(booking.ownerPayoutAmount)}</td>
                      <td>
                        <span className={`status-badge status-badge--${isPending ? 'pending' : 'ok'}`}>
                          {isPending ? 'Pending' : 'Settled'}
                        </span>
                      </td>
                      <td>
                        {isPending && (
                          <button
                            type="button"
                            className="admin-settle-btn"
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
      </section>
    </div>
  )
}
