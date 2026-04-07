const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

import type { Annonce } from "./annonce-api"

export interface FavoritesResponse {
  success?: boolean
  message?: string
  data?: Annonce[] | Annonce
}

async function request<T>(endpoint: string, options: RequestInit = {}, token: string): Promise<T> {
  const url = `${API_URL}${endpoint}`
  console.log("⭐ [API-REQUEST]", options.method || "GET", url)
  
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  })

  const data = await res.json().catch(() => ({}))
  console.log(`⭐ [API-RESPONSE] Status: ${res.status}, Data:`, data)

  if (!res.ok) {
    const errorMsg = data.message || data.error || "Une erreur est survenue"
    console.error(`⭐ [API-ERROR] ${res.status}:`, errorMsg)
    throw new Error(errorMsg)
  }

  return data as T
}

export const favoriteApi = {
  getAll(token: string) {
    console.log("⭐ [API] GET /api/favorites")
    return request<FavoritesResponse>("/api/favorites", { method: "GET" }, token)
  },

  add(annonceId: string, token: string) {
    console.log("⭐ [API] POST /api/favorites/" + annonceId)
    return request<FavoritesResponse>(`/api/favorites/${annonceId}`, { method: "POST" }, token)
  },

  remove(annonceId: string, token: string) {
    console.log("⭐ [API] DELETE /api/favorites/" + annonceId)
    return request<FavoritesResponse>(`/api/favorites/${annonceId}`, { method: "DELETE" }, token)
  },
}
