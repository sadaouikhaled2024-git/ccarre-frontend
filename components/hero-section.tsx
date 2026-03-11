import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background min-h-[90vh] flex items-center">
      {/* Background image */}
      <Image
        src="/backg.png"
        alt=""
        fill
        className="object-cover object-center"
        priority
      />
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-background/60" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl items-center gap-12 px-6 py-24 lg:py-36">
        {/* Left — Shopping image */}
        <div className="hidden flex-shrink-0 lg:block">
          <Image
            src="/shopping.png"
            alt="Shopping"
            width={500}
            height={500}
            className="h-auto w-[420px] drop-shadow-2xl"
          />
        </div>

        {/* Right — Content */}
        <div className="flex flex-1 flex-col items-center text-center">
          <Image
            src="/ccare.png"
            alt="CCarré"
            width={600}
            height={240}
            className="mb-8 h-48 w-auto"
          />

          <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl" style={{ color: '#B44362' }}>
            {"La plateforme d'échange réservée aux étudiants AMU"}
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed" style={{ color: '#B44362' }}>
            {"Achetez, vendez et prêtez entre étudiants d'Aix-Marseille Université. Simple, sécurisé et 100% étudiant."}
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="rounded-lg px-8 shadow-md"
              style={{ backgroundColor: '#B44362', color: '#fff' }}
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
              className="rounded-lg px-8 hover:bg-muted"
              style={{ borderColor: '#B44362', color: '#B44362' }}
            >
              <Link href="/auth">Se connecter</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
