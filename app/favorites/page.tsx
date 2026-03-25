"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Heart } from "lucide-react"

export default function FavoritesPage() {
  // Mock favorites data - not fetched for now
  const mockFavorites = [
    {
      _id: "1",
      title: "MacBook Pro 2023",
      category: "électronique",
      price: 1200,
      image: "/placeholder.jpg",
      owner: {
        firstName: "Jean",
        lastName: "Dupont",
      },
    },
    {
      _id: "2",
      title: "Livres Python Avancé",
      category: "livres",
      price: 45,
      image: "/placeholder.jpg",
      owner: {
        firstName: "Marie",
        lastName: "Martin",
      },
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-8 flex items-center gap-3">
            <Heart className="size-8 text-rose-500 fill-rose-500" />
            <h1 className="text-balance text-4xl font-bold text-foreground">Mes Favoris</h1>
          </div>
          
          <div className="space-y-4">
            {mockFavorites.length > 0 ? (
              mockFavorites.map((item) => (
                <Link key={item._id} href={`/announcements/${item._id}`}>
                  <div className="flex gap-4 rounded-lg border border-border p-4 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="h-24 w-24 flex-shrink-0 rounded-lg bg-muted" />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-foreground">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                      <p className="mt-2 text-lg font-bold text-primary">{item.price}€</p>
                    </div>
                    <div className="flex items-center justify-end">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">
                          {item.owner.firstName} {item.owner.lastName}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-12">
                <Heart className="size-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Vous n'avez pas encore d'annonces en favoris</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
