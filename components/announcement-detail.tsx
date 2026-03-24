"use client"

import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { ContactForm } from "@/components/contact-form"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { annonceApi } from "@/lib/annonce-api"

interface AnnouncementDetailProps {
  id: string
}

export function AnnouncementDetail({ id }: AnnouncementDetailProps) {
  const { token } = useAuth()
  const [announcement, setAnnouncement] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showContactForm, setShowContactForm] = useState(false)

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

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Image Gallery */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="overflow-hidden bg-muted aspect-video relative">
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

            <Button
              onClick={() => setShowContactForm(true)}
              className="w-full bg-primary text-primary-foreground hover:bg-accent transition-colors mt-4"
            >
              Contacter le propriétaire
            </Button>
          </Card>
        </div>
      </div>

      {/* Full Description */}
      <Card className="p-6 space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Description</h2>
        <p className="text-foreground leading-relaxed whitespace-pre-wrap">{announcement.description}</p>

        {announcement.type === "echange" && announcement.exchangeFor && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm font-semibold text-amber-900 mb-2">Ce qu'il recherche en échange:</p>
            <p className="text-foreground">{announcement.exchangeFor}</p>
          </div>
        )}

        {announcement.type === "pret" && announcement.borrowPeriod && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-semibold text-blue-900 mb-2">Période de prêt:</p>
            <p className="text-foreground">{announcement.borrowPeriod}</p>
          </div>
        )}
      </Card>

      {/* Contact Form Modal */}
      {showContactForm && (
        <ContactForm
          announcementTitle={announcement.title}
          publisherName={`${announcement.owner?.firstName || "Utilisateur"} ${announcement.owner?.lastName || ""}`}
          onClose={() => setShowContactForm(false)}
        />
      )}
    </div>
  )
}
