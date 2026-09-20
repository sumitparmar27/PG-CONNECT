import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { createPgRequest, getPgRequest, listPgTypesRequest, updatePgRequest } from '../../api/pg.api'
import type { PgFormValues, PgType } from '../../types/pg'
import { FACILITIES } from '../../constants/facilities'
import { useAuth } from '../../hooks/useAuth'
import { AlertIcon, SpinnerIcon } from '../../components/icons'
import { authAlertClass, authSubmitClass } from '../../lib/ui'
import { cn } from '../../lib/utils'

const rowClass = 'flex gap-3.5 max-[620px]:flex-col'
const labelClass = 'flex flex-1 flex-col gap-1.5 text-[13px] font-semibold text-text-h'
const inputClass =
  'rounded-sm border-[1.5px] border-border bg-code-bg px-3 py-2.5 text-[14.5px] font-normal text-text-h focus:border-accent focus:bg-bg focus:ring-3 focus:ring-accent-bg focus:outline-none'

const EMPTY_FORM: PgFormValues = {
  name: '',
  type: '',
  sharing: '',
  area: '',
  landmark: '',
  address: '',
  pincode: '',
  price: '',
  status: 'available',
  description: '',
  rooms: '',
  bed: '',
  bathroom: '',
  kitchen: '',
  balcony: '',
  parking: '',
  facilities: [],
}

const NUMBER_FIELDS = ['rooms', 'bed', 'bathroom', 'kitchen', 'balcony', 'parking'] as const

export function PgForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { user } = useAuth()

  const [types, setTypes] = useState<PgType[]>([])
  const [form, setForm] = useState<PgFormValues>(EMPTY_FORM)
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [existingVideo, setExistingVideo] = useState('')
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    listPgTypesRequest().then((data) => setTypes(data.types))
  }, [])

  useEffect(() => {
    if (!id) return
    getPgRequest(id)
      .then(({ pg }) => {
        if (user && pg.owner._id !== user._id) {
          setError('You do not own this listing.')
          return
        }
        setForm({
          name: pg.name,
          type: pg.type._id,
          sharing: pg.sharing || '',
          area: pg.area,
          landmark: pg.landmark || '',
          address: pg.address,
          pincode: pg.pincode,
          price: String(pg.price),
          status: pg.status,
          description: pg.description,
          rooms: String(pg.rooms),
          bed: String(pg.bed),
          bathroom: String(pg.bathroom),
          kitchen: String(pg.kitchen),
          balcony: String(pg.balcony),
          parking: String(pg.parking),
          facilities: pg.facilities,
        })
        setExistingImages(pg.images)
        setExistingVideo(pg.video || '')
      })
      .catch((err) => {
        const message = isAxiosError(err) ? err.response?.data?.message : undefined
        setError(message || 'Could not load this listing.')
      })
      .finally(() => setLoading(false))
  }, [id, user])

  function setField<K extends keyof PgFormValues>(key: K, value: PgFormValues[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function toggleFacility(facility: string) {
    setForm((current) => ({
      ...current,
      facilities: current.facilities.includes(facility)
        ? current.facilities.filter((f) => f !== facility)
        : [...current.facilities, facility],
    }))
  }

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []).slice(0, 6)
    setImageFiles(files)
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (!isEdit && imageFiles.length === 0) {
      setError('Add at least one photo of the property.')
      return
    }

    const formData = new FormData()
    formData.append('name', form.name)
    formData.append('type', form.type)
    formData.append('sharing', form.sharing)
    formData.append('area', form.area)
    formData.append('landmark', form.landmark)
    formData.append('address', form.address)
    formData.append('pincode', form.pincode)
    formData.append('price', form.price)
    formData.append('status', form.status)
    formData.append('description', form.description)
    for (const key of NUMBER_FIELDS) formData.append(key, form[key])
    formData.append('facilities', JSON.stringify(form.facilities))
    imageFiles.forEach((file) => formData.append('images', file))
    if (videoFile) formData.append('video', videoFile)

    setSubmitting(true)
    try {
      if (isEdit && id) {
        await updatePgRequest(id, formData)
      } else {
        await createPgRequest(formData)
      }
      navigate('/dashboard/properties')
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined
      setError(message || 'Could not save this listing. Check the form and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p className="py-20 text-center text-text">Loading...</p>

  return (
    <div className="max-w-[760px]">
      <h1 className="mb-5 text-[26px]">{isEdit ? 'Edit property' : 'List a new property'}</h1>

      <form className="flex flex-col gap-[22px]" onSubmit={handleSubmit}>
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

        <fieldset className="flex flex-col gap-3.5 rounded border border-border pt-[18px] px-5 pb-5">
          <legend className="px-1.5 text-[13px] font-bold tracking-[0.05em] text-text uppercase">Capacity &amp; pricing</legend>
          <div className={cn(rowClass, 'flex-wrap')}>
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

        <fieldset className="flex flex-col gap-3.5 rounded border border-border pt-[18px] px-5 pb-5">
          <legend className="px-1.5 text-[13px] font-bold tracking-[0.05em] text-text uppercase">Photos &amp; video</legend>
          {existingImages.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {existingImages.map((src) => (
                <img key={src} src={src} alt="" className="h-14 w-[72px] rounded-sm border border-border object-cover" />
              ))}
              <p className="mt-1 w-full text-[12.5px] font-normal text-text">Uploading new photos below will replace all of these.</p>
            </div>
          )}
          <label className={labelClass}>
            <span>Photos (1–6, JPEG/PNG/WebP)</span>
            <input className={inputClass} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleImageChange} />
          </label>
          {existingVideo && !videoFile && (
            <p className="-mt-1 text-[12.5px] font-normal text-text">Current video will be kept unless you upload a new one.</p>
          )}
          <label className={labelClass}>
            <span>Walkthrough video (optional)</span>
            <input
              className={inputClass}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            />
          </label>
        </fieldset>

        {error && (
          <p className={authAlertClass} role="alert">
            <AlertIcon />
            {error}
          </p>
        )}

        <button className={authSubmitClass} type="submit" disabled={submitting}>
          {submitting && <SpinnerIcon />}
          {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'List property'}
        </button>
      </form>
    </div>
  )
}
