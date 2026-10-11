import type { RoomPayload } from '../api/room.api'
import type { Room, RoomStatus } from '../types/room'
import { inputClass, labelClass, rowClass } from './PgFormFields'
import { PlusIcon, XCircleIcon } from './icons'
import { cn } from '../lib/utils'

export interface RoomRow {
  key: string
  _id?: string
  roomNumber: string
  sharingType: string
  capacity: string
  rentPerBed: string
  dailyRate: string
  weeklyRate: string
  status: RoomStatus
}

let roomRowCounter = 0

function nextRoomRowKey() {
  roomRowCounter += 1
  return `room-${Date.now()}-${roomRowCounter}`
}

export function buildEmptyRoomRow(): RoomRow {
  return {
    key: nextRoomRowKey(),
    roomNumber: '',
    sharingType: '',
    capacity: '',
    rentPerBed: '',
    dailyRate: '',
    weeklyRate: '',
    status: 'active',
  }
}

export function buildRoomRowFromRoom(room: Room): RoomRow {
  return {
    key: room._id,
    _id: room._id,
    roomNumber: room.roomNumber,
    sharingType: room.sharingType,
    capacity: String(room.capacity),
    rentPerBed: String(room.rentPerBed),
    dailyRate: room.dailyRate !== undefined ? String(room.dailyRate) : '',
    weeklyRate: room.weeklyRate !== undefined ? String(room.weeklyRate) : '',
    status: room.status,
  }
}

export function isRoomRowValid(row: RoomRow) {
  return (
    row.roomNumber.trim() !== '' &&
    row.sharingType.trim() !== '' &&
    row.capacity.trim() !== '' &&
    Number(row.capacity) >= 1 &&
    row.rentPerBed.trim() !== '' &&
    Number(row.rentPerBed) >= 0
  )
}

export function isRoomsStepValid(rows: RoomRow[]) {
  return rows.length > 0 && rows.every(isRoomRowValid)
}

export function roomRowToPayload(row: RoomRow): RoomPayload {
  return {
    roomNumber: row.roomNumber.trim(),
    sharingType: row.sharingType.trim(),
    capacity: Number(row.capacity),
    rentPerBed: Number(row.rentPerBed),
    dailyRate: row.dailyRate ? Number(row.dailyRate) : undefined,
    weeklyRate: row.weeklyRate ? Number(row.weeklyRate) : undefined,
    status: row.status,
  }
}

interface RoomsEditorProps {
  rows: RoomRow[]
  onChange: (rows: RoomRow[]) => void
}

export function RoomsEditor({ rows, onChange }: RoomsEditorProps) {
  function updateRow(key: string, patch: Partial<RoomRow>) {
    onChange(rows.map((row) => (row.key === key ? { ...row, ...patch } : row)))
  }

  function removeRow(key: string) {
    onChange(rows.filter((row) => row.key !== key))
  }

  function addRow() {
    onChange([...rows, buildEmptyRoomRow()])
  }

  return (
    <fieldset className="flex flex-col gap-3.5 rounded border border-border pt-[18px] px-5 pb-5">
      <legend className="px-1.5 text-[13px] font-bold tracking-[0.05em] text-text uppercase">Rooms</legend>
      <p className="m-0 text-[13px] text-text">
        Add each room in this PG with its own sharing type, bed capacity, and rent per bed.
      </p>

      {rows.map((row, index) => (
        <div key={row.key} className="flex flex-col gap-3 rounded-sm border border-border bg-code-bg p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-semibold text-text-h">Room {index + 1}</span>
            <button
              type="button"
              className="inline-flex cursor-pointer items-center gap-1 rounded-sm border-none bg-transparent p-1 text-danger hover:brightness-90"
              onClick={() => removeRow(row.key)}
              aria-label="Remove room"
            >
              <XCircleIcon width={16} height={16} />
            </button>
          </div>
          <div className={rowClass}>
            <label className={labelClass}>
              <span>Room number</span>
              <input
                className={inputClass}
                value={row.roomNumber}
                onChange={(e) => updateRow(row.key, { roomNumber: e.target.value })}
                placeholder="e.g. 101"
              />
            </label>
            <label className={labelClass}>
              <span>Sharing type</span>
              <input
                className={inputClass}
                value={row.sharingType}
                onChange={(e) => updateRow(row.key, { sharingType: e.target.value })}
                placeholder="e.g. 2 sharing"
              />
            </label>
          </div>
          <div className={cn(rowClass, 'flex-wrap')}>
            <label className={cn(labelClass, 'min-w-[110px]')}>
              <span>Bed capacity</span>
              <input
                className={inputClass}
                type="number"
                min={1}
                value={row.capacity}
                onChange={(e) => updateRow(row.key, { capacity: e.target.value })}
              />
            </label>
            <label className={cn(labelClass, 'min-w-[110px]')}>
              <span>Rent / bed (₹/mo)</span>
              <input
                className={inputClass}
                type="number"
                min={0}
                value={row.rentPerBed}
                onChange={(e) => updateRow(row.key, { rentPerBed: e.target.value })}
              />
            </label>
            <label className={cn(labelClass, 'min-w-[110px]')}>
              <span>Daily rate (optional)</span>
              <input
                className={inputClass}
                type="number"
                min={0}
                value={row.dailyRate}
                onChange={(e) => updateRow(row.key, { dailyRate: e.target.value })}
              />
            </label>
            <label className={cn(labelClass, 'min-w-[110px]')}>
              <span>Weekly rate (optional)</span>
              <input
                className={inputClass}
                type="number"
                min={0}
                value={row.weeklyRate}
                onChange={(e) => updateRow(row.key, { weeklyRate: e.target.value })}
              />
            </label>
            <label className={cn(labelClass, 'min-w-[110px]')}>
              <span>Status</span>
              <select
                className={inputClass}
                value={row.status}
                onChange={(e) => updateRow(row.key, { status: e.target.value as RoomStatus })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
          </div>
        </div>
      ))}

      <button
        type="button"
        className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-full border border-accent-border bg-accent-bg px-3.5 py-[7px] text-[13px] font-semibold text-accent hover:brightness-105"
        onClick={addRow}
      >
        <PlusIcon width={14} height={14} />
        Add room
      </button>
    </fieldset>
  )
}
