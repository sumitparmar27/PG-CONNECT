import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { isAxiosError } from 'axios'
import {
  createAdminRoomRequest,
  createListingRequest,
  deleteAdminRoomRequest,
  listAdminRoomsRequest,
  updateAdminRoomRequest,
  updateListingRequest,
} from '../../api/admin.api'
import { getPgRequest, listPgTypesRequest } from '../../api/pg.api'
import type { PgFormValues, PgType } from '../../types/pg'
import { EMPTY_PG_FORM, NUMBER_FIELDS } from '../../components/PgFormFields'
import { PgFormWizard } from '../../components/PgFormWizard'
import {
  buildEmptyRoomRow,
  buildRoomRowFromRoom,
  roomRowToPayload,
  type RoomRow,
} from '../../components/RoomsEditor'
import { buildExistingMediaItem, buildMediaItem, type MediaItem } from '../../components/MediaUploader'
import type { MinimalUser } from '../../components/UserAutocomplete'

export function AdminListingForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [types, setTypes] = useState<PgType[]>([])
  const [form, setForm] = useState<PgFormValues>(EMPTY_PG_FORM)
  const [owner, setOwner] = useState<MinimalUser | null>(null)
  const [rooms, setRooms] = useState<RoomRow[]>(() => [buildEmptyRoomRow()])
  const [originalRoomIds, setOriginalRoomIds] = useState<string[]>([])
  const [imageItems, setImageItems] = useState<MediaItem[]>([])
  const [videoItem, setVideoItem] = useState<MediaItem | null>(null)
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
        setForm({
          name: pg.name,
          type: pg.type._id,
          sharing: pg.sharing || '',
          area: pg.area,
          landmark: pg.landmark || '',
          address: pg.address,
          pincode: pg.pincode,
          price: String(pg.price),
          dailyRate: pg.dailyRate !== undefined ? String(pg.dailyRate) : '',
          weeklyRate: pg.weeklyRate !== undefined ? String(pg.weeklyRate) : '',
          status: pg.status,
          description: pg.description,
          bed: String(pg.bed),
          bathroom: String(pg.bathroom),
          kitchen: String(pg.kitchen),
          balcony: String(pg.balcony),
          parking: String(pg.parking),
          facilities: pg.facilities,
        })
        setOwner(pg.owner)
        setImageItems(pg.images.map(buildExistingMediaItem))
        if (pg.video) setVideoItem(buildExistingMediaItem(pg.video))
        return listAdminRoomsRequest(pg._id)
      })
      .then((data) => {
        if (!data) return
        const loadedRooms = data.rooms.map(buildRoomRowFromRoom)
        setRooms(loadedRooms.length > 0 ? loadedRooms : [buildEmptyRoomRow()])
        setOriginalRoomIds(data.rooms.map((room) => room._id))
      })
      .catch((err) => {
        const message = isAxiosError(err) ? err.response?.data?.message : undefined
        setError(message || 'Could not load this listing.')
      })
      .finally(() => setLoading(false))
  }, [id])

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

  function handleImagesAdd(files: File[]) {
    const remaining = 6 - imageItems.length
    if (remaining <= 0) return
    setImageItems((current) => [...current, ...files.slice(0, remaining).map(buildMediaItem)])
  }

  function handleImageRemove(itemId: string) {
    setImageItems((current) => current.filter((item) => item.id !== itemId))
  }

  function handleVideoAdd(files: File[]) {
    const file = files[0]
    if (file) setVideoItem(buildMediaItem(file))
  }

  function handleVideoRemove() {
    setVideoItem(null)
  }

  async function handleSubmit() {
    setError('')
    if (!owner) {
      setError('Select the owner this listing belongs to.')
      return
    }
    if (imageItems.length === 0) {
      setError('Add at least one photo of the property.')
      return
    }

    const formData = new FormData()
    formData.append('ownerId', owner._id)
    formData.append('name', form.name)
    formData.append('type', form.type)
    formData.append('sharing', form.sharing)
    formData.append('area', form.area)
    formData.append('landmark', form.landmark)
    formData.append('address', form.address)
    formData.append('pincode', form.pincode)
    formData.append('price', form.price)
    if (form.dailyRate) formData.append('dailyRate', form.dailyRate)
    if (form.weeklyRate) formData.append('weeklyRate', form.weeklyRate)
    formData.append('status', form.status)
    formData.append('description', form.description)
    for (const key of NUMBER_FIELDS) formData.append(key, form[key])
    formData.append('facilities', JSON.stringify(form.facilities))

    const keepImages = imageItems.filter((item) => !item.file).map((item) => item.url)
    formData.append('keepImages', JSON.stringify(keepImages))
    imageItems.filter((item) => item.file).forEach((item) => formData.append('images', item.file as File))

    if (videoItem?.file) {
      formData.append('video', videoItem.file)
    } else if (videoItem) {
      formData.append('keepVideo', videoItem.url)
    }

    setSubmitting(true)
    try {
      let pgId = id
      if (isEdit && id) {
        await updateListingRequest(id, formData)
      } else {
        const { pg } = await createListingRequest(formData)
        pgId = pg._id
      }

      if (pgId) {
        const remainingIds = new Set(rooms.filter((room) => room._id).map((room) => room._id as string))
        await Promise.all([
          ...rooms.map((room) =>
            room._id
              ? updateAdminRoomRequest(room._id, roomRowToPayload(room))
              : createAdminRoomRequest(pgId, roomRowToPayload(room)),
          ),
          ...originalRoomIds
            .filter((roomId) => !remainingIds.has(roomId))
            .map((roomId) => deleteAdminRoomRequest(roomId)),
        ])
      }

      navigate('/admin/listings')
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined
      setError(message || 'Could not save this listing. Check the form and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p className="py-20 text-center text-text">Loading...</p>

  return (
    <div className="max-w-[820px]">
      <h1 className="mb-5 text-[26px]">{isEdit ? 'Edit listing' : 'Add a listing'}</h1>

      <PgFormWizard
        includeOwnerStep
        owner={owner}
        onOwnerChange={setOwner}
        types={types}
        form={form}
        setField={setField}
        toggleFacility={toggleFacility}
        imageItems={imageItems}
        onImagesAdd={handleImagesAdd}
        onImageRemove={handleImageRemove}
        videoItem={videoItem}
        rooms={rooms}
        onRoomsChange={setRooms}
        onVideoAdd={handleVideoAdd}
        onVideoRemove={handleVideoRemove}
        onSubmit={handleSubmit}
        submitting={submitting}
        error={error}
        submitLabel={isEdit ? 'Save changes' : 'Create listing'}
      />
    </div>
  )
}
