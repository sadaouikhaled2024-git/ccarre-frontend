"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { User, UserX } from "lucide-react"

export function AuthToggle() {
  const { isAuthenticated, toggleAuth } = useAuth()

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={toggleAuth}
        size="lg"
        className={`rounded-full shadow-lg transition-all ${
          isAuthenticated
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-muted text-muted-foreground hover:bg-muted/90"
        }`}
      >
        {isAuthenticated ? (
          <>
            <User className="size-5 mr-2" />
            <span className="hidden sm:inline">Connecté</span>
          </>
        ) : (
          <>
            <UserX className="size-5 mr-2" />
            <span className="hidden sm:inline">Non connecté</span>
          </>
        )}
      </Button>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Cliquer pour basculer
      </p>
    </div>
  )
}
