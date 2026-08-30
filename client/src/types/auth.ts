export interface User {
  _id: string
  name: string
  email: string
  role: string
  createdAt?: string
  updatedAt?: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface MeResponse {
  user: User
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
}
