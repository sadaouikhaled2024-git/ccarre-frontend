"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Flag, AlertCircle } from "lucide-react"

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (reason: string, description: string) => Promise<void>
  targetType: "annonce" | "user" // Type of target being reported
  targetName?: string // Name of the announcment or user being reported
  isLoading?: boolean
}

const REPORT_REASONS = [
  { value: "arnaque", label: " Arnaque", color: "hover:bg-red-50" },
  { value: "contenu_offensant", label: " Contenu offensant", color: "hover:bg-orange-50" },
  { value: "spam", label: " Spam", color: "hover:bg-yellow-50" },
  { value: "contact_externe", label: " Contact externe", color: "hover:bg-purple-50" },
  { value: "prix_suspect", label: " Prix suspect", color: "hover:bg-blue-50" },
  { value: "autre", label: " Autre", color: "hover:bg-gray-50" },
]

export function ReportModal({
  isOpen,
  onClose,
  onSubmit,
  targetType,
  targetName,
  isLoading = false,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setError("")

    // Validate reason
    if (!selectedReason) {
      setError("Veuillez sélectionner une raison")
      return
    }

    // Validate description
    if (!description.trim()) {
      setError("Veuillez entrer une description")
      return
    }

    if (description.trim().length < 10) {
      setError("La description doit contenir au minimum 10 caractères")
      return
    }

    try {
      setIsSubmitting(true)
      await onSubmit(selectedReason, description.trim())
      // Reset form on success
      setSelectedReason("")
      setDescription("")
      setError("")
      onClose()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Une erreur est survenue"
      setError(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedReason("")
      setDescription("")
      setError("")
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-rose-500" />
            <DialogTitle className="text-lg">Signaler {targetType === "annonce" ? "une annonce" : "un utilisateur"}</DialogTitle>
          </div>
          {targetName && (
            <DialogDescription className="text-xs font-medium text-gray-600 mt-1 truncate">
              {targetName}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-3">
          {/* Reason Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Raison</Label>
            <div className="grid grid-cols-2 gap-1.5">
              {REPORT_REASONS.map((reason) => (
                <button
                  key={reason.value}
                  onClick={() => {
                    setSelectedReason(reason.value)
                    setError("")
                  }}
                  className={`text-left px-2.5 py-1.5 rounded-md border-2 transition-all text-xs ${
                    selectedReason === reason.value
                      ? "border-rose-500 bg-rose-50"
                      : "border-gray-200 bg-white hover:border-rose-200"
                  } ${reason.color}`}
                >
                  <span className="font-medium text-sm text-gray-900">{reason.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-sm font-semibold">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Minimum 10 caractères..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                setError("")
              }}
              className="min-h-16 text-sm resize-none rounded-lg border-gray-300 focus:border-rose-500 focus:ring-rose-500"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {description.length}/10
              </span>
              {description.length < 10 && description.length > 0 && (
                <span className="text-xs text-orange-500">+{10 - description.length} caractères</span>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex gap-2 px-2 py-1.5 bg-red-50 border border-red-200 rounded">
              <AlertCircle className="h-3.5 w-3.5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            size="sm"
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedReason || !description.trim() || isSubmitting || isLoading}
            className="bg-rose-500 hover:bg-rose-600"
            size="sm"
          >
            {isSubmitting ? "Envoi..." : "Signaler"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
