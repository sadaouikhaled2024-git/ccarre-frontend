import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2 } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import Image from "next/image"

export default function InfoPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="mx-auto max-w-4xl px-6 py-12">
          {/* Header */}
          <div className="mb-12 text-center">
            <Image src="/logoc.png" alt="CCarré" width={200} height={80} className="h-20 w-auto mx-auto mb-6" />
            <h1 className="mb-4 text-4xl font-bold text-foreground">À propos de CCarré</h1>
            <p className="text-xl text-muted-foreground">
              La plateforme d'échange entre étudiants d'Aix-Marseille Université
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            {/* Mission */}
            <Card className="bg-gradient-to-br from-card to-card/50 p-8">
              <h2 className="mb-4 text-2xl font-bold text-foreground">Notre Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                CCarré est une plateforme innovante créée pour faciliter l'échange de biens et
                de services entre étudiants de l'Université Aix-Marseille. Notre objectif est de
                créer une communauté solidaire où les étudiants peuvent acheter, vendre et
                échanger des articles de manière sécurisée et conviviale.
              </p>
            </Card>

            {/* Features */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-foreground">Nos Fonctionnalités</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    title: "Annonces Sécurisées",
                    description: "Publiez et consultez des annonces vérifiées par une communauté d'étudiants",
                  },
                  {
                    title: "Profils Vérifiés",
                    description: "Profitez de profils authentifiés avec les adresses emails universitaires",
                  },
                  {
                    title: "Communication Directe",
                    description: "Contactez d'autres étudiants directement via la plateforme",
                  },
                  {
                    title: "Interface Intuitive",
                    description: "Naviguez facilement avec un design moderne et responsif",
                  },
                  {
                    title: "Catégories Variées",
                    description: "Explorez plusieurs catégories : livres, électronique, mobilier, etc.",
                  },
                  {
                    title: "Favoris & Sauvegarde",
                    description: "Marquez vos annonces préférées pour les consulter plus tard",
                  },
                ].map((feature, index) => (
                  <Card key={index} className="bg-muted/30 p-6">
                    <div className="mb-3 flex items-start gap-3">
                      <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                      <div>
                        <h3 className="font-semibold text-foreground">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* How it works */}
            <Card className="bg-gradient-to-br from-card to-card/50 p-8">
              <h2 className="mb-6 text-2xl font-bold text-foreground">Comment ça marche ?</h2>
              <div className="space-y-6">
                {[
                  {
                    step: "01",
                    title: "Inscrivez-vous",
                    description: "Créez un compte avec votre adresse email universitaire",
                  },
                  {
                    step: "02",
                    title: "Complétez votre profil",
                    description: "Ajoutez vos informations et une photo de profil",
                  },
                  {
                    step: "03",
                    title: "Créez une annonce",
                    description: "Publiez vos articles avec photos et description détaillée",
                  },
                  {
                    step: "04",
                    title: "Connectez-vous",
                    description: "Interagissez avec d'autres étudiants et finalisez vos transactions",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <Badge className="h-10 w-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
                        {item.step}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Team & Contact */}
            <Card className="bg-muted/30 p-8">
              <h2 className="mb-4 text-2xl font-bold text-foreground">À Propos du Projet</h2>
              <p className="mb-4 text-muted-foreground">
                CCarré est un projet étudiant développé par et pour les étudiants de l'Université
                Aix-Marseille. Nous sommes passionnés par la création de solutions qui facilitent
                la vie universitaire.
              </p>
              <div className="flex flex-col gap-2 text-sm">
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">Université :</span> Aix-Marseille Université (AMU)
                </p>
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">Année :</span> 2026
                </p>
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">Statut :</span> Projet étudiant
                </p>
              </div>
            </Card>

            {/* Links */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="bg-muted/30 p-6 text-center">
                <h3 className="mb-2 font-semibold text-foreground">Questions ?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Consultez notre page de politique de confidentialité pour en savoir plus sur
                  vos droits et la protection de vos données.
                </p>
                <a href="/privacy" className="inline-block text-primary hover:text-primary/80 font-semibold transition-colors">
                  Lire la politique de confidentialité →
                </a>
              </Card>
              <Card className="bg-muted/30 p-6 text-center">
                <h3 className="mb-2 font-semibold text-foreground">Besoin d'aide ?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Pour toute question concernant la plateforme ou vos données, n'hésitez pas
                  à nous contacter.
                </p>
                <a href="mailto:contact@ccarre.local" className="inline-block text-primary hover:text-primary/80 font-semibold transition-colors">
                  Nous contacter →
                </a>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
