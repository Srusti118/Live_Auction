'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { ApiClient } from '@/lib/api'
import type { UserSummary } from '@/types'

interface AuthContextType {
  user: UserSummary | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  switchDemoUser: (email: string) => Promise<void>
  refreshProfile: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserSummary | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('auction_token')
    if (savedToken) {
      setToken(savedToken)
      ApiClient.get<{ user: UserSummary }>('/auth/me')
        .then((res) => {
          setUser(res.user)
        })
        .catch(() => {
          localStorage.removeItem('auction_token')
          setToken(null)
          setUser(null)
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      // Auto login as Alice Cooper for instant demo evaluation
      switchDemoUser('alice@bidder.com').finally(() => {
        setIsLoading(false)
      })
    }
  }, [])

  const login = async (email: string, password: string): Promise<void> => {
    const res = await ApiClient.post<{ token: string; user: UserSummary }>('/auth/login', {
      email,
      password,
    })
    localStorage.setItem('auction_token', res.token)
    setToken(res.token)
    setUser(res.user)
  }

  const register = async (email: string, password: string, name: string): Promise<void> => {
    const res = await ApiClient.post<{ token: string; user: UserSummary }>('/auth/register', {
      email,
      password,
      name,
    })
    localStorage.setItem('auction_token', res.token)
    setToken(res.token)
    setUser(res.user)
  }

  const logout = (): void => {
    localStorage.removeItem('auction_token')
    setToken(null)
    setUser(null)
  }

  const switchDemoUser = async (email: string): Promise<void> => {
    try {
      await login(email, 'password123')
    } catch {
      // Server might not be initialized yet
    }
  }

  const refreshProfile = async (): Promise<void> => {
    if (!token) return
    try {
      const res = await ApiClient.get<{ user: UserSummary }>('/auth/me')
      setUser(res.user)
    } catch {
      // Ignore
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        switchDemoUser,
        refreshProfile,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
