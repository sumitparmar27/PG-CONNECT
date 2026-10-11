import { useEffect, useRef, useState } from 'react'
import { listUsersRequest } from '../api/admin.api'
import type { AdminUser } from '../types/user'
import { inputClass } from './PgFormFields'

export interface MinimalUser {
  _id: string
  name: string
  email: string
}

interface UserAutocompleteProps {
  value: MinimalUser | null
  onChange: (user: MinimalUser | null) => void
  placeholder?: string
  roleFilter?: string
}

export function UserAutocomplete({ value, onChange, placeholder, roleFilter }: UserAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<AdminUser[]>([])
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    const handle = setTimeout(() => {
      listUsersRequest({ q: query, role: roleFilter, page: 1 })
        .then((data) => setResults(data.items))
        .catch(() => setResults([]))
    }, 250)
    return () => clearTimeout(handle)
  }, [query, roleFilter])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (value) {
    return (
      <div className="flex items-center gap-2">
        <span className={`${inputClass} flex-1`}>
          {value.name} ({value.email})
        </span>
        <button
          type="button"
          className="cursor-pointer rounded-sm border border-border bg-transparent px-2.5 py-2 text-[12.5px] font-semibold text-text-h hover:bg-code-bg"
          onClick={() => onChange(null)}
        >
          Change
        </button>
      </div>
    )
  }

  return (
    <div className="relative" ref={boxRef}>
      <input
        className={`${inputClass} w-full`}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder || 'Search by name or email'}
      />
      {open && results.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-sm border border-border bg-bg shadow-card">
          {results.map((u) => (
            <li key={u._id}>
              <button
                type="button"
                className="block w-full cursor-pointer px-3 py-2 text-left text-[13.5px] text-text-h hover:bg-code-bg"
                onClick={() => {
                  onChange(u)
                  setQuery('')
                  setResults([])
                  setOpen(false)
                }}
              >
                {u.name} <span className="text-text opacity-80">({u.email})</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
