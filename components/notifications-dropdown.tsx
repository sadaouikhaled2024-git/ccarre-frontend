"use client"

import { Bell, ChevronRight, MessageSquare, Share2, Check, AlertCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { notificationApi, type Notification, type NotificationType } from "@/lib/notification-api"
import { useAuth } from "@/contexts/auth-context"
import { io, type Socket } from "socket.io-client"
import Link from "next/link"

const getNotificationIcon = (type: NotificationType | string) => {
  const t = type as NotificationType
  switch (t) {
    case "MESSAGE":
      return <MessageSquare className="h-4 w-4 flex-shrink-0" />
    case "ECHANGE_REQUEST":
      return <Share2 className="h-4 w-4 flex-shrink-0" />
    case "ECHANGE_ACCEPTED":
      return <Check className="h-4 w-4 flex-shrink-0" />
    case "ECHANGE_REFUSED":
      return <AlertCircle className="h-4 w-4 flex-shrink-0" />
    case "ECHANGE_COMPLETED":
      return <Check className="h-4 w-4 flex-shrink-0" />
    case "ADMIN":
      return <AlertTriangle className="h-4 w-4 flex-shrink-0" />
    default:
      return <Bell className="h-4 w-4 flex-shrink-0" />
  }
}

const getNotificationColor = (type: NotificationType | string): string => {
  const t = type as NotificationType
  switch (t) {
    case "MESSAGE":
      return "bg-[#B44362]/10 border-[#B44362]/20"
    case "ECHANGE_REQUEST":
      return "bg-[#FF7F50]/10 border-[#FF7F50]/20"
    case "ECHANGE_ACCEPTED":
      return "bg-[#EC7578]/10 border-[#EC7578]/20"
    case "ECHANGE_REFUSED":
      return "bg-[#B44362]/10 border-[#B44362]/20"
    case "ECHANGE_COMPLETED":
      return "bg-[#FF7F50]/10 border-[#FF7F50]/20"
    case "ADMIN":
      return "bg-[#B44362]/10 border-[#B44362]/20"
    default:
      return "bg-[#EC7578]/10 border-[#EC7578]/20"
  }
}

const getNotificationTypeLabel = (type: NotificationType | string): string => {
  const t = type as NotificationType
  switch (t) {
    case "MESSAGE":
      return "Message"
    case "ECHANGE_REQUEST":
      return "Demande d'échange"
    case "ECHANGE_ACCEPTED":
      return "Acceptée"
    case "ECHANGE_REFUSED":
      return "Refusée"
    case "ECHANGE_COMPLETED":
      return "Complétée"
    case "ADMIN":
      return "Admin"
    default:
      return "Notification"
  }
}

const getNotificationLink = (notification: Notification): string => {
  if (notification.relatedMessage) {
    return `/messagerie?conversationId=${notification.relatedMessage}`
  }
  if (notification.relatedEchange) {
    const echangeId = typeof notification.relatedEchange === 'string' 
      ? notification.relatedEchange 
      : (notification.relatedEchange as any)?._id
    return `/historique-echanges?exchangeId=${echangeId}`
  }
  if (notification.relatedAnnonce) {
    return `/announcements/${notification.relatedAnnonce}`
  }
  return "/notifications"
}

const getNotifierFullName = (notification: Notification): string => {
  // Try notifiedBy first, then senderName
  const first = notification.notifiedBy?.firstName?.trim() || ""
  const last = notification.notifiedBy?.lastName?.trim() || ""
  const fullName = `${first} ${last}`.trim()
  return fullName || notification.senderName || ""
}

export function NotificationsDropdown() {
  const { token } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    if (!open || !token) return

    const fetchNotifications = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await notificationApi.getAll(token)
        
        let notifs: Notification[] = []
        
        // Handle various response formats
        if (Array.isArray(response.data)) {
          notifs = response.data
        } else if (response.data && typeof response.data === 'object') {
          if (Array.isArray((response.data as any).notifications)) {
            notifs = (response.data as any).notifications
          } else if ((response.data as any).data && Array.isArray((response.data as any).data)) {
            notifs = (response.data as any).data
          }
        } else if (Array.isArray(response)) {
          notifs = response as any
        }
        
        console.log("📬 Dropdown - Notifications chargées:", notifs.length, notifs)
        if (notifs.length > 0) {
          console.log("🔍 STRUCTURE PREMIÈRE NOTIFICATION:", JSON.stringify(notifs[0], null, 2))
        }
        setNotifications(notifs)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Impossible de charger les notifications"
        console.error("❌ Dropdown - Erreur:", message)
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [open, token])

  useEffect(() => {
    if (!token) return

    const s = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000", {
      transports: ["websocket"],
      auth: { token },
    })

    s.on("notification", (payload: any) => {
      console.log("🔔 Socket notification reçue:", payload)
      const newNotif: Notification = {
        _id: payload.notificationId || payload._id || `temp-${Date.now()}`,
        userId: payload.userId || "",
        type: (payload.type || "MESSAGE") as NotificationType,
        title: payload.title || payload.contenu || "Nouvelle notification",
        description: payload.description || payload.message,
        message: payload.message,
        relatedMessage: payload.messageId || payload.relatedMessage,
        relatedEchange: payload.echangeId || payload.relatedEchange,
        relatedAnnonce: payload.relatedAnnonce,
        read: payload.read || false,
        createdAt: payload.createdAt || new Date().toISOString(),
        updatedAt: payload.updatedAt || new Date().toISOString(),
        notifiedBy: payload.notifiedBy
          ? {
              firstName: payload.notifiedBy.firstName || "",
              lastName: payload.notifiedBy.lastName || "",
              avatar: payload.notifiedBy.avatar,
            }
          : payload.senderName
            ? {
                firstName: String(payload.senderName).split(" ")[0] || "",
                lastName: String(payload.senderName).split(" ").slice(1).join(" "),
                avatar: payload.senderAvatar,
              }
            : undefined,
      }
      console.log("✅ Notification mappée:", newNotif)
      setNotifications((prev) => [newNotif, ...prev])
    })

    setSocket(s)

    return () => {
      s.disconnect()
      setSocket(null)
    }
  }, [token])

  const markAllAsRead = async () => {
    if (!token) return
    try {
      await notificationApi.markAllRead(token)
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de mettre à jour")
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      if (token) {
        await notificationApi.markAsRead(id, token)
        setNotifications((prev) =>
          prev.map((notif) => (notif._id === id ? { ...notif, read: true } : notif))
        )
      }
    } catch (err) {
      console.error("Erreur:", err)
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length
  const displayNotifications = notifications.slice(0, 5)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="group flex flex-col items-center gap-0.5 transition-colors relative">
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EC7578] px-1 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <Bell strokeWidth={2} className="size-6 text-[#B44362] group-hover:text-[#FF7F50] transition-colors" />
          <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors whitespace-nowrap">
            Notifications
          </span>
          <div className="h-0.5 w-10 bg-[#B44362] origin-center scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <div className="border-b border-[#EC7578]/20 px-4 py-3">
          <h3 className="font-semibold text-[#1F0C11]">Notifications</h3>
        </div>

        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mx-auto mb-2" />
            ) : error ? (
              <>
                <p className="text-red-500 text-sm font-medium">Erreur</p>
                <p className="text-xs mt-1">{error}</p>
              </>
            ) : (
              <p>Aucune notification</p>
            )}
          </div>
        ) : (
          <>
            <ScrollArea className="h-96">
              <div className="px-2 py-2">
                {displayNotifications.map((notification) => {
                  const link = getNotificationLink(notification)
                  const backgroundColor = getNotificationColor(notification.type)
                  const icon = getNotificationIcon(notification.type)
                  const typeLabel = getNotificationTypeLabel(notification.type)
                  const notifierName = getNotifierFullName(notification)
                  
                  // Try to extract content from various possible fields
                  const content = 
                    notification.contenu || 
                    notification.title || 
                    notification.description || 
                    notification.message ||
                    "Notification"

                  return (
                    <Link key={notification._id} href={link}>
                      <div
                        className={`mb-2 p-3 rounded-lg border cursor-pointer transition-colors ${backgroundColor} hover:opacity-80`}
                        onClick={() => {
                          if (!notification.read) {
                            handleMarkAsRead(notification._id)
                          }
                          setOpen(false)
                        }}
                      >
                        <div className="flex gap-2">
                          <div className="flex-shrink-0 mt-1 text-[#B44362]">
                            {icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-[#1F0C11]">
                                  {content}
                                </p>
                                {notifierName && (
                                  <p className="text-xs text-[#1F0C11]/60 mt-1">
                                    De <span className="font-medium text-[#B44362]">{notifierName}</span>
                                  </p>
                                )}
                              </div>
                              {!notification.read && (
                                <div className="h-2 w-2 rounded-full bg-[#FF7F50] flex-shrink-0 mt-1.5" />
                              )}
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <Badge
                                variant="outline"
                                className="text-xs border-[#B44362]/30 text-[#B44362]"
                              >
                                {typeLabel}
                              </Badge>
                              <span className="text-xs text-[#1F0C11]/50">
                                {new Date(notification.createdAt).toLocaleDateString("fr-FR", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </ScrollArea>

            <div className="border-t border-[#EC7578]/20 p-3 space-y-2">
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full text-xs text-[#B44362] hover:bg-[#B44362]/5"
                  onClick={markAllAsRead}
                >
                  Tout marquer comme lu
                </Button>
              )}
              <Link href="/notifications" className="w-full block">
                <Button
                  variant="outline"
                  className="w-full text-[#B44362] border-[#B44362]/30 hover:bg-[#B44362]/5"
                  onClick={() => setOpen(false)}
                >
                  Voir toutes les notifications
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
