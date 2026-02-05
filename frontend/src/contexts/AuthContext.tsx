import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { apiClient } from '@/services/apiClient'
import type { User, AuthResponse } from '@/types'

type AuthCtx = {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  refreshUser: () => Promise<void>
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'))
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const res = await apiClient.get('/api/v1/users/me')
      setUser(res.data.data)
    } catch (error: any) {
      console.error('Auth refresh failed:', error)
      if (error.response?.status === 401) {
        localStorage.removeItem('access_token')
        setToken(null)
        setUser(null)
      }
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await apiClient.post('/api/v1/auth/login', { email, password })
      const data = res.data.data as AuthResponse
      const t = data.access_token
      localStorage.setItem('access_token', t)
      setToken(t)
      setUser(data.user)
      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed'
      return { success: false, error: message }
    }
  }, [])

  const signup = useCallback(async (username: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await apiClient.post('/api/v1/auth/signup', { username, email, password })
      const data = res.data.data as AuthResponse
      const t = data.access_token
      localStorage.setItem('access_token', t)
      setToken(t)
      setUser(data.user)
      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Signup failed'
      return { success: false, error: message }
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(() => ({
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    refreshUser,
  }), [user, token, isLoading, login, signup, logout, refreshUser])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const v = useContext(Ctx)
  if (!v) throw new Error('AuthContext missing')
  return v
}
