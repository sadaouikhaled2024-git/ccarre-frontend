"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"

function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  function handleSubmit(e: React.FormEvent) {
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
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
        className="mt-2 w-full rounded-lg bg-primary text-primary-foreground shadow-md hover:bg-accent"
      >
        Se connecter
      </Button>
    </form>
  )
}

function RegisterForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    confirmPassword?: string
  }>({})

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newErrors: {
      email?: string
      password?: string
      confirmPassword?: string
    } = {}

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
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
        className="mt-2 w-full rounded-lg bg-primary text-primary-foreground shadow-md hover:bg-accent"
      >
        {"Créer mon compte"}
      </Button>
    </form>
  )
}

export default function AuthPageContent() {
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") === "register" ? "register" : "login"
  const [activeTab, setActiveTab] = useState<"login" | "register">(defaultTab)

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
          <h2 className="text-2xl font-bold text-foreground tracking-tight">CCarré</h2>
          <p className="mt-1 text-muted-foreground">
            {activeTab === "login"
              ? "Connectez-vous à votre compte."
              : "Créez votre compte étudiant."}
          </p>

          {/* Tabs */}
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

          {/* Form */}
          <div className="mt-8">
            {activeTab === "login" ? <LoginForm /> : <RegisterForm />}
          </div>

          {/* Switch text */}
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
        </div>
      </div>
    </div>
  )
}
