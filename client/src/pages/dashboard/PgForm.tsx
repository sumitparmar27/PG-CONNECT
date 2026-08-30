import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { createPgRequest, getPgRequest, listPgTypesRequest, updatePgRequest } from '../../api/pg.api'
import type { PgFormValues, PgType } from '../../types/pg'
import { FACILITIES } from '../../constants/facilities'
import { useAuth } from '../../hooks/useAuth'
import { AlertIcon, SpinnerIcon } from '../../components/icons'
import './PgForm.css'

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

  if (loading) return <p className="details-state">Loading...</p>

  return (
    <div className="pg-form-page">
      <h1>{isEdit ? 'Edit property' : 'List a new property'}</h1>

      <form className="pg-form" onSubmit={handleSubmit}>
        <fieldset>
          <legend>Basics</legend>
          <div className="pg-form__row">
            <label>
              <span>Property name</span>
              <input value={form.name} onChange={(e) => setField('name', e.target.value)} required />
            </label>
            <label>
              <span>PG type</span>
              <select value={form.type} onChange={(e) => setField('type', e.target.value)} required>
                <option value="">Select a type</option>
                {types.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="pg-form__row">
            <label>
              <span>Sharing (optional)</span>
              <input
                value={form.sharing}
                onChange={(e) => setField('sharing', e.target.value)}
                placeholder="e.g. 2 sharing"
              />
            </label>
            <label>
              <span>Status</span>
              <select value={form.status} onChange={(e) => setField('status', e.target.value as PgFormValues['status'])}>
                <option value="available">Available</option>
                <option value="not available">Not available</option>
              </select>
            </label>
          </div>
          <label>
            <span>Description</span>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              required
            />
          </label>
        </fieldset>

        <fieldset>
          <legend>Location</legend>
          <div className="pg-form__row">
            <label>
              <span>Area / locality</span>
              <input value={form.area} onChange={(e) => setField('area', e.target.value)} required />
            </label>
            <label>
              <span>Landmark (optional)</span>
              <input value={form.landmark} onChange={(e) => setField('landmark', e.target.value)} />
            </label>
          </div>
          <div className="pg-form__row">
            <label className="pg-form__grow">
              <span>Full address</span>
              <input value={form.address} onChange={(e) => setField('address', e.target.value)} required />
            </label>
            <label>
              <span>Pincode</span>
              <input value={form.pincode} onChange={(e) => setField('pincode', e.target.value)} required />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Capacity &amp; pricing</legend>
          <div className="pg-form__row pg-form__row--wrap">
            <label>
              <span>Rent (₹ / month)</span>
              <input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => setField('price', e.target.value)}
                required
              />
            </label>
            {NUMBER_FIELDS.map((key) => (
              <label key={key} className="pg-form__number">
                <span style={{ textTransform: 'capitalize' }}>{key}</span>
                <input
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

        <fieldset>
          <legend>Facilities</legend>
          <div className="pg-form__facilities">
            {FACILITIES.map((facility) => (
              <label key={facility} className="pg-form__checkbox">
                <input
                  type="checkbox"
                  checked={form.facilities.includes(facility)}
                  onChange={() => toggleFacility(facility)}
                />
                {facility}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Photos &amp; video</legend>
          {existingImages.length > 0 && (
            <div className="pg-form__existing">
              {existingImages.map((src) => (
                <img key={src} src={src} alt="" />
              ))}
              <p>Uploading new photos below will replace all of these.</p>
            </div>
          )}
          <label>
            <span>Photos (1–6, JPEG/PNG/WebP)</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleImageChange} />
          </label>
          {existingVideo && !videoFile && <p className="pg-form__hint">Current video will be kept unless you upload a new one.</p>}
          <label>
            <span>Walkthrough video (optional)</span>
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            />
          </label>
        </fieldset>

        {error && (
          <p className="auth-alert" role="alert">
            <AlertIcon />
            {error}
          </p>
        )}

        <button className="auth-submit" type="submit" disabled={submitting}>
          {submitting && <SpinnerIcon />}
          {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'List property'}
        </button>
      </form>
    </div>
  )
}
