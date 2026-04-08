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

export interface SecureMessagePayload {
  echangeId: string
  contenu: string
}

export interface SecureMessage {
  _id: string
  echangeId: string
  sender: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  content: string
  securityAnalysis?: {
    hasScamKeywords: boolean
    hasPhoneNumbers: boolean
    hasEmails: boolean
    hasExternalLinks: boolean
    isSuspicious: boolean
    riskScore: number
    warnings?: string[]
  }
  createdAt: string
}

export interface BlockedUser {
  _id: string
  blockedUser: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  createdAt: string
}

export interface SecureMessageResponse {
  success: boolean
  data?: SecureMessage | SecureMessage[] | BlockedUser[]
  message?: string
  warnings?: string[]
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

  /* ─────────────────────────────────────
     MESSAGERIE SÉCURISÉE
     ───────────────────────────────────── */

  sendSecureMessage(payload: SecureMessagePayload, token: string) {
    return request<SecureMessageResponse>(
      "/api/secure-messages",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token,
    )
  },

  getSecureMessages(echangeId: string, token: string) {
    return request<SecureMessageResponse>(
      `/api/secure-messages/${echangeId}`,
      { method: "GET" },
      token,
    )
  },

  deleteSecureMessage(messageId: string, token: string) {
    return request<SecureMessageResponse>(
      `/api/secure-messages/${messageId}`,
      { method: "DELETE" },
      token,
    )
  },

  /* ─────────────────────────────────────
     BLOCAGE D'UTILISATEURS
     ───────────────────────────────────── */

  blockUser(targetUserId: string, token: string) {
    return request<SecureMessageResponse>(
      `/api/secure-messages/block/${targetUserId}`,
      { method: "POST" },
      token,
    )
  },

  unblockUser(blockId: string, token: string) {
    return request<SecureMessageResponse>(
      `/api/secure-messages/block/${blockId}`,
      { method: "DELETE" },
      token,
    )
  },

  getBlockedUsers(token: string) {
    return request<SecureMessageResponse>(
      "/api/secure-messages/blocks/list",
      { method: "GET" },
      token,
    )
  },
}
