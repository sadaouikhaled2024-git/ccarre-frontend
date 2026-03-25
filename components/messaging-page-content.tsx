"use client"

import { useState, useRef, useEffect } from "react"
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

interface Message {
  id: string
  content: string
  senderId: string
  timestamp: Date
  isRead: boolean
}

interface Conversation {
  id: string
  participant: {
    id: string
    name: string
    avatar?: string
    isOnline: boolean
  }
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  messages: Message[]
}

const mockConversations: Conversation[] = [
  {
    id: "1",
    participant: {
      id: "u1",
      name: "Marie Dupont",
      avatar: "",
      isOnline: true,
    },
    lastMessage: "Super, on se retrouve demain alors !",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 5),
    unreadCount: 2,
    messages: [
      { id: "m0a", content: "Salut ! J'ai vu ton annonce sur CCarré", senderId: "u1", timestamp: new Date(Date.now() - 1000 * 60 * 120), isRead: true },
      { id: "m0b", content: "Ah super ! De quelle annonce tu parles ?", senderId: "me", timestamp: new Date(Date.now() - 1000 * 60 * 115), isRead: true },
      { id: "m0c", content: "Le livre de maths pour le cours d'analyse", senderId: "u1", timestamp: new Date(Date.now() - 1000 * 60 * 110), isRead: true },
      { id: "m0d", content: "Il est en bon état ?", senderId: "u1", timestamp: new Date(Date.now() - 1000 * 60 * 105), isRead: true },
      { id: "m0e", content: "Oui très bon état, je l'ai utilisé qu'un semestre", senderId: "me", timestamp: new Date(Date.now() - 1000 * 60 * 100), isRead: true },
      { id: "m0f", content: "Tu le vends combien ?", senderId: "u1", timestamp: new Date(Date.now() - 1000 * 60 * 95), isRead: true },
      { id: "m0g", content: "25 euros, c'est négociable si tu veux", senderId: "me", timestamp: new Date(Date.now() - 1000 * 60 * 90), isRead: true },
      { id: "m0h", content: "20 euros ça t'irait ?", senderId: "u1", timestamp: new Date(Date.now() - 1000 * 60 * 85), isRead: true },
      { id: "m0i", content: "Ok ça marche pour moi !", senderId: "me", timestamp: new Date(Date.now() - 1000 * 60 * 80), isRead: true },
      { id: "m0j", content: "Parfait merci beaucoup !", senderId: "u1", timestamp: new Date(Date.now() - 1000 * 60 * 75), isRead: true },
      { id: "m1", content: "Bonjour ! Je suis intéressée par votre livre de mathématiques", senderId: "u1", timestamp: new Date(Date.now() - 1000 * 60 * 30), isRead: true },
      { id: "m2", content: "Bonjour Marie ! Oui, il est toujours disponible", senderId: "me", timestamp: new Date(Date.now() - 1000 * 60 * 25), isRead: true },
      { id: "m3", content: "Est-ce qu'on peut se voir demain à la fac ?", senderId: "u1", timestamp: new Date(Date.now() - 1000 * 60 * 20), isRead: true },
      { id: "m4", content: "Oui, vers 14h devant la bibliothèque ?", senderId: "me", timestamp: new Date(Date.now() - 1000 * 60 * 15), isRead: true },
      { id: "m5", content: "Super, on se retrouve demain alors !", senderId: "u1", timestamp: new Date(Date.now() - 1000 * 60 * 5), isRead: false },
    ],
  },
  {
    id: "2",
    participant: {
      id: "u2",
      name: "Lucas Martin",
      avatar: "",
      isOnline: false,
    },
    lastMessage: "Merci pour le vélo !",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
    unreadCount: 0,
    messages: [
      { id: "m6", content: "Le vélo est en bon état ?", senderId: "u2", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), isRead: true },
      { id: "m7", content: "Oui, je l'ai fait réviser le mois dernier", senderId: "me", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.5), isRead: true },
      { id: "m8", content: "Merci pour le vélo !", senderId: "u2", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), isRead: true },
    ],
  },
  {
    id: "3",
    participant: {
      id: "u3",
      name: "Sophie Bernard",
      avatar: "",
      isOnline: true,
    },
    lastMessage: "D'accord, je regarde ça",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
    unreadCount: 0,
    messages: [
      { id: "m9", content: "Salut ! Tu vends toujours ton bureau ?", senderId: "u3", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25), isRead: true },
      { id: "m10", content: "Oui ! Tu veux des photos ?", senderId: "me", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24.5), isRead: true },
      { id: "m11", content: "D'accord, je regarde ça", senderId: "u3", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), isRead: true },
    ],
  },
  {
    id: "4",
    participant: {
      id: "u4",
      name: "Thomas Petit",
      avatar: "",
      isOnline: false,
    },
    lastMessage: "Je te confirme demain",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 48),
    unreadCount: 1,
    messages: [
      { id: "m12", content: "Combien pour la lampe de bureau ?", senderId: "u4", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 50), isRead: true },
      { id: "m13", content: "15 euros, c'est négociable", senderId: "me", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 49), isRead: true },
      { id: "m14", content: "Je te confirme demain", senderId: "u4", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), isRead: false },
    ],
  },
]

function formatTime(date: Date): string {
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
  const [conversations] = useState<Conversation[]>(mockConversations)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [selectedConversation])

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

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv)
    setShowMobileChat(true)
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return
    // In a real app, this would send the message to the backend
    setNewMessage("")
  }

  const handleBackToList = () => {
    setShowMobileChat(false)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Messagerie</h1>
      
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden h-[calc(100vh-220px)] min-h-[500px]">
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
                {filteredConversations.length === 0 ? (
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
                      <DropdownMenuItem className="cursor-pointer text-orange-600">
                        <Flag className="size-4 mr-2" />
                        <span>Signaler</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer text-red-600">
                        <Ban className="size-4 mr-2" />
                        <span>Bloquer</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto">
                  <div className="p-4 space-y-4">
                    {selectedConversation.messages.map((message) => {
                      const isMe = message.senderId === "me"
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
                              "max-w-[75%] rounded-2xl px-4 py-2.5",
                              isMe
                                ? "bg-primary text-primary-foreground rounded-br-md"
                                : "bg-muted text-foreground rounded-bl-md"
                            )}
                          >
                            <p className="text-sm leading-relaxed">{message.content}</p>
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
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground shrink-0"
                    >
                      <Paperclip className="size-5" />
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
