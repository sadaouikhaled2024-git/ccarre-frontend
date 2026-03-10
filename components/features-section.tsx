import { Megaphone, MessageCircle, ShieldCheck } from "lucide-react"

const features = [
  {
    icon: Megaphone,
    title: "Publier des annonces",
    description:
      "Publiez facilement vos annonces de vente, de prêt ou de demande. Trouvez ce dont vous avez besoin en quelques clics.",
  },
  {
    icon: MessageCircle,
    title: "Messagerie sécurisée",
    description:
      "Communiquez directement avec les autres étudiants grâce à notre messagerie intégrée, simple et confidentielle.",
  },
  {
    icon: ShieldCheck,
    title: "Accès réservé @etu.univ-amu.fr",
    description:
      "Seuls les étudiants disposant d'une adresse e-mail universitaire peuvent accéder à la plateforme.",
  },
]

export function FeaturesSection() {
  return (
    <section id="fonctionnalites" className="bg-muted/30 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
            {"Tout ce qu'il faut pour échanger entre étudiants"}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {"Des outils pensés pour simplifier vos échanges au quotidien."}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group flex flex-col items-start rounded-xl border border-border bg-card p-8 shadow-sm transition-all hover:shadow-md hover:border-primary/30"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="size-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="leading-relaxed text-muted-foreground text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
