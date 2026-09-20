import { cn } from './utils'

export type StatusTone = 'ok' | 'off' | 'pending' | 'danger'

const STATUS_TONE_CLASSES: Record<StatusTone, string> = {
  ok: 'text-success bg-success-bg',
  off: 'text-danger bg-danger-bg',
  pending: 'text-warning bg-warning-bg',
  danger: 'text-danger bg-danger-bg',
}

export function statusBadgeClass(tone: StatusTone, className?: string) {
  return cn(
    'inline-flex items-center whitespace-nowrap rounded-full px-[9px] py-1 text-[11.5px] font-bold uppercase tracking-[0.04em]',
    STATUS_TONE_CLASSES[tone],
    className,
  )
}

export const gridErrorClass = 'rounded-[10px] border border-[#f3c3b2] bg-danger-bg px-3.5 py-2.5 text-sm text-danger'

export const siteCtaClass =
  'inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm bg-accent px-3.5 py-2 text-[14.5px] font-semibold text-white hover:brightness-105'

export const siteIconBtnClass =
  'inline-flex h-9 w-9 items-center justify-center rounded-sm border border-border bg-transparent text-text hover:border-accent-border hover:bg-accent-bg hover:text-accent'

export function navLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    'border-b-2 border-transparent px-0.5 py-1.5 text-[14.5px] font-medium text-text no-underline hover:text-text-h',
    isActive && 'border-b-accent text-text-h',
  )
}

export const tableWrapClass = 'overflow-x-auto rounded border border-border'
export const tableClass = 'w-full border-collapse text-[13.5px]'
export const thClass =
  'border-b border-border px-3.5 py-2.5 text-left text-[11px] font-semibold tracking-[0.05em] whitespace-nowrap text-text uppercase'
export const tdClass = 'border-b border-border px-3.5 py-2.5 text-left whitespace-nowrap text-text-h [font-variant-numeric:tabular-nums]'

export const authSubmitClass =
  'mt-1 box-border flex w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] border-none bg-accent px-4 py-[13px] text-[15px] font-semibold text-white transition-[filter,transform,opacity] duration-200 not-disabled:hover:brightness-[1.06] not-disabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-75'

export const authAlertClass =
  'flex items-start gap-2 rounded-[10px] border border-[rgba(220,38,38,0.25)] bg-[rgba(220,38,38,0.08)] px-3 py-2.5 text-[13.5px] leading-[1.4] text-[#dc2626] [&>svg]:mt-px [&>svg]:shrink-0'

export const authFieldClass = 'flex flex-col gap-1.5'
export const authFieldLabelClass = 'text-[13px] font-semibold text-text-h'
export const authInputWrapClass = 'relative flex items-center'
export const authInputIconClass = 'absolute left-3.5 text-text pointer-events-none'
export const authInputClass =
  'w-full box-border rounded py-3 pr-3.5 pl-[42px] text-[15px] text-text-h bg-code-bg border-[1.5px] border-border transition-[border-color,background,box-shadow] duration-200 placeholder:text-text placeholder:opacity-60 focus:outline-none focus:bg-bg focus:border-accent focus:ring-3 focus:ring-accent-bg'
export const authInputToggleClass =
  'absolute right-2.5 inline-flex h-[30px] w-[30px] items-center justify-center rounded-[7px] border-none bg-transparent text-text cursor-pointer hover:bg-accent-bg hover:text-accent'

export const tileClass = 'flex flex-col gap-1.5 rounded border border-border bg-bg px-[18px] py-4'
export const tileLabelClass = 'text-xs uppercase tracking-[0.04em] text-text'
export const tileAccentClass = 'border-accent-border bg-accent-bg'
