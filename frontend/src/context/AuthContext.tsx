import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '../utils/api'
import type { AuthUser, SubscriptionTier } from '../types'

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('auth_token')
      if (storedToken) {
        setToken(storedToken)
        try {
          const response = await api.auth.me()
          setUser(response.user as AuthUser)
        } catch (error) {
          // Token is invalid, clear it
          localStorage.removeItem('auth_token')
          setToken(null)
        }
      }
      setIsLoading(false)
    }

    loadUser()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await api.auth.login(email, password)
      const authToken = response.token
      const authUser = response.user as AuthUser

      // Store token in localStorage
      localStorage.setItem('auth_token', authToken)
      setToken(authToken)
      setUser(authUser)
    } catch (error) {
      throw error
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await api.auth.register(email, password, name)
      const authToken = response.token
      const authUser = response.user as AuthUser

      // Store token in localStorage
      localStorage.setItem('auth_token', authToken)
      setToken(authToken)
      setUser(authUser)
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    setToken(null)
    setUser(null)

    // Call logout endpoint (fire and forget)
    api.auth.logout().catch(() => {
      // Ignore errors on logout
    })
  }

  const refreshUser = async () => {
    if (!token) return

    try {
      const response = await api.auth.me()
      setUser(response.user as AuthUser)
    } catch (error) {
      // If refresh fails, log user out
      logout()
    }
  }

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
