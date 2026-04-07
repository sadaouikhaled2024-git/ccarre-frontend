"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function BlockedPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!user || !user.isBanned) {
      router.push("/")
    }
  }, [user, loading, router])

  if (loading || !user?.isBanned) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <Lock className="size-16 text-destructive" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Accès bloqué</h1>
            <p className="text-muted-foreground">
              Votre compte a été bloqué. Vous n'avez pas accès à l'utilisation de la plateforme.
            </p>
          </div>

          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Si vous pensez qu'il s'agit d'une erreur, veuillez contacter le support.</p>
            <p>Email de support: support@ccarre.fr</p>
          </div>

          <Button onClick={logout} className="w-full">
            Déconnexion
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
