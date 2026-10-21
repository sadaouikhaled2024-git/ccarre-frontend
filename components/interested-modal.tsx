"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Heart } from "lucide-react"
import { echangeApi } from "@/lib/echange-api"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

interface InterestedModalProps {
  announcementId: string
  announcementTitle: string
  announcementType: "vente" | "échange" | "prêt"
  ownerId: string
  ownerName: string
}

export function InterestedModal({
  announcementId,
  announcementTitle,
  announcementType,
  ownerId,
  ownerName,
}: InterestedModalProps) {
  const { token } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getDefaultMessage = () => {
    const type = announcementType.toLowerCase()
    if (type === "vente") {
      return `Bonjour,\n\nJe suis intéressé par votre annonce: "${announcementTitle}".\n\nPourrais-je avoir plus de détails?\n\nMerci!`
    } else if (type === "échange") {
      return `Bonjour,\n\nJe suis intéressé par un échange concernant: "${announcementTitle}".\n\nPourrais-je discuter de détails?\n\nMerci!`
    } else if (type === "prêt") {
      return `Bonjour,\n\nJe suis intéressé par emprunter: "${announcementTitle}".\n\nQuand serait-ce possible?\n\nMerci!`
    }
    return ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      if (!token) {
        throw new Error("Vous devez être connecté pour envoyer un message")
      }
      if (!announcementId) {
        throw new Error("L'ID de l'annonce est requis")
      }
      if (!ownerId) {
        throw new Error("L'ID du propriétaire est requis")
      }

      const payload = message.trim() || getDefaultMessage()
      await echangeApi.create(ownerId, announcementId, token, payload)

      toast({ title: "Échange créé avec succès!", description: "Redirection vers la messagerie..." })
      setOpen(false)
      setMessage("")
      
      // Redirect to messaging page with the announcement owner (requested behavior)
      router.push(`/messages/${ownerId}`)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Impossible de créer l'échange")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-rose-500 hover:bg-rose-600 text-white gap-2">
          <Heart className="size-4" />
          Je suis intéressé
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmation</DialogTitle>
          <DialogDescription>
            Demander un échange avec {ownerName} pour "{announcementTitle}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Message initial (optionnel)
            </label>
            <Textarea
              placeholder="Laissez un message personnalisé..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-24 border-border"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Un message par défaut sera envoyé si vous laissez ce champ vide.
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-rose-500 hover:bg-rose-600"
            >
              {isLoading ? "Création..." : "Créer l'échange"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
