import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import Image from "next/image"

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="mx-auto max-w-4xl px-6 py-12">
          {/* Container CSS */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-card/50 shadow-lg">
            {/* Decorative background */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 h-96 w-96 bg-primary rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 h-96 w-96 bg-primary/50 rounded-full blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative z-10 px-8 py-12 md:px-12 md:py-16">
              {/* Header */}
              <div className="mb-12 border-b border-border/30 pb-8 text-center">
                <Image src="/logoc.png" alt="CCarré" width={200} height={80} className="h-16 w-auto mx-auto mb-6" />
                <h1 className="text-4xl font-bold text-foreground mb-2">Politique de confidentialité</h1>
                <p className="text-lg font-semibold text-primary">CCarré</p>
                <p className="text-sm text-muted-foreground mt-4">
                  Dernière mise à jour : Mars 2026
                </p>
              </div>

              {/* Content */}
              <div className="prose prose-invert max-w-none space-y-8 text-foreground">
                {/* Section 1 */}
                <section>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">1. Introduction</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    La plateforme CCarré est un service destiné aux étudiants de l'Université Aix-Marseille permettant la publication et la consultation d'annonces entre étudiants.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Cette politique de confidentialité explique quelles données sont collectées, comment elles sont utilisées et comment elles sont protégées.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    En utilisant la plateforme CCarré, l'utilisateur accepte les pratiques décrites dans cette politique de confidentialité.
                  </p>
                </section>

                {/* Section 2 */}
                <section>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">2. Données collectées</h2>
                  <p className="text-muted-foreground font-semibold mb-4">
                    Lors de l'utilisation de la plateforme, certaines données personnelles peuvent être collectées.
                  </p>

                  <h3 className="text-xl font-semibold mb-3 text-foreground">Informations fournies lors de l'inscription</h3>
                  <p className="text-muted-foreground mb-3 leading-relaxed">
                    Lors de la création d'un compte, les informations suivantes peuvent être collectées :
                  </p>
                  <ul className="space-y-2 text-muted-foreground pl-6 mb-6">
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>Nom</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>Prénom</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>Adresse email universitaire</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>Nom d'utilisateur</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>Mot de passe (stocké de manière sécurisée)</span>
                    </li>
                  </ul>

                  <h3 className="text-xl font-semibold mb-3 text-foreground">Informations liées à l'utilisation du service</h3>
                  <p className="text-muted-foreground mb-3 leading-relaxed">
                    Lorsque l'utilisateur utilise la plateforme, les informations suivantes peuvent également être enregistrées :
                  </p>
                  <ul className="space-y-2 text-muted-foreground pl-6 mb-6">
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>Annonces publiées</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>Images associées aux annonces</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>Date de création du compte</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>Historique des interactions avec la plateforme</span>
                    </li>
                  </ul>
                </section>

                {/* Section 3 */}
                <section>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">3. Utilisation des données</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Les données collectées sont utilisées uniquement dans le cadre du fonctionnement de la plateforme CCarré.
                  </p>
                  <p className="text-muted-foreground font-semibold mb-3">
                    Ces données permettent notamment de :
                  </p>
                  <ul className="space-y-2 text-muted-foreground pl-6 mb-6">
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>créer et gérer les comptes utilisateurs</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>permettre l'authentification des utilisateurs</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>publier et afficher les annonces</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>identifier les utilisateurs qui publient des annonces</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>permettre les interactions entre étudiants</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>améliorer le fonctionnement de la plateforme</span>
                    </li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed">
                    Les données ne sont pas utilisées à des fins commerciales.
                  </p>
                </section>

                {/* Section 4 */}
                <section>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">4. Stockage et sécurité des données</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Les données personnelles sont stockées de manière sécurisée sur les serveurs utilisés par l'application.
                  </p>
                  <p className="text-muted-foreground font-semibold mb-3">
                    Des mesures de sécurité sont mises en place afin de protéger les informations des utilisateurs, notamment :
                  </p>
                  <ul className="space-y-2 text-muted-foreground pl-6 mb-6">
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>chiffrement des mots de passe</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>authentification sécurisée</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>contrôle d'accès aux données</span>
                    </li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed">
                    Malgré ces mesures, aucun système n'est totalement sécurisé. L'équipe du projet s'efforce néanmoins de protéger au mieux les données des utilisateurs.
                  </p>
                </section>

                {/* Section 5 */}
                <section>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">5. Services tiers</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Certains services externes peuvent être utilisés afin d'assurer le bon fonctionnement de la plateforme.
                  </p>
                  <p className="text-muted-foreground font-semibold mb-3">
                    Par exemple :
                  </p>
                  <ul className="space-y-2 text-muted-foreground pl-6 mb-6">
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>services d'hébergement</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>services de stockage d'images</span>
                    </li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed">
                    Ces services peuvent traiter certaines données nécessaires au fonctionnement de l'application.
                  </p>
                </section>

                {/* Section 6 */}
                <section>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">6. Partage des données</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Les données personnelles des utilisateurs ne sont pas vendues ni partagées avec des tiers à des fins commerciales.
                  </p>
                  <p className="text-muted-foreground font-semibold mb-3">
                    Certaines informations peuvent être visibles par d'autres utilisateurs de la plateforme, notamment :
                  </p>
                  <ul className="space-y-2 text-muted-foreground pl-6 mb-6">
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>le nom et prénom du propriétaire d'une annonce</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>les annonces publiées</span>
                    </li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed">
                    Ces informations sont nécessaires au fonctionnement du service.
                  </p>
                </section>

                {/* Section 7 */}
                <section>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">7. Droits des utilisateurs</h2>
                  <p className="text-muted-foreground font-semibold mb-3">
                    Les utilisateurs disposent de droits concernant leurs données personnelles, notamment :
                  </p>
                  <ul className="space-y-2 text-muted-foreground pl-6 mb-6">
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>consulter les informations associées à leur compte</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>demander la modification de leurs informations</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>demander la suppression de leur compte</span>
                    </li>
                  </ul>
                </section>

                {/* Section 8 */}
                <section>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">8. Modification de la politique de confidentialité</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Cette politique de confidentialité peut être modifiée afin de refléter l'évolution de la plateforme.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Les utilisateurs seront informés en cas de modification importante.
                  </p>
                </section>

                {/* Section 9 */}
                <section>
                  <h2 className="text-2xl font-bold mb-4 text-foreground">9. Contact</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Pour toute question concernant cette politique de confidentialité ou le traitement des données, les utilisateurs peuvent contacter les responsables du projet CCarré.
                  </p>
                </section>
              </div>

              {/* Footer */}
              <div className="mt-12 border-t border-border/30 pt-8 text-center">
                <p className="text-sm text-muted-foreground">
                  © 2026 CCarré — Projet étudiant AMU. Tous droits réservés.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

