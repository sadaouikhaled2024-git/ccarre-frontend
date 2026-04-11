"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { echangeApi, Echange, EchangeStatus } from "@/lib/echange-api"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { EchangeDiscussionState } from "./echange-states/echange-discussion-state"
import { EchangeRendezVousProposedState } from "./echange-states/echange-rendez-vous-proposed-state"
import { EchangeRendezVousAcceptedState } from "./echange-states/echange-rendez-vous-accepted-state"
import { EchangeConfirmationsState } from "./echange-states/echange-confirmations-state"
import { EchangeValidatedState } from "./echange-states/echange-validated-state"
import { EchangeCancelledState } from "./echange-states/echange-cancelled-state"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface EchangePageContentProps {
  echangeId: string
}

export function EchangePageContent({ echangeId }: EchangePageContentProps) {
  const { user, token, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [echange, setEchange] = useState<Echange | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  console.log("🔐 COMPOSANT - useAuth():", { 
    user: user?._id, 
    token: token ? token.substring(0, 50) : "UNDEFINED",
    authLoading 
  })

  useEffect(() => {
    if (authLoading) {
      console.log("⏳ Auth en cours de chargement...")
      return
    }

    if (!token || !user) {
      console.log("❌ Token ou user absent après auth loading")
      setLoading(false)
      setError("Token non disponible ou session expirée")
      return
    }

    console.log("✅ Token et user disponibles, fetching echange...")
    const fetchEchange = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await echangeApi.getById(echangeId, token)
        if (response.data?.echange) {
          setEchange(response.data.echange)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors du chargement"
        setError(message)
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchEchange()
    const interval = setInterval(fetchEchange, 5000) // Refresh every 5 seconds

    return () => clearInterval(interval)
  }, [token, user, echangeId, toast, authLoading])

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (error || !echange || !token) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertDescription>
            {error || !token ? "Token non disponible ou session expirée" : "Échange non trouvé"}
          </AlertDescription>
        </Alert>
        <Button variant="outline" className="mt-4" onClick={() => window.history.back()}>
          Retour
        </Button>
      </div>
    )
  }

  const isCurrentUserDemandeur = user?._id === echange.utilisateurDemandeur?._id
  const isCurrentUserProprietaire = user?._id === echange.utilisateurProprietaire?._id

  const renderStateComponent = () => {
    switch (echange.statut) {
      case "discussion":
        return (
          <EchangeDiscussionState
            echange={echange}
            isCurrentUserDemandeur={isCurrentUserDemandeur}
            isCurrentUserProprietaire={isCurrentUserProprietaire}
            onStateChange={setEchange}

          />
        )
      case "rendez_vous_propose":
        return (
          <EchangeRendezVousProposedState
            echange={echange}
            isCurrentUserDemandeur={isCurrentUserDemandeur}
            isCurrentUserProprietaire={isCurrentUserProprietaire}
            onStateChange={setEchange}

          />
        )
      case "rendez_vous_accepte":
        return (
          <EchangeRendezVousAcceptedState
            echange={echange}
            isCurrentUserDemandeur={isCurrentUserDemandeur}
            isCurrentUserProprietaire={isCurrentUserProprietaire}
            onStateChange={setEchange}

          />
        )
      case "en_attente_confirmations":
        return (
          <EchangeConfirmationsState
            echange={echange}
            isCurrentUserDemandeur={isCurrentUserDemandeur}
            isCurrentUserProprietaire={isCurrentUserProprietaire}
            onStateChange={setEchange}

          />
        )
      case "valide":
        return <EchangeValidatedState echange={echange} />
      case "annule":
      case "expire":
      case "litige":
        return <EchangeCancelledState echange={echange} />
      default:
        return <div>État inconnu: {echange.statut}</div>
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="space-y-6">
        {/* Header with users and announcement */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">Détails de l'échange</h1>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">De</p>
              <p className="font-semibold">{echange.utilisateurDemandeur?.nom || "Utilisateur"}</p>
            </div>
            <div>
              <p className="text-gray-600">À</p>
              <p className="font-semibold">{echange.utilisateurProprietaire?.nom || "Utilisateur"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-600">Annonce</p>
              <p className="font-semibold">{echange.annonce?.titre || "Annonce"}</p>
            </div>
          </div>
        </div>

        {/* State-specific component */}
        {renderStateComponent()}

        {/* History timeline */}
        {echange.historique && echange.historique.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Historique</h2>
            <div className="space-y-3">
              {echange.historique.map((entry, idx) => (
                <div key={idx} className="flex gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-gray-700">
                      {entry.ancienStatut} → {entry.nouveauStatut}
                    </p>
                    {entry.raison && <p className="text-gray-500 text-xs">{entry.raison}</p>}
                    <p className="text-gray-400 text-xs">
                      {new Date(entry.a).toLocaleString("fr-FR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
