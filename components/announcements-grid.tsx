"use client"

import Link from "next/link"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, ChevronDown, AlertTriangle, AlertCircle } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { annonceApi } from "@/lib/annonce-api"
import { favoriteApi } from "@/lib/favorite-api"
import { showNotification } from "@/components/notification-toast"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

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

const typeLabels: Record<string, string> = {
  vente: "Vente",
  echange: "Échange",
  pret: "Prêt",
  demandePret: "Demande de Prêt",
}

const statusLabels: Record<string, string> = {
  disponible: "Disponible",
  reserve: "Réservé",
  vendu: "Vendu",
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

interface FilterState {
  category?: string
  type?: string
  status?: string
  priceMin?: number
  priceMax?: number
  sortBy?: "newest" | "price-low" | "price-high"
}

export function AnnouncementsGrid({
  searchQuery = "",
  onFiltersChange,
}: {
  searchQuery?: string
  onFiltersChange?: (count: number) => void
} = {}) {
  const { token } = useAuth()
  const { toast } = useToast()
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FilterState>({})
  const [allCategories, setAllCategories] = useState<string[]>([])
  const [allTypes, setAllTypes] = useState<string[]>([])
  const [allStatuses, setAllStatuses] = useState<string[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const response = await annonceApi.getAll({}, token || undefined)
        if (response.success && response.data) {
          const annonces = response.data.annonces || []
          setAnnouncements(annonces)

          // Extract unique categories, types, and statuses
          const categories = Array.from(new Set(annonces.map((a: any) => a.category).filter(Boolean)))
          const types = Array.from(new Set(annonces.map((a: any) => a.type).filter(Boolean)))
          const statuses = Array.from(new Set(annonces.map((a: any) => a.status).filter(Boolean)))

          setAllCategories(categories as string[])
          setAllTypes(types as string[])
          setAllStatuses(statuses as string[])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAnnouncements()
  }, [token])

  // Charger les favoris
  useEffect(() => {
    async function fetchFavorites() {
      if (!token) {
        console.log("⭐ [GRID] Pas de token, pas de chargement des favoris")
        return
      }
      try {
        console.log("⭐ [GRID] Chargement des favoris...")
        const response = await favoriteApi.getAll(token)
        console.log("⭐ [GRID] Réponse favoris:", response)
        
        // La réponse peut être un tableau directement ou { data: [...] }
        let favsList: any[] = []
        if (Array.isArray(response)) {
          favsList = response
        } else if (response && typeof response === 'object' && 'data' in response) {
          favsList = Array.isArray(response.data) ? response.data : []
        }
        
        const favIds = new Set<string>(favsList.map((f: any) => f._id))
        console.log("⭐ [GRID] IDs favoris:", Array.from(favIds))
        setFavoriteIds(favIds)
      } catch (err) {
        console.error("❌ [GRID] Erreur chargement favoris:", err)
      }
    }

    fetchFavorites()
  }, [token])

  const filteredAnnouncements = useMemo(() => {
    if (!hasSearched && !searchQuery) return []

    return announcements.filter((announcement) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          announcement.title?.toLowerCase().includes(query) ||
          announcement.description?.toLowerCase().includes(query) ||
          announcement.category?.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Category filter
      if (filters.category && announcement.category !== filters.category) {
        return false
      }

      // Type filter
      if (filters.type && announcement.type !== filters.type) {
        return false
      }

      // Status filter
      if (filters.status && announcement.status !== filters.status) {
        return false
      }

      // Price filters
      if (filters.priceMin !== undefined && announcement.price && announcement.price < filters.priceMin) {
        return false
      }
      if (filters.priceMax !== undefined && announcement.price && announcement.price > filters.priceMax) {
        return false
      }

      return true
    }).sort((a, b) => {
      if (filters.sortBy === "price-low") {
        return (a.price || 0) - (b.price || 0)
      } else if (filters.sortBy === "price-high") {
        return (b.price || 0) - (a.price || 0)
      } else {
        // newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })
  }, [announcements, searchQuery, filters, hasSearched])

  useEffect(() => {
    if (hasSearched) {
      onFiltersChange?.(filteredAnnouncements.length)
    }
  }, [filteredAnnouncements.length, hasSearched, onFiltersChange])

  useEffect(() => {
    setHasSearched(true)
  }, [searchQuery])

  const toggleFavorite = async (id: string) => {
    if (!token) {
      console.log("⭐ [GRID] Pas authentifié")
      toast({ title: "Connectez-vous pour ajouter aux favoris" })
      return
    }

    console.log("⭐ [GRID] Toggle favori:", id, "actuellement:", favoriteIds.has(id))

    try {
      if (favoriteIds.has(id)) {
        // Remove
        console.log("⭐ [GRID] Suppression du favori...")
        await favoriteApi.remove(id, token)
        setFavoriteIds((prev) => {
          const newSet = new Set(prev)
          newSet.delete(id)
          return newSet
        })
        console.log("⭐ [GRID] Suppression réussie!")
        showNotification("Retiré des favoris", "info")
      } else {
        // Add
        console.log("⭐ [GRID] Ajout du favori...")
        await favoriteApi.add(id, token)
        setFavoriteIds((prev) => new Set([...prev, id]))
        console.log("⭐ [GRID] Ajout réussi!")
        showNotification("Ajouté aux favoris", "success")
      }
    } catch (err) {
      console.error("❌ [GRID] Erreur toggle favori:", err)
      showNotification(err instanceof Error ? err.message : "Impossible de modifier les favoris", "error")
    }
  }

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === prev[key] ? undefined : value,
    }))
  }

  const updateRangeFilter = (key: "priceMin" | "priceMax", value: number | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const hasActiveFilters =
    filters.category ||
    filters.type ||
    filters.status ||
    filters.priceMin !== undefined ||
    filters.priceMax !== undefined

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-muted rounded animate-pulse" />
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
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter & Sort Bar */}
      {hasSearched && (
        <div className="flex flex-wrap gap-3 items-center pb-4 border-b border-border/50">
          {/* Category Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                Catégorie {filters.category && <span className="text-rose-500">●</span>}
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {allCategories.length > 0 ? (
                allCategories.map((category) => (
                  <DropdownMenuCheckboxItem
                    key={category}
                    checked={filters.category === category}
                    onCheckedChange={() => updateFilter("category", category)}
                  >
                    {category}
                  </DropdownMenuCheckboxItem>
                ))
              ) : (
                <DropdownMenuItem disabled>Aucune catégorie</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Type Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                Type {filters.type && <span className="text-rose-500">●</span>}
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {allTypes.length > 0 ? (
                allTypes.map((type) => (
                  <DropdownMenuCheckboxItem
                    key={type}
                    checked={filters.type === type}
                    onCheckedChange={() => updateFilter("type", type)}
                  >
                    {type === "vente" && "Vente"}
                    {type === "echange" && "Échange"}
                    {type === "pret" && "Prêt"}
                    {type === "demandePret" && "Demande de Prêt"}
                  </DropdownMenuCheckboxItem>
                ))
              ) : (
                <DropdownMenuItem disabled>Aucun type</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                Statut {filters.status && <span className="text-rose-500">●</span>}
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {allStatuses.length > 0 ? (
                allStatuses.map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={filters.status === status}
                    onCheckedChange={() => updateFilter("status", status)}
                  >
                    {status === "disponible" && "Disponible"}
                    {status === "reserve" && "Réservé"}
                    {status === "vendu" && "Vendu"}
                  </DropdownMenuCheckboxItem>
                ))
              ) : (
                <DropdownMenuItem disabled>Aucun statut</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Price Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                Prix {(filters.priceMin !== undefined || filters.priceMax !== undefined) && <span className="text-rose-500">●</span>}
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 p-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Prix minimum</label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.priceMin ?? ""}
                  onChange={(e) => updateRangeFilter("priceMin", e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full mt-1 px-2 py-1 text-sm border border-border rounded"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground">Prix maximum</label>
                <input
                  type="number"
                  placeholder="∞"
                  value={filters.priceMax ?? ""}
                  onChange={(e) => updateRangeFilter("priceMax", e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full mt-1 px-2 py-1 text-sm border border-border rounded"
                />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                Trier {filters.sortBy && filters.sortBy !== "newest" && <span className="text-rose-500">●</span>}
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuCheckboxItem
                checked={!filters.sortBy || filters.sortBy === "newest"}
                onCheckedChange={() => updateFilter("sortBy", "newest")}
              >
                Plus récent
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.sortBy === "price-low"}
                onCheckedChange={() => updateFilter("sortBy", "price-low")}
              >
                Prix croissant
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.sortBy === "price-high"}
                onCheckedChange={() => updateFilter("sortBy", "price-high")}
              >
                Prix décroissant
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Results Count */}
          <span className="text-sm font-semibold text-foreground ml-auto">
            {filteredAnnouncements.length} résultat{filteredAnnouncements.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Results */}
      {!hasSearched ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Utilisez la barre de recherche pour trouver des annonces</p>
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucune annonce ne correspond à vos critères de recherche.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAnnouncements.map((announcement) => {
            const isFavorited = favoriteIds.has(announcement._id)
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
                          toggleFavorite(announcement._id)
                        }}
                        className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full p-2 transition-all duration-200 hover:scale-110 shadow-lg"
                      >
                        <Heart
                          className={`size-5 transition-all duration-200 ${
                            isFavorited ? "fill-rose-600 text-rose-600" : "text-foreground/60"
                          }`}
                        />
                      </button>

                      {/* Status Badges */}
                      <div className="absolute bottom-3 left-3 flex flex-col gap-1">
                        <Badge className={`${categoryColors[announcement.category?.toLowerCase()] || "bg-gray-100 text-gray-800"} text-xs font-semibold`}>
                          {announcement.category}
                        </Badge>
                        {announcement.reportCount > 0 && (
                          <Badge className="bg-destructive text-white text-xs gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Signalé({announcement.reportCount})
                          </Badge>
                        )}
                        {announcement.riskScore && announcement.riskScore >= 50 && (
                          <Badge className={`text-xs gap-1 ${announcement.riskScore >= 80 ? 'bg-destructive text-white' : 'bg-yellow-600 text-white'}`}>
                            <AlertCircle className="h-3 w-3" />
                            {announcement.riskScore >= 80 ? 'Critique' : 'Risque'}
                          </Badge>
                        )}
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
      )}
    </div>
  )
}
