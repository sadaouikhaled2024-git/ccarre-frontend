"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold text-foreground tracking-tight">
          CCarré
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Accueil
          </Link>
          <Link
            href="#fonctionnalites"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Fonctionnalités
          </Link>
          <Link
            href="/auth"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Connexion
          </Link>
          <Button asChild size="lg" className="rounded-lg bg-primary text-primary-foreground hover:bg-accent">
            <Link href="/auth?tab=register">{"S'inscrire"}</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              Accueil
            </Link>
            <Link
              href="#fonctionnalites"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              Fonctionnalités
            </Link>
            <Link
              href="/auth"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              Connexion
            </Link>
            <Button asChild size="lg" className="w-full rounded-lg bg-primary text-primary-foreground hover:bg-accent">
              <Link href="/auth?tab=register">{"S'inscrire"}</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
