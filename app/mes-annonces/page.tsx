"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function MyAnnouncementsPage() {
  // Mock announcements data - not fetched for now
  const mockAnnouncements = [
    {
      _id: "1",
      title: "MacBook Pro 2023",
      category: "électronique",
      type: "vente",
      price: 1200,
      status: "active",
      image: "/placeholder.jpg",
      createdAt: new Date("2024-12-01"),
    },
    {
      _id: "2",
      title: "Livres Python Avancé",
      category: "livres",
      type: "prêt",
      price: 0,
      status: "active",
      image: "/placeholder.jpg",
      createdAt: new Date("2024-12-05"),
    },
    {
      _id: "3",
      title: "Vélo Route",
      category: "sports",
      type: "échange",
      price: 0,
      status: "archived",
      image: "/placeholder.jpg",
      createdAt: new Date("2024-11-20"),
    },
  ]

  const handleDelete = (id: string) => {
    console.log("Delete announcement:", id)
    // API call would go here
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-rose-100 text-rose-800"
      case "archived":
        return "bg-rose-200 text-rose-800"
      default:
        return "bg-rose-100 text-rose-800"
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-balance text-4xl font-bold text-foreground">Mes Annonces</h1>
            <Link href="/announcements/create">
              <Button className="bg-rose-500 hover:bg-rose-600">
                + Créer une annonce
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {mockAnnouncements.length > 0 ? (
              mockAnnouncements.map((announcement) => (
                <div key={announcement._id} className="flex gap-4 rounded-lg border border-border p-4 hover:shadow-lg transition-shadow">
                  <div className="h-24 w-24 flex-shrink-0 rounded-lg bg-muted" />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-foreground">{announcement.title}</h3>
                    <p className="text-sm text-muted-foreground">{announcement.category}</p>
                    <div className="mt-2 flex gap-2">
                      <Badge variant="outline">{announcement.type}</Badge>
                      <Badge className={getStatusColor(announcement.status)}>
                        {announcement.status === "active" ? "Actif" : "Archivé"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <p className="text-lg font-bold text-primary">
                      {announcement.price > 0 ? `${announcement.price}€` : "N/A"}
                    </p>
                    <div className="flex gap-2">
                      <Link href={`/announcements/${announcement._id}/edit`}>
                        <Button variant="outline" size="sm" className="border-rose-200 hover:bg-rose-50">
                          <Edit className="size-4" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="border-red-200 hover:bg-red-50">
                            <Trash2 className="size-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer cette annonce?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(announcement._id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Vous n'avez pas encore créé d'annonces</p>
                <Link href="/announcements/create" className="mt-4 inline-block">
                  <Button className="bg-rose-500 hover:bg-rose-600">
                    Créer votre première annonce
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
