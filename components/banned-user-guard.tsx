"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export function BannedUserGuard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return

    // Si l'utilisateur est banni ET n'est pas déjà sur la page /blocked
    if (user?.isBanned && pathname !== "/blocked") {
      router.push("/blocked")
    }
  }, [user, loading, pathname, router])

  return null
}
