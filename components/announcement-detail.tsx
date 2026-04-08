"use client"

import Image from "next/image"
import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { InterestedModal } from "@/components/interested-modal"
import { ReportModal } from "@/components/report-modal"
import { ChevronLeft, ChevronRight, Flag, Trash2, Heart, MoreVertical } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { annonceApi } from "@/lib/annonce-api"
import { reportApi } from "@/lib/report-api"
import { favoriteApi } from "@/lib/favorite-api"
import { showNotification } from "@/components/notification-toast"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AnnouncementDetailProps {
  id: string
}

export function AnnouncementDetail({ id }: AnnouncementDetailProps) {
  const { token, user } = useAuth()
  const [announcement, setAnnouncement] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [isReporting, setIsReporting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchAnnouncement() {
      try {
        setLoading(true)
        const response = await annonceApi.getById(id, token || undefined)
        if (response.success && response.data?.annonce) {
          setAnnouncement(response.data.annonce)
        } else {
          setError("Annonce non trouvée")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors du chargement de l'annonce")
      } finally {
        setLoading(false)
      }
    }

    fetchAnnouncement()
  }, [id, token])

  // Check if announcement is in favorites
  useEffect(() => {
    async function checkFavorite() {
      if (!token) {
        console.log("⭐ [FAV] Pas de token, favoris non vérifiés")
        return
      }
      try {
        console.log("⭐ [FAV] Vérification si l'annonce est en favori...")
        const response = await favoriteApi.getAll(token)
        console.log("⭐ [FAV] Réponse API favoris:", response)
        if (response.success && response.data) {
          const isFav = (response.data as any[]).some((fav: any) => fav._id === id)
          console.log(`⭐ [FAV] Annonce ${id} est en favori: ${isFav}`)
          setIsFavorite(isFav)
        }
      } catch (err) {
        console.error("❌ [FAV] Erreur lors de la vérification des favoris:", err)
        // Silently fail - favorites are optional
      }
    }

    if (token && announcement) {
      checkFavorite()
    }
  }, [token, announcement, id])

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Chargement de l'annonce...</p>
      </div>
    )
  }

  if (error || !announcement) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{error || "Annonce non trouvée"}</p>
      </div>
    )
  }

  const images = announcement.images || []
  const hasMultipleImages = images.length > 1
  const currentImage = images[currentImageIndex] || "/placeholder.jpg"

  const nextImage = () => {
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }
  }

  const prevImage = () => {
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }
  }

  const handleDelete = async () => {
    if (!token || !announcement?._id) return
    if (!confirm("Supprimer cette annonce ?")) return
    try {
      await annonceApi.delete(announcement._id, token)
      toast({ title: "Annonce supprimée" })
      setAnnouncement(null)
    } catch (err) {
      toast({ title: "Suppression impossible", description: err instanceof Error ? err.message : "Erreur" })
    }
  }

  const handleReport = () => {
    if (!token || !announcement?._id) {
      toast({ title: "Connectez-vous pour signaler" })
      return
    }
    setShowReportModal(true)
  }

  const handleReportSubmit = async (reason: string, description: string) => {
    if (!token || !announcement?._id) {
      toast({ title: "Erreur d'authentification" })
      return
    }

    setIsReporting(true)
    try {
      console.log("[REPORT] Envoi du signalement:", {
        announcementId: announcement._id,
        reason,
        descriptionLength: description.length,
      })

      await reportApi.createAnnonceReport(announcement._id, reason, description, token)

      console.log("[REPORT] Signalement réussi")
      toast({ title: "Signalement envoyé avec succès" })
      setShowReportModal(false)
    } catch (err) {
      console.error("[REPORT] Erreur lors du signalement:", err)
      const errorMsg = err instanceof Error ? err.message : "Erreur inconnue"
      throw new Error(errorMsg)
    } finally {
      setIsReporting(false)
    }
  }

  const handleAddFavorite = async () => {
    if (!token) {
      console.log("⭐ [FAV] Pas authentifié, redirection nécessaire")
      toast({ title: "Connectez-vous pour ajouter aux favoris" })
      return
    }
    
    console.log(`⭐ [FAV] Début du toggle favori. isFavorite actuel: ${isFavorite}`)
    console.log(`⭐ [FAV] ID annonce: ${announcement._id}`)
    setFavoriteLoading(true)
    try {
      if (isFavorite) {
        // Remove from favorites
        console.log("⭐ [FAV] Appel DELETE pour retirer des favoris...")
        await favoriteApi.remove(announcement._id, token)
        console.log("⭐ [FAV] Suppression réussie!")
        setIsFavorite(false)
        showNotification("Retiré des favoris", "info")
      } else {
        // Add to favorites
        console.log("⭐ [FAV] Appel POST pour ajouter aux favoris...")
        await favoriteApi.add(announcement._id, token)
        console.log("⭐ [FAV] Ajout réussi!")
        setIsFavorite(true)
        showNotification("Ajouté aux favoris", "success")
      }
    } catch (err) {
      console.error("❌ [FAV] Erreur lors du toggle favori:", err)
      showNotification(err instanceof Error ? err.message : "Impossible de modifier les favoris", "error")
      // Revert the state on error
      setIsFavorite(!isFavorite)
    } finally {
      setFavoriteLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Image Gallery */}
        <div className="lg:col-span-2 space-y-2">
          <Card className="overflow-hidden bg-muted aspect-square relative">
            <Image
              src={currentImage}
              alt={`${announcement.title} - Photo ${currentImageIndex + 1}`}
              fill
              className="object-cover"
            />
            {hasMultipleImages && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                  aria-label="Image précédente"
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                  aria-label="Image suivante"
                >
                  <ChevronRight className="size-6" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </Card>

          {/* Thumbnail images */}
          {hasMultipleImages && (
            <div className="flex gap-2">
              {images.map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    index === currentImageIndex ? "border-primary" : "border-border hover:border-primary"
                  }`}
                >
                  <Image src={image} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h1 className="text-3xl font-bold text-foreground">{announcement.title}</h1>

            <div className="flex items-center justify-between gap-2">
              {user?._id === announcement.owner?._id && (
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  <Trash2 className="size-4 mr-2" /> Supprimer
                </Button>
              )}
              
              {/* Favorite Heart Button - VISIBLE */}
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddFavorite}
                disabled={favoriteLoading}
                className={`${
                  isFavorite
                    ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100"
                    : "text-rose-600 border-rose-200 hover:bg-rose-50"
                }`}
              >
                <Heart className={`size-4 mr-2 ${isFavorite ? "fill-current" : ""}`} />
                {isFavorite ? "Retiré des favoris" : "Ajouter aux favoris"}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleReport}>
                    <Flag className="size-4 mr-2" />
                    Signaler
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {announcement.type === "vente" && announcement.price && (
              <div className="space-y-2 border-t border-border pt-4">
                <p className="text-sm text-muted-foreground">Prix</p>
                <p className="text-2xl font-bold text-rose-600">{announcement.price}€</p>
              </div>
            )}

            <div className="space-y-2 border-t border-border pt-4">
              <p className="text-sm text-muted-foreground">Publié par</p>
              <p className="text-lg font-semibold text-foreground">
                {announcement.owner?.firstName || "Utilisateur"} {announcement.owner?.lastName || ""}
              </p>
            </div>

            <div className="space-y-2 border-t border-border pt-4">
              <p className="text-sm text-muted-foreground">Date de publication</p>
              <p className="text-foreground">
                {new Date(announcement.createdAt).toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <InterestedModal
              announcementId={announcement._id}
              announcementTitle={announcement.title}
              announcementType={announcement.type}
              ownerName={`${announcement.owner?.firstName || "Utilisateur"} ${announcement.owner?.lastName || ""}`}
            />
          </Card>
        </div>
      </div>

      {/* Full Description */}
      <Card className="p-6 space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Description</h2>
        <p className="text-foreground leading-relaxed whitespace-pre-wrap">{announcement.description}</p>

        {announcement.type === "echange" && announcement.exchangeFor && (
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm font-semibold text-orange-900 mb-2">Ce qu'il recherche en échange:</p>
            <p className="text-foreground">{announcement.exchangeFor}</p>
          </div>
        )}

        {announcement.type === "pret" && announcement.borrowPeriod && (
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm font-semibold text-orange-900 mb-2">Période de prêt:</p>
            <p className="text-foreground">{announcement.borrowPeriod}</p>
          </div>
        )}
      </Card>

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReportSubmit}
        targetType="annonce"
        targetName={announcement?.title}
        isLoading={isReporting}
      />
    </div>
  )
}
