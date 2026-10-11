export type RoomStatus = 'active' | 'inactive'

export interface Room {
  _id: string
  pg: string
  roomNumber: string
  sharingType: string
  capacity: number
  rentPerBed: number
  dailyRate?: number
  weeklyRate?: number
  status: RoomStatus
  createdAt: string
  updatedAt: string
}

export interface RoomFormValues {
  roomNumber: string
  sharingType: string
  capacity: string
  rentPerBed: string
  dailyRate: string
  weeklyRate: string
  status: RoomStatus
}

export const EMPTY_ROOM_FORM: RoomFormValues = {
  roomNumber: '',
  sharingType: '',
  capacity: '',
  rentPerBed: '',
  dailyRate: '',
  weeklyRate: '',
  status: 'active',
}
