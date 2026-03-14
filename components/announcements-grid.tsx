"use client"

import Link from "next/link"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart } from "lucide-react"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock data - in a real app, this would come from an API/database
const announcements = [
  {
    id: 1,
    title: "Chaise de Bureau Gaming",
    description: "Chaise gaming très confortable, légèrement usée mais en bon état",
    image: "/placeholder.jpg",
    publisherFirstName: "Marie",
    publisherLastName: "Dupont",
    publishedAt: "2024-03-10",
    category: "Mobilier",
    price: "150€",
  },
  {
    id: 2,
    title: "Livre - Analyse Mathématique",
    description: "Manuel d'analyse mathématique S3, très utile pour les cours",
    image: "/placeholder.jpg",
    publisherFirstName: "Jean",
    publisherLastName: "Martin",
    publishedAt: "2024-03-09",
    category: "Livres",
    price: "20€",
  },
  {
    id: 3,
    title: "Lampe de Bureau LED",
    description: "Lampe LED blanche, design moderne, parfait pour l'étude",
    image: "/placeholder.jpg",
    publisherFirstName: "Sophie",
    publisherLastName: "Bernard",
    publishedAt: "2024-03-08",
    category: "Électronique",
    price: "45€",
  },
  {
    id: 4,
    title: "Clavier Mécanique",
    description: "Clavier mécanique RGB, switches bleus, excellent état",
    image: "/placeholder.jpg",
    publisherFirstName: "Pierre",
    publisherLastName: "Laurent",
    publishedAt: "2024-03-07",
    category: "Électronique",
    price: "120€",
  },
  {
    id: 5,
    title: "Souris Logitech MX Master 3",
    description: "Souris ergonomique de haute qualité, comme neuve",
    image: "/placeholder.jpg",
    publisherFirstName: "Emma",
    publisherLastName: "Moreau",
    publishedAt: "2024-03-06",
    category: "Accessoires",
    price: "80€",
  },
  {
    id: 6,
    title: "Sac à Dos Universitaire",
    description: "Grand sac à dos noir, nombreux compartiments, parfait pour les cours",
    image: "/placeholder.jpg",
    publisherFirstName: "Lucas",
    publisherLastName: "Fournier",
    publishedAt: "2024-03-05",
    category: "Accessoires",
    price: "35€",
  },
]

const categoryColors: Record<string, string> = {
  Mobilier: "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-100",
  Livres: "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-100",
  Électronique: "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-100",
  Accessoires: "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-100",
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return "Aujourd'hui"
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Hier"
  } else {
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    })
  }
}

export function AnnouncementsGrid() {
  const [liked, setLiked] = useState<Set<number>>(new Set())

  const toggleLike = (id: number) => {
    const newLiked = new Set(liked)
    if (newLiked.has(id)) {
      newLiked.delete(id)
    } else {
      newLiked.add(id)
    }
    setLiked(newLiked)
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {announcements.map((announcement) => {
        const isLiked = liked.has(announcement.id)
        const userInitials = `${announcement.publisherFirstName[0]}${announcement.publisherLastName[0]}`

        return (
          <Link key={announcement.id} href={`/announcements/${announcement.id}`}>
            <div className="group h-full">
              <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-background to-muted/30">
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <Image
                    src={announcement.image}
                    alt={announcement.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Like Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      toggleLike(announcement.id)
                    }}
                    className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full p-2 transition-all duration-200 hover:scale-110 shadow-lg"
                  >
                    <Heart
                      className={`size-5 transition-all duration-200 ${
                        isLiked ? "fill-red-500 text-red-500" : "text-foreground/60"
                      }`}
                    />
                  </button>

                  {/* Category Badge */}
                  <div className="absolute bottom-3 left-3">
                    <Badge className={`${categoryColors[announcement.category] || "bg-gray-100 text-gray-800"} text-xs font-semibold`}>
                      {announcement.category}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                  {/* Title & Price */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {announcement.title}
                    </h3>
                    <p className="text-xl font-bold text-primary">{announcement.price}</p>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-2 group-hover:line-clamp-3 transition-all">
                    {announcement.description}
                  </p>

                  {/* Divider */}
                  <div className="border-t border-border/30" />

                  {/* Footer: Publisher & Date */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-border">
                        <AvatarImage src={""} alt={`${announcement.publisherFirstName} ${announcement.publisherLastName}`} />
                        <AvatarFallback className="bg-primary/20 text-xs font-semibold">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="text-xs font-semibold text-foreground">
                          {announcement.publisherFirstName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(announcement.publishedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
