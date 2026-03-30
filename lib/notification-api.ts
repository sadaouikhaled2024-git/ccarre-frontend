const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export interface Notification {
  _id: string
  type: string
  contenu: string
  read: boolean
  createdAt: string
  relatedEchange?: string
  relatedMessage?: string
}

export interface NotificationsResponse {
  success: boolean
  message?: string
  data?: Notification[]
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

  markRead(id: string, token: string) {
    return request<NotificationsResponse>(`/api/notifications/${id}/read`, { method: "PUT" }, token)
  },

  markAllRead(token: string) {
    return request<NotificationsResponse>("/api/notifications/read-all", { method: "PUT" }, token)
  },
}
