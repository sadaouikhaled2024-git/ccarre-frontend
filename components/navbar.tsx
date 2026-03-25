"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Menu,
  X,
  ShoppingCart,
  Heart,
  MessageCircle,
  Info,
  Settings,
  LogOut,
  User,
  Bell,
} from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, usePathname } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SearchBar } from "@/components/search-bar"

export function Navbar({ onSearchChange }: { onSearchChange?: (query: string) => void } = {}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  function handleLogout() {
    logout()
    router.push("/")
  }

  const userInitials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`
    : "U"

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <nav className="mx-auto flex h-[60px] max-w-6xl items-center justify-between px-6">
        <Link href={isAuthenticated ? "/announcements" : "/"} className="flex items-center">
          <Image src="/ccare.png" alt="CCarré" width={300} height={120} className="h-27 w-auto" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-5 md:flex w-full">
          {/* Search Bar - show for authenticated users */}
          {isAuthenticated && (
            <div className="flex-1 flex justify-center">
              <SearchBar onSearch={onSearchChange} />
            </div>
          )}

          <div className="flex items-center gap-5 ml-auto">
          {isAuthenticated ? (
            <>
              {/* Annonces */}
              <Link
                href="/announcements"
                className="group flex flex-col items-center gap-0.5 transition-colors"
              >
                <ShoppingCart strokeWidth={2} className="size-6 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors whitespace-nowrap">
                  Annonces
                </span>
                <div className="h-0.5 w-10 bg-rose-500 origin-center scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </Link>

              {/* Favoris */}
              <Link
                href="/favorites"
                className="group flex flex-col items-center gap-0.5 transition-colors"
              >
                <Heart strokeWidth={2} className="size-6 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors whitespace-nowrap">
                  Favoris
                </span>
                <div className="h-0.5 w-10 bg-rose-500 origin-center scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </Link>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="group flex flex-col items-center gap-0.5 transition-colors">
                    <Bell strokeWidth={2} className="size-6 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors whitespace-nowrap">
                      Notifications
                    </span>
                    <div className="h-0.5 w-10 bg-rose-500 origin-center scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-64">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-semibold text-foreground">Notifications</p>
                  </div>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-2 text-sm text-muted-foreground text-center">
                    Aucune notification pour le moment
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Messagerie */}
              <Link
                href="/messagerie"
                className="group flex flex-col items-center gap-0.5 transition-colors"
              >
                <MessageCircle strokeWidth={2} className="size-6 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors whitespace-nowrap">
                  Messagerie
                </span>
                <div className="h-0.5 w-10 bg-rose-500 origin-center scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </Link>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex flex-col items-center gap-0.5 rounded-full transition-colors group cursor-pointer">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.profileImage as string | undefined} alt={`${user?.firstName} ${user?.lastName}`} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-semibold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
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
                      <span>Mon Profil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/mes-annonces" className="cursor-pointer">
                      <ShoppingCart className="size-4 mr-2" />
                      <span>Mes Annonces</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/historique-echanges" className="cursor-pointer">
                      <MessageCircle className="size-4 mr-2" />
                      <span>Historique des échanges</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/parametres" className="cursor-pointer">
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
                  Annonces
                </Link>
                <Link
                  href="/favorites"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  Favoris
                </Link>
                <Link
                  href="/messagerie"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  Messagerie
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
