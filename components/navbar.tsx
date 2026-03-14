"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Menu,
  X,
  Megaphone,
  Clock,
  Plus,
  Info,
  Settings,
  LogOut,
  User,
} from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const router = useRouter()

  function handleLogout() {
    logout()
    router.push("/")
  }

  const userInitials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`
    : "U"

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href={isAuthenticated ? "/announcements" : "/"} className="flex items-center">
          <Image src="/logoc.png" alt="CCarré" width={200} height={80} className="h-14 w-auto" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-6">
                {/* Annonces */}
                <Link
                  href="/announcements"
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                  title="Annonces"
                >
                  <Megaphone className="size-5" />
                </Link>

                {/* Historique */}
                <Link
                  href="/announcements"
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                  title="Historique"
                >
                  <Clock className="size-5" />
                </Link>
              </div>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-center rounded-full w-10 h-10 bg-muted hover:bg-muted/80 transition-colors border border-border">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.profileImage as string | undefined} alt={`${user?.firstName} ${user?.lastName}`} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-semibold text-foreground">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="size-4 mr-2" />
                      <span>Profil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <Settings className="size-4 mr-2" />
                      <span>Paramètres</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/info" className="cursor-pointer">
                      <Info className="size-4 mr-2" />
                      <span>À propos</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                    <LogOut className="size-4 mr-2" />
                    <span>Déconnexion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                href="/info"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                À propos
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
                  href="/announcements"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  Historique
                </Link>
                <Link
                  href="/announcements/create"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  Créer une annonce
                </Link>
                <Link
                  href="/info"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  À propos
                </Link>
                <Link
                  href="/profile"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  Paramètres
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
                  href="/info"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  À propos
                </Link>
                <Link
                  href="/auth"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  Connexion
                </Link>
                <Button asChild size="lg" className="w-full rounded-lg bg-primary text-primary-foreground hover:bg-accent">
                  <Link href="/auth?tab=register" onClick={() => setMobileOpen(false)}>{"S'inscrire"}</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
