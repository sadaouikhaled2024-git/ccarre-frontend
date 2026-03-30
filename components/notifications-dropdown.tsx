"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"
import { notificationApi, type Notification } from "@/lib/notification-api"
import { useAuth } from "@/contexts/auth-context"
import { io, type Socket } from "socket.io-client"

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
        setNotifications(response.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Impossible de charger les notifications")
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
      setNotifications((prev) => [
        {
          _id: payload.notificationId || `temp-${Date.now()}`,
          type: payload.type,
          contenu: payload.contenu,
          read: false,
          createdAt: new Date().toISOString(),
          relatedEchange: payload.echangeId,
          relatedMessage: payload.messageId,
        },
        ...prev,
      ])
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

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="group flex flex-col items-center gap-0.5 transition-colors relative">
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
              {unreadCount}
            </span>
          )}
          <Bell strokeWidth={2} className="size-6 text-muted-foreground group-hover:text-foreground transition-colors" />
          <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors whitespace-nowrap">
            Notifications
          </span>
          <div className="h-0.5 w-10 bg-rose-500 origin-center scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-64">
        <div className="px-2 py-1.5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            {unreadCount > 0 && (
              <Button variant="ghost" size="xs" onClick={markAllAsRead} className="text-[11px]">
                Tout marquer comme lu
              </Button>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <div className="px-2 py-2 text-sm text-muted-foreground text-center">
          {loading ? (
            <p>Chargement...</p>
          ) : error ? (
            <p className="text-destructive">{error}</p>
          ) : notifications.length > 0 ? (
            <div className="space-y-2 text-left">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-2 rounded-md border transition-colors ${notification.read ? "bg-muted/40 border-border" : "bg-rose-50 border-rose-200"}`}
                >
                  <p className="text-sm font-medium text-foreground">{notification.contenu}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {new Date(notification.createdAt).toLocaleString("fr-FR")}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p>Aucune notification pour le moment</p>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
