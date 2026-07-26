import { createContext, useEffect, useState } from 'react'
import { loginRequest, meRequest, registerRequest } from '../api/auth.api'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
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

  async function login(payload) {
    const data = await loginRequest(payload)
    localStorage.setItem('token', data.token)
    setUser(data.user)
  }

  async function register(payload) {
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
