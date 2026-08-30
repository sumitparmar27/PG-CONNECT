import api from './axios'
import type { PlatformStats } from '../types/admin'

export function getPlatformStatsRequest(): Promise<{ stats: PlatformStats }> {
  return api.get('/admin/stats').then((res) => res.data)
}
