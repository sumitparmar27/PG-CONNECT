import api from './axios'
import type { PlatformAnalytics, PlatformStats } from '../types/admin'
import type { AdminUser, AdminUserFilters, AdminUserListResponse } from '../types/user'
import type { AdminListingFilters, AdminListingListResponse, ModerationStatus, Pg } from '../types/pg'

export function getPlatformStatsRequest(): Promise<{ stats: PlatformStats }> {
  return api.get('/admin/stats').then((res) => res.data)
}

export function getAnalyticsRequest(): Promise<{ analytics: PlatformAnalytics }> {
  return api.get('/admin/analytics').then((res) => res.data)
}

export function listUsersRequest(filters: AdminUserFilters = {}): Promise<AdminUserListResponse> {
  return api.get('/admin/users', { params: filters }).then((res) => res.data)
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
