import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { EditAnnouncementForm } from "@/components/edit-announcement-form"

export default async function EditAnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-2xl px-6">
          <h1 className="text-4xl font-bold text-foreground mb-8">Modifier l'annonce</h1>
          <EditAnnouncementForm announcementId={id} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
