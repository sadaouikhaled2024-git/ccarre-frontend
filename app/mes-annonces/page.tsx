"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState } from "react"
import { annonceApi, type Annonce } from "@/lib/annonce-api"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function MyAnnouncementsPage() {
  const { isAuthenticated, loading, token } = useAuth()
  const router = useRouter()
  const [announcements, setAnnouncements] = useState<Annonce[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/auth")
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    if (!token) return

    const fetchMyAnnouncements = async () => {
      try {
        setIsLoadingData(true)
        setError(null)
        const response = await annonceApi.getAll({ mine: "true" }, token)
        setAnnouncements(response.data?.annonces ?? [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Impossible de charger vos annonces")
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchMyAnnouncements()
  }, [token])

  const handleDelete = (id: string) => {
    if (!token) return
    annonceApi
      .delete(id, token)
      .then(() => {
        setAnnouncements((prev) => prev.filter((a) => a._id !== id))
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Suppression impossible"))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "disponible":
        return "bg-rose-100 text-rose-800"
      case "vendu":
        return "bg-rose-200 text-rose-800"
      default:
        return "bg-rose-100 text-rose-800"
    }
  }

  if (loading || !isAuthenticated) return null

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-balance text-4xl font-bold text-foreground">Mes Annonces</h1>
            <Link href="/announcements/create">
              <Button className="bg-rose-500 hover:bg-rose-600">
                + Créer une annonce
              </Button>
            </Link>
          </div>

          {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

          <div className="space-y-4">
            {isLoadingData ? (
              <p className="text-muted-foreground">Chargement de vos annonces...</p>
            ) : announcements.length > 0 ? (
              announcements.map((announcement) => (
                <div key={announcement._id} className="flex gap-4 rounded-lg border border-border p-4 hover:shadow-lg transition-shadow">
                  <div className="h-24 w-24 shrink-0 rounded-lg bg-muted overflow-hidden">
                    {announcement.images && announcement.images[0] ? (
                      <Image
                        src={announcement.images[0]}
                        alt={announcement.title}
                        width={96}
                        height={96}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-muted flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">Pas d'image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-foreground">{announcement.title}</h3>
                    <p className="text-sm text-muted-foreground">{announcement.category}</p>
                    <div className="mt-2 flex gap-2">
                      <Badge variant="outline">{announcement.type}</Badge>
                      <Badge className={getStatusColor(announcement.status)}>
                        {announcement.status === "disponible" ? "Disponible" : announcement.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <p className="text-lg font-bold text-primary">
                      {announcement.price && announcement.price > 0 ? `${announcement.price}€` : "N/A"}
                    </p>
                    <div className="flex gap-2">
                      <Link href={`/announcements/${announcement._id}/edit`}>
                        <Button variant="outline" size="sm" className="border-rose-200 hover:bg-rose-50">
                          <Edit className="size-4" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="border-red-200 hover:bg-red-50">
                            <Trash2 className="size-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer cette annonce?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(announcement._id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Vous n'avez pas encore créé d'annonces</p>
                <Link href="/announcements/create" className="mt-4 inline-block">
                  <Button className="bg-rose-500 hover:bg-rose-600">
                    Créer votre première annonce
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
