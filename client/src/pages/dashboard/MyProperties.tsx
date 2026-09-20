import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { deletePgRequest, listMyPgsRequest } from '../../api/pg.api'
import type { Pg } from '../../types/pg'
import { EditIcon, ImagePlaceholderIcon, PlusIcon, TrashIcon } from '../../components/icons'
import { gridErrorClass, siteCtaClass, siteIconBtnClass, statusBadgeClass } from '../../lib/ui'
import { cn } from '../../lib/utils'

export function MyProperties() {
  const [pgs, setPgs] = useState<Pg[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function load() {
    setLoading(true)
    listMyPgsRequest()
      .then((data) => setPgs(data.pgs))
      .catch((err) => {
        const message = isAxiosError(err) ? err.response?.data?.message : undefined
        setError(message || 'Could not load your properties.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function handleDelete(pg: Pg) {
    if (!window.confirm(`Delete "${pg.name}"? This can't be undone.`)) return
    setDeletingId(pg._id)
    try {
      await deletePgRequest(pg._id)
      setPgs((current) => current.filter((item) => item._id !== pg._id))
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined
      setError(message || 'Could not delete this listing.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-[22px]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-[26px]">My properties</h1>
          <p className="m-0 text-sm text-text">
            {pgs.length} listing{pgs.length === 1 ? '' : 's'} under your account
          </p>
        </div>
        <Link to="/dashboard/properties/new" className={siteCtaClass}>
          <PlusIcon width={16} height={16} />
          Add property
        </Link>
      </div>

      {error && <p className={gridErrorClass}>{error}</p>}

      {!loading && pgs.length === 0 && !error && (
        <div className="flex flex-col items-center gap-4 rounded border border-dashed border-border px-5 py-14 text-text">
          <p>You haven't listed a PG yet.</p>
          <Link to="/dashboard/properties/new" className={siteCtaClass}>
            <PlusIcon width={16} height={16} />
            List your first property
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {pgs.map((pg) => (
          <div className="flex items-center gap-4 rounded border border-border p-3" key={pg._id}>
            <div className="flex h-16 w-[84px] shrink-0 items-center justify-center overflow-hidden rounded-sm bg-code-bg text-text opacity-90">
              {pg.images[0] ? (
                <img src={pg.images[0]} alt={pg.name} className="size-full object-cover" />
              ) : (
                <ImagePlaceholderIcon />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5">
                <h3 className="m-0 truncate font-heading text-[15.5px] text-text-h">{pg.name}</h3>
                <span className={statusBadgeClass(pg.status === 'available' ? 'ok' : 'off')}>
                  {pg.status === 'available' ? 'Available' : 'Not available'}
                </span>
                {pg.moderationStatus !== 'approved' && (
                  <span className={statusBadgeClass(pg.moderationStatus === 'pending' ? 'pending' : 'danger')}>
                    {pg.moderationStatus === 'pending' ? 'Pending review' : 'Rejected'}
                  </span>
                )}
              </div>
              <p className="mt-1 text-[13px] text-text">
                {pg.area} · {pg.type.name} · ₹{pg.price.toLocaleString('en-IN')}/mo
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link to={`/properties/${pg._id}`} className="px-1 py-2 text-[13.5px] font-semibold text-accent-blue no-underline">
                View
              </Link>
              <Link to={`/dashboard/properties/${pg._id}/edit`} className={siteIconBtnClass} aria-label="Edit">
                <EditIcon width={17} height={17} />
              </Link>
              <button
                type="button"
                className={cn(siteIconBtnClass, 'hover:border-[#f3c3b2] hover:bg-danger-bg hover:text-[#b3261e]')}
                onClick={() => handleDelete(pg)}
                disabled={deletingId === pg._id}
                aria-label="Delete"
              >
                <TrashIcon width={17} height={17} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
