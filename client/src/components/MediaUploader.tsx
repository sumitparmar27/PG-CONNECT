import { useRef, type ChangeEvent } from 'react'
import { FileIcon, PlusIcon, XCircleIcon } from './icons'
import { cn } from '../lib/utils'

export interface MediaItem {
  id: string
  url: string
  name: string
  isImage: boolean
  /** Present for a newly picked, not-yet-uploaded file. Absent for a file that already exists on the server (its `url` is what should be retained). */
  file?: File
}

let mediaItemCounter = 0

export function nextMediaItemId() {
  mediaItemCounter += 1
  return `media-${Date.now()}-${mediaItemCounter}`
}

export function buildMediaItem(file: File): MediaItem {
  return {
    id: nextMediaItemId(),
    url: URL.createObjectURL(file),
    name: file.name,
    isImage: file.type.startsWith('image/'),
    file,
  }
}

export function buildExistingMediaItem(url: string): MediaItem {
  return {
    id: nextMediaItemId(),
    url,
    name: url.split('/').pop() || url,
    isImage: /\.(jpe?g|png|webp|gif)$/i.test(url),
  }
}

interface MediaUploaderProps {
  items: MediaItem[]
  onAdd: (files: File[]) => void
  onRemove: (id: string) => void
  accept: string
  multiple?: boolean
  maxItems?: number
  label: string
  tileClassName?: string
}

export function MediaUploader({
  items,
  onAdd,
  onRemove,
  accept,
  multiple = false,
  maxItems,
  label,
  tileClassName,
}: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const atLimit = maxItems !== undefined && items.length >= maxItems

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) onAdd(files)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="flex flex-wrap gap-3">
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            'relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-border bg-code-bg',
            tileClassName,
          )}
        >
          {item.isImage ? (
            <img src={item.url} alt={item.name} className="size-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-1 px-1.5 text-center">
              <FileIcon width={22} height={22} className="text-text" />
              <span className="w-full truncate text-[10.5px] font-medium text-text-h">{item.name}</span>
            </div>
          )}
          <button
            type="button"
            className="absolute top-1 right-1 inline-flex size-5 cursor-pointer items-center justify-center rounded-full bg-bg text-danger shadow-card hover:brightness-95"
            onClick={() => onRemove(item.id)}
            aria-label={`Remove ${item.name}`}
          >
            <XCircleIcon width={16} height={16} />
          </button>
        </div>
      ))}

      {!atLimit && (
        <label
          className={cn(
            'flex h-24 w-24 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-sm border-[1.5px] border-dashed border-border text-text hover:border-accent-border hover:text-accent',
            tileClassName,
          )}
        >
          <PlusIcon width={18} height={18} />
          <span className="px-1 text-center text-[11px] font-semibold">{label}</span>
          <input ref={inputRef} className="hidden" type="file" accept={accept} multiple={multiple} onChange={handleChange} />
        </label>
      )}
    </div>
  )
}
