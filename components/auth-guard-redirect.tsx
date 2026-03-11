"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, type ReactNode } from "react"

interface AuthGuardRedirectProps {
  children: ReactNode
  redirectTo: string
  whenAuthenticated?: boolean
}

/**
 * If `whenAuthenticated` is true  → redirects authenticated users away (e.g. from /auth).
 * If `whenAuthenticated` is false → redirects unauthenticated users away (e.g. from /profile).
 */
export function AuthGuardRedirect({
  children,
  redirectTo,
  whenAuthenticated = false,
}: AuthGuardRedirectProps) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (whenAuthenticated && isAuthenticated) {
      router.replace(redirectTo)
    }
    if (!whenAuthenticated && !isAuthenticated) {
      router.replace(redirectTo)
    }
  }, [isAuthenticated, loading, router, redirectTo, whenAuthenticated])

  if (loading) return null

  if (whenAuthenticated && isAuthenticated) return null
  if (!whenAuthenticated && !isAuthenticated) return null

  return <>{children}</>
}
