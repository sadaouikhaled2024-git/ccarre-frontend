import { Suspense } from "react"
import AuthPageContent from "@/components/auth-page-content"

export default function AuthPage() {
  return (
    <Suspense>
      <AuthPageContent />
    </Suspense>
  )
}
