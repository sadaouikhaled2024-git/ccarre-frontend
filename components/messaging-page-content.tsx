"use client"

import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Send, MoreVertical, ArrowLeft, ImageIcon, Paperclip, User, Trash2, Flag, Ban, X } from "lucide-react"
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
  }
  lastMessage?: string
  lastMessageTime?: Date
  unreadCount: number
  annonceTitle?: string
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

export function MessagingPageContent() {
  const { token, user } = useAuth()
  const [echanges, setEchanges] = useState<Echange[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [messagesByEchange, setMessagesByEchange] = useState<Record<string, Message[]>>({})
  const [loadingEchanges, setLoadingEchanges] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [blockedIds, setBlockedIds] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<Socket | null>(null)
  const { toast } = useToast()

  const isImageContent = useCallback((content: string) => {
    return content.startsWith("data:image") || /\.(png|jpe?g|gif|webp|avif)$/i.test(content)
  }, [])

  const mapApiMessage = useCallback((message: ApiMessage): Message => ({
    id: message._id,
    content: message.contenu,
    senderId: (message.expediteur as any)?._id ?? "",
    timestamp: new Date(message.createdAt),
    isRead: true,
    isImage: isImageContent(message.contenu),
    status: "sent",
  }), [isImageContent])

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
          name: `${counterpart?.firstName ?? ""} ${counterpart?.lastName ?? ""}`.trim() || "Utilisateur",
          avatar: counterpart?.profileImage,
          isOnline: false,
        },
        lastMessage: lastMessageText,
        lastMessageTime: lastMessage?.timestamp || new Date(echange.updatedAt),
        unreadCount: 0,
        annonceTitle: (echange.annonce as any)?.title,
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
    if (!token) return

    const socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000", {
      transports: ["websocket"],
      auth: { token },
    })

    socketRef.current = socket

    socket.on("connect_error", (err) => {
      setError(err.message || "Connexion temps réel échouée")
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
      socket.disconnect()
      socketRef.current = null
    }
  }, [mapApiMessage, token])

  useEffect(() => {
    if (!token) return
    blockApi
      .list(token)
      .then((res) => setBlockedIds((res.data || []).map((b) => (b.blocked as any)?._id || b.blocked)))
      .catch(() => {})
  }, [token])

  useEffect(() => {
    if (!token) return

    const fetchEchanges = async () => {
      try {
        setLoadingEchanges(true)
        setError(null)
        const response = await echangeApi.getAll(token)
        const list = Array.isArray(response.data) ? (response.data as Echange[]) : []
        setEchanges(list)

        // Join exchange rooms for realtime updates
        const socket = socketRef.current
        if (socket && socket.connected) {
          list.forEach((e) => {
            socket.emit("join_echange", { echangeId: e._id })
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

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && selectedImages.length === 0) || !selectedConversationId || !token) return

    const socket = socketRef.current

    const sendTextMessage = async () => {
      const payload = { echangeId: selectedConversationId, contenu: newMessage.trim() }

      if (socket && socket.connected) {
        socket.emit("send_message", payload, (err?: Error) => {
          if (err) {
            setError(err.message)
          }
        })
      } else {
        const response = await messageApi.send(payload, token)
        const created = (response.data as ApiMessage) || null
        if (created) {
          const normalized = mapApiMessage(created)
          setMessagesByEchange((prev) => {
            const existing = prev[selectedConversationId] ?? []
            return {
              ...prev,
              [selectedConversationId]: [...existing, normalized],
            }
          })
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

      addMessageToEchange(selectedConversationId, tempMessage)

      try {
        const uploadResponse = await messageApi.uploadImage(file, token)
        const imageUrl = uploadResponse.url
        const payload = { echangeId: selectedConversationId, contenu: imageUrl }

        if (socket && socket.connected) {
          await new Promise<void>((resolve, reject) => {
            socket.emit("send_message", payload, (err?: Error, messageId?: string) => {
              if (err) {
                return reject(err)
              }
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
          const response = await messageApi.send(payload, token)
          const created = (response.data as ApiMessage) || null
          if (created) {
            updateMessageInEchange(selectedConversationId, tempId, mapApiMessage(created))
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Envoi du message impossible")
        updateMessageInEchange(selectedConversationId, tempId, { status: "error" })
      }
    }

    try {
      if (newMessage.trim()) {
        await sendTextMessage()
        setNewMessage("")
      }

      for (let i = 0; i < selectedImages.length; i++) {
        const file = selectedImages[i]
        const preview = imagePreviews[i]
        if (file && preview) {
          await sendImageMessage(file, preview)
        }
      }

      setSelectedImages([])
      setImagePreviews([])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Envoi du message impossible")
    }
  }

  const handleBackToList = () => {
    setShowMobileChat(false)
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
        <div className="flex h-full">
          {/* Conversations List */}
          <div
            className={cn(
              "w-full md:w-80 lg:w-96 border-r border-border flex flex-col bg-card",
              showMobileChat && "hidden md:flex"
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
                        <Avatar className="size-12">
                          <AvatarImage src={conv.participant.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {getInitials(conv.participant.name)}
                          </AvatarFallback>
                        </Avatar>
                        {conv.participant.isOnline && (
                          <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-card" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-foreground truncate">
                            {conv.participant.name}
                          </span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTime(conv.lastMessageTime)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate mt-0.5">
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
              "flex-1 flex flex-col bg-background",
              !showMobileChat && "hidden md:flex"
            )}
          >
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border bg-card flex items-center gap-3">
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
                      <span className="absolute bottom-0 right-0 size-2.5 bg-green-500 rounded-full border-2 border-card" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-foreground truncate">
                      {selectedConversation.participant.name}
                    </h2>
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
                        onClick={async () => {
                          const reason = prompt("Expliquez la raison du signalement")
                          if (!reason || !token) return
                          try {
                            await reportApi.create(
                              {
                                targetId: selectedConversation.participant.id,
                                targetType: "USER",
                                reason,
                              },
                              token,
                            )
                            toast({ title: "Signalement envoyé" })
                          } catch (err) {
                            toast({
                              title: "Signalement impossible",
                              description: err instanceof Error ? err.message : "Erreur",
                            })
                          }
                        }}
                      >
                        <Flag className="size-4 mr-2" />
                        <span>Signaler</span>
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

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto">
                  <div className="p-4 space-y-4">
                    {loadingMessages ? (
                      <p className="text-sm text-muted-foreground">Chargement des messages...</p>
                    ) : selectedMessages.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Aucun message pour le moment.</p>
                    ) : (
                      selectedMessages.map((message) => {
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
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-border bg-card space-y-3">
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
      </div>
    </div>
  )
}
