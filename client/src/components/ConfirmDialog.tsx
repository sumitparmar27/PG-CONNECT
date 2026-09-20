import { cn } from '../lib/utils'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(3,26,38,0.45)] p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-[380px] rounded border border-border bg-bg p-6 text-left shadow-card"
        role="alertdialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-2 font-heading text-[17px] text-text-h">{title}</h3>
        <p className="m-0 text-sm text-text">{message}</p>
        <div className="mt-6 flex justify-end gap-2.5">
          <button
            type="button"
            className="cursor-pointer rounded-sm border border-border bg-transparent px-4 py-2 text-sm font-semibold text-text-h hover:bg-code-bg"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className={cn(
              'cursor-pointer rounded-sm border border-transparent bg-accent-blue px-4 py-2 text-sm font-semibold text-white hover:brightness-[1.08]',
              danger && 'bg-[#b3261e]',
            )}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
