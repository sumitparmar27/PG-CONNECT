import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { getPgRequest } from '../api/pg.api'
import { createBookingRequest, verifyBookingPaymentRequest } from '../api/booking.api'
import type { Pg } from '../types/pg'
import { useAuth } from '../hooks/useAuth'
import { BathIcon, BedIcon, CarIcon, CheckIcon, DoorIcon, PinIcon, SpinnerIcon } from '../components/icons'
import './PropertyDetails.css'

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

  if (loading) return <p className="details-state">Loading listing...</p>
  if (error || !pg) return <p className="details-state details-state--error">{error || 'Listing not found.'}</p>

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
        theme: { color: '#f15a29' },
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
    <div className="details-page">
      <div className="details-gallery">
        <div className="details-gallery__main">
          <img src={pg.images[activeImage]} alt={pg.name} />
          <span className={`pg-card__status status-badge status-badge--${pg.status === 'available' ? 'ok' : 'off'}`}>
            {pg.status === 'available' ? 'Available' : 'Not available'}
          </span>
        </div>
        {pg.images.length > 1 && (
          <div className="details-gallery__thumbs">
            {pg.images.map((src, i) => (
              <button
                key={src}
                type="button"
                className={i === activeImage ? 'active' : ''}
                onClick={() => setActiveImage(i)}
              >
                <img src={src} alt="" />
              </button>
            ))}
          </div>
        )}
        {pg.video && (
          <video className="details-gallery__video" src={pg.video} controls preload="metadata">
            <track kind="captions" />
          </video>
        )}
      </div>

      <div className="details-body">
        <div className="details-main">
          <div className="details-heading">
            <div>
              <span className="details-type">{pg.type.name}</span>
              <h1>{pg.name}</h1>
              <p className="details-location">
                <PinIcon width={16} height={16} />
                {pg.landmark ? `${pg.landmark}, ` : ''}
                {pg.area}
              </p>
            </div>
            {isOwner && (
              <Link to={`/dashboard/properties/${pg._id}/edit`} className="details-edit-link">
                Edit listing
              </Link>
            )}
          </div>

          <div className="details-facts">
            <span>
              <DoorIcon width={17} height={17} /> {pg.rooms} rooms
            </span>
            <span>
              <BedIcon width={17} height={17} /> {pg.bed} beds
            </span>
            <span>
              <BathIcon width={17} height={17} /> {pg.bathroom} bathrooms
            </span>
            <span>
              <CarIcon width={17} height={17} /> {pg.parking} parking
            </span>
            {pg.sharing && <span>{pg.sharing}</span>}
          </div>

          <section>
            <h2>About this PG</h2>
            <p className="details-description">{pg.description}</p>
          </section>

          {pg.facilities.length > 0 && (
            <section>
              <h2>Facilities</h2>
              <ul className="details-facilities">
                {pg.facilities.map((facility) => (
                  <li key={facility}>
                    <CheckIcon width={15} height={15} />
                    {facility}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2>Address</h2>
            <p className="details-description">
              {pg.address} — {pg.pincode}
            </p>
          </section>
        </div>

        <aside className="details-sidebar">
          <div className="details-price">
            <b>₹{pg.price.toLocaleString('en-IN')}</b>
            <span>/ month</span>
          </div>
          {bookingState === 'success' ? (
            <div className="details-booking-success">
              <CheckIcon width={18} height={18} />
              <div>
                <b>Booking confirmed</b>
                <p>
                  Check <Link to="/dashboard/bookings">My Bookings</Link> for details.
                </p>
              </div>
            </div>
          ) : (
            isOwner ? null : (
              <button
                type="button"
                className="details-book-btn"
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
            )
          )}
          {bookingError && (
            <p className="auth-alert" role="alert">
              {bookingError}
            </p>
          )}

          <div className="details-owner">
            <span className="details-owner__label">Listed by</span>
            <span className="details-owner__name">{pg.owner.name}</span>
            <a href={`mailto:${pg.owner.email}`} className="details-contact">
              Contact owner
            </a>
          </div>
        </aside>
      </div>
    </div>
  )
}
