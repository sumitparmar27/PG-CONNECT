import type { ReactNode } from 'react'

interface FormModalProps {
  isOpen: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

export function FormModal({ isOpen, title, onClose, children }: FormModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(3,26,38,0.45)] p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-[480px] overflow-auto rounded border border-border bg-bg p-6 text-left shadow-card"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 font-heading text-[17px] text-text-h">{title}</h3>
        {children}
      </div>
    </div>
  )
}
