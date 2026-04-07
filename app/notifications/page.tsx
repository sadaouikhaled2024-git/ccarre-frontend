"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { notificationApi, type Notification, type NotificationType } from "@/lib/notification-api"
import Link from "next/link"
import { MessageSquare, Share2, CheckCircle, XCircle, Zap, Inbox, Trash2, Archive, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { showNotification } from "@/components/notification-toast"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "MESSAGE":
      return <MessageSquare className="h-5 w-5" />
    case "ECHANGE_REQUEST":
      return <Share2 className="h-5 w-5" />
    case "ECHANGE_ACCEPTED":
      return <CheckCircle className="h-5 w-5" />
    case "ECHANGE_REFUSED":
      return <XCircle className="h-5 w-5" />
    case "ECHANGE_COMPLETED":
      return <Zap className="h-5 w-5" />
    case "ADMIN":
      return <Inbox className="h-5 w-5" />
    default:
      return <Mail className="h-5 w-5" />
  }
}

const getNotificationTypeColor = (type: NotificationType): string => {
  switch (type) {
    case "MESSAGE":
      return "text-[#B44362]"
    case "ECHANGE_REQUEST":
      return "text-[#FF7F50]"
    case "ECHANGE_ACCEPTED":
      return "text-[#EC7578]"
    case "ECHANGE_REFUSED":
      return "text-[#B44362]"
    case "ECHANGE_COMPLETED":
      return "text-[#FF7F50]"
    case "ADMIN":
      return "text-[#B44362]"
    default:
      return "text-[#EC7578]"
  }
}

const getNotificationTypeLabel = (type: NotificationType): string => {
  switch (type) {
    case "MESSAGE":
      return "Messages"
    case "ECHANGE_REQUEST":
      return "Demandes d'échange"
    case "ECHANGE_ACCEPTED":
      return "Acceptées"
    case "ECHANGE_REFUSED":
      return "Refusées"
    case "ECHANGE_COMPLETED":
      return "Complétées"
    case "ADMIN":
      return "Admin"
    default:
      return "Notifications"
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
  // Use notifiedBy first, then senderName
  if (notification.notifiedBy?.firstName || notification.notifiedBy?.lastName) {
    const first = notification.notifiedBy.firstName?.trim() || ""
    const last = notification.notifiedBy.lastName?.trim() || ""
    return `${first} ${last}`.trim() || "Unknown"
  }
  return notification.senderName || "Unknown"
}

const groupMessagesBySender = (notifications: Notification[]) => {
  const grouped: Record<string, Notification[]> = {}
  notifications.forEach((notif) => {
    const key = getNotifierFullName(notif)
    if (!grouped[key]) {
      grouped[key] = []
    }
    grouped[key].push(notif)
  })
  return Object.entries(grouped).sort((a, b) => 
    (b[1][0]?.createdAt || "").localeCompare(a[1][0]?.createdAt || "")
  )
}

export default function NotificationsPage() {
  const { token } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
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
        
        console.log("📬 Notifications chargées:", notifs.length, notifs)
        if (notifs.length > 0) {
          const first = notifs[0]
          console.log("🔍 STRUCTURE PREMIÈRE NOTIFICATION:", JSON.stringify(first, null, 2))
          console.log("📋 Fields check:")
          console.log("  - title:", first.title)
          console.log("  - description:", first.description)
          console.log("  - message:", first.message)
          console.log("  - contenu:", (first as any).contenu)
          console.log("  - senderName:", first.senderName)
          console.log("  - notifiedBy:", first.notifiedBy)
          console.log("  - type:", first.type)
        }
        setNotifications(notifs)
      } catch (err) {
        console.error("❌ Erreur fetch notifications:", err)
        showNotification("Erreur lors du chargement", "error")
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [token])

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

  const handleMarkAllAsRead = async () => {
    try {
      if (token) {
        await notificationApi.markAllAsRead(token)
        setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
        showNotification("Toutes les notifications marquées comme lues", "success")
      }
    } catch (err) {
      showNotification("Erreur", "error")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      if (token) {
        await notificationApi.delete(id, token)
        setNotifications((prev) => prev.filter((notif) => notif._id !== id))
        showNotification("Notification supprimée", "success")
      }
    } catch (err) {
      showNotification("Erreur lors de la suppression", "error")
    }
  }

  // Group by type
  const groupedByType = notifications.reduce(
    (acc, notif) => {
      if (!acc[notif.type]) {
        acc[notif.type] = []
      }
      acc[notif.type].push(notif)
      return acc
    },
    {} as Record<NotificationType, Notification[]>
  )

  // Sort each group by date
  Object.keys(groupedByType).forEach((type) => {
    groupedByType[type as NotificationType].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  })

  const notificationTypes = Object.keys(groupedByType) as NotificationType[]
  const unreadCount = notifications.filter((n) => !n.read).length

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B44362] mx-auto mb-4"></div>
            <p className="text-[#1F0C11]/60">Chargement des notifications...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
        <div className="container mx-auto max-w-5xl px-6 py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#1F0C11] mb-2">Notifications</h1>
            <p className="text-[#1F0C11]/60">
              {notifications.length === 0
                ? "Vous n'avez aucune notification"
                : `${notifications.length} notification${notifications.length !== 1 ? "s" : ""}`}
              {unreadCount > 0 && ` • ${unreadCount} non lu${unreadCount !== 1 ? "e" : ""}`}
            </p>
          </div>

          {/* Actions */}
          {notifications.length > 0 && unreadCount > 0 && (
            <div className="flex gap-3 mb-8">
              <Button
                onClick={handleMarkAllAsRead}
                className="bg-[#B44362] hover:bg-[#B44362]/90 text-white"
              >
                <Archive className="h-4 w-4 mr-2" />
                Tout marquer comme lu
              </Button>
            </div>
          )}

          {/* Notifications */}
          {notificationTypes.length === 0 ? (
            <Card className="p-16 text-center border-[#EC7578]/20">
              <Mail className="h-16 w-16 mx-auto mb-4 text-[#1F0C11]/20" />
              <p className="text-xl text-[#1F0C11]/60">Aucune notification pour le moment</p>
            </Card>
          ) : (
            <Tabs defaultValue={notificationTypes[0]} className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border-b border-[#EC7578]/20 bg-transparent">
                {notificationTypes.map((type) => {
                  const count = groupedByType[type].length
                  const unread = groupedByType[type].filter((n) => !n.read).length
                  return (
                    <TabsTrigger
                      key={type}
                      value={type}
                      className="flex flex-col items-center gap-1 data-[state=active]:text-[#B44362] data-[state=active]:border-b-2 data-[state=active]:border-[#B44362] pb-4"
                    >
                      <span className={`flex items-center gap-1 ${getNotificationTypeColor(type)}`}>
                        {getNotificationIcon(type)}
                      </span>
                      <span className="text-xs font-medium text-center leading-tight">
                        {getNotificationTypeLabel(type)}
                      </span>
                      <Badge className="text-xs bg-[#B44362]/10 text-[#B44362] border-0">
                        {count}
                        {unread > 0 && ` (${unread})`}
                      </Badge>
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              {notificationTypes.map((type) => (
                <TabsContent key={type} value={type} className="mt-6 space-y-4">
                  {type === "MESSAGE" ? (
                    <GroupedMessages
                      notifications={groupedByType[type]}
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={handleDelete}
                    />
                  ) : (
                    <div className="space-y-3">
                      {groupedByType[type].map((notification) => (
                        <NotificationCard
                          key={notification._id}
                          notification={notification}
                          onMarkAsRead={handleMarkAsRead}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          )}
          
          {/* View All Button */}
          <div className="mt-8 text-center">
            <Link href="/notifications">
              <Button className="bg-[#B44362] hover:bg-[#B44362]/90 text-white">
                Voir toutes les notifications
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

interface NotificationCardProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}

function NotificationCard({ notification, onMarkAsRead, onDelete }: NotificationCardProps) {
  const link = getNotificationLink(notification)
  const iconColor = getNotificationTypeColor(notification.type)
  const notifierName = getNotifierFullName(notification)
  
  // Try to extract content from various possible fields
  const content = 
    notification.contenu || 
    notification.title || 
    notification.description || 
    notification.message ||
    "Notification"

  return (
    <Link href={link}>
      <Card
        className={`p-5 border-l-4 transition-all cursor-pointer hover:shadow-md ${
          !notification.read
            ? "border-l-[#FF7F50] bg-[#FF7F50]/5"
            : "border-l-[#1F0C11]/10 bg-white"
        }`}
        onClick={() => {
          if (!notification.read) {
            onMarkAsRead(notification._id)
          }
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3 flex-1 min-w-0">
            <div className={`flex-shrink-0 mt-1 ${iconColor}`}>
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-[#1F0C11]">{content}</h3>
                {!notification.read && (
                  <div className="h-2.5 w-2.5 rounded-full bg-[#FF7F50] flex-shrink-0" />
                )}
              </div>
              {notifierName !== "Unknown" && (
                <p className="text-xs text-[#1F0C11]/60 mt-2">
                  De <span className="font-medium text-[#B44362]">{notifierName}</span>
                </p>
              )}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <Badge
                  variant="outline"
                  className="text-xs border-[#B44362]/30 text-[#B44362]"
                >
                  {getNotificationTypeLabel(notification.type)}
                </Badge>
                <span className="text-xs text-[#1F0C11]/50">
                  {new Date(notification.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-[#1F0C11]/50 hover:text-[#B44362] hover:bg-[#B44362]/5 flex-shrink-0"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onDelete(notification._id)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </Link>
  )
}

interface GroupedMessagesProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}

function GroupedMessages({ notifications, onMarkAsRead, onDelete }: GroupedMessagesProps) {
  const grouped = groupMessagesBySender(notifications)

  return (
    <div className="space-y-4">
      {grouped.map(([senderName, messages]) => {
        const unreadCount = messages.filter((m) => !m.read).length
        const firstMessage = messages[0]

        return (
          <Link
            key={senderName}
            href={
              firstMessage.relatedMessage
                ? `/messagerie?conversationId=${firstMessage.relatedMessage}`
                : "#"
            }
          >
            <Card
              className={`p-5 border-l-4 transition-all cursor-pointer hover:shadow-md ${
                unreadCount > 0
                  ? "border-l-[#FF7F50] bg-[#FF7F50]/5"
                  : "border-l-[#1F0C11]/10 bg-white"
              }`}
              onClick={() => {
                messages.forEach((msg) => {
                  if (!msg.read) {
                    onMarkAsRead(msg._id)
                  }
                })
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 mt-1 text-[#B44362]">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-[#1F0C11]">
                        {messages.length} message{messages.length !== 1 ? "s" : ""} de
                      </h3>
                      <span className="font-bold text-[#B44362]">{senderName}</span>
                      {unreadCount > 0 && (
                        <Badge variant="secondary" className="bg-[#FF7F50] text-white text-xs">
                          {unreadCount}
                        </Badge>
                      )}
                    </div>
                    {firstMessage.description && (
                      <p className="text-sm text-[#1F0C11]/70 mt-2 line-clamp-2">
                        {firstMessage.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      <Badge
                        variant="outline"
                        className="text-xs border-[#B44362]/30 text-[#B44362]"
                      >
                        Messages
                      </Badge>
                      <span className="text-xs text-[#1F0C11]/50">
                        {new Date(firstMessage.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[#1F0C11]/50 hover:text-[#B44362] hover:bg-[#B44362]/5 flex-shrink-0"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    messages.forEach((msg) => onDelete(msg._id))
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}




