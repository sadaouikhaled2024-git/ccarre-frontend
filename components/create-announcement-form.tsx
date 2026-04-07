"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, Upload, AlertCircle, CheckCircle2, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { annonceApi } from "@/lib/annonce-api"
import { showNotification } from "@/components/notification-toast"

const ANNOUNCEMENT_TYPES = [
  { value: "vente", label: "Vente" },
  { value: "echange", label: "Échange" },
  { value: "pret", label: "Prêt" },
  { value: "demandePret", label: "Demande de Prêt" },
]

const CATEGORIES = [
  "Livres",
  "Électronique",
  "Mobilier",
  "Accessoires",
  "Vêtements",
  "Sports",
  "Outils",
  "Autre",
]

function CreateAnnouncementFormContent() {
  const { token } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "vente",
    category: "Livres",
    price: "",
    exchangeFor: "",
    borrowPeriod: "",
  })

  const [mainImage, setMainImage] = useState<File | null>(null)
  const [mainImagePreview, setMainImagePreview] = useState("")
  const [additionalImages, setAdditionalImages] = useState<File[]>([])
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([])
  const [exchangeImage, setExchangeImage] = useState<File | null>(null)
  const [exchangeImagePreview, setExchangeImagePreview] = useState("")

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setMainImage(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setMainImagePreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAdditionalImages([...additionalImages, ...files])

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        setAdditionalPreviews((prev) => [...prev, event.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleExchangeImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setExchangeImage(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setExchangeImagePreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index))
    setAdditionalPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setLoading(true)

    try {
      if (!formData.title.trim()) throw new Error("Le titre est obligatoire")
      if (!formData.description.trim()) throw new Error("La description est obligatoire")
      if (!mainImage) throw new Error("L'image principale est obligatoire")

      if (formData.type === "vente") {
        if (!formData.price || parseFloat(formData.price) <= 0) {
          throw new Error("Un prix valide (> 0) est requis pour une annonce de vente")
        }
      }

      if (formData.type === "echange") {
        if (!formData.exchangeFor.trim()) {
          throw new Error("Veuillez décrire ce que vous recherchez en échange")
        }
        if (formData.exchangeFor.trim().length < 5) {
          throw new Error("La description d'échange doit faire au moins 5 caractères")
        }
      }

      if (formData.type === "pret") {
        if (!formData.borrowPeriod.trim()) {
          throw new Error('Veuillez spécifier la période de prêt')
        }
        if (formData.borrowPeriod.trim().length < 3) {
          throw new Error("La période doit faire au moins 3 caractères")
        }
      }

      const uploadFormData = new FormData()
      uploadFormData.append("title", formData.title)
      uploadFormData.append("description", formData.description)
      uploadFormData.append("type", formData.type)
      uploadFormData.append("category", formData.category.toLowerCase())

      if (formData.type === "vente") {
        uploadFormData.append("price", formData.price)
      }

      if (formData.type === "echange") {
        uploadFormData.append("exchangeFor", formData.exchangeFor)
        if (exchangeImage) {
          uploadFormData.append("exchangeImage", exchangeImage)
        }
      }

      if (formData.type === "pret") {
        uploadFormData.append("borrowPeriod", formData.borrowPeriod)
      }

      uploadFormData.append("images", mainImage)
      additionalImages.forEach((img) => {
        uploadFormData.append("images", img)
      })

      if (!token) {
        throw new Error("Authentication token required")
      }

      const response = await annonceApi.create(uploadFormData, token)

      if (response.success) {
        showNotification("Annonce créée avec succès!", "success")
        setSuccess(true)
        setTimeout(() => {
          router.push(`/announcements/${response.data?.annonce._id}`)
        }, 1500)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-[#EC7578]/10 border-[#EC7578]/20">
          <CheckCircle2 className="h-4 w-4 text-[#EC7578]" />
          <AlertDescription className="text-[#EC7578]">
            Annonce créée avec succès! Redirection en cours...
          </AlertDescription>
        </Alert>
      )}

      {/* Type d'annonce */}
      <div className="space-y-2">
        <Label>Type d'annonce</Label>
        <div className="grid grid-cols-2 gap-2">
          {ANNOUNCEMENT_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setFormData({ ...formData, type: type.value as any })}
              className={`p-2 rounded border-2 transition-all text-sm font-medium ${
                formData.type === type.value
                  ? "border-rose-500 bg-rose-50"
                  : "border-gray-200 hover:border-rose-300"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Titre */}
      <div className="space-y-2">
        <Label htmlFor="title">Titre *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Ex: iPhone 12 - Excellent État"
          disabled={loading}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Décrivez votre article..."
          rows={3}
          disabled={loading}
        />
      </div>

      {/* Catégorie */}
      <div className="space-y-2">
        <Label htmlFor="category">Catégorie</Label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm"
          disabled={loading}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Prix (si vente) */}
      {formData.type === "vente" && (
        <div className="space-y-2">
          <Label htmlFor="price">Prix (€) *</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="0.00"
            step="0.01"
            min="0"
            disabled={loading}
          />
        </div>
      )}

      {/* Échange (si échange) */}
      {formData.type === "echange" && (
        <div className="space-y-2">
          <Label htmlFor="exchangeFor">Ce que vous recherchez en échange *</Label>
          <Textarea
            id="exchangeFor"
            value={formData.exchangeFor}
            onChange={(e) => setFormData({ ...formData, exchangeFor: e.target.value })}
            placeholder="Décrivez ce que vous cherchez..."
            rows={2}
            disabled={loading}
          />
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center">
            <input
              id="exchangeImage"
              type="file"
              accept="image/*"
              onChange={handleExchangeImageChange}
              className="hidden"
              disabled={loading}
            />
            <label htmlFor="exchangeImage" className="cursor-pointer block">
              <Upload className="h-4 w-4 mx-auto mb-1 text-gray-400" />
              <p className="text-xs text-gray-500">Photo (optionnel)</p>
            </label>
          </div>
          {exchangeImagePreview && (
            <div className="relative w-24 h-24">
              <img
                src={exchangeImagePreview}
                alt="Exchange"
                className="w-full h-full object-cover rounded border-2 border-rose-200"
              />
              <button
                type="button"
                onClick={() => {
                  setExchangeImage(null)
                  setExchangeImagePreview("")
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Période de prêt (si prêt) */}
      {formData.type === "pret" && (
        <div className="space-y-2">
          <Label htmlFor="borrowPeriod">Période de prêt *</Label>
          <Input
            id="borrowPeriod"
            value={formData.borrowPeriod}
            onChange={(e) => setFormData({ ...formData, borrowPeriod: e.target.value })}
            placeholder="Ex: 2 semaines, 1 mois"
            disabled={loading}
          />
        </div>
      )}

      {/* Images */}
      <div className="space-y-3">
        <Label>Images *</Label>

        {/* Image principale */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <input
            id="mainImage"
            type="file"
            accept="image/*"
            onChange={handleMainImageChange}
            className="hidden"
            disabled={loading}
          />
          <label htmlFor="mainImage" className="cursor-pointer block">
            <Upload className="h-5 w-5 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500">Image principale</p>
          </label>
        </div>
        {mainImagePreview && (
          <div className="relative w-32 h-32 border-2 border-rose-500 rounded-lg overflow-hidden">
            <img
              src={mainImagePreview}
              alt="Main"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Images supplémentaires */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <input
            id="additionalImages"
            type="file"
            accept="image/*"
            multiple
            onChange={handleAdditionalImagesChange}
            className="hidden"
            disabled={loading}
          />
          <label htmlFor="additionalImages" className="cursor-pointer block">
            <Upload className="h-5 w-5 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500">Images supplémentaires (optionnel)</p>
          </label>
        </div>
        {additionalPreviews.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {additionalPreviews.map((preview, index) => (
              <div key={index} className="relative w-full aspect-square">
                <img
                  src={preview}
                  alt={`Additional ${index}`}
                  className="w-full h-full object-cover rounded border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeAdditionalImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Boutons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="flex-1"
          disabled={loading}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-rose-500 hover:bg-rose-600 text-white"
          disabled={loading}
        >
          {loading ? "Création..." : "Créer"}
        </Button>
      </div>
    </form>
  )
}

export function CreateAnnouncementButton() {
  const { user, token } = useAuth()

  if (!user || !token) {
    return null
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="fixed bottom-6 left-6 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-4 shadow-lg transition-all hover:shadow-xl">
          <Plus className="h-6 w-6" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer une annonce</DialogTitle>
        </DialogHeader>
        <CreateAnnouncementFormContent />
      </DialogContent>
    </Dialog>
  )
}
