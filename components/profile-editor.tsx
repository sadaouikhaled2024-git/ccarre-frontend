"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { profileApi, type UserProfile } from "@/lib/profile-api"
import { showNotification } from "@/components/notification-toast"
import { Upload, X } from "lucide-react"
import { LIEUX_OPTIONS } from "@/lib/lieux-options"

interface ProfileEditorProps {
  user: UserProfile | null
  token: string | null
  onProfileUpdate?: (updatedUser: UserProfile) => void
}

export function ProfileEditor({ user, token, onProfileUpdate }: ProfileEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    campus: "",
  })
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  // Update form when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        address: user.address || "",
        campus: typeof user.campus === "string" ? user.campus : (user.campus as any)?._id || "",
      })
    }
  }, [user])

  const handleSave = async () => {
    if (!token) return

    try {
      setLoading(true)
      const response = await profileApi.updateProfile(formData, token)
      showNotification("Profil mis à jour", "success")
      setIsEditing(false)
      onProfileUpdate?.(response.data)
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : "Impossible de mettre à jour le profil",
        "error",
      )
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !token) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification("La photo doit faire moins de 5MB", "error")
      return
    }

    try {
      setUploadingPhoto(true)
      const response = await profileApi.uploadPhoto(file, token)
      showNotification("Photo mise à jour", "success")
      onProfileUpdate?.(response.data)
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : "Impossible d'uploader la photo",
        "error",
      )
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleDeletePhoto = async () => {
    if (!token) return

    try {
      setLoading(true)
      const response = await profileApi.deletePhoto(token)
      showNotification("Photo supprimée", "success")
      onProfileUpdate?.(response.data)
    } catch (error) {
      showNotification({
        title: "Erreur",
        message: error instanceof Error ? error.message : "Impossible de supprimer la photo",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const userInitials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`
    : "U"

  if (!user) {
    return (
      <Card className="p-6 border border-[#EC7578]/20 text-center">
        <p className="text-[#1F0C11]/60">Impossible de charger le profil</p>
      </Card>
    )
  }

  return (
    <Card className="border border-[#EC7578]/20">
      <div className="p-6">
        {/* Profile Photo Section */}
        <div className="mb-8 pb-8 border-b border-[#EC7578]/10">
          <h3 className="text-lg font-semibold text-[#1F0C11] mb-4">Photo de profil</h3>
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.profilePhoto} alt={`${user.firstName} ${user.lastName}`} />
              <AvatarFallback className="bg-[#B44362] text-white text-lg font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-3">
              <label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                  className="hidden"
                />
                <Button
                  asChild
                  variant="outline"
                  className="cursor-pointer border-[#B44362]/30 text-[#B44362] hover:bg-[#B44362]/5"
                >
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingPhoto ? "Upload..." : "Changer la photo"}
                  </span>
                </Button>
              </label>
              {user.profilePhoto && (
                <Button
                  onClick={handleDeletePhoto}
                  disabled={loading}
                  variant="outline"
                  className="border-[#EC7578]/30 text-[#EC7578] hover:bg-[#EC7578]/5"
                >
                  <X className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Form */}
        {isEditing ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-[#1F0C11] mb-2 block">
                  Prénom
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="border-[#B44362]/30 focus:border-[#B44362]"
                  placeholder="Votre prénom"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-[#1F0C11] mb-2 block">
                  Nom
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="border-[#B44362]/30 focus:border-[#B44362]"
                  placeholder="Votre nom"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address" className="text-[#1F0C11] mb-2 block">
                Adresse
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="border-[#B44362]/30 focus:border-[#B44362]"
                placeholder="Votre adresse"
              />
            </div>

            <div>
              <Label htmlFor="campus" className="text-[#1F0C11] mb-2 block">
                Campus
              </Label>
              <Select value={formData.campus} onValueChange={(value) => setFormData({ ...formData, campus: value })}>
                <SelectTrigger className="border-[#B44362]/30 focus:border-[#B44362]">
                  <SelectValue placeholder="Sélectionnez un site" />
                </SelectTrigger>
                <SelectContent>
                  {LIEUX_OPTIONS.map((lieu) => (
                    <SelectItem key={lieu} value={lieu}>
                      {lieu}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="bg-[#B44362] hover:bg-[#B44362]/90 text-white"
              >
                {loading ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                className="border-[#B44362]/30 text-[#B44362] hover:bg-[#B44362]/5"
              >
                Annuler
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[#1F0C11]/60 mb-1">Prénom</p>
                <p className="font-medium text-[#1F0C11]">{user.firstName}</p>
              </div>
              <div>
                <p className="text-sm text-[#1F0C11]/60 mb-1">Nom</p>
                <p className="font-medium text-[#1F0C11]">{user.lastName}</p>
              </div>
            </div>

            {user.address && (
              <div>
                <p className="text-sm text-[#1F0C11]/60 mb-1">Adresse</p>
                <p className="font-medium text-[#1F0C11]">{user.address}</p>
              </div>
            )}

            {user.campus && (
              <div>
                <p className="text-sm text-[#1F0C11]/60 mb-1">Campus</p>
                <p className="font-medium text-[#1F0C11]">
                  {typeof user.campus === "string" ? user.campus : (user.campus as any).name}
                </p>
              </div>
            )}

            <Button
              onClick={() => setIsEditing(true)}
              className="mt-4 bg-[#B44362] hover:bg-[#B44362]/90 text-white"
            >
              Modifier le profil
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
