import api from './axios'
import type { PlatformAnalytics, PlatformStats } from '../types/admin'
import type { AdminUser, AdminUserFilters, AdminUserListResponse, CreateUserPayload } from '../types/user'
import type { AdminListingFilters, AdminListingListResponse, ModerationStatus, Pg } from '../types/pg'
import type { Booking } from '../types/booking'
import type { Role, RolePayload } from '../types/role'
import type { Room } from '../types/room'
import type { RoomPayload } from './room.api'

export function getPlatformStatsRequest(): Promise<{ stats: PlatformStats }> {
  return api.get('/admin/stats').then((res) => res.data)
}

export function getAnalyticsRequest(): Promise<{ analytics: PlatformAnalytics }> {
  return api.get('/admin/analytics').then((res) => res.data)
}

export function listUsersRequest(filters: AdminUserFilters = {}): Promise<AdminUserListResponse> {
  return api.get('/admin/users', { params: filters }).then((res) => res.data)
}

export function createUserRequest(payload: CreateUserPayload): Promise<{ user: AdminUser }> {
  return api.post('/admin/users', payload).then((res) => res.data)
}

export function updateUserRoleRequest(id: string, role: string): Promise<{ user: AdminUser }> {
  return api.patch(`/admin/users/${id}/role`, { role }).then((res) => res.data)
}

export function updateUserStatusRequest(id: string, isActive: boolean): Promise<{ user: AdminUser }> {
  return api.patch(`/admin/users/${id}/status`, { isActive }).then((res) => res.data)
}

export function listListingsForModerationRequest(filters: AdminListingFilters = {}): Promise<AdminListingListResponse> {
  return api.get('/admin/listings', { params: filters }).then((res) => res.data)
}

export function setListingModerationRequest(id: string, status: ModerationStatus): Promise<{ pg: Pg }> {
  return api.patch(`/admin/listings/${id}/moderation`, { status }).then((res) => res.data)
}

export function createListingRequest(formData: FormData): Promise<{ pg: Pg }> {
  return api.post('/admin/listings', formData).then((res) => res.data)
}

export function createManualBookingRequest(formData: FormData): Promise<{ booking: Booking }> {
  return api.post('/admin/bookings', formData).then((res) => res.data)
}

export function updateListingRequest(id: string, formData: FormData): Promise<{ pg: Pg }> {
  return api.put(`/admin/listings/${id}`, formData).then((res) => res.data)
}

export function listAdminRoomsRequest(pgId: string): Promise<{ rooms: Room[] }> {
  return api.get(`/admin/listings/${pgId}/rooms`).then((res) => res.data)
}

export function createAdminRoomRequest(pgId: string, payload: RoomPayload): Promise<{ room: Room }> {
  return api.post(`/admin/listings/${pgId}/rooms`, payload).then((res) => res.data)
}

export function updateAdminRoomRequest(roomId: string, payload: RoomPayload): Promise<{ room: Room }> {
  return api.put(`/admin/rooms/${roomId}`, payload).then((res) => res.data)
}

export function deleteAdminRoomRequest(roomId: string): Promise<void> {
  return api.delete(`/admin/rooms/${roomId}`).then(() => undefined)
}

export function listRolesRequest(): Promise<{ roles: Role[] }> {
  return api.get('/admin/roles').then((res) => res.data)
}

export function createRoleRequest(payload: RolePayload): Promise<{ role: Role }> {
  return api.post('/admin/roles', payload).then((res) => res.data)
}

export function updateRoleRequest(id: string, payload: RolePayload): Promise<{ role: Role }> {
  return api.put(`/admin/roles/${id}`, payload).then((res) => res.data)
}

export function deleteRoleRequest(id: string): Promise<void> {
  return api.delete(`/admin/roles/${id}`).then(() => undefined)
}
