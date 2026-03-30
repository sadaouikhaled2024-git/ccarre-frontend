const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export type EchangeStatus = "EN_ATTENTE" | "ACCEPTE" | "TERMINE" | "REFUSE"

export interface Echange {
  _id: string
  utilisateurDemandeur: any
  utilisateurProprietaire: any
  annonce: any
  statut: EchangeStatus
  messageInitial?: string
   historique?: { de?: EchangeStatus | null; vers: EchangeStatus; par: any; a: string }[]
  createdAt: string
  updatedAt: string
}

export interface EchangeResponse {
  success: boolean
  message?: string
  data?: Echange | Echange[] | { ongoing: Echange[]; completed: Echange[] }
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

export const echangeApi = {
  getAll(token: string, statut?: EchangeStatus) {
    const query = statut ? `?statut=${statut}` : ""
    return request<EchangeResponse>(`/api/echanges${query}`, { method: "GET" }, token)
  },

  getHistory(token: string) {
    return request<EchangeResponse>(`/api/echanges/history`, { method: "GET" }, token)
  },

  create(annonceId: string, token: string, messageInitial?: string) {
    return request<EchangeResponse>(
      "/api/echanges",
      {
        method: "POST",
        body: JSON.stringify({ annonceId, messageInitial }),
      },
      token,
    )
  },

  accept(id: string, token: string) {
    return request<EchangeResponse>(`/api/echanges/${id}/accept`, { method: "PUT" }, token)
  },

  refuse(id: string, token: string) {
    return request<EchangeResponse>(`/api/echanges/${id}/refuse`, { method: "PUT" }, token)
  },

  complete(id: string, token: string) {
    return request<EchangeResponse>(`/api/echanges/${id}/complete`, { method: "PUT" }, token)
  },
}
