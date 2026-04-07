"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CreateAnnouncementButton } from "@/components/create-announcement-form"

export default function CreateAnnouncementPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Créer une nouvelle annonce</h1>
          <p className="text-muted-foreground mb-8">Remplissez le formulaire pour créer votre annonce</p>
          <CreateAnnouncementButton />
        </div>
      </main>
      <Footer />
    </div>
  )
}
