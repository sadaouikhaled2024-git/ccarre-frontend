import Image from "next/image"

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/20 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 text-center">
        <Image src="/logoc.png" alt="CCarré" width={200} height={80} className="h-14 w-auto" />
        <p className="text-sm text-muted-foreground">
          {"Plateforme d'échange entre étudiants d'Aix-Marseille Université."}
        </p>
        <p className="text-xs text-muted-foreground/70">
          {"© 2026 CCarré — Projet étudiant AMU. Tous droits réservés."}
        </p>
      </div>
    </footer>
  )
}
