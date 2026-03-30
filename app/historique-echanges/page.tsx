"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { echangeApi, type Echange, type EchangeStatus } from "@/lib/echange-api"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

export default function ExchangeHistoryPage() {
  const { token, user } = useAuth()
  const [ongoing, setOngoing] = useState<Echange[]>([])
  const [completed, setCompleted] = useState<Echange[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return

    const fetchHistory = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await echangeApi.getHistory(token)
        const data = response.data as { ongoing: Echange[]; completed: Echange[] }
        setOngoing(data?.ongoing || [])
        setCompleted(data?.completed || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Impossible de charger l'historique")
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [token])

  const exchanges = useMemo(() => [...ongoing, ...completed], [ongoing, completed])

  const getStatusColor = (status: EchangeStatus) => {
    switch (status) {
      case "EN_ATTENTE":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "ACCEPTE":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "TERMINE":
        return "bg-slate-100 text-slate-800 border-slate-200"
      case "REFUSE":
        return "bg-rose-100 text-rose-800 border-rose-200"
      default:
        return "bg-muted text-foreground"
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

  const counterpartName = (echange: Echange) => {
    const demandeur = echange.utilisateurDemandeur
    const proprietaire = echange.utilisateurProprietaire
    const meId = user?._id
    const person = demandeur?._id === meId ? proprietaire : demandeur
    return `${person?.firstName ?? ""} ${person?.lastName ?? ""}`.trim() || "Utilisateur"
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
            {loading ? (
              <p className="text-muted-foreground">Chargement...</p>
            ) : error ? (
              <p className="text-destructive">{error}</p>
            ) : exchanges.length > 0 ? (
              exchanges.map((exchange) => (
                <div key={exchange._id} className="rounded-lg border border-border p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-foreground">{exchange.annonce?.title ?? "Annonce"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {counterpartName(exchange)}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {new Date(exchange.updatedAt).toLocaleDateString("fr-FR")}
                      </p>
                      {exchange.historique && exchange.historique.length > 0 && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Dernier changement: {exchange.historique[exchange.historique.length - 1].vers}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
                        {getTypeLabel(exchange.annonce?.type || "")}
                      </Badge>
                      <Badge className={cn("border", getStatusColor(exchange.statut))}>
                        {exchange.statut.replace("_", " ")}
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
