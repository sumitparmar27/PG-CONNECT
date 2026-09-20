import { ChevronLeftIcon, ChevronRightIcon } from './icons'

const buttonClass =
  'inline-flex size-[34px] cursor-pointer items-center justify-center rounded-sm border border-border bg-transparent text-text disabled:cursor-not-allowed disabled:opacity-40 not-disabled:hover:border-accent-border not-disabled:hover:bg-accent-bg not-disabled:hover:text-accent'

interface PaginationProps {
  page: number
  pages: number
  onChange: (page: number) => void
}

export function Pagination({ page, pages, onChange }: PaginationProps) {
  if (pages <= 1) return null

  return (
    <div className="mt-2 flex items-center justify-center gap-3.5">
      <button type="button" className={buttonClass} disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronLeftIcon width={16} height={16} />
      </button>
      <span className="text-[13.5px] text-text">
        Page {page} of {pages}
      </span>
      <button type="button" className={buttonClass} disabled={page >= pages} onClick={() => onChange(page + 1)}>
        <ChevronRightIcon width={16} height={16} />
      </button>
    </div>
  )
}
