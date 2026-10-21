"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, CheckCircle2 } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "support",
    message: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState("")

  const categories = [
    { value: "support", label: "Support Technique" },
    { value: "feedback", label: "Suggestions & Feedback" },
    { value: "issue", label: "Signaler un Problème" },
    { value: "partnership", label: "Partenariat" },
    { value: "other", label: "Autre" },
  ]

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      // TODO: Integrate with backend API
      // For now, just simulate success
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log("Contact form submitted:", formData)

      setShowSuccess(true)
      setFormData({
        name: "",
        email: "",
        subject: "",
        category: "support",
        message: "",
      })

      setTimeout(() => {
        setShowSuccess(false)
      }, 5000)
    } catch (err) {
      setError("Une erreur s'est produite. Veuillez réessayer.")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Header Section */}
        <section className="bg-gradient-to-b from-muted/50 to-background py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Nous Contacter
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Vous avez une question ? Une suggestion ? Des questions sur votre compte ou des annonces ?
                Nous serions ravis de vous aider.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {/* Contact Info Cards */}
              <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
                <Mail className="size-8 text-primary mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Email
                </h3>
                <p className="text-muted-foreground">
                  <a href="mailto:support@ccarre.com" className="hover:text-primary transition-colors">
                    support@ccarre.com
                  </a>
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
                <Phone className="size-8 text-primary mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Téléphone
                </h3>
                <p className="text-muted-foreground">
                  <a href="tel:+33123456789" className="hover:text-primary transition-colors">
                    +33 1 23 45 67 89
                  </a>
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
                <MapPin className="size-8 text-primary mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Adresse
                </h3>
                <p className="text-muted-foreground">
                  123 Rue de la Plateforme<br />
                  75001 Paris, France
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-card border border-border rounded-lg p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Nous Envoyer un Message
              </h2>

              {showSuccess && (
                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6 flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900 dark:text-green-200">
                      Message Envoyé avec Succès!
                    </p>
                    <p className="text-sm text-green-800 dark:text-green-300">
                      Nous vous répondrons dans les meilleurs délais.
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                  <p className="text-red-900 dark:text-red-200">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name and Email */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                      Nom Complet *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Votre nom"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      Email *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="votre@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Category and Subject */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-foreground mb-2">
                      Catégorie *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                      Sujet *
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      placeholder="Résumé de votre demande"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Décrivez votre question ou votre demande en détail..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                    minLength={10}
                    className="w-full min-h-40 resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum 10 caractères
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.name || !formData.email || !formData.subject || !formData.message}
                  className="w-full py-6 text-base font-medium"
                >
                  {isSubmitting ? "Envoi en cours..." : "Envoyer le Message"}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Les champs marqués avec * sont obligatoires
                </p>
              </form>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
              Questions Fréquemment Posées
            </h2>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-background border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Quel est le temps de réponse ?
                </h3>
                <p className="text-muted-foreground text-sm">
                  Nous répondons généralement à tous les messages dans les 24 à 48 heures pendant les jours ouvrables.
                </p>
              </div>

              <div className="bg-background border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Comment puis-je signaler une annonce ?
                </h3>
                <p className="text-muted-foreground text-sm">
                  Vous pouvez signaler une annonce directement depuis la page d'annonce en utilisant le bouton "Signaler".
                </p>
              </div>

              <div className="bg-background border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Comment puis-je supprimer mon compte ?
                </h3>
                <p className="text-muted-foreground text-sm">
                  Visitez vos paramètres de compte pour demander la suppression. Il faudra quelques jours pour traiter votre demande.
                </p>
              </div>

              <div className="bg-background border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Y a-t-il des frais ?
                </h3>
                <p className="text-muted-foreground text-sm">
                  CCaré est gratuit pour créer un compte et publier des annonces. Nous ne prélevons aucun frais.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
