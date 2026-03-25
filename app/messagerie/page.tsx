import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { MessagingPageContent } from "@/components/messaging-page-content"

export default function MessagingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <MessagingPageContent />
      </main>
      <Footer />
    </div>
  )
}
