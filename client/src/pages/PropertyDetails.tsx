import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { getPgRequest } from '../api/pg.api'
import { createBookingRequest, verifyBookingPaymentRequest } from '../api/booking.api'
import type { Pg } from '../types/pg'
import { useAuth } from '../hooks/useAuth'
import { BathIcon, BedIcon, CarIcon, CheckIcon, DoorIcon, PinIcon, SpinnerIcon } from '../components/icons'
import { authAlertClass, statusBadgeClass } from '../lib/ui'
import { cn } from '../lib/utils'

type BookingState = 'idle' | 'processing' | 'success'

export function PropertyDetails() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [pg, setPg] = useState<Pg | null>(null)
  const [activeImage, setActiveImage] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [bookingState, setBookingState] = useState<BookingState>('idle')
  const [bookingError, setBookingError] = useState('')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getPgRequest(id)
      .then((data) => {
        setPg(data.pg)
        setActiveImage(0)
      })
      .catch((err) => {
        const message = isAxiosError(err) ? err.response?.data?.message : undefined
        setError(message || 'This listing could not be found.')
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <p className="py-20 text-center text-text">Loading listing...</p>
  if (error || !pg) return <p className="py-20 text-center text-danger">{error || 'Listing not found.'}</p>

  const isOwner = user?._id === pg.owner._id

  async function handleBookNow() {
    if (!pg) return
    if (!user) {
      navigate('/login')
      return
    }

    setBookingError('')
    setBookingState('processing')
    try {
      const { booking, razorpayOrder, razorpayKeyId } = await createBookingRequest(pg._id)

      const checkout = new window.Razorpay({
        key: razorpayKeyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'PG Connect',
        description: pg.name,
        order_id: razorpayOrder.id,
        prefill: { name: user.name, email: user.email },
        theme: { color: '#0f5a8c' },
        handler: async (response) => {
          try {
            await verifyBookingPaymentRequest(booking._id, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })
            setBookingState('success')
          } catch (err) {
            const message = isAxiosError(err) ? err.response?.data?.message : undefined
            setBookingError(message || 'Payment succeeded but verification failed. Contact support.')
            setBookingState('idle')
          }
        },
        modal: { ondismiss: () => setBookingState('idle') },
      })
      checkout.open()
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined
      setBookingError(message || 'Could not start the booking. Try again.')
      setBookingState('idle')
    }
  }

  return (
    <div className="flex flex-col gap-7">
      <div>
        <div className="relative aspect-[16/8] overflow-hidden rounded-[14px] bg-code-bg">
          <img src={pg.images[activeImage]} alt={pg.name} className="block h-full w-full object-cover" />
          <span className={statusBadgeClass(pg.status === 'available' ? 'ok' : 'off', 'absolute top-[10px] left-[10px]')}>
            {pg.status === 'available' ? 'Available' : 'Not available'}
          </span>
        </div>
        {pg.images.length > 1 && (
          <div className="mt-2.5 flex gap-2.5 overflow-x-auto">
            {pg.images.map((src, i) => (
              <button
                key={src}
                type="button"
                className={cn(
                  'h-16 w-[84px] shrink-0 cursor-pointer overflow-hidden rounded-sm border-2 border-transparent bg-none p-0',
                  i === activeImage && 'border-accent',
                )}
                onClick={() => setActiveImage(i)}
              >
                <img src={src} alt="" className="block h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
        {pg.video && (
          <video className="mt-3.5 max-h-[420px] w-full rounded bg-black" src={pg.video} controls preload="metadata">
            <track kind="captions" />
          </video>
        )}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_280px] items-start gap-8 max-[860px]:grid-cols-1">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="mb-2 inline-block rounded-full bg-accent-blue-bg px-[9px] py-[3px] text-xs font-semibold text-accent-blue">
                {pg.type.name}
              </span>
              <h1 className="mb-1.5 text-[26px]">{pg.name}</h1>
              <p className="m-0 flex items-center gap-1.5 text-[14.5px] text-text">
                <PinIcon width={16} height={16} />
                {pg.landmark ? `${pg.landmark}, ` : ''}
                {pg.area}
              </p>
            </div>
            {isOwner && (
              <Link
                to={`/dashboard/properties/${pg._id}/edit`}
                className="shrink-0 rounded-sm border border-accent-border bg-accent-bg px-3 py-2 text-[13.5px] font-semibold whitespace-nowrap text-accent no-underline"
              >
                Edit listing
              </Link>
            )}
          </div>

          <div className="my-5 flex flex-wrap gap-x-[22px] gap-y-2.5 border-t border-b border-border py-4">
            <span className="inline-flex items-center gap-1.5 text-sm text-text-h">
              <DoorIcon width={17} height={17} /> {pg.rooms} rooms
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-text-h">
              <BedIcon width={17} height={17} /> {pg.bed} beds
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-text-h">
              <BathIcon width={17} height={17} /> {pg.bathroom} bathrooms
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-text-h">
              <CarIcon width={17} height={17} /> {pg.parking} parking
            </span>
            {pg.sharing && <span className="inline-flex items-center gap-1.5 text-sm text-text-h">{pg.sharing}</span>}
          </div>

          <section className="mt-[26px]">
            <h2 className="mb-2.5 text-[17px]">About this PG</h2>
            <p className="text-[14.5px] leading-[1.65] whitespace-pre-line text-text">{pg.description}</p>
          </section>

          {pg.facilities.length > 0 && (
            <section className="mt-[26px]">
              <h2 className="mb-2.5 text-[17px]">Facilities</h2>
              <ul className="m-0 grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2.5 list-none p-0">
                {pg.facilities.map((facility) => (
                  <li key={facility} className="flex items-center gap-2 text-sm text-text-h">
                    <CheckIcon width={15} height={15} className="shrink-0 text-accent" />
                    {facility}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-[26px]">
            <h2 className="mb-2.5 text-[17px]">Address</h2>
            <p className="text-[14.5px] leading-[1.65] whitespace-pre-line text-text">
              {pg.address} — {pg.pincode}
            </p>
          </section>
        </div>

        <aside className="sticky top-[90px] flex flex-col gap-4 rounded border border-border bg-code-bg p-5 max-[860px]:static">
          <div className="flex items-baseline gap-1.5">
            <b className="text-[26px] text-text-h">₹{pg.price.toLocaleString('en-IN')}</b>
            <span className="text-sm text-text">/ month</span>
          </div>
          {bookingState === 'success' ? (
            <div className="flex items-start gap-2.5 rounded-[10px] bg-success-bg px-3.5 py-3 text-success">
              <CheckIcon width={18} height={18} />
              <div>
                <b className="block text-[14.5px]">Booking confirmed</b>
                <p className="mt-0.5 text-[13px] text-inherit">
                  Check <Link to="/dashboard/bookings" className="font-semibold text-inherit">My Bookings</Link> for details.
                </p>
              </div>
            </div>
          ) : isOwner ? null : (
            <button
              type="button"
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded border-none bg-accent px-4 py-[13px] text-[15px] font-semibold text-white not-disabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-55"
              onClick={handleBookNow}
              disabled={pg.status !== 'available' || bookingState === 'processing'}
            >
              {bookingState === 'processing' && <SpinnerIcon width={16} height={16} />}
              {pg.status !== 'available'
                ? 'Not available'
                : bookingState === 'processing'
                  ? 'Opening checkout...'
                  : `Book now — pay ₹${pg.price.toLocaleString('en-IN')}`}
            </button>
          )}
          {bookingError && (
            <p className={authAlertClass} role="alert">
              {bookingError}
            </p>
          )}

          <div className="flex flex-col gap-1 border-t border-border pt-3">
            <span className="text-xs tracking-[0.04em] text-text uppercase">Listed by</span>
            <span className="text-[15px] font-semibold text-text-h">{pg.owner.name}</span>
            <a
              href={`mailto:${pg.owner.email}`}
              className="mt-2 inline-flex justify-center rounded-sm border-[1.5px] border-border px-3.5 py-[9px] text-sm font-semibold text-text-h no-underline hover:border-accent-border hover:text-accent"
            >
              Contact owner
            </a>
          </div>
        </aside>
      </div>
    </div>
  )
}
