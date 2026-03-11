"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react"
import Image from "next/image"
import { authApi } from "@/lib/auth-api"
import { useAuth } from "@/contexts/auth-context"

/* ─── Login Form ─── */
function LoginForm() {
  const { login } = useAuth()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [apiError, setApiError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newErrors: { email?: string; password?: string } = {}

    if (!email) {
      newErrors.email = "L\u2019adresse e-mail est requise."
    } else if (!email.endsWith("@etu.univ-amu.fr")) {
      newErrors.email = "Utilisez votre adresse @etu.univ-amu.fr."
    }
    if (!password) {
      newErrors.password = "Le mot de passe est requis."
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setLoading(true)
    setApiError("")

    try {
      const res = await authApi.login({ email, password })
      const jwt = res.data?.token
      if (!jwt) {
        setApiError("Aucun token re\u00e7u du serveur.")
        return
      }
      await login(jwt, res.data?.user)
      router.push("/announcements")
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Erreur de connexion.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {apiError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {apiError}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="login-email">Adresse e-mail</Label>
        <Input
          id="login-email"
          type="email"
          placeholder="prenom.nom@etu.univ-amu.fr"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
          }}
          className="rounded-lg h-11"
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="login-password">Mot de passe</Label>
        <div className="relative">
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            placeholder="Votre mot de passe"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
            }}
            className="rounded-lg h-11 pr-10"
            aria-invalid={!!errors.password}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password}</p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={loading}
        className="mt-2 w-full rounded-lg bg-primary text-primary-foreground shadow-md hover:bg-accent"
      >
        {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
        Se connecter
      </Button>
    </form>
  )
}

/* ─── Register Form ─── */
function RegisterForm({ onNeedConfirm }: { onNeedConfirm: (email: string) => void }) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState<{
    firstName?: string
    lastName?: string
    email?: string
    password?: string
    confirmPassword?: string
  }>({})
  const [apiError, setApiError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newErrors: {
      firstName?: string
      lastName?: string
      email?: string
      password?: string
      confirmPassword?: string
    } = {}

    if (!firstName.trim()) {
      newErrors.firstName = "Le prénom est requis."
    }
    if (!lastName.trim()) {
      newErrors.lastName = "Le nom est requis."
    }
    if (!email) {
      newErrors.email = "L\u2019adresse e-mail est requise."
    } else if (!email.endsWith("@etu.univ-amu.fr")) {
      newErrors.email = "Utilisez votre adresse @etu.univ-amu.fr."
    }
    if (!password) {
      newErrors.password = "Le mot de passe est requis."
    } else if (password.length < 8) {
      newErrors.password = "Le mot de passe doit contenir au moins 8 caractères."
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Veuillez confirmer votre mot de passe."
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas."
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setLoading(true)
    setApiError("")

    try {
      await authApi.register({ firstName: firstName.trim(), lastName: lastName.trim(), email, password })
      onNeedConfirm(email)
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Erreur lors de l\u2019inscription.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {apiError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {apiError}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="register-firstName">Prénom</Label>
          <Input
            id="register-firstName"
            type="text"
            placeholder="Prénom"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value)
              if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: undefined }))
            }}
            className="rounded-lg h-11"
            aria-invalid={!!errors.firstName}
          />
          {errors.firstName && (
            <p className="text-sm text-destructive">{errors.firstName}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="register-lastName">Nom</Label>
          <Input
            id="register-lastName"
            type="text"
            placeholder="Nom"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value)
              if (errors.lastName) setErrors((prev) => ({ ...prev, lastName: undefined }))
            }}
            className="rounded-lg h-11"
            aria-invalid={!!errors.lastName}
          />
          {errors.lastName && (
            <p className="text-sm text-destructive">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="register-email">Adresse e-mail</Label>
        <Input
          id="register-email"
          type="email"
          placeholder="prenom.nom@etu.univ-amu.fr"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
          }}
          className="rounded-lg h-11"
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="register-password">Mot de passe</Label>
        <div className="relative">
          <Input
            id="register-password"
            type={showPassword ? "text" : "password"}
            placeholder="Minimum 8 caractères"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
            }}
            className="rounded-lg h-11 pr-10"
            aria-invalid={!!errors.password}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="register-confirm">Confirmer le mot de passe</Label>
        <div className="relative">
          <Input
            id="register-confirm"
            type={showConfirm ? "text" : "password"}
            placeholder="Confirmez votre mot de passe"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              if (errors.confirmPassword)
                setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
            }}
            className="rounded-lg h-11 pr-10"
            aria-invalid={!!errors.confirmPassword}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showConfirm ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">{errors.confirmPassword}</p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={loading}
        className="mt-2 w-full rounded-lg bg-primary text-primary-foreground shadow-md hover:bg-accent"
      >
        {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
        {"Créer mon compte"}
      </Button>
    </form>
  )
}

/* ─── Email Confirmation Form (8-digit code) ─── */
function ConfirmForm({ email, onConfirmed }: { email: string; onConfirmed: () => void }) {
  const [code, setCode] = useState("")
  const [apiError, setApiError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!code || code.length !== 8) {
      setApiError("Veuillez entrer le code à 8 chiffres.")
      return
    }

    setLoading(true)
    setApiError("")

    try {
      await authApi.confirm({ email, code })
      onConfirmed()
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Code invalide.")
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setResending(true)
    setApiError("")
    setSuccessMsg("")

    try {
      const res = await authApi.resendConfirmation({ email })
      setSuccessMsg(res.message || "Code renvoyé avec succès.")
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Impossible de renvoyer le code.")
    } finally {
      setResending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm text-foreground">
        Un code de confirmation à 8 chiffres a été envoyé à <strong>{email}</strong>.
        Vérifiez votre boîte e-mail.
      </div>

      {apiError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {apiError}
        </div>
      )}

      {successMsg && (
        <div className="rounded-lg border border-secondary/50 bg-secondary/10 p-3 text-sm text-secondary-foreground">
          {successMsg}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="confirm-code">Code de confirmation</Label>
        <Input
          id="confirm-code"
          type="text"
          inputMode="numeric"
          maxLength={8}
          placeholder="12345678"
          value={code}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "")
            setCode(val)
          }}
          className="rounded-lg h-11 text-center text-lg tracking-widest"
        />
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={loading}
        className="mt-2 w-full rounded-lg bg-primary text-primary-foreground shadow-md hover:bg-accent"
      >
        {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
        Confirmer mon compte
      </Button>

      <button
        type="button"
        onClick={handleResend}
        disabled={resending}
        className="text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        {resending ? "Envoi en cours..." : "Renvoyer le code"}
      </button>
    </form>
  )
}

/* ─── Main Auth Page ─── */
export default function AuthPageContent() {
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") === "register" ? "register" : "login"
  const [activeTab, setActiveTab] = useState<"login" | "register" | "confirm">(defaultTab)
  const [confirmEmail, setConfirmEmail] = useState("")

  function handleNeedConfirm(email: string) {
    setConfirmEmail(email)
    setActiveTab("confirm")
  }

  function handleConfirmed() {
    setActiveTab("login")
  }

  const tabTitle =
    activeTab === "login"
      ? "Connectez-vous à votre compte."
      : activeTab === "register"
        ? "Créez votre compte étudiant."
        : "Confirmez votre adresse e-mail."

  return (
    <div className="flex min-h-screen">
      {/* Left branding panel */}
      <div className="hidden flex-col justify-between bg-primary p-12 lg:flex lg:w-[45%]">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary-foreground/80 text-sm font-medium hover:text-primary-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Retour
          </Link>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-primary-foreground tracking-tight text-balance">
            {"Rejoignez la communauté étudiante CCarré"}
          </h1>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-primary-foreground/80">
            {"Achetez, vendez et échangez avec les étudiants d\u2019Aix-Marseille Université. Connectez-vous avec votre adresse @etu.univ-amu.fr."}
          </p>
        </div>

        <p className="text-sm text-primary-foreground/50">
          {"© 2026 CCarré — Projet étudiant AMU"}
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-md">
          {/* Mobile back link */}
          <div className="mb-8 lg:hidden">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-muted-foreground text-sm font-medium hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" />
              Retour
            </Link>
          </div>

          {/* Logo */}
          <Image src="/ccare.png" alt="CCarré" width={500} height={200} className="h-32 w-auto" />
          <p className="mt-1 text-muted-foreground">{tabTitle}</p>

          {/* Tabs (hidden when confirming) */}
          {activeTab !== "confirm" && (
            <div className="mt-8 flex rounded-lg bg-muted p-1">
              <button
                onClick={() => setActiveTab("login")}
                className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
                  activeTab === "login"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Connexion
              </button>
              <button
                onClick={() => setActiveTab("register")}
                className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
                  activeTab === "register"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Inscription
              </button>
            </div>
          )}

          {/* Form */}
          <div className="mt-8">
            {activeTab === "login" && <LoginForm />}
            {activeTab === "register" && <RegisterForm onNeedConfirm={handleNeedConfirm} />}
            {activeTab === "confirm" && (
              <ConfirmForm email={confirmEmail} onConfirmed={handleConfirmed} />
            )}
          </div>

          {/* Switch text */}
          {activeTab !== "confirm" && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {activeTab === "login" ? (
                <>
                  {"Pas encore de compte ? "}
                  <button
                    onClick={() => setActiveTab("register")}
                    className="font-medium text-primary hover:text-accent transition-colors"
                  >
                    {"S\u2019inscrire"}
                  </button>
                </>
              ) : (
                <>
                  {"Déjà un compte ? "}
                  <button
                    onClick={() => setActiveTab("login")}
                    className="font-medium text-primary hover:text-accent transition-colors"
                  >
                    Se connecter
                  </button>
                </>
              )}
            </p>
          )}

          {activeTab === "confirm" && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              <button
                onClick={() => setActiveTab("register")}
                className="font-medium text-primary hover:text-accent transition-colors"
              >
                {"Retour à l\u2019inscription"}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
