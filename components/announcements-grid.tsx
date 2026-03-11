"use client"

import Link from "next/link"
import Image from "next/image"
import { Card } from "@/components/ui/card"

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
  },
  {
    id: 2,
    title: "Livre - Analyse Mathématique",
    description: "Manuel d'analyse mathématique S3, très utile pour les cours",
    image: "/placeholder.jpg",
    publisherFirstName: "Jean",
    publisherLastName: "Martin",
    publishedAt: "2024-03-09",
  },
  {
    id: 3,
    title: "Lampe de Bureau LED",
    description: "Lampe LED blanche, design moderne, parfait pour l'étude",
    image: "/placeholder.jpg",
    publisherFirstName: "Sophie",
    publisherLastName: "Bernard",
    publishedAt: "2024-03-08",
  },
  {
    id: 4,
    title: "Clavier Mécanique",
    description: "Clavier mécanique RGB, switches bleus, excellent état",
    image: "/placeholder.jpg",
    publisherFirstName: "Pierre",
    publisherLastName: "Laurent",
    publishedAt: "2024-03-07",
  },
  {
    id: 5,
    title: "Souris Logitech MX Master 3",
    description: "Souris ergonomique de haute qualité, comme neuve",
    image: "/placeholder.jpg",
    publisherFirstName: "Emma",
    publisherLastName: "Moreau",
    publishedAt: "2024-03-06",
  },
  {
    id: 6,
    title: "Sac à Dos Universitaire",
    description: "Grand sac à dos noir, nombreux compartiments, parfait pour les cours",
    image: "/placeholder.jpg",
    publisherFirstName: "Lucas",
    publisherLastName: "Fournier",
    publishedAt: "2024-03-05",
  },
]

export function AnnouncementsGrid() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {announcements.map((announcement) => (
        <Link key={announcement.id} href={`/announcements/${announcement.id}`}>
          <Card className="group h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer">
            <div className="relative aspect-square overflow-hidden bg-muted">
              <Image
                src={announcement.image}
                alt={announcement.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="p-4 space-y-3">
              <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {announcement.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {announcement.description}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground">
                  {announcement.publisherFirstName} {announcement.publisherLastName}
                </p>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}
