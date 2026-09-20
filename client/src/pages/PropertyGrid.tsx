import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { listAreasRequest, listPgTypesRequest, listPgsRequest } from '../api/pg.api'
import type { Pg, PgType } from '../types/pg'
import { PgCard } from '../components/PgCard'
import { Pagination } from '../components/Pagination'
import { SearchIcon } from '../components/icons'
import { gridErrorClass } from '../lib/ui'

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

  const selectClass =
    'rounded-sm border-[1.5px] border-border bg-bg px-2.5 py-[9px] text-sm text-text-h focus:border-accent focus:outline-none focus:ring-3 focus:ring-accent-bg'

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="mb-1 text-[30px]">Find your next PG</h1>
        <p className="text-[14.5px] text-text">
          {result.total} verified listing{result.total === 1 ? '' : 's'} to browse
        </p>
      </div>

      <div className="flex flex-wrap gap-3.5 rounded border border-border bg-code-bg p-4">
        <label className="flex min-w-[180px] flex-col gap-[5px]">
          <span className="text-xs font-semibold tracking-[0.04em] text-text uppercase">Area</span>
          <select className={selectClass} value={area} onChange={(e) => updateFilter('area', e.target.value)}>
            <option value="">All areas</option>
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-[180px] flex-col gap-[5px]">
          <span className="text-xs font-semibold tracking-[0.04em] text-text uppercase">PG type</span>
          <select className={selectClass} value={type} onChange={(e) => updateFilter('type', e.target.value)}>
            <option value="">All types</option>
            {types.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-[180px] flex-col gap-[5px]">
          <span className="text-xs font-semibold tracking-[0.04em] text-text uppercase">Price</span>
          <select className={selectClass} value={priceIndex} onChange={(e) => updateFilter('priceIndex', e.target.value)}>
            {PRICE_RANGES.map((r, i) => (
              <option key={r.label} value={i}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <p className={gridErrorClass}>{error}</p>}

      {!loading && !error && result.items.length === 0 && (
        <div className="flex flex-col items-center gap-2.5 px-5 py-16 text-center text-text">
          <SearchIcon width={28} height={28} />
          <p>No PGs match those filters yet. Try widening your search.</p>
        </div>
      )}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3.7] animate-shimmer rounded bg-[linear-gradient(100deg,var(--code-bg)_30%,var(--border)_50%,var(--code-bg)_70%)] bg-[length:200%_100%] motion-reduce:animate-none"
              />
            ))
          : result.items.map((pg) => <PgCard key={pg._id} pg={pg} />)}
      </div>

      {!loading && result.pages > 1 && <Pagination page={page} pages={result.pages} onChange={goToPage} />}
    </div>
  )
}
