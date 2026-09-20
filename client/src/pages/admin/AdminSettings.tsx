import { useEffect, useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import { createPgTypeRequest, listPgTypesRequest } from '../../api/pg.api'
import type { PgType } from '../../types/pg'
import { PlusIcon } from '../../components/icons'
import { gridErrorClass, siteCtaClass, statusBadgeClass } from '../../lib/ui'

export function AdminSettings() {
  const [types, setTypes] = useState<PgType[]>([])
  const [newType, setNewType] = useState('')
  const [typeError, setTypeError] = useState('')
  const [addingType, setAddingType] = useState(false)

  function loadTypes() {
    listPgTypesRequest().then((data) => setTypes(data.types))
  }

  useEffect(loadTypes, [])

  async function handleAddType(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setTypeError('')
    if (!newType.trim()) return
    setAddingType(true)
    try {
      await createPgTypeRequest(newType.trim())
      setNewType('')
      loadTypes()
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined
      setTypeError(message || 'Could not add that PG type.')
    } finally {
      setAddingType(false)
    }
  }

  return (
    <div className="flex flex-col gap-7">
      <h1 className="m-0 text-[26px]">Settings</h1>

      <section className="flex flex-col gap-3">
        <h2 className="m-0 text-[17px]">PG types</h2>
        <div className="flex flex-wrap gap-2">
          {types.map((t) => (
            <span key={t._id} className={statusBadgeClass('pending')}>
              {t.name}
            </span>
          ))}
        </div>
        <form className="flex max-w-[420px] gap-2.5" onSubmit={handleAddType}>
          <input
            className="flex-1 rounded-sm border-[1.5px] border-border bg-code-bg px-3 py-2.5 text-sm text-text-h focus:border-accent focus:bg-bg focus:outline-none focus:ring-3 focus:ring-accent-bg"
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            placeholder="e.g. Co-living for students"
          />
          <button type="submit" className={siteCtaClass} disabled={addingType}>
            <PlusIcon width={16} height={16} />
            Add type
          </button>
        </form>
        {typeError && <p className={gridErrorClass}>{typeError}</p>}
      </section>
    </div>
  )
}
