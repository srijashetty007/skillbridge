import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { apiRequest, getStoredToken, setStoredToken } from '../lib/api'
import { User } from '../types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (payload: {
    full_name: string
    email: string
    password: string
    confirm_password: string
    college_name: string
    graduation_year: number
  }) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    const token = getStoredToken()
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const me = await apiRequest<User>('/api/auth/me')
      setUser(me)
    } catch {
      setStoredToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const login = async (email: string, password: string) => {
    const res = await apiRequest<{ access_token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    setStoredToken(res.access_token)
    setUser(res.user)
  }

  const signup = async (payload: {
    full_name: string
    email: string
    password: string
    confirm_password: string
    college_name: string
    graduation_year: number
  }) => {
    const res = await apiRequest<{ access_token: string; user: User }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    setStoredToken(res.access_token)
    setUser(res.user)
  }

  const logout = () => {
    setStoredToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return ctx
}
