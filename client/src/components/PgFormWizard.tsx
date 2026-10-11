import { useState, type ReactNode } from 'react'
import type { PgFormValues, PgType } from '../types/pg'
import {
  BasicsFields,
  FacilitiesFields,
  isBasicsStepValid,
  isLocationStepValid,
  isPricingStepValid,
  LocationFields,
  NUMBER_FIELDS,
  PricingFields,
  labelClass,
} from './PgFormFields'
import { RoomsEditor, isRoomsStepValid, type RoomRow } from './RoomsEditor'
import { MediaUploader, type MediaItem } from './MediaUploader'
import { UserAutocomplete, type MinimalUser } from './UserAutocomplete'
import { AlertIcon, CheckIcon, SpinnerIcon } from './icons'
import { authAlertClass, authSubmitClass } from '../lib/ui'
import { cn } from '../lib/utils'

type StepKey = 'owner' | 'basics' | 'location' | 'pricing' | 'rooms' | 'facilities' | 'media' | 'review'

const STEP_LABELS: Record<StepKey, string> = {
  owner: 'Owner',
  basics: 'Basics',
  location: 'Location',
  pricing: 'Capacity & pricing',
  rooms: 'Rooms',
  facilities: 'Facilities',
  media: 'Photos & video',
  review: 'Review & submit',
}

interface PgFormWizardProps {
  includeOwnerStep: boolean
  owner: MinimalUser | null
  onOwnerChange: (user: MinimalUser | null) => void
  types: PgType[]
  form: PgFormValues
  setField: <K extends keyof PgFormValues>(key: K, value: PgFormValues[K]) => void
  toggleFacility: (facility: string) => void
  imageItems: MediaItem[]
  onImagesAdd: (files: File[]) => void
  onImageRemove: (id: string) => void
  videoItem: MediaItem | null
  onVideoAdd: (files: File[]) => void
  onVideoRemove: () => void
  rooms: RoomRow[]
  onRoomsChange: (rooms: RoomRow[]) => void
  onSubmit: () => void
  submitting: boolean
  error: string
  submitLabel: string
}

const tabBtnClass =
  'flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-[7px] text-[13px] font-semibold disabled:cursor-not-allowed'
const tabBtnActiveClass = 'border-accent-border bg-accent-bg text-accent'
const tabBtnInactiveClass = 'border-border bg-transparent text-text-h cursor-pointer hover:border-accent-border hover:text-accent'
const tabBtnLockedClass = 'border-border bg-transparent text-text opacity-50'

function typeName(types: PgType[], id: string) {
  return types.find((t) => t._id === id)?.name || '—'
}

const NUMBER_FIELD_LABELS = NUMBER_FIELDS.map((key) => [key, key[0].toUpperCase() + key.slice(1)] as const)

function ReviewSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="m-0 text-[12px] font-bold tracking-[0.05em] text-text uppercase">{title}</h3>
      {children}
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border pb-2 text-[13.5px] text-text-h">
      <span className="font-semibold text-text">{label}</span>
      <span className="text-right">{value || '—'}</span>
    </div>
  )
}

export function PgFormWizard({
  includeOwnerStep,
  owner,
  onOwnerChange,
  types,
  form,
  setField,
  toggleFacility,
  imageItems,
  onImagesAdd,
  onImageRemove,
  videoItem,
  onVideoAdd,
  onVideoRemove,
  rooms,
  onRoomsChange,
  onSubmit,
  submitting,
  error,
  submitLabel,
}: PgFormWizardProps) {
  const steps: StepKey[] = [
    ...(includeOwnerStep ? (['owner'] as StepKey[]) : []),
    'basics',
    'location',
    'pricing',
    'rooms',
    'facilities',
    'media',
    'review',
  ]
  const [currentIndex, setCurrentIndex] = useState(0)

  function isStepValid(key: StepKey): boolean {
    switch (key) {
      case 'owner':
        return owner !== null
      case 'basics':
        return isBasicsStepValid(form)
      case 'location':
        return isLocationStepValid(form)
      case 'pricing':
        return isPricingStepValid(form)
      case 'rooms':
        return isRoomsStepValid(rooms)
      case 'facilities':
        return true
      case 'media':
        return imageItems.length >= 1
      case 'review':
        return true
    }
  }

  function canAccessStep(index: number): boolean {
    return steps.slice(0, index).every((key) => isStepValid(key))
  }

  const currentKey = steps[currentIndex]
  const isLastStep = currentIndex === steps.length - 1
  const isFirstStep = currentIndex === 0

  function goTo(index: number) {
    if (canAccessStep(index)) setCurrentIndex(index)
  }

  function handleNext() {
    if (isStepValid(currentKey) && currentIndex < steps.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  function handleBack() {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2">
        {steps.map((key, index) => {
          const accessible = canAccessStep(index)
          const valid = isStepValid(key)
          return (
            <button
              key={key}
              type="button"
              disabled={!accessible}
              className={cn(
                tabBtnClass,
                index === currentIndex ? tabBtnActiveClass : accessible ? tabBtnInactiveClass : tabBtnLockedClass,
              )}
              onClick={() => goTo(index)}
            >
              {valid && index !== currentIndex && <CheckIcon width={13} height={13} />}
              {index + 1}. {STEP_LABELS[key]}
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-[22px]">
        {currentKey === 'owner' && (
          <fieldset className="flex flex-col gap-3.5 rounded border border-border pt-[18px] px-5 pb-5">
            <legend className="px-1.5 text-[13px] font-bold tracking-[0.05em] text-text uppercase">Owner</legend>
            <label className={labelClass}>
              <span>This listing belongs to</span>
              <UserAutocomplete value={owner} onChange={onOwnerChange} placeholder="Search owners by name or email" />
            </label>
          </fieldset>
        )}

        {currentKey === 'basics' && <BasicsFields types={types} form={form} setField={setField} />}
        {currentKey === 'location' && <LocationFields form={form} setField={setField} />}
        {currentKey === 'pricing' && <PricingFields form={form} setField={setField} />}
        {currentKey === 'rooms' && <RoomsEditor rows={rooms} onChange={onRoomsChange} />}
        {currentKey === 'facilities' && <FacilitiesFields form={form} toggleFacility={toggleFacility} />}

        {currentKey === 'media' && (
          <fieldset className="flex flex-col gap-4 rounded border border-border pt-[18px] px-5 pb-5">
            <legend className="px-1.5 text-[13px] font-bold tracking-[0.05em] text-text uppercase">Photos &amp; video</legend>
            <label className={labelClass}>
              <span>Photos (1–6, JPEG/PNG/WebP)</span>
              <MediaUploader
                items={imageItems}
                onAdd={onImagesAdd}
                onRemove={onImageRemove}
                accept="image/jpeg,image/png,image/webp"
                multiple
                maxItems={6}
                label="Add photo"
              />
            </label>
            <label className={labelClass}>
              <span>Walkthrough video (optional)</span>
              <MediaUploader
                items={videoItem ? [videoItem] : []}
                onAdd={onVideoAdd}
                onRemove={onVideoRemove}
                accept="video/mp4,video/webm,video/quicktime"
                maxItems={1}
                label="Add video"
              />
            </label>
          </fieldset>
        )}

        {currentKey === 'review' && (
          <fieldset className="flex flex-col gap-5 rounded border border-border pt-[18px] px-5 pb-5">
            <legend className="px-1.5 text-[13px] font-bold tracking-[0.05em] text-text uppercase">Review &amp; submit</legend>

            {includeOwnerStep && (
              <ReviewSection title="Owner">
                <ReviewRow label="Owner" value={owner ? `${owner.name} (${owner.email})` : '—'} />
              </ReviewSection>
            )}

            <ReviewSection title="Basics">
              <ReviewRow label="Property name" value={form.name} />
              <ReviewRow label="PG type" value={form.type ? typeName(types, form.type) : '—'} />
              <ReviewRow label="Sharing" value={form.sharing} />
              <ReviewRow label="Status" value={form.status} />
              <ReviewRow label="Description" value={form.description} />
            </ReviewSection>

            <ReviewSection title="Location">
              <ReviewRow label="Area / locality" value={form.area} />
              <ReviewRow label="Landmark" value={form.landmark} />
              <ReviewRow label="Full address" value={form.address} />
              <ReviewRow label="Pincode" value={form.pincode} />
            </ReviewSection>

            <ReviewSection title="Capacity & pricing">
              <ReviewRow label="Rent (₹/month)" value={form.price ? `₹${form.price}` : '—'} />
              <ReviewRow label="Daily rate" value={form.dailyRate ? `₹${form.dailyRate}` : '—'} />
              <ReviewRow label="Weekly rate" value={form.weeklyRate ? `₹${form.weeklyRate}` : '—'} />
              {NUMBER_FIELD_LABELS.map(([key, label]) => (
                <ReviewRow key={key} label={label} value={form[key]} />
              ))}
            </ReviewSection>

            <ReviewSection title="Rooms">
              {rooms.length === 0 ? (
                <p className="m-0 text-[13.5px] text-text-h">No rooms added</p>
              ) : (
                rooms.map((room, index) => (
                  <ReviewRow
                    key={room.key}
                    label={room.roomNumber || `Room ${index + 1}`}
                    value={`${room.sharingType || '—'} · ${room.capacity || '0'} beds · ₹${room.rentPerBed || '0'}/bed`}
                  />
                ))
              )}
            </ReviewSection>

            <ReviewSection title="Facilities">
              {form.facilities.length === 0 ? (
                <p className="m-0 text-[13.5px] text-text-h">None selected</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {form.facilities.map((facility) => (
                    <span
                      key={facility}
                      className="inline-flex items-center whitespace-nowrap rounded-full bg-code-bg px-2.5 py-1 text-[11.5px] font-semibold text-text-h"
                    >
                      {facility}
                    </span>
                  ))}
                </div>
              )}
            </ReviewSection>

            <ReviewSection title="Photos & video">
              {imageItems.length === 0 ? (
                <p className="m-0 text-[13.5px] text-text-h">No photos added</p>
              ) : (
                <div className="flex flex-wrap gap-2.5">
                  {imageItems.map((item) => (
                    <img
                      key={item.id}
                      src={item.url}
                      alt={item.name}
                      className="h-20 w-20 rounded-sm border border-border object-cover"
                    />
                  ))}
                </div>
              )}
              <p className="m-0 text-[13.5px] text-text-h">{videoItem ? `Video: ${videoItem.name}` : 'No video added'}</p>
            </ReviewSection>

            {error && (
              <p className={authAlertClass} role="alert">
                <AlertIcon />
                {error}
              </p>
            )}

            <button className={authSubmitClass} type="button" disabled={submitting} onClick={onSubmit}>
              {submitting && <SpinnerIcon />}
              {submitting ? 'Saving...' : submitLabel}
            </button>
          </fieldset>
        )}
      </div>

      <div className="flex justify-between gap-2.5">
        <button
          type="button"
          className="cursor-pointer rounded-sm border border-border bg-transparent px-4 py-2 text-sm font-semibold text-text-h disabled:cursor-not-allowed disabled:opacity-40 not-disabled:hover:bg-code-bg"
          onClick={handleBack}
          disabled={isFirstStep}
        >
          Back
        </button>
        {!isLastStep && (
          <button
            type="button"
            className="cursor-pointer rounded-sm border border-transparent bg-accent px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 not-disabled:hover:brightness-105"
            onClick={handleNext}
            disabled={!isStepValid(currentKey)}
          >
            Next
          </button>
        )}
      </div>
    </div>
  )
}
