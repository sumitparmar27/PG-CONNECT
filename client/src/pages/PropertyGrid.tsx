import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { listAreasRequest, listPgTypesRequest, listPgsRequest } from '../api/pg.api'
import type { Pg, PgType } from '../types/pg'
import { PgCard } from '../components/PgCard'
import { ChevronLeftIcon, ChevronRightIcon, SearchIcon } from '../components/icons'
import './PropertyGrid.css'

const PRICE_RANGES = [
  { label: 'Any price', min: undefined, max: undefined },
  { label: 'Under ₹8,000', min: 0, max: 8000 },
  { label: '₹8,000 – ₹15,000', min: 8000, max: 15000 },
  { label: '₹15,000 – ₹25,000', min: 15000, max: 25000 },
  { label: 'Above ₹25,000', min: 25000, max: undefined },
]

export function PropertyGrid() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [areas, setAreas] = useState<string[]>([])
  const [types, setTypes] = useState<PgType[]>([])
  const [result, setResult] = useState<{ items: Pg[]; total: number; page: number; pages: number }>({
    items: [],
    total: 0,
    page: 1,
    pages: 1,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const area = searchParams.get('area') || ''
  const type = searchParams.get('type') || ''
  const priceIndex = Number(searchParams.get('priceIndex') || 0)
  const page = Number(searchParams.get('page') || 1)

  useEffect(() => {
    listAreasRequest().then((data) => setAreas(data.areas.filter(Boolean).sort()))
    listPgTypesRequest().then((data) => setTypes(data.types))
  }, [])

  useEffect(() => {
    setLoading(true)
    setError('')
    const range = PRICE_RANGES[priceIndex] || PRICE_RANGES[0]

    listPgsRequest({
      area: area || undefined,
      type: type || undefined,
      minPrice: range.min,
      maxPrice: range.max,
      page,
    })
      .then(setResult)
      .catch((err) => {
        const message = isAxiosError(err) ? err.response?.data?.message : undefined
        setError(message || 'Could not load listings right now.')
      })
      .finally(() => setLoading(false))
  }, [area, type, priceIndex, page])

  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    setSearchParams(next)
  }

  function goToPage(nextPage: number) {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(nextPage))
    setSearchParams(next)
  }

  return (
    <div className="grid-page">
      <div className="grid-page__head">
        <h1>Find your next PG</h1>
        <p>{result.total} verified listing{result.total === 1 ? '' : 's'} to browse</p>
      </div>

      <div className="grid-filters">
        <label className="grid-filter">
          <span>Area</span>
          <select value={area} onChange={(e) => updateFilter('area', e.target.value)}>
            <option value="">All areas</option>
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>

        <label className="grid-filter">
          <span>PG type</span>
          <select value={type} onChange={(e) => updateFilter('type', e.target.value)}>
            <option value="">All types</option>
            {types.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid-filter">
          <span>Price</span>
          <select value={priceIndex} onChange={(e) => updateFilter('priceIndex', e.target.value)}>
            {PRICE_RANGES.map((r, i) => (
              <option key={r.label} value={i}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <p className="grid-error">{error}</p>}

      {!loading && !error && result.items.length === 0 && (
        <div className="grid-empty">
          <SearchIcon width={28} height={28} />
          <p>No PGs match those filters yet. Try widening your search.</p>
        </div>
      )}

      <div className="grid-cards">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="pg-card-skeleton" />)
          : result.items.map((pg) => <PgCard key={pg._id} pg={pg} />)}
      </div>

      {!loading && result.pages > 1 && (
        <div className="grid-pagination">
          <button type="button" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
            <ChevronLeftIcon width={16} height={16} />
          </button>
          <span>
            Page {result.page} of {result.pages}
          </span>
          <button type="button" disabled={page >= result.pages} onClick={() => goToPage(page + 1)}>
            <ChevronRightIcon width={16} height={16} />
          </button>
        </div>
      )}
    </div>
  )
}
