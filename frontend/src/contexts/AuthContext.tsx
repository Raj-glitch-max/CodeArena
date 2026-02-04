import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { apiClient } from '../services/apiClient'

type User = { id: number; username: string; email: string; rating: number }

type AuthCtx = {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  signup: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'))
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (!token) return
    apiClient.get('/api/v1/users/me').then(res => setUser(res.data.data)).catch(() => {})
  }, [token])

  async function login(email: string, password: string) {
    const res = await apiClient.post('/api/v1/auth/login', { email, password })
    const t = res.data.data.access_token as string
    localStorage.setItem('access_token', t)
    setToken(t)
    setUser(res.data.data.user)
  }

  async function signup(username: string, email: string, password: string) {
    const res = await apiClient.post('/api/v1/auth/signup', { username, email, password })
    const t = res.data.data.access_token as string
    localStorage.setItem('access_token', t)
    setToken(t)
    setUser(res.data.data.user)
  }

  function logout() {
    localStorage.removeItem('access_token')
    setToken(null)
    setUser(null)
  }

  const value = useMemo(() => ({ user, token, login, signup, logout }), [user, token])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const v = useContext(Ctx)
  if (!v) throw new Error('AuthContext missing')
  return v
}
