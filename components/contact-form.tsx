"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"
import { useState } from "react"

interface ContactFormProps {
  announcementTitle: string
  publisherName: string
  onClose: () => void
}

export function ContactForm({ announcementTitle, publisherName, onClose }: ContactFormProps) {
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Form submission logic will be added later
    console.log("Message sent:", message)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Contacter le propriétaire</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Fermer"
          >
            <X className="size-6" />
          </button>
        </div>

        <div className="bg-muted p-3 rounded-lg space-y-1">
          <p className="text-sm text-muted-foreground">Annonce</p>
          <p className="font-semibold text-foreground">{announcementTitle}</p>
          <p className="text-sm text-muted-foreground">À: {publisherName}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium text-foreground">
              Votre message
            </label>
            <Textarea
              id="message"
              placeholder="Écrivez votre message ici..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="min-h-32 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground hover:bg-accent"
              disabled={!message.trim()}
            >
              Envoyer
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
