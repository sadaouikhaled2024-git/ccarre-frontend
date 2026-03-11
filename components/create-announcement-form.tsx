"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Plus, X, CalendarIcon, ImagePlus } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"

type OfferType = "vente" | "pret" | "echange"

export function CreateAnnouncementButton() {
  const [open, setOpen] = useState(false)
  const [offerType, setOfferType] = useState<OfferType>("vente")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [exchangeFor, setExchangeFor] = useState("")
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [images, setImages] = useState<string[]>([])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newImages: string[] = []
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          newImages.push(reader.result as string)
          if (newImages.length === files.length) {
            setImages((prev) => [...prev, ...newImages])
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock submission - will be connected to server later
    console.log({
      title,
      description,
      offerType,
      price: offerType === "vente" ? price : undefined,
      exchangeFor: offerType === "echange" ? exchangeFor : undefined,
      startDate: offerType === "pret" ? startDate : undefined,
      endDate: offerType === "pret" ? endDate : undefined,
      images,
    })
    setOpen(false)
    // Reset form
    setTitle("")
    setDescription("")
    setPrice("")
    setExchangeFor("")
    setStartDate(undefined)
    setEndDate(undefined)
    setImages([])
    setOfferType("vente")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="fixed bottom-6 left-6 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:scale-110 hover:shadow-xl"
          aria-label="Créer une annonce"
        >
          <Plus className="size-7" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">Créer une annonce</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-foreground">Titre</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Livre de mathématiques L2"
              required
              className="border-input"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-foreground">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre article en détail..."
              rows={4}
              required
              className="border-input resize-none"
            />
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Images</Label>
            <div className="flex flex-wrap gap-3">
              {images.map((image, index) => (
                <div key={index} className="group relative size-20 overflow-hidden rounded-lg border border-border">
                  <img src={image} alt={`Image ${index + 1}`} className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
              <label className="flex size-20 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border transition-colors hover:border-primary hover:bg-muted/50">
                <ImagePlus className="size-6 text-muted-foreground" />
                <span className="mt-1 text-xs text-muted-foreground">Ajouter</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Offer Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">{"Type d'offre"}</Label>
            <RadioGroup
              value={offerType}
              onValueChange={(value) => setOfferType(value as OfferType)}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="vente" id="vente" className="border-primary text-primary" />
                <Label htmlFor="vente" className="cursor-pointer text-sm text-foreground">Vente</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pret" id="pret" className="border-primary text-primary" />
                <Label htmlFor="pret" className="cursor-pointer text-sm text-foreground">Prêt</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="echange" id="echange" className="border-primary text-primary" />
                <Label htmlFor="echange" className="cursor-pointer text-sm text-foreground">Échange</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Conditional Fields based on Offer Type */}
          {offerType === "vente" && (
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium text-foreground">Prix (EUR)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Ex: 25.00"
                required
                className="border-input"
              />
            </div>
          )}

          {offerType === "echange" && (
            <div className="space-y-2">
              <Label htmlFor="exchangeFor" className="text-sm font-medium text-foreground">Échange contre</Label>
              <Textarea
                id="exchangeFor"
                value={exchangeFor}
                onChange={(e) => setExchangeFor(e.target.value)}
                placeholder="Décrivez ce que vous recherchez en échange..."
                rows={3}
                required
                className="border-input resize-none"
              />
            </div>
          )}

          {offerType === "pret" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Date de début</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 size-4" />
                      {startDate ? format(startDate, "PPP", { locale: fr }) : "Sélectionner"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Date de fin</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 size-4" />
                      {endDate ? format(endDate, "PPP", { locale: fr }) : "Sélectionner"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      locale={fr}
                      disabled={(date) => startDate ? date < startDate : false}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Publier l'annonce
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
