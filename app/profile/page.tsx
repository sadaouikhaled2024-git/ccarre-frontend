"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Mail, GraduationCap, Calendar, MapPin, Package, Edit, Plus } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

// Mock user data
const mockUser = {
  name: "Marie Dupont",
  email: "marie.dupont@etu.univ-amu.fr",
  avatar: "/placeholder-user.jpg",
  campus: "Campus Aix-en-Provence",
  department: "Faculté des Sciences",
  joinedDate: "Septembre 2024",
  announcesCount: 5,
}

// Mock user announcements
const mockUserAnnouncements = [
  {
    id: "1",
    title: "Livres de Mathématiques L2",
    description: "Lot de 3 livres de maths en très bon état",
    price: 25,
    image: "/shopping.png",
    status: "active",
    createdAt: "Il y a 2 jours",
  },
  {
    id: "2",
    title: "Calculatrice TI-83",
    description: "Calculatrice graphique, fonctionne parfaitement",
    price: 35,
    image: "/shopping.png",
    status: "active",
    createdAt: "Il y a 1 semaine",
  },
  {
    id: "3",
    title: "Bureau étudiant",
    description: "Bureau en bois, idéal pour petit espace",
    price: 40,
    image: "/shopping.png",
    status: "sold",
    createdAt: "Il y a 2 semaines",
  },
]

export default function ProfilePage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/auth")
    }
  }, [isAuthenticated, loading, router])

  if (loading || !isAuthenticated) return null

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-4xl px-6">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
                <Avatar className="size-24 border-4 border-primary/20">
                  <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {mockUser.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-2xl font-bold text-foreground">{mockUser.name}</h1>
                  <div className="mt-3 flex flex-col gap-2">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground md:justify-start">
                      <Mail className="size-4" />
                      <span className="text-sm">{mockUser.email}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground md:justify-start">
                      <GraduationCap className="size-4" />
                      <span className="text-sm">{mockUser.department}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground md:justify-start">
                      <MapPin className="size-4" />
                      <span className="text-sm">{mockUser.campus}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground md:justify-start">
                      <Calendar className="size-4" />
                      <span className="text-sm">Membre depuis {mockUser.joinedDate}</span>
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
                  <p className="text-2xl font-bold text-foreground">{mockUser.announcesCount}</p>
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
                  <p className="text-2xl font-bold text-foreground">2</p>
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
                  <p className="text-2xl font-bold text-foreground">1</p>
                  <p className="text-sm text-muted-foreground">Vendus</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Announcements Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <div className="mb-6 flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="all">Toutes</TabsTrigger>
                <TabsTrigger value="active">Actives</TabsTrigger>
                <TabsTrigger value="sold">Vendues</TabsTrigger>
              </TabsList>
              <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="size-4" />
                Nouvelle annonce
              </Button>
            </div>

            <TabsContent value="all" className="mt-0">
              <div className="grid gap-4">
                {mockUserAnnouncements.map((announcement) => (
                  <AnnouncementCard key={announcement.id} announcement={announcement} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="active" className="mt-0">
              <div className="grid gap-4">
                {mockUserAnnouncements
                  .filter((a) => a.status === "active")
                  .map((announcement) => (
                    <AnnouncementCard key={announcement.id} announcement={announcement} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="sold" className="mt-0">
              <div className="grid gap-4">
                {mockUserAnnouncements
                  .filter((a) => a.status === "sold")
                  .map((announcement) => (
                    <AnnouncementCard key={announcement.id} announcement={announcement} />
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

function AnnouncementCard({ announcement }: { announcement: typeof mockUserAnnouncements[0] }) {
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
