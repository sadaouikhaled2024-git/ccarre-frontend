const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export type NotificationType = 
  | "MESSAGE"
  | "ECHANGE_REQUEST"
  | "ECHANGE_ACCEPTED"
  | "ECHANGE_REFUSED"
  | "ECHANGE_COMPLETED"
  | "ADMIN"

export interface Notification {
  _id: string
  userId?: string
  user?: {
    _id: string
    firstName: string
    lastName: string
    email?: string
    avatar?: string
  }
  type: NotificationType
  title?: string
  contenu?: string
  description?: string
  message?: string
  relatedMessage?: string
  relatedEchange?: any | string
  relatedAnnonce?: string
  read: boolean
  createdAt: string
  updatedAt: string
  notifiedBy?: {
    firstName?: string
    lastName?: string
    avatar?: string
  }
  senderName?: string
  senderAvatar?: string
}

export interface NotificationsResponse {
  success: boolean
  message?: string
  data?: Notification[] | { notifications: Notification[] }
}

async function request<T>(endpoint: string, options: RequestInit = {}, token: string): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.message || data.error || "Une erreur est survenue")
  }

  return data as T
}

export const notificationApi = {
  getAll(token: string, unreadOnly = false) {
    const query = unreadOnly ? "?unreadOnly=true" : ""
    return request<NotificationsResponse>(`/api/notifications${query}`, { method: "GET" }, token)
  },

  markAsRead(id: string, token: string) {
    return request<NotificationsResponse>(`/api/notifications/${id}/read`, { method: "PUT" }, token)
  },

  markRead(id: string, token: string) {
    return request<NotificationsResponse>(`/api/notifications/${id}/read`, { method: "PUT" }, token)
  },

  markAllAsRead(token: string) {
    return request<NotificationsResponse>("/api/notifications/read-all", { method: "PUT" }, token)
  },

  markAllRead(token: string) {
    return request<NotificationsResponse>("/api/notifications/read-all", { method: "PUT" }, token)
  },

  delete(id: string, token: string) {
    return request<NotificationsResponse>(`/api/notifications/${id}`, { method: "DELETE" }, token)
  },
}

