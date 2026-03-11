"use client"

import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ContactForm } from "@/components/contact-form"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Mock data - in a real app, this would come from an API/database
const announcementDetails: Record<
  string,
  {
    id: number
    title: string
    description: string
    fullDescription: string
    images: string[]
    publisherFirstName: string
    publisherLastName: string
    publishedAt: string
  }
> = {
  "1": {
    id: 1,
    title: "Chaise de Bureau Gaming",
    description: "Chaise gaming très confortable, légèrement usée mais en bon état",
    fullDescription:
      "Bonjour, je vends ma chaise gaming car j'ai changé de configuration. Elle est en très bon état, très confortable avec support lombaire et appui-tête ajustable. Les accoudoirs sont également ajustables. La chaise a quelques marques d'usure superficielles mais fonctionne parfaitement. Parfait pour les longues sessions d'étude ou de gaming!",
    images: ["/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg"],
    publisherFirstName: "Marie",
    publisherLastName: "Dupont",
    publishedAt: "2024-03-10",
  },
  "2": {
    id: 2,
    title: "Livre - Analyse Mathématique",
    description: "Manuel d'analyse mathématique S3, très utile pour les cours",
    fullDescription:
      "Manuel complet d'analyse mathématique pour le semestre 3. Contient de nombreux exercices corrigés et des exemples concrets. Très utilisé en classe, légèrement annoté mais les annotations sont facilement ignorables. Les pages sont en bon état. Idéal pour préparer les examens!",
    images: ["/placeholder.jpg", "/placeholder.jpg"],
    publisherFirstName: "Jean",
    publisherLastName: "Martin",
    publishedAt: "2024-03-09",
  },
  "3": {
    id: 3,
    title: "Lampe de Bureau LED",
    description: "Lampe LED blanche, design moderne, parfait pour l'étude",
    fullDescription:
      "Lampe LED de qualité supérieure avec 5 niveaux de luminosité réglables. Très économe en énergie, dure très longtemps. Design épuré et moderne qui s'adapte à tout type de bureau. L'ampoule LED dure jusqu'à 50 000 heures! Pratiquement neuve, à peine utilisée.",
    images: ["/placeholder.jpg"],
    publisherFirstName: "Sophie",
    publisherLastName: "Bernard",
    publishedAt: "2024-03-08",
  },
  "4": {
    id: 4,
    title: "Clavier Mécanique",
    description: "Clavier mécanique RGB, switches bleus, excellent état",
    fullDescription:
      "Clavier mécanique 87 touches avec switches bleus (tactiles et bruyants). RGB éclairage avec plusieurs modes. Excellent état général, utilisé peu. Idéal pour le gaming et la dactylographie. Livré avec câble USB et mode sans fil.",
    images: ["/placeholder.jpg", "/placeholder.jpg"],
    publisherFirstName: "Pierre",
    publisherLastName: "Laurent",
    publishedAt: "2024-03-07",
  },
  "5": {
    id: 5,
    title: "Souris Logitech MX Master 3",
    description: "Souris ergonomique de haute qualité, comme neuve",
    fullDescription:
      "Souris Logitech MX Master 3 - l'une des meilleures souris du marché. Ergonomique, plusieurs boutons programmables, précision exceptionnelle. Compatible Windows et Mac. Comme neuve, très peu utilisée. Batterie dure des semaines!",
    images: ["/placeholder.jpg"],
    publisherFirstName: "Emma",
    publisherLastName: "Moreau",
    publishedAt: "2024-03-06",
  },
  "6": {
    id: 6,
    title: "Sac à Dos Universitaire",
    description: "Grand sac à dos noir, nombreux compartiments, parfait pour les cours",
    fullDescription:
      "Grand sac à dos de marque renommée, capacité 30L. Plusieurs compartiments avec pochettes spécialisées pour ordinateur portable. Bretelles ergonomiques et rembourées. Très résistant et durable. Coloris noir classique. Excellent pour transporter livres et ordinateur à l'université!",
    images: ["/placeholder.jpg", "/placeholder.jpg"],
    publisherFirstName: "Lucas",
    publisherLastName: "Fournier",
    publishedAt: "2024-03-05",
  },
}

interface AnnouncementDetailProps {
  id: string
}

export function AnnouncementDetail({ id }: AnnouncementDetailProps) {
  const announcement = announcementDetails[id]
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showContactForm, setShowContactForm] = useState(false)

  if (!announcement) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Annonce non trouvée</p>
      </div>
    )
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % announcement.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + announcement.images.length) % announcement.images.length)
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Image Gallery */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="overflow-hidden bg-muted aspect-video relative">
            <Image
              src={announcement.images[currentImageIndex]}
              alt={`${announcement.title} - Photo ${currentImageIndex + 1}`}
              fill
              className="object-cover"
            />
            {announcement.images.length > 1 && (
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
                  {currentImageIndex + 1} / {announcement.images.length}
                </div>
              </>
            )}
          </Card>

          {/* Thumbnail images */}
          {announcement.images.length > 1 && (
            <div className="flex gap-2">
              {announcement.images.map((image, index) => (
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

            <div className="space-y-2 border-t border-border pt-4">
              <p className="text-sm text-muted-foreground">Publié par</p>
              <p className="text-lg font-semibold text-foreground">
                {announcement.publisherFirstName} {announcement.publisherLastName}
              </p>
            </div>

            <div className="space-y-2 border-t border-border pt-4">
              <p className="text-sm text-muted-foreground">Date de publication</p>
              <p className="text-foreground">
                {new Date(announcement.publishedAt).toLocaleDateString("fr-FR", {
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
        <p className="text-foreground leading-relaxed whitespace-pre-wrap">{announcement.fullDescription}</p>
      </Card>

      {/* Contact Form Modal */}
      {showContactForm && (
        <ContactForm
          announcementTitle={announcement.title}
          publisherName={`${announcement.publisherFirstName} ${announcement.publisherLastName}`}
          onClose={() => setShowContactForm(false)}
        />
      )}
    </div>
  )
}
