"use client"

import { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { LIEUX_OPTIONS } from "@/lib/lieux-options"

interface CompleteExchangeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (lieuEchange: string, prixFinal?: number) => Promise<void>
  annonceType: string // "VENTE" | "ECHANGE" | "PRET"
}

export function CompleteExchangeDialog({
  open,
  onOpenChange,
  onConfirm,
  annonceType,
}: CompleteExchangeDialogProps) {
  const [lieuEchange, setLieuEchange] = useState("")
  const [prixFinal, setPrixFinal] = useState("")
  const [loading, setLoading] = useState(false)

  const isSale = useMemo(() => annonceType === "VENTE", [annonceType])
  const isValid = useMemo(
    () => lieuEchange && (!isSale || (prixFinal && !isNaN(Number(prixFinal)) && Number(prixFinal) > 0)),
    [lieuEchange, prixFinal, isSale],
  )

  const handleConfirm = async () => {
    setLoading(true)
    try {
      const finalPrice = isSale ? Number(prixFinal) : undefined
      await onConfirm(lieuEchange, finalPrice)
      setLieuEchange("")
      setPrixFinal("")
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-950 border-rose-200 dark:border-rose-900">
        <DialogHeader>
          <DialogTitle className="text-rose-900 dark:text-rose-100">
            {isSale ? "Finaliser la vente" : "Finaliser l'échange"}
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            {isSale
              ? "Indiquez le lieu de rencontre et le prix final discuté."
              : "Indiquez le lieu de rencontre."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="lieu" className="text-slate-700 dark:text-slate-300">
              Lieu d'échange
            </Label>
            <Select value={lieuEchange} onValueChange={setLieuEchange}>
              <SelectTrigger id="lieu" className="border-rose-200 dark:border-rose-900">
                <SelectValue placeholder="Sélectionnez un lieu" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900">
                {LIEUX_OPTIONS.map((lieu) => (
                  <SelectItem key={lieu} value={lieu} className="text-slate-900 dark:text-slate-100">
                    {lieu}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isSale && (
            <div className="space-y-2">
              <Label htmlFor="prix" className="text-slate-700 dark:text-slate-300">
                Prix final discuté
              </Label>
              <Input
                id="prix"
                type="number"
                placeholder="Montant en euros"
                value={prixFinal}
                onChange={(e) => setPrixFinal(e.target.value)}
                min="0"
                step="1"
                className="border-rose-200 dark:border-rose-900"
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="text-rose-600 border-rose-200 hover:bg-rose-50"
          >
            Annuler
          </Button>
          <Button
            type="button"
            disabled={!isValid || loading}
            onClick={handleConfirm}
            className="bg-rose-600 hover:bg-rose-700 text-white"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSale ? "Finaliser la vente" : "Finaliser l'échange"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
