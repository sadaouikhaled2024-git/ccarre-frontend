"use client"

import Link from "next/link"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart } from "lucide-react"
import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { annonceApi } from "@/lib/annonce-api"

const categoryColors: Record<string, string> = {
  livres: "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-100",
  électronique: "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-100",
  mobilier: "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-100",
  accessoires: "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-100",
  vêtements: "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-100",
  sports: "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-100",
  outils: "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-100",
  autre: "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-100",
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
  const { token } = useAuth()
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [liked, setLiked] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const response = await annonceApi.getAll({}, token || undefined)
        if (response.success && response.data) {
          setAnnouncements(response.data.annonces || [])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAnnouncements()
  }, [token])

  const toggleLike = (id: string) => {
    const newLiked = new Set(liked)
    if (newLiked.has(id)) {
      newLiked.delete(id)
    } else {
      newLiked.add(id)
    }
    setLiked(newLiked)
  }

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="h-full overflow-hidden bg-gradient-to-br from-background to-muted/30 animate-pulse">
            <div className="aspect-square bg-muted" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {announcements.map((announcement) => {
        const isLiked = liked.has(announcement._id)
        const owner = announcement.owner || {}
        const userInitials = `${owner.firstName?.[0] ?? ""}${owner.lastName?.[0] ?? ""}`

        return (
          <Link key={announcement._id} href={`/announcements/${announcement._id}`}>
            <div className="group h-full">
              <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-background to-muted/30">
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <Image
                    src={announcement.images?.[0] || "/placeholder.jpg"}
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
                      toggleLike(announcement._id)
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
                    <Badge className={`${categoryColors[announcement.category?.toLowerCase()] || "bg-gray-100 text-gray-800"} text-xs font-semibold`}>
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
                    {announcement.price && (
                      <p className="text-xl font-bold text-primary">{announcement.price}€</p>
                    )}
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
                        <AvatarImage src={owner.profileImage as string | undefined} alt={`${owner.firstName} ${owner.lastName}`} />
                        <AvatarFallback className="bg-primary/20 text-xs font-semibold">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="text-xs font-semibold text-foreground">
                          {owner.firstName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(announcement.createdAt)}
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
