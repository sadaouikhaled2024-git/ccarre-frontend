import { Lock, CreditCard, Mail } from "lucide-react"

export function SecuritySection() {
  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center gap-16 lg:flex-row">
          <div className="flex-1">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5">
              <Lock className="size-3.5 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">
                {"Sécurité"}
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
              {"Un environnement sûr et vérifié"}
            </h2>
            <p className="mt-4 max-w-lg leading-relaxed text-muted-foreground">
              {"CCarré est une plateforme exclusivement réservée aux étudiants d\u2019Aix-Marseille Université. Chaque compte est vérifié grâce à l\u2019adresse e-mail universitaire."}
            </p>
          </div>

          <div className="flex flex-1 flex-col gap-6">
            <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Mail className="size-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {"E-mail universitaire requis"}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {"Seuls les comptes @etu.univ-amu.fr sont acceptés pour garantir un accès exclusivement étudiant."}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/10">
                <CreditCard className="size-5 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {"Aucun paiement intégré"}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {"CCarré ne gère aucune transaction financière. Les échanges se font directement entre étudiants, en toute liberté."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
