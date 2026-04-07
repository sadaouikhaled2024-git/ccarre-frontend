"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Check, X, CheckCircle2, AlertCircle } from "lucide-react"
import { useEffect, useMemo, useState, useCallback } from "react"
import { echangeApi, type Echange, type EchangeStatus } from "@/lib/echange-api"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { CompleteExchangeDialog } from "@/components/complete-exchange-dialog"

export default function ExchangeHistoryPage() {
  const { token, user } = useAuth()
  const [exchanges, setExchanges] = useState<Echange[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false)
  const [completeDialogEchangeId, setCompleteDialogEchangeId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!token) return

    const fetchHistory = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await echangeApi.getHistory(token)
        const data = response.data as { ongoing: Echange[]; completed: Echange[] }
        const allExchanges = [...(data?.ongoing || []), ...(data?.completed || [])]
        setExchanges(allExchanges)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Impossible de charger l'historique")
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [token])

  const handleAccept = useCallback(async (echangeId: string) => {
    if (!token) return
    try {
      await echangeApi.accept(echangeId, token)
      setExchanges((prev) =>
        prev.map((e) => (e._id === echangeId ? { ...e, statut: "ACCEPTE" } : e))
      )
      toast({ title: "Échange accepté!" })
    } catch (err) {
      toast({
        title: "Action impossible",
        description: err instanceof Error ? err.message : "Erreur",
      })
    }
  }, [token, toast])

  const handleRefuse = useCallback(async (echangeId: string) => {
    if (!token) return
    try {
      await echangeApi.refuse(echangeId, token)
      setExchanges((prev) =>
        prev.map((e) => (e._id === echangeId ? { ...e, statut: "REFUSE" } : e))
      )
      toast({ title: "Échange refusé" })
    } catch (err) {
      toast({
        title: "Action impossible",
        description: err instanceof Error ? err.message : "Erreur",
      })
    }
  }, [token, toast])

  const handleComplete = useCallback(async (echangeId: string) => {
    setCompleteDialogEchangeId(echangeId)
    setCompleteDialogOpen(true)
  }, [])

  const handleCompleteConfirm = useCallback(
    async (lieuEchange: string, prixFinal?: number) => {
      if (!token || !completeDialogEchangeId) return
      try {
        await echangeApi.completeWithDetails(completeDialogEchangeId, lieuEchange, prixFinal, token)
        setExchanges((prev) =>
          prev.map((e) =>
            e._id === completeDialogEchangeId
              ? { ...e, statut: "TERMINE" as any, lieuEchange, prixFinal }
              : e,
          ),
        )
        toast({ title: "Échange finalisé avec succès!" })
        setCompleteDialogEchangeId(null)
      } catch (err) {
        toast({
          title: "Action impossible",
          description: err instanceof Error ? err.message : "Erreur",
        })
      }
    },
    [token, completeDialogEchangeId, toast],
  )

  const handleCancel = useCallback(async (echangeId: string) => {
    if (!token) return
    if (!confirm("Êtes-vous sûr de vouloir annuler cet échange ?")) return
    try {
      await echangeApi.cancel(echangeId, token)
      setExchanges((prev) =>
        prev.map((e) => (e._id === echangeId ? { ...e, statut: "ANNULE" as any } : e))
      )
      toast({ title: "Échange annulé" })
    } catch (err) {
      toast({
        title: "Action impossible",
        description: err instanceof Error ? err.message : "Erreur",
      })
    }
  }, [token, toast])

  const groupedExchanges = useMemo(() => {
    return {
      EN_ATTENTE: exchanges.filter((e) => e.statut === "EN_ATTENTE"),
      ACCEPTE: exchanges.filter((e) => e.statut === "ACCEPTE"),
      REFUSE: exchanges.filter((e) => e.statut === "REFUSE"),
      TERMINE: exchanges.filter((e) => e.statut === "TERMINE"),
    }
  }, [exchanges])

  const getStatusColor = (status: EchangeStatus) => {
    switch (status) {
      case "EN_ATTENTE":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "ACCEPTE":
        return "bg-[#EC7578]/10 text-[#EC7578] border-[#EC7578]/20"
      case "TERMINE":
        return "bg-slate-100 text-slate-800 border-slate-200"
      case "REFUSE":
        return "bg-rose-100 text-rose-800 border-rose-200"
      default:
        return "bg-muted text-foreground"
    }
  }

  const getStatusIcon = (status: EchangeStatus) => {
    switch (status) {
      case "EN_ATTENTE":
        return <AlertCircle className="size-5 text-orange-600" />
      case "ACCEPTE":
        return <Check className="size-5 text-[#EC7578]" />
      case "TERMINE":
        return <CheckCircle2 className="size-5 text-slate-600" />
      case "REFUSE":
        return <X className="size-5 text-rose-600" />
      default:
        return null
    }
  }

  const getStatusLabel = (status: EchangeStatus) => {
    switch (status) {
      case "EN_ATTENTE":
        return "En attente"
      case "ACCEPTE":
        return "Accepté"
      case "TERMINE":
        return "Terminé"
      case "REFUSE":
        return "Refusé"
      default:
        return status
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
    const demandeur = echange.utilisateurDemandeur as any
    const proprietaire = echange.utilisateurProprietaire as any
    const meId = user?._id
    const person = demandeur?._id === meId ? proprietaire : demandeur
    return `${person?.firstName ?? ""} ${person?.lastName ?? ""}`.trim() || "Utilisateur"
  }

  const isOwner = (echange: Echange) => {
    return (echange.utilisateurProprietaire as any)?._id === user?._id
  }

  const ExchangeCard = ({ exchange }: { exchange: Echange }) => (
    <div className="rounded-lg border border-border p-4 hover:shadow-lg transition-shadow bg-card">
      <div className="flex gap-4">
        {/* Product Image */}
        {(exchange.annonce as any)?.images?.[0] && (
          <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted border border-border">
            <Image
              src={(exchange.annonce as any).images[0]}
              alt="Product"
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-foreground truncate">{(exchange.annonce as any)?.title ?? "Annonce"}</h3>
          <p className="text-sm text-muted-foreground mt-1">{counterpartName(exchange)}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 text-xs">
              {getTypeLabel((exchange.annonce as any)?.type || "")}
            </Badge>
            <Badge className={cn("border text-xs", getStatusColor(exchange.statut))}>
              {getStatusLabel(exchange.statut)}
            </Badge>
          </div>

          {/* Détails de l'échange finalisé */}
          {exchange.statut === "TERMINE" && (
            <div className="mt-3 pt-3 border-t border-rose-200 space-y-1">
              {exchange.lieuEchange && (
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-rose-600">Lieu :</span> {exchange.lieuEchange}
                </p>
              )}
              {exchange.prixFinal && (
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-orange-600">Prix final :</span> {exchange.prixFinal}€
                </p>
              )}
            </div>
          )}

          <p className="mt-2 text-xs text-muted-foreground">
            {new Date(exchange.updatedAt).toLocaleDateString("fr-FR")}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 justify-center flex-shrink-0">
          {exchange.statut === "EN_ATTENTE" && isOwner(exchange) && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRefuse(exchange._id)}
                className="text-red-600 border-red-200 hover:bg-red-50 whitespace-nowrap text-xs"
              >
                <X className="size-3 mr-1" />
                Refuser
              </Button>
              <Button
                size="sm"
                onClick={() => handleAccept(exchange._id)}
                className="bg-[#EC7578] hover:bg-[#d45166] text-white whitespace-nowrap text-xs"
              >
                <Check className="size-3 mr-1" />
                Accepter
              </Button>
            </>
          )}
          {exchange.statut === "ACCEPTE" && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCancel(exchange._id)}
                className="text-red-600 border-red-200 hover:bg-red-50 whitespace-nowrap text-xs"
              >
                <X className="size-3 mr-1" />
                Annuler
              </Button>
              <Button
                size="sm"
                onClick={() => handleComplete(exchange._id)}
                className="bg-rose-600 hover:bg-rose-700 text-white whitespace-nowrap text-xs"
              >
                <CheckCircle2 className="size-3 mr-1" />
                Clôturer
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )

  const Section = ({ status, title, exchanges: sectionExchanges }: { status: EchangeStatus; title: string; exchanges: Echange[] }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        {getStatusIcon(status)}
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <span className="ml-auto text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
          {sectionExchanges.length}
        </span>
      </div>
      {sectionExchanges.length > 0 ? (
        <div className="space-y-3">
          {sectionExchanges.map((exchange) => (
            <ExchangeCard key={exchange._id} exchange={exchange} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground text-sm">
          Aucun échange dans cette catégorie
        </div>
      )}
    </div>
  )

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-8 flex items-center gap-3">
            <Clock className="size-8 text-rose-500" />
            <h1 className="text-balance text-4xl font-bold text-foreground">Historique de mes échanges</h1>
          </div>

          {loading ? (
            <p className="text-muted-foreground">Chargement...</p>
          ) : error ? (
            <p className="text-destructive">{error}</p>
          ) : Object.values(groupedExchanges).some((list) => list.length > 0) ? (
            <div className="space-y-12">
              {groupedExchanges.EN_ATTENTE.length > 0 && (
                <Section
                  status="EN_ATTENTE"
                  title="En attente"
                  exchanges={groupedExchanges.EN_ATTENTE}
                />
              )}
              {groupedExchanges.ACCEPTE.length > 0 && (
                <Section
                  status="ACCEPTE"
                  title="Accepté"
                  exchanges={groupedExchanges.ACCEPTE}
                />
              )}
              {groupedExchanges.REFUSE.length > 0 && (
                <Section
                  status="REFUSE"
                  title="Refusé"
                  exchanges={groupedExchanges.REFUSE}
                />
              )}
              {groupedExchanges.TERMINE.length > 0 && (
                <Section
                  status="TERMINE"
                  title="Terminé"
                  exchanges={groupedExchanges.TERMINE}
                />
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="size-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Vous n'avez pas encore d'échanges</p>
            </div>
          )}
        </div>
      </main>

      {/* Complete Exchange Dialog */}
      {completeDialogEchangeId && (
        <CompleteExchangeDialog
          open={completeDialogOpen}
          onOpenChange={setCompleteDialogOpen}
          annonceType={
            exchanges.find((e) => e._id === completeDialogEchangeId)?.annonce?.type?.toUpperCase() || "VENTE"
          }
          onConfirm={handleCompleteConfirm}
        />
      )}

      <Footer />
    </div>
  )
}

