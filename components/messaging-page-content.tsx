"use client"

import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Search, Send, MoreVertical, ArrowLeft, ImageIcon, Paperclip, User, Trash2, Flag, Ban, X, AlertTriangle, AlertCircle } from "lucide-react"
import { ReportModal } from "@/components/report-modal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { echangeApi, type Echange } from "@/lib/echange-api"
import { messageApi, type Message as ApiMessage } from "@/lib/message-api"
import { io, type Socket } from "socket.io-client"
import { blockApi } from "@/lib/block-api"
import { reportApi } from "@/lib/report-api"
import { useToast } from "@/hooks/use-toast"
import { CompleteExchangeDialog } from "@/components/complete-exchange-dialog"

interface Message {
  id: string
  content: string
  senderId: string
  timestamp: Date
  isRead: boolean
  isImage?: boolean
  status?: "uploading" | "sent" | "error"
}

interface Conversation {
  id: string
  participant: {
    id: string
    name: string
    avatar?: string
    isOnline: boolean
    riskScore?: number
  }
  lastMessage?: string
  lastMessageTime?: Date
  unreadCount: number
  annonceTitle?: string
  annonceImage?: string
}

function formatTime(date?: Date): string {
  if (!date) return ""
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) {
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
  } else if (days === 1) {
    return "Hier"
  } else if (days < 7) {
    return date.toLocaleDateString("fr-FR", { weekday: "short" })
  } else {
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })
  }
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

function RiskBadge({ score }: { score?: number }) {
  if (!score) return null
  
  if (score >= 80) {
    return (
      <Badge className="bg-destructive text-white gap-1 text-xs">
        <AlertCircle className="h-3 w-3" />
        Critique ({score})
      </Badge>
    )
  } else if (score >= 50) {
    return (
      <Badge className="bg-yellow-600 text-white gap-1 text-xs">
        <AlertCircle className="h-3 w-3" />
        Risque ({score})
      </Badge>
    )
  } else if (score >= 20) {
    return (
      <Badge className="bg-orange-600 text-white gap-1 text-xs">
        <AlertCircle className="h-3 w-3" />
        Moyen ({score})
      </Badge>
    )
  }
  
  return (
    <Badge className="bg-green-600 text-white gap-1 text-xs">
      <AlertCircle className="h-3 w-3" />
      Faible ({score})
    </Badge>
  )
}

interface MessagingPageContentProps {
  initialParticipantId?: string
}

export function MessagingPageContent({ initialParticipantId }: MessagingPageContentProps = {}) {
  const { token: contextToken, user } = useAuth()
  const token =
    contextToken ||
    (typeof window !== "undefined" ? window.localStorage.getItem("ccarre_token") : null)
  const [echanges, setEchanges] = useState<Echange[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [messagesByEchange, setMessagesByEchange] = useState<Record<string, Message[]>>({})
  const [loadingEchanges, setLoadingEchanges] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [showMobileChat, setShowMobileChat] = useState(true)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [blockedIds, setBlockedIds] = useState<string[]>([])
  const [securityWarnings, setSecurityWarnings] = useState<string[]>([])
  const [showSecurityAlert, setShowSecurityAlert] = useState(false)
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false)
  const [completeDialogEchangeId, setCompleteDialogEchangeId] = useState<string | null>(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [isReporting, setIsReporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<Socket | null>(null)
  const { toast } = useToast()

  const handleAcceptExchange = useCallback(async (echangeId: string) => {
    if (!token) return
    try {
      await echangeApi.accept(echangeId, token)
      setEchanges((prev) =>
        prev.map((e) => (e._id === echangeId ? { ...e, statut: "ACCEPTE" as any } : e))
      )
      toast({ title: "Échange accepté!" })
    } catch (err) {
      toast({
        title: "Action impossible",
        description: err instanceof Error ? err.message : "Erreur",
      })
    }
  }, [token, toast])

  const handleCompleteExchange = useCallback(async (echangeId: string) => {
    setCompleteDialogEchangeId(echangeId)
    setCompleteDialogOpen(true)
  }, [])

  const handleCompleteExchangeConfirm = useCallback(
    async (lieuEchange: string, prixFinal?: number) => {
      if (!token || !completeDialogEchangeId) return
      try {
        await echangeApi.completeWithDetails(completeDialogEchangeId, lieuEchange, prixFinal, token)
        setEchanges((prev) =>
          prev.map((e) =>
            e._id === completeDialogEchangeId
              ? { ...e, statut: "TERMINE" as any, lieuEchange, prixFinal }
              : e,
          ),
        )
        toast({ title: "Échange finalisé avec succès!" })
        setCompleteDialogEchangeId(null)
      } catch (err) {
        toast({
          title: "Action impossible",
          description: err instanceof Error ? err.message : "Erreur",
        })
      }
    },
    [token, completeDialogEchangeId, toast],
  )

  const handleRefuseExchange = useCallback(async (echangeId: string) => {
    if (!token) return
    try {
      await echangeApi.refuse(echangeId, token)
      setEchanges((prev) =>
        prev.map((e) => (e._id === echangeId ? { ...e, statut: "REFUSE" as any } : e))
      )
      toast({ title: "Échange refusé" })
    } catch (err) {
      toast({
        title: "Action impossible",
        description: err instanceof Error ? err.message : "Erreur",
      })
    }
  }, [token, toast])

  const handleReportSubmit = async (reason: string, description: string) => {
    if (!token || !selectedConversation?.participant?.id) {
      toast({ title: "Erreur d'authentification" })
      return
    }

    setIsReporting(true)
    try {
      const userId = selectedConversation.participant.id
      console.log("[MESSAGING REPORT] Signaling user:", {
        userId,
        userIdType: typeof userId,
        reason,
        descriptionLength: description.length,
      })

      await reportApi.createUserReport(userId, reason, description, token)

      console.log("[MESSAGING REPORT] Report sent successfully")
      toast({ title: "Signalement envoyé avec succès" })
      setShowReportModal(false)
    } catch (err) {
      console.error("[MESSAGING REPORT] Error:", err)
      const errorMsg = err instanceof Error ? err.message : "Erreur inconnue"
      throw new Error(errorMsg)
    } finally {
      setIsReporting(false)
    }
  }

  const handleCancelExchange = useCallback(async (echangeId: string) => {
    if (!token) return
    if (!confirm("Êtes-vous sûr de vouloir annuler cet échange ?")) return
    try {
      await echangeApi.cancel(echangeId, token)
      setEchanges((prev) =>
        prev.map((e) => (e._id === echangeId ? { ...e, statut: "ANNULE" } : e))
      )
      toast({ title: "Échange annulé" })
    } catch (err) {
      toast({
        title: "Action impossible",
        description: err instanceof Error ? err.message : "Erreur",
      })
    }
  }, [token, toast])

  const isImageContent = useCallback((content: string) => {
    if (!content) return false
    return content.startsWith("data:image") || /\.(png|jpe?g|gif|webp|avif)$/i.test(content)
  }, [])

  const mapApiMessage = useCallback((message: ApiMessage): Message => {
    const textContent = (message as any).contenu || (message as any).content || ""
    const imageContent = (message as any).image || ""
    const normalizedContent = imageContent || textContent
    const senderId =
      (message as any)?.sender?._id ||
      (message as any)?.expediteur?._id ||
      ""

    return {
      id: message._id,
      content: normalizedContent,
      senderId,
      timestamp: new Date(message.createdAt),
      isRead: true,
      isImage: isImageContent(normalizedContent),
      status: "sent",
    }
  }, [isImageContent])

  const addMessageToEchange = useCallback((echangeId: string, message: Message) => {
    setMessagesByEchange((prev) => {
      const existing = prev[echangeId] ?? []
      return { ...prev, [echangeId]: [...existing, message] }
    })
  }, [])

  const updateMessageInEchange = useCallback((echangeId: string, messageId: string, updates: Partial<Message>) => {
    setMessagesByEchange((prev) => {
      const existing = prev[echangeId] ?? []
      return {
        ...prev,
        [echangeId]: existing.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg)),
      }
    })
  }, [])

  const getCounterpart = useCallback(
    (echange: Echange) => {
      const demandeur = echange.utilisateurDemandeur as any
      const proprietaire = echange.utilisateurProprietaire as any
      if (demandeur?._id === user?._id) return proprietaire
      return demandeur
    },
    [user?._id],
  )

  const conversations = useMemo<Conversation[]>(() => {
    return echanges.map((echange) => {
      const counterpart = getCounterpart(echange)
      const lastMessage = messagesByEchange[echange._id]?.[messagesByEchange[echange._id].length - 1]
      const annonce = (echange.annonce as any)
      const annonceImage =
        annonce?.images?.[0] || annonce?.image || annonce?.photo || "/placeholder.jpg"
      const counterpartName =
        `${counterpart?.firstName ?? counterpart?.prenom ?? ""} ${counterpart?.lastName ?? counterpart?.nom ?? ""}`.trim() ||
        counterpart?.username ||
        counterpart?.name ||
        "Utilisateur"

      const lastMessageText = lastMessage
        ? lastMessage.isImage
          ? lastMessage.senderId === user?._id
            ? "you sent an image"
            : "sent image"
          : lastMessage.content
        : echange.messageInitial || "Nouvel échange"

      return {
        id: echange._id,
        participant: {
          id: counterpart?._id ?? "",
          name: counterpartName,
          avatar: counterpart?.profilePhoto || counterpart?.image || counterpart?.avatar,
          isOnline: false,
          riskScore: (counterpart as any)?.riskScore,
        },
        lastMessage: lastMessageText,
        lastMessageTime: lastMessage?.timestamp || new Date(echange.updatedAt),
        unreadCount: 0,
        annonceTitle: annonce?.title || annonce?.titre || "Annonce",
        annonceImage: annonceImage,
      }
    })
  }, [echanges, getCounterpart, messagesByEchange, user?._id])
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [selectedConversationId, messagesByEchange])

  // Socket.io connection
  useEffect(() => {
    // Validate token before attempting connection
    if (!token || token.trim() === "") {
      console.warn("No valid token provided for socket connection")
      return
    }

    console.log("Initializing socket connection with token:", token.substring(0, 20) + "...")

    const socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000", {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ["websocket", "polling"],
    })

    socketRef.current = socket

    socket.on("connect", () => {
      console.log("✓ Socket connected:", socket.id)
      setError(null)
      
      // Join all existing exchange rooms
      echanges.forEach((echange) => {
        socket.emit("join_echange", { echangeId: echange._id }, (err?: any) => {
          if (err) {
            console.error(`Failed to join exchange ${echange._id}:`, err)
          } else {
            console.log(`✓ Joined exchange room: ${echange._id}`)
          }
        })
      })
    })

    socket.on("connect_error", (err: any) => {
      console.error("✗ Socket connection error:", err)
      const errorMessage = err?.message || err?.data?.message || "Connexion temps réel échouée"
      
      // Provide specific error messages based on auth errors
      if (errorMessage.includes("Authentication error") || errorMessage.includes("token")) {
        console.error("Authentication failed - token may be missing or invalid")
        setError("Session expired. Please refresh the page and log in again.")
      } else {
        setError(errorMessage)
      }
    })

    socket.on("disconnect", (reason) => {
      console.log("✗ Socket disconnected:", reason)
      if (reason === "io server disconnect") {
        console.error("Server disconnected the client - likely authentication failure")
      }
    })

    socket.on("receive_message", (payload: any) => {
      const echangeId = payload.echangeId as string

      // Skip duplicates and avoid re-adding our own optimistic send
      setMessagesByEchange((prev) => {
        const existing = prev[echangeId] ?? []
        const senderId = (payload.expediteur as any)?._id ?? ""

        if (existing.some((m) => m.id === payload._id)) {
          return prev
        }

        // If we have a pending uploading image from this sender, replace it instead of duplicating
        const pendingIndex = existing.findIndex((m) => m.isImage && m.status === "uploading" && m.senderId === senderId)

        const mapped = mapApiMessage({
          _id: payload._id,
          echangeId,
          expediteur: payload.expediteur,
          contenu: payload.contenu,
          createdAt: payload.createdAt,
          updatedAt: payload.createdAt,
        } as ApiMessage)

        if (pendingIndex !== -1) {
          const next = [...existing]
          next[pendingIndex] = { ...mapped, status: "sent" }
          return { ...prev, [echangeId]: next }
        }

        return { ...prev, [echangeId]: [...existing, mapped] }
      })
    })

    return () => {
      console.log("Cleaning up socket connection")
      socket.disconnect()
      socketRef.current = null
    }
  }, [mapApiMessage, token, echanges])

  useEffect(() => {
    if (!token) return
    blockApi
      .list(token)
      .then((res) => setBlockedIds((res.data || []).map((b) => (b.blocked as any)?._id || b.blocked)))
      .catch(() => {})
  }, [token])

  useEffect(() => {
    if (!token) {
      setEchanges([])
      setLoadingEchanges(false)
      return
    }

    const fetchEchanges = async () => {
      try {
        setLoadingEchanges(true)
        setError(null)
        const response = await echangeApi.getAll(token)
        const rawData = response.data as any
        const list: Echange[] = Array.isArray(rawData)
          ? rawData
          : Array.isArray(rawData?.echanges)
            ? rawData.echanges
            : rawData?.ongoing || rawData?.completed
              ? [...(rawData?.ongoing || []), ...(rawData?.completed || [])]
              : rawData?.echange
                ? [rawData.echange]
                : []
        setEchanges(list)

        // Join exchange rooms for realtime updates
        const socket = socketRef.current
        if (socket && socket.connected) {
          list.forEach((e) => {
            socket.emit("join_echange", { echangeId: e._id }, (err?: any) => {
              if (err) {
                console.error(`Failed to join exchange ${e._id}:`, err)
              } else {
                console.log(`✓ Joined exchange room: ${e._id}`)
              }
            })
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Impossible de charger vos échanges")
      } finally {
        setLoadingEchanges(false)
      }
    }

    fetchEchanges()
  }, [token])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newFiles = [...selectedImages, ...files]
    setSelectedImages(newFiles)

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const loadMessages = useCallback(
    async (echangeId: string) => {
      if (!token) return
      try {
        setLoadingMessages(true)
        setError(null)
        const response = await messageApi.getByEchange(echangeId, token)
        const data = Array.isArray(response.data) ? (response.data as ApiMessage[]) : []
        const normalized = data.map(mapApiMessage)
        setMessagesByEchange((prev) => ({ ...prev, [echangeId]: normalized }))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Impossible de charger les messages")
      } finally {
        setLoadingMessages(false)
      }
    },
    [mapApiMessage, token],
  )

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversationId(conv.id)
    setShowMobileChat(true)
    if (!messagesByEchange[conv.id]) {
      loadMessages(conv.id)
    }
  }

  useEffect(() => {
    if (selectedConversationId || filteredConversations.length === 0) return

    const preferredConversation = initialParticipantId
      ? filteredConversations.find(
          (conv) => conv.participant.id === initialParticipantId || conv.id === initialParticipantId,
        )
      : undefined

    const conversationToSelect = preferredConversation ?? filteredConversations[0]

    setSelectedConversationId(conversationToSelect.id)
    if (!messagesByEchange[conversationToSelect.id]) {
      loadMessages(conversationToSelect.id)
    }
  }, [filteredConversations, initialParticipantId, loadMessages, messagesByEchange, selectedConversationId])

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && selectedImages.length === 0) || !selectedConversationId || !token) {
      console.warn("Cannot send message - validation failed:", {
        hasMessage: newMessage.trim().length > 0,
        hasImages: selectedImages.length > 0,
        hasConversation: !!selectedConversationId,
        hasToken: !!token,
      })
      return
    }

    const socket = socketRef.current

    const sendTextMessage = async () => {
      const payload = { echangeId: selectedConversationId, contenu: newMessage.trim() }

      console.log("========== SENDING MESSAGE START ==========")
      console.log("Selected Conversation ID:", selectedConversationId)
      console.log("Socket State:", {
        exists: !!socket,
        connected: socket?.connected,
        id: socket?.id,
        auth: socket?.auth,
      })
      console.log("Message Payload:", payload)
      console.log("Token:", token.substring(0, 30) + "...")

      if (socket && socket.connected) {
        console.log("✓ Using WebSocket to send message")
        console.log("🔵 ABOUT TO EMIT - CHECK BACKEND LOGS NOW")
        socket.emit("send_message", payload, (err?: any) => {
          console.log("========== SOCKET CALLBACK ==========")
          console.log("Error received:", err)
          console.log("Error type:", typeof err)
          console.log("Error keys:", err ? Object.keys(err) : "N/A")
          console.log("Error toString:", err ? err.toString() : "N/A")
          console.log("Error JSON:", err ? JSON.stringify(err) : "N/A")
          console.log("Is error null/undefined:", err == null)
          console.log("Is error empty object:", err && typeof err === 'object' && Object.keys(err).length === 0)

          if (err) {
            setError(err.message)
          }
        })
      } else {
        try {
          // Utiliser messagerie sécurisée pour analyser les risques
          const response = await messageApi.sendSecureMessage(payload, token)
          const created = (response.data as any) || null
          
          // Afficher les avertissements de sécurité
          if (response.warnings && response.warnings.length > 0) {
            setSecurityWarnings(response.warnings)
            setShowSecurityAlert(true)
            toast({
              title: " Alerte de sécurité",
              description: response.warnings.join(", "),
              variant: "destructive",
            })
          }
          
          if (created) {
            const normalized = mapApiMessage({
              _id: created._id,
              echangeId: created.echangeId,
              expediteur: created.sender,
              contenu: created.content,
              createdAt: created.createdAt,
              updatedAt: created.createdAt,
            } as ApiMessage)
            setMessagesByEchange((prev) => {
              const existing = prev[selectedConversationId] ?? []
              return {
                ...prev,
                [selectedConversationId]: [...existing, normalized],
              }
            })
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : "Envoi du message impossible")
        }
      }
    }

    const sendImageMessage = async (file: File, preview: string) => {
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const tempMessage: Message = {
        id: tempId,
        content: preview,
        senderId: user?._id ?? "",
        timestamp: new Date(),
        isRead: true,
        isImage: true,
        status: "uploading",
      }

      console.log("========== SENDING IMAGE START ==========")
      console.log("File:", { name: file.name, size: file.size, type: file.type })
      console.log("Temp ID:", tempId)

      addMessageToEchange(selectedConversationId, tempMessage)

      try {
        console.log("Uploading image to server...")
        const uploadResponse = await messageApi.uploadImage(file, token)
        console.log("Upload response:", uploadResponse)
        
        const imageUrl = uploadResponse.url
        const payload = { echangeId: selectedConversationId, contenu: imageUrl }
        console.log("Image payload:", payload)

        if (socket && socket.connected) {
          console.log("✓ Sending image via WebSocket")
          await new Promise<void>((resolve, reject) => {
            socket.emit("send_message", payload, (err?: any, messageId?: string) => {
              console.log("Image send callback - Error:", err, "MessageId:", messageId)
              if (err) {
                console.error("❌ Image send error:", err)
                return reject(err)
              }
              console.log("✓ Image message sent successfully:", messageId)
              updateMessageInEchange(selectedConversationId, tempId, {
                id: messageId ?? tempId,
                content: imageUrl,
                timestamp: new Date(),
                isImage: true,
                status: "sent",
              })
              resolve()
            })
          })
        } else {
          console.log("⚠ Socket not connected, using REST API for image")
          const response = await messageApi.sendSecureMessage(payload, token)
          console.log("REST image response:", response)
          const created = (response.data as any) || null
          
          // Afficher les avertissements pour les images aussi
          if (response.warnings && response.warnings.length > 0) {
            setSecurityWarnings(response.warnings)
            setShowSecurityAlert(true)
          }
          
          if (created) {
            console.log("✓ Image message created via REST API")
            updateMessageInEchange(selectedConversationId, tempId, {
              ...(mapApiMessage({
                _id: created._id,
                echangeId: created.echangeId,
                expediteur: created.sender,
                contenu: created.content,
                createdAt: created.createdAt,
                updatedAt: created.createdAt,
              } as ApiMessage)),
            })
          }
        }
      } catch (err) {
        console.error("❌ Image send error:", err)
        setError(err instanceof Error ? err.message : "Envoi du message impossible")
        updateMessageInEchange(selectedConversationId, tempId, { status: "error" })
      }
      console.log("========== SENDING IMAGE END ==========")
    }

    try {
      console.log("========== HANDLE SEND MESSAGE START ==========")
      console.log("New message:", newMessage)
      console.log("Selected images count:", selectedImages.length)
      
      if (newMessage.trim()) {
        console.log("Sending text message...")
        await sendTextMessage()
        setNewMessage("")
      }

      for (let i = 0; i < selectedImages.length; i++) {
        const file = selectedImages[i]
        const preview = imagePreviews[i]
        if (file && preview) {
          console.log(`Sending image ${i + 1}/${selectedImages.length}`)
          await sendImageMessage(file, preview)
        }
      }

      setSelectedImages([])
      setImagePreviews([])
      console.log("========== HANDLE SEND MESSAGE END ==========")
    } catch (err) {
      console.error("❌ Handle send error:", err)
      setError(err instanceof Error ? err.message : "Envoi du message impossible")
    }
  }

  const handleBlockUser = async () => {
    if (!selectedConversation?.participant.id || !token) return
    
    try {
      await messageApi.blockUser(selectedConversation.participant.id, token)
      setBlockedIds([...blockedIds, selectedConversation.participant.id])
      toast({
        title: " Utilisateur bloqué",
        description: `${selectedConversation.participant.name} a été bloqué`,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du blocage")
      toast({
        title: "Erreur",
        description: "Impossible de bloquer cet utilisateur",
        variant: "destructive",
      })
    }
  }

  const handleBackToList = () => {
    // Messagerie inmasquable
  }

  const selectedConversation = selectedConversationId
    ? conversations.find((c) => c.id === selectedConversationId) || null
    : null

  const selectedMessages = selectedConversationId ? messagesByEchange[selectedConversationId] || [] : []

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Messagerie</h1>
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
      
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden h-[calc(100vh-220px)] min-h-125">
        <div className="flex h-full flex-col md:flex-row">
          {/* Conversations List */}
          <div
            className={cn(
              "w-full md:w-80 lg:w-96 md:shrink-0 border-b md:border-b-0 md:border-r border-border flex flex-col bg-card h-[40%] md:h-auto"
            )}
          >
            {/* Search Header */}
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une conversation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-muted/50 border-0"
                />
              </div>
            </div>

            {/* Conversations */}
            <ScrollArea className="flex-1">
              <div className="divide-y divide-border">
                {loadingEchanges ? (
                  <div className="p-8 text-center text-muted-foreground">Chargement des conversations...</div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <p>Aucune conversation trouvée</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      className={cn(
                        "w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left",
                        selectedConversation?.id === conv.id && "bg-muted"
                      )}
                    >
                      <div className="relative">
                        {conv.annonceImage ? (
                          <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted">
                            <Image
                              src={conv.annonceImage}
                              alt={conv.annonceTitle || "Product"}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <Avatar className="size-12">
                            <AvatarImage src={conv.participant.avatar} />
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {getInitials(conv.participant.name)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-foreground truncate">
                            {conv.annonceTitle || conv.participant.name}
                          </span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTime(conv.lastMessageTime)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {conv.participant.name}
                        </p>
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {conv.lastMessage}
                        </p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="size-5 flex items-center justify-center bg-primary text-primary-foreground text-xs font-medium rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div
            className={cn(
              "flex-1 min-h-0 flex flex-col bg-background"
            )}
          >
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="border-b border-border bg-card">
                  {/* Header Top - User Info */}
                  <div className="p-4 flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                      onClick={handleBackToList}
                    >
                      <ArrowLeft className="size-5" />
                    </Button>
                    <div className="relative">
                      <Avatar className="size-10">
                        <AvatarImage src={selectedConversation.participant.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {getInitials(selectedConversation.participant.name)}
                      </AvatarFallback>
                    </Avatar>
                    {selectedConversation.participant.isOnline && (
                      <span className="absolute bottom-0 right-0 size-2.5 bg-[#EC7578] rounded-full border-2 border-card" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-semibold text-foreground truncate">
                        {selectedConversation.participant.name}
                      </h2>
                      {selectedConversation.participant.riskScore !== undefined && (
                        <RiskBadge score={selectedConversation.participant.riskScore} />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {selectedConversation.participant.isOnline ? "En ligne" : "Hors ligne"}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <MoreVertical className="size-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link href={`/user/${selectedConversation.participant.id}`} className="cursor-pointer">
                          <User className="size-4 mr-2" />
                          <span>Voir le profil</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer text-muted-foreground">
                        <Trash2 className="size-4 mr-2" />
                        <span>Supprimer la conversation</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer text-orange-600"
                        onClick={() => {
                          if (selectedConversation?.participant?.id) {
                            setShowReportModal(true)
                          } else {
                            toast({ 
                              title: "Erreur", 
                              description: "ID utilisateur manquant" 
                            })
                          }
                        }}
                      >
                        <Flag className="size-4 mr-2" />
                        Signaler
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer text-red-600"
                        onClick={async () => {
                          if (!token) return
                          const targetId = selectedConversation.participant.id
                          const isBlocked = blockedIds.includes(targetId)
                          try {
                            if (isBlocked) {
                              await blockApi.unblock(targetId, token)
                              setBlockedIds((prev) => prev.filter((id) => id !== targetId))
                              toast({ title: "Utilisateur débloqué" })
                            } else {
                              await blockApi.block(targetId, token)
                              setBlockedIds((prev) => [...prev, targetId])
                              toast({ title: "Utilisateur bloqué" })
                            }
                          } catch (err) {
                            toast({
                              title: "Action impossible",
                              description: err instanceof Error ? err.message : "Erreur",
                            })
                          }
                        }}
                      >
                        <Ban className="size-4 mr-2" />
                        <span>{blockedIds.includes(selectedConversation.participant.id) ? "Débloquer" : "Bloquer"}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  </div>

                  {/* Product Info Section */}
                  {selectedConversationId && echanges.find(e => e._id === selectedConversationId)?.annonce && (
                    <div className="p-4 border-t border-border bg-muted/30">
                      <div className="flex gap-3 items-start">
                        {(echanges.find(e => e._id === selectedConversationId)?.annonce as any)?.images?.[0] && (
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted border border-border">
                            <Image
                              src={(echanges.find(e => e._id === selectedConversationId)?.annonce as any)?.images[0]}
                              alt="Product"
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Produit</p>
                          <h3 className="font-semibold text-foreground truncate">
                            {(echanges.find(e => e._id === selectedConversationId)?.annonce as any)?.title || "Produit"}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            Avec {selectedConversation.participant.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Exchange Actions */}
                  {selectedConversationId && (
                    (() => {
                      const echange = echanges.find(e => e._id === selectedConversationId)
                      if (!echange) return null
                      const isOwner = (echange.utilisateurProprietaire as any)?._id === user?._id
                      const status = String((echange as any).statut || "").toLowerCase()
                      const isPending = status === "en_attente"
                      const isActive = status === "accepte" || status === "discussion" || status === "rendez_vous_accepte" || status === "rendez_vous_propose"
                      const shouldShowActionsBar = (isPending && isOwner) || isActive
                      if (!shouldShowActionsBar) return null
                      return (
                        <div className="p-3 border-t border-border bg-card flex gap-2 justify-end flex-wrap">
                          {isPending && isOwner && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRefuseExchange(echange._id)}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                Refuser
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleAcceptExchange(echange._id)}
                                className="bg-[#EC7578] hover:bg-[#d45166] text-white"
                              >
                                Accepter
                              </Button>
                            </>
                          )}
                          {isActive && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelExchange(echange._id)}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                Annuler
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleCompleteExchange(echange._id)}
                                className="bg-[#EC7578] hover:bg-[#d45166] text-white"
                              >
                                Marquer comme terminé
                              </Button>
                            </>
                          )}
                        </div>
                      )
                    })()
                  )}
                </div>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto">
                  <div className="p-4 space-y-4">
                    {showSecurityAlert && securityWarnings.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <div className="flex items-start gap-2">
                          <Flag className="size-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-red-900 text-sm">⚠️ Alerte de sécurité</h4>
                            <ul className="text-sm text-red-800 mt-1 space-y-1">
                              {securityWarnings.map((warning, idx) => (
                                <li key={idx}>• {warning}</li>
                              ))}
                            </ul>
                          </div>
                          <button
                            onClick={() => setShowSecurityAlert(false)}
                            className="text-red-600 hover:text-red-800 flex-shrink-0"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    {loadingMessages ? (
                      <p className="text-sm text-muted-foreground">Chargement des messages...</p>
                    ) : (
                      <>
                        {/* Initial Message */}
                        {selectedConversationId && echanges.find(e => e._id === selectedConversationId)?.messageInitial && (
                          <div className="py-4 mb-4 border-b border-border">
                            <div className="bg-rose-50 dark:bg-rose-950/30 rounded-lg p-3 border border-rose-200 dark:border-rose-800">
                              <p className="text-xs font-medium text-rose-700 dark:text-rose-300 mb-2">Message initial</p>
                              <p className="text-sm text-rose-900 dark:text-rose-100 whitespace-pre-wrap">
                                {echanges.find(e => e._id === selectedConversationId)?.messageInitial}
                              </p>
                            </div>
                          </div>
                        )}

                        {selectedMessages.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Aucun message pour le moment.</p>
                        ) : (
                          <>
                            {selectedMessages.map((message) => {
                              const isMe = message.senderId === user?._id
                              const isImage = message.isImage
                              return (
                                <div
                                  key={message.id}
                                  className={cn(
                                    "flex",
                                    isMe ? "justify-end" : "justify-start"
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "max-w-[75%]",
                                      isImage
                                        ? "p-0 bg-transparent shadow-none"
                                        : "rounded-2xl px-4 py-2.5",
                                !isImage && (isMe
                                  ? "bg-primary text-primary-foreground rounded-br-md"
                                  : "bg-muted text-foreground rounded-bl-md")
                              )}
                            >
                              {isImage ? (
                                <div className="relative overflow-hidden rounded-lg border border-border bg-background">
                                  <Image
                                    src={message.content}
                                    alt="Image envoyée"
                                    width={320}
                                    height={320}
                                    className="h-auto w-full max-w-xs object-cover"
                                  />
                                  {message.status === "uploading" && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs font-medium">
                                      Envoi en cours...
                                    </div>
                                  )}
                                  {message.status === "error" && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-destructive/80 text-destructive-foreground text-xs font-medium">
                                      Échec de l'envoi
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <p className="text-sm leading-relaxed">{message.content}</p>
                              )}
                              <p
                                className={cn(
                                  "text-[10px] mt-1",
                                  isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                                )}
                              >
                                {message.timestamp.toLocaleTimeString("fr-FR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                                )
                              })}
                          </>
                        )}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-border bg-card space-y-3 shrink-0">
                  {(() => {
                    const isBlocked = blockedIds.includes(selectedConversation.participant.id)
                    return (
                      <>
                        {isBlocked && (
                          <div className="bg-destructive/10 dark:bg-destructive/20 border border-destructive/30 dark:border-destructive/40 rounded-lg p-3">
                            <p className="text-sm text-destructive dark:text-destructive/90">
                              Utilisateur bloqué. Vous pouvez toujours écrire ici.
                            </p>
                          </div>
                        )}

                        {/* Image Previews */}
                        {imagePreviews.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {imagePreviews.map((preview, index) => (
                              <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                                <Image
                                  src={preview}
                                  alt={`Preview ${index + 1}`}
                                  fill
                                  className="object-cover"
                                />
                                <button
                                  onClick={() => removeImage(index)}
                                  className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-0.5 transition-colors"
                                >
                                  <X className="size-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <form
                          onSubmit={(e) => {
                            e.preventDefault()
                            handleSendMessage()
                          }}
                          className="flex items-center gap-2"
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-muted-foreground hover:text-foreground shrink-0"
                          >
                            <ImageIcon className="size-5" />
                          </Button>
                          <Input
                            placeholder="Écrivez votre message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="flex-1 bg-muted/50 border-0"
                          />
                          <Button
                            type="submit"
                            size="icon"
                            className="bg-rose-500 hover:bg-rose-600 shrink-0"
                            disabled={!newMessage.trim() && imagePreviews.length === 0}
                          >
                            <Send className="size-4" />
                          </Button>
                        </form>
                      </>
                    )
                  })()}
                </div>
              </>
            ) : (
              /* Empty State */
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center px-6">
                  <div className="size-20 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                    <Send className="size-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Vos messages
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-xs">
                    Sélectionnez une conversation pour afficher les messages ou démarrez une nouvelle discussion.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Complete Exchange Dialog */}
        {completeDialogEchangeId && (
          <CompleteExchangeDialog
            open={completeDialogOpen}
            onOpenChange={setCompleteDialogOpen}
            annonceType={
              echanges.find((e) => e._id === completeDialogEchangeId)?.annonce?.type?.toUpperCase() || "VENTE"
            }
            onConfirm={handleCompleteExchangeConfirm}
          />
        )}

        {/* Report Modal */}
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          onSubmit={handleReportSubmit}
          targetType="user"
          targetName={selectedConversation?.participant?.name || "Utilisateur"}
          isLoading={isReporting}
        />
      </div>
    </div>
  )
}

