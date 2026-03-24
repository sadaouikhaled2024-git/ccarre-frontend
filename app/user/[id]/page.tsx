"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GraduationCap, Calendar, MapPin, Package, MessageCircle, Flag, Ban, MoreVertical } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useParams } from "next/navigation"
import { useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock users data - in a real app this would come from an API
const mockUsers: Record<string, {
  id: string
  name: string
  avatar: string
  campus: string
  department: string
  joinedDate: string
  announcesCount: number
  isOnline: boolean
}> = {
  "u1": {
    id: "u1",
    name: "Marie Dupont",
    avatar: "",
    campus: "Campus Aix-en-Provence",
    department: "Faculté des Sciences",
    joinedDate: "Septembre 2024",
    announcesCount: 8,
    isOnline: true,
  },
  "u2": {
    id: "u2",
    name: "Lucas Martin",
    avatar: "",
    campus: "Campus Marseille Luminy",
    department: "Faculté des Lettres",
    joinedDate: "Octobre 2023",
    announcesCount: 12,
    isOnline: false,
  },
  "u3": {
    id: "u3",
    name: "Sophie Bernard",
    avatar: "",
    campus: "Campus Aix-en-Provence",
    department: "Faculté de Droit",
    joinedDate: "Janvier 2024",
    announcesCount: 5,
    isOnline: true,
  },
  "u4": {
    id: "u4",
    name: "Thomas Petit",
    avatar: "",
    campus: "Campus Marseille Centre",
    department: "Faculté des Sciences",
    joinedDate: "Septembre 2023",
    announcesCount: 15,
    isOnline: false,
  },
}

// Mock user announcements
const mockUserAnnouncements: Record<string, Array<{
  id: string
  title: string
  description: string
  price: number
  image: string
  status: string
  createdAt: string
}>> = {
  "u1": [
    {
      id: "1",
      title: "Livres de Physique L3",
      description: "Lot de 4 livres de physique quantique",
      price: 35,
      image: "/shopping.png",
      status: "active",
      createdAt: "Il y a 3 jours",
    },
    {
      id: "2",
      title: "Lampe de bureau LED",
      description: "Lampe moderne avec variateur",
      price: 20,
      image: "/shopping.png",
      status: "active",
      createdAt: "Il y a 1 semaine",
    },
  ],
  "u2": [
    {
      id: "3",
      title: "Vélo de ville",
      description: "Vélo en excellent état, peu utilisé",
      price: 80,
      image: "/shopping.png",
      status: "sold",
      createdAt: "Il y a 2 semaines",
    },
  ],
  "u3": [
    {
      id: "4",
      title: "Code civil 2024",
      description: "Dernière édition, comme neuf",
      price: 25,
      image: "/shopping.png",
      status: "active",
      createdAt: "Il y a 5 jours",
    },
  ],
  "u4": [
    {
      id: "5",
      title: "Lampe de bureau",
      description: "Lampe simple mais efficace",
      price: 15,
      image: "/shopping.png",
      status: "active",
      createdAt: "Il y a 2 jours",
    },
  ],
}

export default function UserProfilePage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/auth")
    }
  }, [isAuthenticated, loading, router])

  if (loading || !isAuthenticated) return null

  const user = mockUsers[userId]
  const announcements = mockUserAnnouncements[userId] || []

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 py-12">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Utilisateur non trouvé</h1>
            <p className="text-muted-foreground mb-6">Cet utilisateur n'existe pas ou a été supprimé.</p>
            <Button asChild>
              <Link href="/messaging">Retour à la messagerie</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const activeAnnouncements = announcements.filter(a => a.status === "active")
  const soldAnnouncements = announcements.filter(a => a.status === "sold")

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-4xl px-6">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
                <div className="relative">
                  <Avatar className="size-24 border-4 border-primary/20">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                      {user.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  {user.isOnline && (
                    <span className="absolute bottom-1 right-1 size-4 bg-green-500 rounded-full border-2 border-card" />
                  )}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
                    {user.isOnline && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                        En ligne
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3 flex flex-col gap-2">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground md:justify-start">
                      <GraduationCap className="size-4" />
                      <span className="text-sm">{user.department}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground md:justify-start">
                      <MapPin className="size-4" />
                      <span className="text-sm">{user.campus}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground md:justify-start">
                      <Calendar className="size-4" />
                      <span className="text-sm">Membre depuis {user.joinedDate}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button asChild className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link href="/messaging">
                      <MessageCircle className="size-4" />
                      Contacter
                    </Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="cursor-pointer text-orange-600">
                        <Flag className="size-4 mr-2" />
                        <span>Signaler</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer text-red-600">
                        <Ban className="size-4 mr-2" />
                        <span>Bloquer</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
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
                  <p className="text-2xl font-bold text-foreground">{user.announcesCount}</p>
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
                  <p className="text-2xl font-bold text-foreground">{activeAnnouncements.length}</p>
                  <p className="text-sm text-muted-foreground">Annonces actives</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex size-12 items-center justify-center rounded-full bg-accent/10">
                  <Package className="size-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{soldAnnouncements.length}</p>
                  <p className="text-sm text-muted-foreground">Vendus</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Announcements Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <div className="mb-6">
              <TabsList>
                <TabsTrigger value="all">Toutes ({announcements.length})</TabsTrigger>
                <TabsTrigger value="active">Actives ({activeAnnouncements.length})</TabsTrigger>
                <TabsTrigger value="sold">Vendues ({soldAnnouncements.length})</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="mt-0">
              {announcements.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Package className="size-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Cet utilisateur n'a pas encore publié d'annonces.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {announcements.map((announcement) => (
                    <AnnouncementCard key={announcement.id} announcement={announcement} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="active" className="mt-0">
              {activeAnnouncements.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Package className="size-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Aucune annonce active pour le moment.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {activeAnnouncements.map((announcement) => (
                    <AnnouncementCard key={announcement.id} announcement={announcement} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="sold" className="mt-0">
              {soldAnnouncements.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Package className="size-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Aucune vente pour le moment.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {soldAnnouncements.map((announcement) => (
                    <AnnouncementCard key={announcement.id} announcement={announcement} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function AnnouncementCard({ announcement }: { announcement: { id: string; title: string; description: string; price: number; image: string; status: string; createdAt: string } }) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="relative h-32 w-full sm:h-auto sm:w-40">
            <Image
              src={announcement.image}
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
                  variant={announcement.status === "active" ? "default" : "secondary"}
                  className={announcement.status === "active" ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"}
                >
                  {announcement.status === "active" ? "Active" : "Vendu"}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{announcement.description}</p>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-bold text-primary">{announcement.price} EUR</span>
              <span className="text-xs text-muted-foreground">{announcement.createdAt}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
