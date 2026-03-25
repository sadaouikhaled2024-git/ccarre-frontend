"use client"

import { Navbar } from "@/components/navbar"
import { AnnouncementsGrid } from "@/components/announcements-grid"
import { Footer } from "@/components/footer"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function AnnouncementsPage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/auth")
    }
  }, [isAuthenticated, loading, router])

  if (loading || !isAuthenticated) return null

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onSearchChange={setSearchQuery} />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-8">
            <h1 className="text-balance text-4xl font-bold text-foreground">Annonces</h1>
            <p className="mt-2 text-muted-foreground">
              Découvrez les annonces des étudiants d'Aix-Marseille Université
            </p>
          </div>
          <AnnouncementsGrid searchQuery={searchQuery} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
