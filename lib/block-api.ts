const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export interface BlockItem {
  _id: string
  blocker: string
  blocked: { _id: string; firstName?: string; lastName?: string; email?: string }
  createdAt: string
}

export interface BlockResponse {
  success: boolean
  message?: string
  data?: BlockItem[]
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

export const blockApi = {
  list(token: string) {
    return request<BlockResponse>(`/api/blocks`, { method: "GET" }, token)
  },
  block(userId: string, token: string) {
    return request<BlockResponse>(`/api/blocks/${userId}`, { method: "POST" }, token)
  },
  unblock(userId: string, token: string) {
    return request<BlockResponse>(`/api/blocks/${userId}`, { method: "DELETE" }, token)
  },
}
