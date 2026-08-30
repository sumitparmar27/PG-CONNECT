import { Link } from 'react-router-dom'
import type { Pg } from '../types/pg'
import { BedIcon, ImagePlaceholderIcon, PinIcon } from './icons'
import './PgCard.css'

export function PgCard({ pg }: { pg: Pg }) {
  const cover = pg.images[0]

  return (
    <Link to={`/properties/${pg._id}`} className="pg-card">
      <div className="pg-card__media">
        {cover ? (
          <img src={cover} alt={pg.name} loading="lazy" />
        ) : (
          <div className="pg-card__media-fallback">
            <ImagePlaceholderIcon />
          </div>
        )}
        <span className={`pg-card__status status-badge status-badge--${pg.status === 'available' ? 'ok' : 'off'}`}>
          {pg.status === 'available' ? 'Available' : 'Not available'}
        </span>
      </div>
      <div className="pg-card__body">
        <div className="pg-card__top">
          <h3>{pg.name}</h3>
          <span className="pg-card__type">{pg.type.name}</span>
        </div>
        <p className="pg-card__location">
          <PinIcon width={15} height={15} />
          {pg.area}
        </p>
        <div className="pg-card__meta">
          <span>
            <BedIcon width={15} height={15} />
            {pg.bed} bed{pg.bed === 1 ? '' : 's'}
          </span>
          {pg.sharing && <span>{pg.sharing}</span>}
        </div>
        <div className="pg-card__price">
          <b>₹{pg.price.toLocaleString('en-IN')}</b> / month
        </div>
      </div>
    </Link>
  )
}
