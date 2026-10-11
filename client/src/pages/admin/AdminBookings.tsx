import { useEffect, useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import type { DateRange } from 'react-day-picker'
import { listAllBookingsRequest, settleBookingRequest } from '../../api/booking.api'
import { createManualBookingRequest, listListingsForModerationRequest } from '../../api/admin.api'
import { listRoomsForPgRequest } from '../../api/room.api'
import type { Booking, DurationUnit, OwnerEarningsSummary, PaymentMode } from '../../types/booking'
import type { Pg } from '../../types/pg'
import type { Room } from '../../types/room'
import { AlertIcon, FileIcon, PlusIcon } from '../../components/icons'
import { FormModal } from '../../components/FormModal'
import { UserAutocomplete, type MinimalUser } from '../../components/UserAutocomplete'
import { inputClass, labelClass } from '../../components/PgFormFields'
import { buildMediaItem, MediaUploader, type MediaItem } from '../../components/MediaUploader'
import { BookingDateRangePicker } from '../../components/BookingDateRangePicker'
import { authAlertClass, authSubmitClass, gridErrorClass, statusBadgeClass, tableClass, tableWrapClass, tdClass, thClass } from '../../lib/ui'
import { cn } from '../../lib/utils'

const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
  cash: 'Cash',
  upi: 'UPI',
  bank_transfer: 'Bank transfer',
  cheque: 'Cheque',
  other: 'Other',
}

const ID_PROOF_ACCEPT = 'image/jpeg,image/png,image/webp,application/pdf'

const DURATION_UNIT_LABELS: Record<DurationUnit, string> = {
  day: 'Day(s)',
  week: 'Week(s)',
  month: 'Month(s)',
}

const EMPTY_EXTRA_FIELDS = {
  tenantPhone: '',
  securityDeposit: '',
  paymentMode: 'cash' as PaymentMode,
  notes: '',
}

function money(value: number) {
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function computeSuggestedAmount(room: Room | undefined, range: DateRange | undefined) {
  if (!room || !range?.from || !range?.to) return ''
  const days = Math.max(1, Math.round((range.to.getTime() - range.from.getTime()) / 86400000))
  if (room.dailyRate && days < 7) return String(Math.round(room.dailyRate * days))
  if (room.weeklyRate && days < 30) return String(Math.round(room.weeklyRate * Math.ceil(days / 7)))
  return String(Math.round(room.rentPerBed * (days / 30)))
}

export function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [summary, setSummary] = useState<OwnerEarningsSummary | null>(null)
  const [settlingId, setSettlingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const [showCreate, setShowCreate] = useState(false)
  const [listings, setListings] = useState<Pg[]>([])
  const [selectedTenant, setSelectedTenant] = useState<MinimalUser | null>(null)
  const [pgId, setPgId] = useState('')
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomId, setRoomId] = useState('')
  const [range, setRange] = useState<DateRange | undefined>(undefined)
  const [amount, setAmount] = useState('')
  const [amountTouched, setAmountTouched] = useState(false)
  const [extra, setExtra] = useState(EMPTY_EXTRA_FIELDS)
  const [idProofFile, setIdProofFile] = useState<File | null>(null)
  const [idProofItem, setIdProofItem] = useState<MediaItem | null>(null)
  const [createError, setCreateError] = useState('')
  const [creating, setCreating] = useState(false)
  const [detailsTarget, setDetailsTarget] = useState<Booking | null>(null)

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

  function openCreate() {
    setShowCreate(true)
    setCreateError('')
    listListingsForModerationRequest({ status: 'approved', limit: 100 })
      .then((data) => setListings(data.items))
      .catch(() => setListings([]))
  }

  function closeCreate() {
    setShowCreate(false)
    setSelectedTenant(null)
    setPgId('')
    setRooms([])
    setRoomId('')
    setRange(undefined)
    setAmount('')
    setAmountTouched(false)
    setExtra(EMPTY_EXTRA_FIELDS)
    setIdProofFile(null)
    setIdProofItem(null)
    setCreateError('')
  }

  function handlePgChange(id: string) {
    setPgId(id)
    setRoomId('')
    setRange(undefined)
    setAmountTouched(false)
    setAmount('')
    setRooms([])
    if (!id) return
    listRoomsForPgRequest(id)
      .then((data) => setRooms(data.rooms.filter((room) => room.status === 'active')))
      .catch(() => setRooms([]))
  }

  function handleRoomChange(id: string) {
    setRoomId(id)
    if (!amountTouched) {
      const selected = rooms.find((room) => room._id === id)
      setAmount(computeSuggestedAmount(selected, range))
    }
  }

  function handleRangeChange(nextRange: DateRange | undefined) {
    setRange(nextRange)
    if (!amountTouched) {
      const selected = rooms.find((room) => room._id === roomId)
      setAmount(computeSuggestedAmount(selected, nextRange))
    }
  }

  function handleAmountChange(value: string) {
    setAmount(value)
    setAmountTouched(true)
  }

  function handleIdProofAdd(files: File[]) {
    const file = files[0]
    if (!file) return
    setIdProofFile(file)
    setIdProofItem(buildMediaItem(file))
  }

  function handleIdProofRemove() {
    setIdProofFile(null)
    setIdProofItem(null)
  }

  async function handleCreateBooking(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setCreateError('')
    if (!selectedTenant || !pgId || !roomId || !range?.from || !range?.to) {
      setCreateError('Select a tenant, listing, room, and check-in/check-out dates.')
      return
    }
    setCreating(true)
    try {
      const formData = new FormData()
      formData.append('pgId', pgId)
      formData.append('roomId', roomId)
      formData.append('tenantId', selectedTenant._id)
      formData.append('checkIn', formatDateKey(range.from))
      formData.append('checkOut', formatDateKey(range.to))
      if (amount) formData.append('amount', amount)
      if (extra.tenantPhone) formData.append('tenantPhone', extra.tenantPhone)
      if (extra.securityDeposit) formData.append('securityDeposit', extra.securityDeposit)
      if (extra.paymentMode) formData.append('paymentMode', extra.paymentMode)
      if (extra.notes) formData.append('notes', extra.notes)
      if (idProofFile) formData.append('idProofDocument', idProofFile)

      await createManualBookingRequest(formData)
      closeCreate()
      loadBookings()
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined
      setCreateError(message || 'Could not create this booking.')
    } finally {
      setCreating(false)
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
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h1 className="m-0 text-[26px]">All bookings</h1>
        <button
          type="button"
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-[7px] border border-accent-border bg-accent-bg px-3.5 py-2 text-[13px] font-semibold whitespace-nowrap text-accent hover:brightness-105"
          onClick={openCreate}
        >
          <PlusIcon width={14} height={14} />
          Create manual booking
        </button>
      </div>
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
                <th className={thClass}>Source</th>
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
                      <span className={statusBadgeClass(booking.source === 'manual' ? 'pending' : 'ok')}>
                        {booking.source === 'manual' ? 'Manual' : 'Online'}
                      </span>
                    </td>
                    <td className={tdClass}>
                      <span className={statusBadgeClass(isPending ? 'pending' : 'ok')}>
                        {isPending ? 'Pending' : 'Settled'}
                      </span>
                    </td>
                    <td className={tdClass}>
                      <div className="flex gap-2">
                        {booking.source === 'manual' && (
                          <button
                            type="button"
                            className="cursor-pointer rounded-[7px] border border-border bg-transparent px-2.5 py-1.5 text-[12.5px] font-semibold whitespace-nowrap text-text-h hover:border-accent-border hover:bg-accent-bg hover:text-accent"
                            onClick={() => setDetailsTarget(booking)}
                          >
                            Details
                          </button>
                        )}
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
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <FormModal isOpen={showCreate} title="Create a manual booking" onClose={closeCreate}>
        <form className="flex flex-col gap-3.5" onSubmit={handleCreateBooking}>
          <label className={labelClass}>
            <span>Tenant</span>
            <UserAutocomplete value={selectedTenant} onChange={setSelectedTenant} placeholder="Search tenants by name or email" />
          </label>
          <label className={labelClass}>
            <span>Listing</span>
            <select className={inputClass} value={pgId} onChange={(e) => handlePgChange(e.target.value)} required>
              <option value="">Select an approved listing</option>
              {listings.map((pg) => (
                <option key={pg._id} value={pg._id}>
                  {pg.name} · {pg.area} · {money(pg.price)}/mo
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            <span>Room</span>
            <select
              className={inputClass}
              value={roomId}
              onChange={(e) => handleRoomChange(e.target.value)}
              disabled={rooms.length === 0}
              required
            >
              <option value="">{rooms.length === 0 ? 'Select a listing first' : 'Select a room'}</option>
              {rooms.map((room) => (
                <option key={room._id} value={room._id}>
                  {room.roomNumber} · {room.sharingType} · {money(room.rentPerBed)}/bed
                </option>
              ))}
            </select>
          </label>
          {roomId && (
            <label className={labelClass}>
              <span>Check-in / check-out</span>
              <BookingDateRangePicker roomId={roomId} range={range} onRangeChange={handleRangeChange} />
            </label>
          )}
          <label className={labelClass}>
            <span>Amount charged (₹)</span>
            <input
              className={inputClass}
              type="number"
              min={0}
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              required
            />
          </label>
          <label className={labelClass}>
            <span>Tenant phone (optional)</span>
            <input
              className={inputClass}
              type="tel"
              value={extra.tenantPhone}
              onChange={(e) => setExtra((c) => ({ ...c, tenantPhone: e.target.value }))}
            />
          </label>
          <label className={labelClass}>
            <span>Security deposit (₹)</span>
            <input
              className={inputClass}
              type="number"
              min={0}
              value={extra.securityDeposit}
              onChange={(e) => setExtra((c) => ({ ...c, securityDeposit: e.target.value }))}
            />
          </label>
          <label className={labelClass}>
            <span>Payment mode</span>
            <select
              className={inputClass}
              value={extra.paymentMode}
              onChange={(e) => setExtra((c) => ({ ...c, paymentMode: e.target.value as PaymentMode }))}
            >
              {Object.entries(PAYMENT_MODE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            <span>ID proof document (optional, image or PDF)</span>
            <MediaUploader
              items={idProofItem ? [idProofItem] : []}
              onAdd={handleIdProofAdd}
              onRemove={handleIdProofRemove}
              accept={ID_PROOF_ACCEPT}
              maxItems={1}
              label="Upload"
            />
          </label>
          <label className={labelClass}>
            <span>Notes (optional)</span>
            <textarea
              className={cn(inputClass, 'resize-y [font-family:inherit]')}
              rows={3}
              value={extra.notes}
              onChange={(e) => setExtra((c) => ({ ...c, notes: e.target.value }))}
            />
          </label>

          {createError && (
            <p className={authAlertClass} role="alert">
              <AlertIcon />
              {createError}
            </p>
          )}

          <div className="mt-1 flex justify-end gap-2.5">
            <button
              type="button"
              className="cursor-pointer rounded-sm border border-border bg-transparent px-4 py-2 text-sm font-semibold text-text-h hover:bg-code-bg"
              onClick={closeCreate}
            >
              Cancel
            </button>
            <button className={cn(authSubmitClass, 'mt-0 w-auto px-4 py-2')} type="submit" disabled={creating}>
              {creating ? 'Creating...' : 'Create booking'}
            </button>
          </div>
        </form>
      </FormModal>

      <FormModal isOpen={detailsTarget !== null} title="Manual booking details" onClose={() => setDetailsTarget(null)}>
        {detailsTarget && (
          <div className="flex flex-col gap-2.5">
            <dl className="flex flex-col gap-2.5 text-[13.5px] text-text-h">
              {[
                ['Tenant phone', detailsTarget.tenantPhone],
                ['Check-in', new Date(detailsTarget.checkIn).toLocaleDateString('en-IN')],
                ['Check-out', new Date(detailsTarget.checkOut).toLocaleDateString('en-IN')],
                [
                  'Duration',
                  detailsTarget.durationUnit
                    ? `${detailsTarget.durationQuantity || 1} ${DURATION_UNIT_LABELS[detailsTarget.durationUnit].toLowerCase()}`
                    : undefined,
                ],
                ['Security deposit', detailsTarget.securityDeposit ? money(detailsTarget.securityDeposit) : undefined],
                ['Payment mode', detailsTarget.paymentMode ? PAYMENT_MODE_LABELS[detailsTarget.paymentMode] : undefined],
                ['Notes', detailsTarget.notes],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 border-b border-border pb-2">
                  <dt className="font-semibold text-text">{label}</dt>
                  <dd className="m-0 text-right">{value || '—'}</dd>
                </div>
              ))}
            </dl>
            <div className="flex items-center justify-between gap-4 pb-2">
              <span className="text-[13.5px] font-semibold text-text">ID proof document</span>
              {detailsTarget.idProofDocument ? (
                <a
                  href={detailsTarget.idProofDocument}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-accent-blue no-underline hover:underline"
                >
                  <FileIcon width={15} height={15} />
                  View document
                </a>
              ) : (
                <span className="text-[13.5px] text-text-h">—</span>
              )}
            </div>
          </div>
        )}
      </FormModal>
    </div>
  )
}
