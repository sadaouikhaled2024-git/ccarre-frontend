"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import Link from "next/link"
import Image from "next/image"
import { Heart, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState } from "react"
import { favoriteApi } from "@/lib/favorite-api"
import type { Annonce } from "@/lib/annonce-api"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function FavoritesPage() {
  const { isAuthenticated, loading, token } = useAuth()
  const router = useRouter()
  const [favorites, setFavorites] = useState<Annonce[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/auth")
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    if (!token) {
      console.log("⭐ [FAV PAGE] Pas de token")
      return
    }

    const fetchFavorites = async () => {
      try {
        console.log("⭐ [FAV PAGE] Chargement des favoris...")
        setIsLoadingData(true)
        setError(null)
        const response = await favoriteApi.getAll(token)
        console.log("⭐ [FAV PAGE] Réponse API:", response)
        setFavorites((response.data as Annonce[]) || [])
        console.log(`⭐ [FAV PAGE] ${(response.data as Annonce[])?.length || 0} favoris chargés`)
      } catch (err) {
        console.error("❌ [FAV PAGE] Erreur lors du chargement:", err)
        setError(err instanceof Error ? err.message : "Impossible de charger vos favoris")
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchFavorites()
  }, [token])

  const handleRemoveFavorite = async (e: React.MouseEvent<HTMLButtonElement>, annonceId: string) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("⭐ [FAV PAGE] Suppression du favori:", annonceId)
    if (!token) {
      console.error("❌ [FAV PAGE] Pas de token!")
      return
    }

    try {
      console.log("⭐ [FAV PAGE] Appel DELETE /api/favorites/:id...")
      await favoriteApi.remove(annonceId, token)
      console.log("⭐ [FAV PAGE] Suppression réussie!")
      setFavorites((prev) => prev.filter((fav) => fav._id !== annonceId))
      toast({ title: "Retiré des favoris" })
    } catch (err) {
      console.error("❌ [FAV PAGE] Erreur lors de la suppression:", err)
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Impossible de retirer des favoris",
      })
    }
  }

  if (loading || !isAuthenticated) return null

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-8 flex items-center gap-3">
            <Heart className="size-8 text-rose-500 fill-rose-500" />
            <h1 className="text-balance text-4xl font-bold text-foreground">Mes Favoris</h1>
          </div>
          
          {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

          <div className="space-y-4">
            {isLoadingData ? (
              <p className="text-muted-foreground">Chargement de vos favoris...</p>
            ) : favorites.length > 0 ? (
              favorites.map((item) => (
                <Link key={item._id} href={`/announcements/${item._id}`}>
                  <div className="flex gap-4 rounded-lg border border-border p-4 hover:shadow-lg transition-shadow cursor-pointer bg-card">
                    {/* Product Image */}
                    {item.images && item.images[0] ? (
                      <div className="relative h-32 w-32 shrink-0 rounded-lg overflow-hidden bg-muted border border-border">
                        <Image
                          src={item.images[0]}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-32 w-32 shrink-0 rounded-lg bg-muted border border-border" />
                    )}

                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-foreground line-clamp-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{item.category}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{item.description}</p>

                      {/* Type Badge & Price */}
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-xs px-2 py-1 rounded-full bg-rose-50 text-rose-700">
                          {item.type === "vente"
                            ? "Vente"
                            : item.type === "echange"
                              ? "Échange"
                              : item.type === "pret"
                                ? "Prêt"
                                : "Demande de Prêt"}
                        </span>
                        {item.price && <p className="text-lg font-bold text-orange-600">{item.price}€</p>}
                      </div>
                    </div>

                    {/* Owner Info & Remove Button */}
                    <div className="flex flex-col items-end justify-between">
                      <Button
                        onClick={(e) => handleRemoveFavorite(e, item._id)}
                        size="sm"
                        variant="outline"
                        className="text-rose-600 border-rose-200 hover:bg-rose-50"
                      >
                        <X className="size-4" />
                      </Button>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">
                          {item.owner?.firstName} {item.owner?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{item.owner?.email}</p>
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
