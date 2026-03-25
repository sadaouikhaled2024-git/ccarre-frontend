"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"

export default function ExchangeHistoryPage() {
  // Mock exchange data - not fetched for now
  const mockExchanges = [
    {
      _id: "1",
      announcement: {
        title: "iPhone 13",
        type: "échange",
      },
      utilisateur: {
        firstName: "Jean",
        lastName: "Dupont",
      },
      status: "acceptés",
      date: new Date("2024-12-15"),
    },
    {
      _id: "2",
      announcement: {
        title: "Vélo Route",
        type: "prêt",
      },
      utilisateur: {
        firstName: "Marie",
        lastName: "Martin",
      },
      status: "en attente",
      date: new Date("2024-12-20"),
    },
    {
      _id: "3",
      announcement: {
        title: "Laptop Dell",
        type: "vente",
      },
      utilisateur: {
        firstName: "Pierre",
        lastName: "Bernard",
      },
      status: "terminés",
      date: new Date("2024-12-10"),
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "en attente":
        return "bg-rose-100 text-rose-800"
      case "acceptés":
        return "bg-rose-200 text-rose-900"
      case "terminés":
        return "bg-rose-300 text-rose-900"
      default:
        return "bg-rose-100 text-rose-800"
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      échange: "Échange",
      prêt: "Prêt",
      vente: "Vente",
    }
    return labels[type] || type
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-8 flex items-center gap-3">
            <Clock className="size-8 text-rose-500" />
            <h1 className="text-balance text-4xl font-bold text-foreground">Historique de mes échanges</h1>
          </div>

          <div className="space-y-4">
            {mockExchanges.length > 0 ? (
              mockExchanges.map((exchange) => (
                <div key={exchange._id} className="rounded-lg border border-border p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-foreground">{exchange.announcement.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {exchange.utilisateur.firstName} {exchange.utilisateur.lastName}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {exchange.date.toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
                        {getTypeLabel(exchange.announcement.type)}
                      </Badge>
                      <Badge className={getStatusColor(exchange.status)}>
                        {exchange.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Clock className="size-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Vous n'avez pas encore d'échanges</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}