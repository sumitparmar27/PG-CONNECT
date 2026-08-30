import api from './axios'
import type { AuthResponse, LoginPayload, MeResponse, RegisterPayload } from '../types/auth'

export function registerRequest(payload: RegisterPayload): Promise<AuthResponse> {
  return api.post('/auth/register', payload).then((res) => res.data)
}

export function loginRequest(payload: LoginPayload): Promise<AuthResponse> {
  return api.post('/auth/login', payload).then((res) => res.data)
}

export function meRequest(): Promise<MeResponse> {
  return api.get('/auth/me').then((res) => res.data)
}
