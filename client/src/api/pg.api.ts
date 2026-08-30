import api from './axios'
import type { Pg, PgFilters, PgListResponse, PgType } from '../types/pg'

export function listPgsRequest(filters: PgFilters = {}): Promise<PgListResponse> {
  return api.get('/pgs', { params: filters }).then((res) => res.data)
}

export function listAreasRequest(): Promise<{ areas: string[] }> {
  return api.get('/pgs/areas').then((res) => res.data)
}

export function getPgRequest(id: string): Promise<{ pg: Pg }> {
  return api.get(`/pgs/${id}`).then((res) => res.data)
}

export function listMyPgsRequest(): Promise<{ pgs: Pg[] }> {
  return api.get('/pgs/mine').then((res) => res.data)
}

export function createPgRequest(formData: FormData): Promise<{ pg: Pg }> {
  return api.post('/pgs', formData).then((res) => res.data)
}

export function updatePgRequest(id: string, formData: FormData): Promise<{ pg: Pg }> {
  return api.put(`/pgs/${id}`, formData).then((res) => res.data)
}

export function deletePgRequest(id: string): Promise<void> {
  return api.delete(`/pgs/${id}`).then(() => undefined)
}

export function listPgTypesRequest(): Promise<{ types: PgType[] }> {
  return api.get('/pg-types').then((res) => res.data)
}

export function createPgTypeRequest(name: string): Promise<{ type: PgType }> {
  return api.post('/pg-types', { name }).then((res) => res.data)
}
