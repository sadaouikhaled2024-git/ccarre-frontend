"use client"

import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { SecuritySection } from "@/components/security-section"
import { Footer } from "@/components/footer"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function HomePage() {
    const { isAuthenticated, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && isAuthenticated) {
            router.replace("/announcements")
        }
    }, [isAuthenticated, loading, router])

    if (loading) return null

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
                <HeroSection />
                <FeaturesSection />
                <SecuritySection />
            </main>
            <Footer />
        </div>
    )
}