import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { deletePgRequest, listMyPgsRequest } from '../../api/pg.api'
import type { Pg } from '../../types/pg'
import { EditIcon, ImagePlaceholderIcon, PlusIcon, TrashIcon } from '../../components/icons'
import './MyProperties.css'

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
    <div className="my-pgs">
      <div className="my-pgs__head">
        <div>
          <h1>My properties</h1>
          <p>{pgs.length} listing{pgs.length === 1 ? '' : 's'} under your account</p>
        </div>
        <Link to="/dashboard/properties/new" className="site-cta">
          <PlusIcon width={16} height={16} />
          Add property
        </Link>
      </div>

      {error && <p className="grid-error">{error}</p>}

      {!loading && pgs.length === 0 && !error && (
        <div className="my-pgs__empty">
          <p>You haven't listed a PG yet.</p>
          <Link to="/dashboard/properties/new" className="site-cta">
            <PlusIcon width={16} height={16} />
            List your first property
          </Link>
        </div>
      )}

      <div className="my-pgs__list">
        {pgs.map((pg) => (
          <div className="my-pg-row" key={pg._id}>
            <div className="my-pg-row__media">
              {pg.images[0] ? <img src={pg.images[0]} alt={pg.name} /> : <ImagePlaceholderIcon />}
            </div>
            <div className="my-pg-row__body">
              <div className="my-pg-row__top">
                <h3>{pg.name}</h3>
                <span className={`status-badge status-badge--${pg.status === 'available' ? 'ok' : 'off'}`}>
                  {pg.status === 'available' ? 'Available' : 'Not available'}
                </span>
              </div>
              <p>
                {pg.area} · {pg.type.name} · ₹{pg.price.toLocaleString('en-IN')}/mo
              </p>
            </div>
            <div className="my-pg-row__actions">
              <Link to={`/properties/${pg._id}`} className="my-pg-row__link">
                View
              </Link>
              <Link to={`/dashboard/properties/${pg._id}/edit`} className="site-icon-btn" aria-label="Edit">
                <EditIcon width={17} height={17} />
              </Link>
              <button
                type="button"
                className="site-icon-btn my-pg-row__delete"
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
