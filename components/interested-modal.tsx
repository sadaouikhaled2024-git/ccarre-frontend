"use client"

import { useState } from "react"
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

interface InterestedModalProps {
  announcementId: string
  announcementTitle: string
  announcementType: "vente" | "échange" | "prêt"
  ownerName: string
}

export function InterestedModal({
  announcementId,
  announcementTitle,
  announcementType,
  ownerName,
}: InterestedModalProps) {
  const { token } = useAuth()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

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
    setSuccess(null)
    try {
      if (!token) {
        throw new Error("Vous devez être connecté pour envoyer un message")
      }

      const payload = message || getDefaultMessage()
      await echangeApi.create(announcementId, token, payload)

      setSuccess("Votre demande a été envoyée dans la messagerie")
      setOpen(false)
      setMessage("")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Impossible d'envoyer le message")
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
          <DialogTitle>Contacter le propriétaire</DialogTitle>
          <DialogDescription>
            Envoyez un message à {ownerName} concernant "{announcementTitle}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Votre message..."
            value={message || getDefaultMessage()}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-32 border-border"
          />

          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-emerald-600">{success}</p>}

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
              disabled={isLoading || !message}
              className="bg-rose-500 hover:bg-rose-600"
            >
              {isLoading ? "Envoi..." : "Envoyer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
