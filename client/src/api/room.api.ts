import api from './axios'
import type { Room } from '../types/room'

export interface RoomPayload {
  roomNumber: string
  sharingType: string
  capacity: number
  rentPerBed: number
  dailyRate?: number
  weeklyRate?: number
  status?: 'active' | 'inactive'
}

export function listRoomsForPgRequest(pgId: string): Promise<{ rooms: Room[] }> {
  return api.get(`/pgs/${pgId}/rooms`).then((res) => res.data)
}

export function createRoomRequest(pgId: string, payload: RoomPayload): Promise<{ room: Room }> {
  return api.post(`/pgs/${pgId}/rooms`, payload).then((res) => res.data)
}

export function updateRoomRequest(roomId: string, payload: RoomPayload): Promise<{ room: Room }> {
  return api.put(`/rooms/${roomId}`, payload).then((res) => res.data)
}

export function deleteRoomRequest(roomId: string): Promise<void> {
  return api.delete(`/rooms/${roomId}`).then(() => undefined)
}

export function getRoomAvailabilityRequest(
  roomId: string,
  from: string,
  to: string,
): Promise<{ availability: Record<string, number> }> {
  return api.get(`/rooms/${roomId}/availability`, { params: { from, to } }).then((res) => res.data)
}
