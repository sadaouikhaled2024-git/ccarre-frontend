const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

import type { Annonce } from "./annonce-api"

export interface FavoritesResponse {
  success: boolean
  message?: string
  data?: Annonce[]
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

export const favoriteApi = {
  getAll(token: string) {
    return request<FavoritesResponse>("/api/favorites", { method: "GET" }, token)
  },

  add(annonceId: string, token: string) {
    return request<FavoritesResponse>(`/api/favorites/${annonceId}`, { method: "POST" }, token)
  },

  remove(annonceId: string, token: string) {
    return request<FavoritesResponse>(`/api/favorites/${annonceId}`, { method: "DELETE" }, token)
  },
}
