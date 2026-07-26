import api from './axios'

export function registerRequest(payload) {
  return api.post('/auth/register', payload).then((res) => res.data)
}

export function loginRequest(payload) {
  return api.post('/auth/login', payload).then((res) => res.data)
}

export function meRequest() {
  return api.get('/auth/me').then((res) => res.data)
}
