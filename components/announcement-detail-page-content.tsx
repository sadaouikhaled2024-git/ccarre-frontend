"use client"

import { Navbar } from "@/components/navbar"
import { AnnouncementDetail } from "@/components/announcement-detail"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface AnnouncementDetailPageContentProps {
  id: string
}

export function AnnouncementDetailPageContent({ id }: AnnouncementDetailPageContentProps) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/auth")
    }
  }, [isAuthenticated, loading, router])

  if (loading || !isAuthenticated) return null

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="mx-auto max-w-4xl px-6">
          <Link href="/announcements">
            <Button variant="ghost" size="sm" className="mb-6 text-muted-foreground hover:text-foreground">
              <ChevronLeft className="size-4 mr-2" />
              Retour aux annonces
            </Button>
          </Link>
          <AnnouncementDetail id={id} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
