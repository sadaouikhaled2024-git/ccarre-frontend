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
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

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
    try {
      // API call would go here to send message
      console.log("Sending message to", ownerName, ":", message)
      // await contactApi.sendMessage(announcementId, message)
      setOpen(false)
      setMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
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
