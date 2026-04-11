"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Loader } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { authApi } from "@/lib/auth-api"

export default function SettingsPage() {
  const { user, token: contextToken } = useAuth()
  const token =
    contextToken ||
    (typeof window !== "undefined" ? window.localStorage.getItem("ccarre_token") : null)
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: (user?.firstName as string) || "",
    lastName: (user?.lastName as string) || "",
    email: (user?.email as string) || "",
    username: (user?.username as string) || "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      // API call would go here
      console.log("Updating user:", formData)
      // await updateUserProfile(formData)
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)

    if (!token) {
      setPasswordError("Vous devez être connecté")
      return
    }

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError("Tous les champs sont requis")
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("La confirmation du mot de passe ne correspond pas")
      return
    }

    setIsPasswordLoading(true)
    try {
      const response = await authApi.changePassword(passwordData, token)
      toast({
        title: "Mot de passe modifié",
        description: response.message || "Mot de passe modifié avec succès",
      })
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "Erreur lors du changement de mot de passe")
    } finally {
      setIsPasswordLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-2xl px-6">
          <h1 className="text-balance text-4xl font-bold text-foreground mb-8">Paramètres</h1>

          <div className="rounded-lg border border-border p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Informations personnelles</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
                    Prénom
                  </label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Votre prénom"
                    className="border-border"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
                    Nom
                  </label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Votre nom"
                    className="border-border"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="votre.email@example.com"
                  className="border-border"
                />
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
                  Nom d'utilisateur
                </label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="votre_nom_utilisateur"
                  className="border-border"
                />
              </div>

              <div className="pt-6 border-t border-border">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-rose-500 hover:bg-rose-600 text-white w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader className="mr-2 size-4 animate-spin" />
                      Mise à jour en cours...
                    </>
                  ) : (
                    "Mettre à jour"
                  )}
                </Button>
              </div>
            </form>
          </div>

          <div className="rounded-lg border border-border p-8 mt-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">Modifier le mot de passe</h2>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-foreground mb-2">
                  Mot de passe actuel
                </label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Votre mot de passe actuel"
                  className="border-border"
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-foreground mb-2">
                  Nouveau mot de passe
                </label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Votre nouveau mot de passe"
                  className="border-border"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                  Confirmation du nouveau mot de passe
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirmez le nouveau mot de passe"
                  className="border-border"
                />
              </div>

              {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isPasswordLoading}
                  className="bg-rose-500 hover:bg-rose-600 text-white w-full"
                >
                  {isPasswordLoading ? (
                    <>
                      <Loader className="mr-2 size-4 animate-spin" />
                      Changement en cours...
                    </>
                  ) : (
                    "Changer le mot de passe"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
