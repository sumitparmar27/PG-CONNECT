import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { listListingsForModerationRequest, setListingModerationRequest } from '../../api/admin.api'
import type { ModerationStatus, Pg } from '../../types/pg'
import { Pagination } from '../../components/Pagination'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { CheckIcon, ImagePlaceholderIcon, XCircleIcon } from '../../components/icons'
import { gridErrorClass, statusBadgeClass } from '../../lib/ui'
import { cn } from '../../lib/utils'

const TABS: { label: string; value: ModerationStatus | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
]

const tabBtnClass = 'cursor-pointer rounded-full border border-border bg-transparent px-3.5 py-[7px] text-[13.5px] font-semibold text-text'
const tabBtnActiveClass = 'border-accent-border bg-accent-bg text-accent'
const rowBtnClass =
  'inline-flex cursor-pointer items-center gap-1.5 rounded-[7px] border border-border bg-transparent px-3 py-[7px] text-[12.5px] font-semibold whitespace-nowrap text-text-h not-disabled:hover:border-accent-border not-disabled:hover:bg-accent-bg not-disabled:hover:text-accent disabled:cursor-not-allowed disabled:opacity-40'
const rowBtnDangerClass =
  'not-disabled:hover:border-[#f3c3b2] not-disabled:hover:bg-[#fdeeea] not-disabled:hover:text-[#b3261e]'

function moderationBadgeVariant(status: ModerationStatus) {
  if (status === 'approved') return 'ok'
  if (status === 'rejected') return 'danger'
  return 'pending'
}

export function AdminListings() {
  const [searchParams, setSearchParams] = useSearchParams()
  const status = (searchParams.get('status') || '') as ModerationStatus | ''
  const page = Number(searchParams.get('page') || 1)

  const [items, setItems] = useState<Pg[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [rejectTarget, setRejectTarget] = useState<Pg | null>(null)

  function load() {
    listListingsForModerationRequest({ status: status || undefined, page })
      .then((data) => {
        setItems(data.items)
        setTotal(data.total)
        setPages(data.pages)
      })
      .catch((err) => {
        const message = isAxiosError(err) ? err.response?.data?.message : undefined
        setError(message || 'Could not load listings.')
      })
  }

  useEffect(load, [status, page])

  function setTab(next: ModerationStatus | '') {
    const params = new URLSearchParams(searchParams)
    if (next) params.set('status', next)
    else params.delete('status')
    params.delete('page')
    setSearchParams(params)
  }

  function goToPage(next: number) {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(next))
    setSearchParams(params)
  }

  async function applyModeration(pg: Pg, next: ModerationStatus) {
    setBusyId(pg._id)
    setError('')
    try {
      await setListingModerationRequest(pg._id, next)
      load()
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined
      setError(message || 'Could not update this listing.')
    } finally {
      setBusyId(null)
    }
  }

  function confirmReject() {
    if (!rejectTarget) return
    applyModeration(rejectTarget, 'rejected')
    setRejectTarget(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="m-0 text-[26px]">Listings</h1>
      <p className="m-0 text-[13.5px] text-text">
        {total} listing{total === 1 ? '' : 's'}
      </p>

      <div className="flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.label}
            type="button"
            className={cn(tabBtnClass, status === tab.value && tabBtnActiveClass)}
            onClick={() => setTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <p className={gridErrorClass}>{error}</p>}

      {items.length === 0 && !error && <p className="py-10 text-center text-text">No listings match this filter.</p>}

      <div className="flex flex-col gap-3">
        {items.map((pg) => (
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
                <span className={statusBadgeClass(moderationBadgeVariant(pg.moderationStatus))}>
                  {pg.moderationStatus}
                </span>
              </div>
              <p className="mt-1 text-[13px] text-text">
                {pg.area} · {pg.type.name} · ₹{pg.price.toLocaleString('en-IN')}/mo
              </p>
              <p className="mt-1 text-[13px] text-text opacity-85">
                Owner: {pg.owner.name} ({pg.owner.email})
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2">
              {pg.moderationStatus !== 'approved' && (
                <button
                  type="button"
                  className={rowBtnClass}
                  disabled={busyId === pg._id}
                  onClick={() => applyModeration(pg, 'approved')}
                >
                  <CheckIcon width={14} height={14} />
                  Approve
                </button>
              )}
              {pg.moderationStatus !== 'rejected' && (
                <button
                  type="button"
                  className={cn(rowBtnClass, rowBtnDangerClass)}
                  disabled={busyId === pg._id}
                  onClick={() => setRejectTarget(pg)}
                >
                  <XCircleIcon width={14} height={14} />
                  {pg.moderationStatus === 'approved' ? 'Unpublish' : 'Reject'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Pagination page={page} pages={pages} onChange={goToPage} />

      <ConfirmDialog
        isOpen={rejectTarget !== null}
        title={rejectTarget?.moderationStatus === 'approved' ? 'Unpublish this listing?' : 'Reject this listing?'}
        message={`"${rejectTarget?.name}" will be hidden from public search until it's approved again.`}
        confirmLabel={rejectTarget?.moderationStatus === 'approved' ? 'Unpublish' : 'Reject'}
        danger
        onConfirm={confirmReject}
        onCancel={() => setRejectTarget(null)}
      />
    </div>
  )
}
