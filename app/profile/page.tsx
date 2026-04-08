"use client"

import { useEffect, useMemo, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Mail, GraduationCap, Calendar, MapPin, Package, Edit, Plus, AlertTriangle, AlertCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { annonceApi, type Annonce } from "@/lib/annonce-api"
import { favoriteApi } from "@/lib/favorite-api"

export default function ProfilePage() {
  const { isAuthenticated, loading, user, token } = useAuth()
  const router = useRouter()
  const [announcements, setAnnouncements] = useState<Annonce[]>([])
  const [favoritesCount, setFavoritesCount] = useState(0)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/auth")
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    if (!token) return

    const fetchData = async () => {
      try {
        setIsLoadingData(true)
        setError(null)

        const [myAnnoncesRes, favoritesRes] = await Promise.all([
          annonceApi.getAll({ mine: "true" }, token),
          favoriteApi.getAll(token),
        ])

        const annonces = myAnnoncesRes.data?.annonces ?? []
        setAnnouncements(annonces)
        setFavoritesCount(Array.isArray(favoritesRes.data) ? favoritesRes.data.length : 0)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Impossible de charger vos données")
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchData()
  }, [token])

  const stats = useMemo(() => {
    const total = announcements.length
    const active = announcements.filter((a) => a.status === "disponible").length
    const sold = announcements.filter((a) => a.status === "vendu").length

    return { total, active, sold }
  }, [announcements])

  if (loading || !isAuthenticated) return null

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-4xl px-6">
          {error && (
            <Card className="mb-6 border-destructive/40">
              <CardContent className="pt-6 text-sm text-destructive">{error}</CardContent>
            </Card>
          )}

          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
                <Avatar className="size-24 border-4 border-primary/20">
                  <AvatarImage src={(user as any)?.profileImage} alt={`${user?.firstName} ${user?.lastName}`} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {`${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}` || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center gap-2 justify-center md:justify-start flex-wrap">
                    <h1 className="text-2xl font-bold text-foreground">{`${user?.firstName ?? ""} ${user?.lastName ?? ""}`}</h1>
                    {(user as any)?.reportCount > 0 && (
                      <Badge className="bg-destructive text-white gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Signalé
                      </Badge>
                    )}
                    {(user as any)?.riskScore && (user as any)?.riskScore >= 50 && (
                      <Badge className={`gap-1 ${(user as any)?.riskScore >= 80 ? 'bg-destructive text-white' : 'bg-yellow-600 text-white'}`}>
                        <AlertCircle className="h-3 w-3" />
                        Risque élevé
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3 flex flex-col gap-2">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground md:justify-start">
                      <Mail className="size-4" />
                      <span className="text-sm">{user?.email}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground md:justify-start">
                      <GraduationCap className="size-4" />
                      <span className="text-sm">Université Aix-Marseille</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground md:justify-start">
                      <MapPin className="size-4" />
                      <span className="text-sm">Campus AMU</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground md:justify-start">
                      <Calendar className="size-4" />
                      <span className="text-sm">
                        Membre depuis {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR") : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Edit className="size-4" />
                  Modifier le profil
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                  <Package className="size-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Annonces publiées</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex size-12 items-center justify-center rounded-full bg-secondary/10">
                  <Package className="size-6 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.active}</p>
                  <p className="text-sm text-muted-foreground">Annonces disponibles</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex size-12 items-center justify-center rounded-full bg-accent/10">
                  <Package className="size-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{favoritesCount}</p>
                  <p className="text-sm text-muted-foreground">Favoris enregistrés</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Announcements Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <div className="mb-6 flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="all">Toutes</TabsTrigger>
                <TabsTrigger value="active">Disponibles</TabsTrigger>
                <TabsTrigger value="sold">Vendues</TabsTrigger>
              </TabsList>
              <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="size-4" />
                Nouvelle annonce
              </Button>
            </div>

            <TabsContent value="all" className="mt-0">
              <div className="grid gap-4">
                {isLoadingData ? (
                  <p className="text-sm text-muted-foreground">Chargement de vos annonces...</p>
                ) : announcements.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune annonce publiée pour le moment.</p>
                ) : (
                  announcements.map((announcement) => (
                    <AnnouncementCard key={announcement._id} announcement={announcement} />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="active" className="mt-0">
              <div className="grid gap-4">
                {announcements
                  .filter((a) => a.status === "disponible")
                  .map((announcement) => (
                    <AnnouncementCard key={announcement._id} announcement={announcement} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="sold" className="mt-0">
              <div className="grid gap-4">
                {announcements
                  .filter((a) => a.status === "vendu")
                  .map((announcement) => (
                    <AnnouncementCard key={announcement._id} announcement={announcement} />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function AnnouncementCard({ announcement }: { announcement: Annonce }) {
  const priceLabel =
    announcement.type === "vente" && announcement.price !== undefined
      ? `${announcement.price} EUR`
      : announcement.type === "pret"
        ? "Prêt"
        : "N/A"

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="relative h-32 w-full sm:h-auto sm:w-40">
            <Image
              src={announcement.images?.[0] || "/placeholder.jpg"}
              alt={announcement.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-1 flex-col justify-between p-4">
            <div>
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-semibold text-foreground">{announcement.title}</h3>
                <Badge
                  variant={announcement.status === "disponible" ? "default" : "secondary"}
                  className={announcement.status === "disponible" ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"}
                >
                  {announcement.status === "disponible" ? "Disponible" : "Vendu"}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{announcement.description}</p>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-bold text-primary">{priceLabel}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(announcement.createdAt).toLocaleDateString("fr-FR")}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
