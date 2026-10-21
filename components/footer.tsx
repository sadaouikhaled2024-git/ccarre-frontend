import Image from "next/image"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/20 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6">
        <Image src="/logoc.png" alt="CCarré" width={200} height={80} className="h-14 w-auto" />
        <p className="text-sm text-muted-foreground text-center">
          {"Plateforme d'échange entre étudiants d'Aix-Marseille Université."}
        </p>
        
        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
          <Link href="/info" className="hover:text-primary transition-colors">
            À propos
          </Link>
          <span className="text-border/50">•</span>
          <Link href="/privacy" className="hover:text-primary transition-colors">
            Politique de confidentialité
          </Link>
          <span className="text-border/50">•</span>
          <Link href="/contact" className="hover:text-primary transition-colors">
            Contact
          </Link>
        </div>

        <p className="text-xs text-muted-foreground/70 text-center">
          {"© 2026 CCarré — Projet étudiant AMU. Tous droits réservés."}
        </p>
      </div>
    </footer>
  )
}
