"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import { authApi, type AuthUser } from "@/lib/auth-api"

const TOKEN_KEY = "ccarre_token"

interface AuthContextType {
  isAuthenticated: boolean
  user: AuthUser | null
  token: string | null
  loading: boolean
  login: (token: string, user?: AuthUser) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Authenticated = token exists in state (token is the source of truth)
  const isAuthenticated = !!token

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const login = useCallback(
    async (newToken: string, userData?: AuthUser) => {
      localStorage.setItem(TOKEN_KEY, newToken)
      setToken(newToken)
      if (userData) {
        setUser(userData)
      } else {
        // Fallback: try to fetch user profile
        try {
          const me = await authApi.getMe(newToken)
          setUser(me)
        } catch {
          // Token is still valid, user profile just couldn't be fetched
        }
      }
    },
    []
  )

  // On mount, check for existing token in localStorage
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY)
    if (!stored) {
      setLoading(false)
      return
    }

    setToken(stored)
    authApi
      .getMe(stored)
      .then((me) => {
        setUser(me)
      })
      .catch(() => {
        // Ne pas supprimer le token immédiatement pour éviter de déconnecter sur simple erreur réseau
        // Il sera invalidé côté API sur la prochaine requête si expiré
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, token, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
