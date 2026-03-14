import { Suspense } from "react"
import AuthPageContent from "@/components/auth-page-content"
import { AuthGuardRedirect } from "@/components/auth-guard-redirect"

export default function AuthPage() {
  return (
    <Suspense>
      <AuthGuardRedirect redirectTo="/announcements" whenAuthenticated>
        <AuthPageContent />
      </AuthGuardRedirect>
    </Suspense>
  )
}
