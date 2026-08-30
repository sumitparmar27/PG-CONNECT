import { createContext, useEffect, useState, type ReactNode } from 'react'
import { loginRequest, meRequest, registerRequest } from '../api/auth.api'
import type { LoginPayload, RegisterPayload, User } from '../types/auth'

export interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    meRequest()
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false))
  }, [])

  async function login(payload: LoginPayload) {
    const data = await loginRequest(payload)
    localStorage.setItem('token', data.token)
    setUser(data.user)
  }

  async function register(payload: RegisterPayload) {
    const data = await registerRequest(payload)
    localStorage.setItem('token', data.token)
    setUser(data.user)
  }

  function logout() {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
