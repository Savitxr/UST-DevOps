'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getUserProfile, loginUser } from '@/lib/api'

interface AuthUser {
  id: string
  email: string
  displayName: string
}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  signOut: () => void
}

const AUTH_TOKEN_KEY = 'auth_token'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function normalizeProfile(profile: Record<string, unknown>): AuthUser {
  return {
    id: String(profile.id ?? ''),
    email: String(profile.email ?? ''),
    displayName: String(profile.display_name ?? profile.displayName ?? profile.name ?? ''),
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? window.localStorage.getItem(AUTH_TOKEN_KEY) : null
    if (!storedToken) {
      setIsLoading(false)
      return
    }

    setToken(storedToken)
    getUserProfile(storedToken)
      .then((profile) => {
        if (profile?.error) {
          window.localStorage.removeItem(AUTH_TOKEN_KEY)
          setToken(null)
          setUser(null)
          return
        }
        setUser(normalizeProfile(profile))
      })
      .catch(() => {
        window.localStorage.removeItem(AUTH_TOKEN_KEY)
        setToken(null)
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const response = await loginUser(email, password)
    if (!response || response.error || !response.token) {
      return { ok: false, error: response?.error || 'login_failed' }
    }

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(AUTH_TOKEN_KEY, response.token)
    }
    setToken(response.token)

    const profile = await getUserProfile(response.token)
    if (profile?.error) {
      return { ok: false, error: profile.error }
    }

    setUser(normalizeProfile(profile))
    return { ok: true }
  }

  const signOut = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(AUTH_TOKEN_KEY)
    }
    setToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({ user, token, isLoading, login, signOut }),
    [user, token, isLoading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
