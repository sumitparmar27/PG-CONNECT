import type { PgFormValues, PgType } from '../types/pg'
import { FACILITIES } from '../constants/facilities'
import { cn } from '../lib/utils'

export const rowClass = 'flex gap-3.5 max-[620px]:flex-col'
export const labelClass = 'flex flex-1 flex-col gap-1.5 text-[13px] font-semibold text-text-h'
export const inputClass =
  'rounded-sm border-[1.5px] border-border bg-code-bg px-3 py-2.5 text-[14.5px] font-normal text-text-h focus:border-accent focus:bg-bg focus:ring-3 focus:ring-accent-bg focus:outline-none'

export const EMPTY_PG_FORM: PgFormValues = {
  name: '',
  type: '',
  sharing: '',
  area: '',
  landmark: '',
  address: '',
  pincode: '',
  price: '',
  dailyRate: '',
  weeklyRate: '',
  status: 'available',
  description: '',
  bed: '',
  bathroom: '',
  kitchen: '',
  balcony: '',
  parking: '',
  facilities: [],
}

export const NUMBER_FIELDS = ['bed', 'bathroom', 'kitchen', 'balcony', 'parking'] as const

interface FieldsProps {
  form: PgFormValues
  setField: <K extends keyof PgFormValues>(key: K, value: PgFormValues[K]) => void
}

export function isBasicsStepValid(form: PgFormValues) {
  return form.name.trim() !== '' && form.type !== '' && form.description.trim() !== ''
}

export function BasicsFields({ types, form, setField }: FieldsProps & { types: PgType[] }) {
  return (
    <fieldset className="flex flex-col gap-3.5 rounded border border-border pt-[18px] px-5 pb-5">
      <legend className="px-1.5 text-[13px] font-bold tracking-[0.05em] text-text uppercase">Basics</legend>
      <div className={rowClass}>
        <label className={labelClass}>
          <span>Property name</span>
          <input className={inputClass} value={form.name} onChange={(e) => setField('name', e.target.value)} required />
        </label>
        <label className={labelClass}>
          <span>PG type</span>
          <select className={inputClass} value={form.type} onChange={(e) => setField('type', e.target.value)} required>
            <option value="">Select a type</option>
            {types.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className={rowClass}>
        <label className={labelClass}>
          <span>Sharing (optional)</span>
          <input
            className={inputClass}
            value={form.sharing}
            onChange={(e) => setField('sharing', e.target.value)}
            placeholder="e.g. 2 sharing"
          />
        </label>
        <label className={labelClass}>
          <span>Status</span>
          <select
            className={inputClass}
            value={form.status}
            onChange={(e) => setField('status', e.target.value as PgFormValues['status'])}
          >
            <option value="available">Available</option>
            <option value="not available">Not available</option>
          </select>
        </label>
      </div>
      <label className={labelClass}>
        <span>Description</span>
        <textarea
          className={cn(inputClass, 'resize-y [font-family:inherit]')}
          rows={4}
          value={form.description}
          onChange={(e) => setField('description', e.target.value)}
          required
        />
      </label>
    </fieldset>
  )
}

export function isLocationStepValid(form: PgFormValues) {
  return form.area.trim() !== '' && form.address.trim() !== '' && form.pincode.trim() !== ''
}

export function LocationFields({ form, setField }: FieldsProps) {
  return (
    <fieldset className="flex flex-col gap-3.5 rounded border border-border pt-[18px] px-5 pb-5">
      <legend className="px-1.5 text-[13px] font-bold tracking-[0.05em] text-text uppercase">Location</legend>
      <div className={rowClass}>
        <label className={labelClass}>
          <span>Area / locality</span>
          <input className={inputClass} value={form.area} onChange={(e) => setField('area', e.target.value)} required />
        </label>
        <label className={labelClass}>
          <span>Landmark (optional)</span>
          <input className={inputClass} value={form.landmark} onChange={(e) => setField('landmark', e.target.value)} />
        </label>
      </div>
      <div className={rowClass}>
        <label className={cn(labelClass, 'flex-[2]')}>
          <span>Full address</span>
          <input className={inputClass} value={form.address} onChange={(e) => setField('address', e.target.value)} required />
        </label>
        <label className={labelClass}>
          <span>Pincode</span>
          <input className={inputClass} value={form.pincode} onChange={(e) => setField('pincode', e.target.value)} required />
        </label>
      </div>
    </fieldset>
  )
}

export function isPricingStepValid(form: PgFormValues) {
  return (
    form.price.trim() !== '' &&
    NUMBER_FIELDS.every((key) => form[key].trim() !== '')
  )
}

export function PricingFields({ form, setField }: FieldsProps) {
  return (
    <fieldset className="flex flex-col gap-3.5 rounded border border-border pt-[18px] px-5 pb-5">
      <legend className="px-1.5 text-[13px] font-bold tracking-[0.05em] text-text uppercase">Capacity &amp; pricing</legend>
      <div className={rowClass}>
        <label className={labelClass}>
          <span>Rent (₹ / month)</span>
          <input
            className={inputClass}
            type="number"
            min={0}
            value={form.price}
            onChange={(e) => setField('price', e.target.value)}
            required
          />
        </label>
        <label className={labelClass}>
          <span>Daily rate (₹, optional)</span>
          <input
            className={inputClass}
            type="number"
            min={0}
            value={form.dailyRate}
            onChange={(e) => setField('dailyRate', e.target.value)}
            placeholder="For short stays"
          />
        </label>
        <label className={labelClass}>
          <span>Weekly rate (₹, optional)</span>
          <input
            className={inputClass}
            type="number"
            min={0}
            value={form.weeklyRate}
            onChange={(e) => setField('weeklyRate', e.target.value)}
            placeholder="For short stays"
          />
        </label>
      </div>
      <div className={cn(rowClass, 'flex-wrap')}>
        {NUMBER_FIELDS.map((key) => (
          <label key={key} className={cn(labelClass, 'min-w-[90px]')}>
            <span style={{ textTransform: 'capitalize' }}>{key}</span>
            <input
              className={inputClass}
              type="number"
              min={0}
              value={form[key]}
              onChange={(e) => setField(key, e.target.value)}
              required
            />
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function FacilitiesFields({ form, toggleFacility }: { form: PgFormValues; toggleFacility: (facility: string) => void }) {
  return (
    <fieldset className="flex flex-col gap-3.5 rounded border border-border pt-[18px] px-5 pb-5">
      <legend className="px-1.5 text-[13px] font-bold tracking-[0.05em] text-text uppercase">Facilities</legend>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2.5">
        {FACILITIES.map((facility) => (
          <label key={facility} className={cn(labelClass, 'flex-row items-center gap-2 font-medium cursor-pointer')}>
            <input
              className="size-4 p-0 accent-accent"
              type="checkbox"
              checked={form.facilities.includes(facility)}
              onChange={() => toggleFacility(facility)}
            />
            {facility}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
