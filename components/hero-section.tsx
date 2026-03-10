import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-secondary/5" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 py-24 text-center lg:py-36">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-primary" />
          <span className="text-xs font-medium text-muted-foreground">
            {"Réservé aux étudiants AMU"}
          </span>
        </div>

        <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
          {"La plateforme d'échange réservée aux étudiants AMU"}
        </h1>

        <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
          {"Achetez, vendez et prêtez entre étudiants d'Aix-Marseille Université. Simple, sécurisé et 100% étudiant."}
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="rounded-lg bg-primary px-8 text-primary-foreground shadow-md hover:bg-accent"
          >
            <Link href="/auth?tab=register">
              {"Créer un compte"}
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-lg border-border px-8 text-foreground hover:bg-muted"
          >
            <Link href="/auth">Se connecter</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
