"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, Upload, AlertCircle, CheckCircle2, Loader } from "lucide-react"
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

export function EditAnnouncementForm({ announcementId }: { announcementId: string }) {
  const { token } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
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
  const [removedImageIndices, setRemovedImageIndices] = useState<number[]>([])

  // Fetch announcement data on load
  useEffect(() => {
    async function fetchAnnouncement() {
      try {
        console.log("🔧 [EDIT-FORM] Chargement de l'annonce ID:", announcementId)
        setLoading(true)
        const response = await annonceApi.getById(announcementId, token || undefined)
        console.log("🔧 [EDIT-FORM] Réponse complète:", response)
        console.log("🔧 [EDIT-FORM] response.data:", response.data)
        console.log("🔧 [EDIT-FORM] response.title (direct):", (response as any).title)
        
        // La structure peut être:
        // 1. { data: { annonce: {...} } }
        // 2. { annonce: {...} }
        // 3. L'annonce elle-même {...}
        let ann = (response.data as any)?.annonce || (response as any)?.annonce
        
        // Si on n'a toujours pas trouvé, c'est peut-être la réponse elle-même qui est l'annonce
        if (!ann && (response as any).title) {
          ann = response as any
        }
        
        if (ann && ann._id) {
          console.log("🔧 [EDIT-FORM] Annonce chargée:", ann)
          setFormData({
            title: ann.title || "",
            description: ann.description || "",
            type: ann.type || "vente",
            category: ann.category || "Livres",
            price: ann.price?.toString() || "",
            exchangeFor: ann.exchangeFor || "",
            borrowPeriod: ann.borrowPeriod || "",
          })
          console.log("🔧 [EDIT-FORM] FormData défini:", {
            title: ann.title,
            description: ann.description,
            type: ann.type,
            category: ann.category,
            price: ann.price,
          })
          
          // Set main image preview from existing announcement
          if (ann.images && ann.images[0]) {
            console.log("🔧 [EDIT-FORM] Image principale:", ann.images[0])
            setMainImagePreview(ann.images[0])
          }
          // Set additional images
          if (ann.images && ann.images.length > 1) {
            console.log("🔧 [EDIT-FORM] Images additionnelles:", ann.images.slice(1))
            setAdditionalPreviews(ann.images.slice(1))
          }
        } else {
          console.error("🔧 [EDIT-FORM] Annonce non trouvée dans la réponse:", response)
          console.error("🔧 [EDIT-FORM] ann:", ann)
          setError("Annonce non trouvée")
        }
      } catch (err) {
        console.error("🔧 [EDIT-FORM] Erreur lors du chargement:", err)
        setError(err instanceof Error ? err.message : "Erreur lors du chargement de l'annonce")
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      console.log("🔧 [EDIT-FORM] Token trouvé, lancement du fetch")
      fetchAnnouncement()
    } else {
      console.log("🔧 [EDIT-FORM] Pas de token, attente...")
    }
  }, [announcementId, token])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError("")
  }

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

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index))
    setAdditionalPreviews((prev) => {
      // If this is an existing image (URL), track it as removed
      const preview = prev[index]
      if (preview && !preview.startsWith('data:')) {
        setRemovedImageIndices((prevRemoved) => [...prevRemoved, index])
      }
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    console.log("🔧 [EDIT] Début de la soumission du formulaire")

    if (!formData.title.trim()) {
      setError("Veuillez entrer un titre")
      console.log("❌ [EDIT] Erreur: Titre vide")
      return
    }

    if (!formData.description.trim()) {
      setError("Veuillez entrer une description")
      console.log("❌ [EDIT] Erreur: Description vide")
      return
    }

    if (formData.type === "vente" && !formData.price) {
      setError("Veuillez entrer un prix")
      console.log("❌ [EDIT] Erreur: Prix vide pour une vente")
      return
    }

    if (formData.type === "echange" && !formData.exchangeFor.trim()) {
      setError("Veuillez indiquer ce que vous recherchez")
      console.log("❌ [EDIT] Erreur: ExchangeFor vide")
      return
    }

    if (formData.type === "pret" && !formData.borrowPeriod.trim()) {
      setError("Veuillez indiquer la période de prêt")
      console.log("❌ [EDIT] Erreur: BorrowPeriod vide")
      return
    }

    console.log("✅ [EDIT] Validation réussie, préparation du FormData")
    console.log("📝 [EDIT] FormData:", {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      category: formData.category,
      price: formData.type === "vente" ? formData.price : undefined,
      exchangeFor: formData.type === "echange" ? formData.exchangeFor : undefined,
      borrowPeriod: formData.type === "pret" ? formData.borrowPeriod : undefined,
      mainImageFile: mainImage ? mainImage.name : "Pas de nouveau fichier",
      additionalImagesCount: additionalImages.length,
      existingImagesPreviewsCount: additionalPreviews.length,
    })
    try {
      setSubmitting(true)
      const uploadFormData = new FormData()

      uploadFormData.append("title", formData.title)
      uploadFormData.append("description", formData.description)
      uploadFormData.append("type", formData.type)
      uploadFormData.append("category", formData.category)

      if (formData.type === "vente") {
        uploadFormData.append("price", formData.price)
      }

      if (formData.type === "echange") {
        uploadFormData.append("exchangeFor", formData.exchangeFor)
      }

      if (formData.type === "pret") {
        uploadFormData.append("borrowPeriod", formData.borrowPeriod)
      }

      if (mainImage) {
        console.log("📸 [EDIT] Ajout image principale:", mainImage.name)
        uploadFormData.append("images", mainImage)
      }
      additionalImages.forEach((img, idx) => {
        console.log(`📸 [EDIT] Ajout image additionnelle ${idx}:`, img.name)
        uploadFormData.append("images", img)
      })

      if (!token) {
        throw new Error("Authentication token required")
      }

      console.log("🚀 [EDIT] Appel API PUT /api/annonces/:id avec annonce ID:", announcementId)
      const response = await annonceApi.update(announcementId, uploadFormData, token)
      console.log("📋 [EDIT] Réponse API:", response)

      if (response.success) {
        console.log("✅ [EDIT] Mise à jour réussie!")
        showNotification("Annonce mise à jour avec succès!", "success")
        setSuccess(true)
        setTimeout(() => {
          console.log("🔄 [EDIT] Redirection vers /mes-annonces")
          router.push("/mes-annonces")
        }, 1500)
      } else {
        console.error("❌ [EDIT] Erreur API:", response.message)
        setError(response.message || "Erreur lors de la mise à jour de l'annonce")
      }
    } catch (err) {
      console.error("❌ [EDIT] Exception lors de la soumission:", err)
      setError(err instanceof Error ? err.message : "Erreur lors de la mise à jour")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader className="size-8 animate-spin mx-auto text-rose-500 mb-4" />
        <p className="text-muted-foreground">Chargement de l'annonce...</p>
      </div>
    )
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
        <Alert className="border-[#EC7578]/20 bg-[#EC7578]/10">
          <CheckCircle2 className="h-4 w-4 text-[#EC7578]" />
          <AlertDescription className="text-[#EC7578]">Annonce mise à jour avec succès!</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Label htmlFor="title">Titre de l'annonce *</Label>
          <Input
            id="title"
            name="title"
            placeholder="Ex: MacBook Pro 2023"
            value={formData.title}
            onChange={handleInputChange}
            className="mt-2 border-border"
          />
        </div>

        <div>
          <Label htmlFor="category">Catégorie *</Label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Décrivez votre annonce en détail..."
          value={formData.description}
          onChange={handleInputChange}
          rows={5}
          className="mt-2 border-border"
        />
      </div>

      <div>
        <Label htmlFor="type">Type d'annonce *</Label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleInputChange}
          className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
        >
          {ANNOUNCEMENT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {formData.type === "vente" && (
        <div>
          <Label htmlFor="price">Prix (€) *</Label>
          <Input
            id="price"
            name="price"
            type="number"
            placeholder="0.00"
            step="0.01"
            value={formData.price}
            onChange={handleInputChange}
            className="mt-2 border-border"
          />
        </div>
      )}

      {formData.type === "echange" && (
        <div>
          <Label htmlFor="exchangeFor">Ce que vous recherchez en échange *</Label>
          <Textarea
            id="exchangeFor"
            name="exchangeFor"
            placeholder="Décrivez ce que vous recherchez..."
            value={formData.exchangeFor}
            onChange={handleInputChange}
            rows={3}
            className="mt-2 border-border"
          />
        </div>
      )}

      {formData.type === "pret" && (
        <div>
          <Label htmlFor="borrowPeriod">Période de prêt *</Label>
          <Input
            id="borrowPeriod"
            name="borrowPeriod"
            placeholder="Ex: 1 semaine, 2 mois"
            value={formData.borrowPeriod}
            onChange={handleInputChange}
            className="mt-2 border-border"
          />
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="mainImage">Image principale</Label>
          <div className="mt-2 rounded-lg border-2 border-dashed border-border p-6">
            {mainImagePreview ? (
              <div className="relative w-full h-40 rounded-lg overflow-hidden">
                <img src={mainImagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setMainImage(null)
                    setMainImagePreview("")
                  }}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center cursor-pointer py-8">
                <Upload className="size-8 text-muted-foreground mb-2" />
                <span className="text-sm font-medium text-foreground">Cliquez pour ajouter une image</span>
                <span className="text-xs text-muted-foreground mt-1">ou glissez-la ici</span>
                <input
                  id="mainImage"
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="additionalImages">Images supplémentaires</Label>
          <div className="mt-2 rounded-lg border-2 border-dashed border-border p-6">
            {additionalPreviews.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {additionalPreviews.map((preview, index) => (
                  <div key={index} className="relative w-full h-24 rounded-lg overflow-hidden">
                    <img src={preview} alt={`Additional ${index}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeAdditionalImage(index)}
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
            <label className="flex flex-col items-center justify-center cursor-pointer py-8">
              <Upload className="size-8 text-muted-foreground mb-2" />
              <span className="text-sm font-medium text-foreground">Ajouter d'autres images</span>
              <span className="text-xs text-muted-foreground mt-1">Vous pouvez en ajouter plusieurs</span>
              <input
                id="additionalImages"
                type="file"
                multiple
                accept="image/*"
                onChange={handleAdditionalImagesChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={submitting}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-rose-500 hover:bg-rose-600"
        >
          {submitting ? (
            <>
              <Loader className="mr-2 size-4 animate-spin" />
              Mise à jour en cours...
            </>
          ) : (
            "Mettre à jour l'annonce"
          )}
        </Button>
      </div>
    </form>
  )
}
