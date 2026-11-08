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
                La vie étudiante implique de nombreux besoins matériels et pratiques : trouver des manuels universitaires à moindre coût, acheter du mobilier, revendre des équipements dont on n'a plus besoin ou encore donner une seconde vie à des objets.
Pourtant, les échanges entre étudiants restent souvent dispersés sur différentes plateformes et groupes de discussion.
              </p> <p className="text-lg text-muted-foreground leading-relaxed">CCarré est né de cette problématique.
</p>
 <p className="text-lg text-muted-foreground leading-relaxed">Notre objectif est de proposer un espace centralisé, accessible à la communauté d'Aix-Marseille Université, permettant aux étudiants de publier des annonces, acheter, vendre et échanger des biens plus facilement.
</p>
 <p className="text-lg text-muted-foreground leading-relaxed">Au-delà d'une simple plateforme de petites annonces, CCarré ambitionne de favoriser l'entraide, les échanges locaux et une consommation plus responsable au sein de la communauté universitaire.
</p>              </p>
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
CCarré est un projet étudiant indépendant, initié dans le but de faciliter les échanges de biens entre les étudiants d'Aix-Marseille Université.</p>
 <p className="mb-4 text-muted-foreground">Développé à partir d'un constat simple, le projet répond à un besoin concret de la vie universitaire : permettre aux étudiants de trouver plus facilement des biens utiles à leur quotidien, tout en donnant une seconde vie aux objets dont d'autres n'ont plus besoin.
</p>
 <p className="mb-4 text-muted-foreground">À travers une plateforme centralisée, CCarré propose un espace où les étudiants peuvent publier des annonces, acheter, vendre et découvrir des articles dans différentes catégories, notamment les livres, le matériel informatique et le mobilier.
</p>
 <p className="mb-4 text-muted-foreground">Au-delà de sa dimension pratique, le projet porte une ambition plus large : encourager l'entraide étudiante, favoriser l'économie circulaire et renforcer les échanges au sein de la communauté universitaire.
</p>
              
              <div className="flex flex-col gap-2 text-sm">
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">Université :</span> Aix-Marseille Université (AMU)
                </p>
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">Année :</span> 2026
                </p>
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">Statut :</span> Projet étudiant indépendant
                </p>
              </div>
              <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">Développement et conception :</span>
                </p>
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">Sadaoui Khaled</span> - co-founder, Full-stack developper
                </p>
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">Macyl Moumou</span> - co-founder, Full-stack developper and Product Owner
                </p>
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">Lydia Meziane</span> - Scrum Master
                </p>
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">Rassoul Rayane</span> - Frontend Developper
                </p>
                 <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">Djoumer Rayan</span> - Backend Developper
                </p>
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
                <a href="mailto:sadaouikhaled2024@gmail.com" className="inline-block text-primary hover:text-primary/80 font-semibold transition-colors">
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
