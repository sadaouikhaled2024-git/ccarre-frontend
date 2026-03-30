const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export interface MessagePayload {
  echangeId: string
  contenu: string
}

export interface Message {
  _id: string
  echangeId: string
  expediteur: {
    _id: string
    firstName?: string
    lastName?: string
    email?: string
  }
  contenu: string
  createdAt: string
  updatedAt: string
}

export interface MessagesResponse {
  success: boolean
  message?: string
  data?: Message | Message[]
}

export interface UploadImageResponse {
  success: boolean
  url: string
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

export const messageApi = {
  send(payload: MessagePayload, token: string) {
    return request<MessagesResponse>(
      "/api/messages",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token,
    )
  },

  getByEchange(echangeId: string, token: string) {
    return request<MessagesResponse>(`/api/messages/${echangeId}`, { method: "GET" }, token)
  },

  async uploadImage(file: File, token: string) {
    const formData = new FormData()
    formData.append("image", file)

    const res = await fetch(`${API_URL}/api/messages/upload-image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      throw new Error((data as any).message || (data as any).error || "Upload de l'image impossible")
    }

    return data as UploadImageResponse
  },
}
