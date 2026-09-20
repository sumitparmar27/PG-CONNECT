import { Link } from 'react-router-dom'
import type { Pg } from '../types/pg'
import { BedIcon, ImagePlaceholderIcon, PinIcon } from './icons'
import { statusBadgeClass } from '../lib/ui'

export function PgCard({ pg }: { pg: Pg }) {
  const cover = pg.images[0]

  return (
    <Link
      to={`/properties/${pg._id}`}
      className="flex flex-col overflow-hidden rounded border border-border bg-bg text-inherit no-underline transition-[box-shadow,border-color] duration-200 hover:border-accent-border hover:shadow-card"
    >
      <div className="relative aspect-[4/3] bg-code-bg">
        {cover ? (
          <img src={cover} alt={pg.name} loading="lazy" className="block size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-text opacity-50">
            <ImagePlaceholderIcon />
          </div>
        )}
        <span className={statusBadgeClass(pg.status === 'available' ? 'ok' : 'off', 'absolute top-[10px] left-[10px]')}>
          {pg.status === 'available' ? 'Available' : 'Not available'}
        </span>
      </div>
      <div className="flex flex-col gap-2 px-4 pt-3.5 pb-4 text-left">
        <div className="flex items-start justify-between gap-2">
          <h3 className="m-0 font-heading text-base font-semibold text-text-h">{pg.name}</h3>
          <span className="shrink-0 rounded-full bg-accent-blue-bg px-2 py-[3px] text-[11.5px] font-semibold whitespace-nowrap text-accent-blue">
            {pg.type.name}
          </span>
        </div>
        <p className="m-0 flex items-center gap-[5px] text-[13px] text-text">
          <PinIcon width={15} height={15} />
          {pg.area}
        </p>
        <div className="flex gap-3.5 text-[13px] text-text">
          <span className="inline-flex items-center gap-1">
            <BedIcon width={15} height={15} />
            {pg.bed} bed{pg.bed === 1 ? '' : 's'}
          </span>
          {pg.sharing && <span className="inline-flex items-center gap-1">{pg.sharing}</span>}
        </div>
        <div className="mt-1 text-sm text-text">
          <b className="text-[17px] text-text-h">₹{pg.price.toLocaleString('en-IN')}</b> / month
        </div>
      </div>
    </Link>
  )
}
