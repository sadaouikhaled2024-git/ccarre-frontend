"use client"

import { useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { MessagingPageContent } from "@/components/messaging-page-content"

export default function MessageConversationPage() {
  const params = useParams<{ id: string }>()
  const participantId = Array.isArray(params?.id) ? params.id[0] : params?.id

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <MessagingPageContent initialParticipantId={participantId} />
      </main>
      <Footer />
    </div>
  )
}
