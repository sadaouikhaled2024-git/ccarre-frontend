"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X, LogOut, User } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const router = useRouter()

  function handleLogout() {
    logout()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href={isAuthenticated ? "/announcements" : "/"} className="flex items-center">
          <Image src="/logoc.png" alt="CCarré" width={200} height={80} className="h-14 w-auto" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          {isAuthenticated ? (
            <>
              <Link
                href="/announcements"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Annonces
              </Link>
              <Link
                href="/profile"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="flex items-center gap-2">
                  <User className="size-4" />
                  {user?.firstName ?? "Profil"}
                </span>
              </Link>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <LogOut className="size-4" />
                Déconnexion
              </Button>
            </>
          ) : (
            <>
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
            </>
          )}
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
            {isAuthenticated ? (
              <>
                <Link
                  href="/announcements"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  Annonces
                </Link>
                <Link
                  href="/profile"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  Profil
                </Link>
                <Button
                  onClick={() => { handleLogout(); setMobileOpen(false) }}
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                >
                  <LogOut className="size-4" />
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
