"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users,
  Package,
  Flag,
  BarChart3,
  ArrowRight,
  AlertCircle,
} from "lucide-react"

const DASHBOARD_CARDS = [
  {
    id: "reports",
    title: "Gestion de Signalements",
    description: "Gérez les signalements et modérez les contenus problématiques",
    icon: Flag,
    href: "/admin/reports",
    color: "#EC7578",
    gradient: "from-[#EC7578]/10 to-[#B44362]/10",
    stats: {
      label: "Signalements",
      value: "12",
      change: "+2 cette semaine",
    },
  },
  {
    id: "users",
    title: "Gestion d'Utilisateurs",
    description: "Consultez et gérez les utilisateurs, bannissements et risques",
    icon: Users,
    href: "/admin/users",
    color: "#FF7F50",
    gradient: "from-[#FF7F50]/10 to-[#EC7578]/10",
    stats: {
      label: "Utilisateurs",
      value: "42",
      change: "+3 ce mois",
    },
  },
  {
    id: "annonces",
    title: "Gestion d'Annonces",
    description: "Modérez les annonces, vérifiez le statut et les prix suspects",
    icon: Package,
    href: "/admin/annonces",
    color: "#B44362",
    gradient: "from-[#B44362]/10 to-[#FF7F50]/10",
    stats: {
      label: "Annonces",
      value: "156",
      change: "+8 ce mois",
    },
  },
  {
    id: "analytics",
    title: "Analytics",
    description: "Visualisez les statistiques et tendances de la plateforme",
    icon: BarChart3,
    href: "/admin/analytics",
    color: "#1F0C11",
    gradient: "from-[#1F0C11]/5 to-[#B44362]/5",
    stats: {
      label: "Tendances",
      value: "↑ 24%",
      change: "Croissance mensuelle",
    },
  },
]

export default function AdminDashboardPage() {
  const { isAuthenticated, loading, user } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

 // useEffect(() => {
 //   if (!loading && (!isAuthenticated || user?.role !== "admin")) {
 //     router.replace("/")
 //   }
 // }, [isAuthenticated, loading, user, router])

  if (loading || !mounted) return null

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "linear-gradient(to bottom right, #F8F4F6, #F3EFF1)" }}>
      <Navbar />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-6xl px-6">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-[#1F0C11] mb-2">
              Tableau de Bord Admin
            </h1>
            <p className="text-[#1F0C11]/60">
              Bienvenue {user?.firstName}! Gérez les signalements, utilisateurs et annonces
            </p>
          </div>

          {/* Quick Stats Row */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-white p-4 shadow-sm hover:shadow-md transition-shadow" style={{ borderColor: "#B44362", borderWidth: "1px" }}>
              <p className="text-sm text-[#1F0C11]/60 font-medium">Signalements</p>
              <p className="text-2xl font-bold text-[#EC7578] mt-1">12</p>
              <p className="text-xs text-[#1F0C11]/40 mt-2">+2 cette semaine</p>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm hover:shadow-md transition-shadow" style={{ borderColor: "#B44362", borderWidth: "1px" }}>
              <p className="text-sm text-[#1F0C11]/60 font-medium">Utilisateurs</p>
              <p className="text-2xl font-bold text-[#FF7F50] mt-1">42</p>
              <p className="text-xs text-[#1F0C11]/40 mt-2">2 bannis</p>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm hover:shadow-md transition-shadow" style={{ borderColor: "#B44362", borderWidth: "1px" }}>
              <p className="text-sm text-[#1F0C11]/60 font-medium">Annonces</p>
              <p className="text-2xl font-bold text-[#B44362] mt-1">156</p>
              <p className="text-xs text-[#1F0C11]/40 mt-2">12 signalées</p>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm hover:shadow-md transition-shadow" style={{ borderColor: "#B44362", borderWidth: "1px" }}>
              <p className="text-sm text-[#1F0C11]/60 font-medium">Santé Platform</p>
              <p className="text-2xl font-bold mt-1" style={{ color: "#FF7F50" }}>96%</p>
              <p className="text-xs text-[#1F0C11]/40 mt-2">Excellent</p>
            </div>
          </div>

          {/* Main Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {DASHBOARD_CARDS.map((card, index) => {
              const Icon = card.icon
              return (
                <Link key={card.id} href={card.href}>
                  <Card
                    className={`h-full cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br ${card.gradient} hover:bg-opacity-100`}
                    style={{ borderWidth: "2px", borderColor: "#B44362" }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div
                          className="rounded-lg p-2 w-fit"
                          style={{ backgroundColor: `${card.color}20` }}
                        >
                          <Icon
                            className="h-6 w-6"
                            style={{ color: card.color }}
                          />
                        </div>
                        <ArrowRight className="h-5 w-5 text-[#1F0C11]/30 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <CardTitle className="text-[#1F0C11] mt-3">
                        {card.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-[#1F0C11]/60 leading-relaxed">
                        {card.description}
                      </p>

                      {/* Stats Section */}
                      <div className="rounded-lg bg-white/50 p-3 border border-white/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-[#1F0C11]/60">
                              {card.stats.label}
                            </p>
                            <p
                              className="text-2xl font-bold mt-1"
                              style={{ color: card.color }}
                            >
                              {card.stats.value}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-medium" style={{ color: "#FF7F50" }}>
                              {card.stats.change}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2 border-[#1F0C11]/10 hover:bg-[#1F0C11]/5"
                      >
                        Accéder
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>

          {/* Info Box */}
          <div className="mt-12 rounded-lg p-4 flex gap-3" style={{ backgroundColor: "#EC7578", borderColor: "#B44362", borderWidth: "1px" }}>
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "#1F0C11" }} />
            <div>
              <h3 className="font-semibold text-sm" style={{ color: "#1F0C11" }}>
                Conseils de modération
              </h3>
              <p className="text-sm mt-1" style={{ color: "#1F0C11" }}>
                Consultez les signalements régulièrement et agissez rapidement pour maintenir une communauté saine et sécurisée.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
