const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export type EchangeStatus = 
  | "discussion"
  | "rendez_vous_propose"
  | "rendez_vous_accepte"
  | "en_attente_confirmations"
  | "valide"
  | "annule"
  | "expire"
  | "litige"

export interface RendezVous {
  proposePar?: string
  acceptePar?: string
  lieu: string
  dateProposee: string
  dateAcceptee?: string
  raison?: string
}

export interface Confirmation {
  confirme: boolean
  confirmePar?: string
  confirmeA?: string
  raison?: string
}

export interface Echange {
  _id: string
  utilisateurDemandeur: any
  utilisateurProprietaire: any
  annonce: any
  statut: EchangeStatus
  messageInitial?: string
  historique?: {
    ancienStatut?: EchangeStatus | null
    nouveauStatut: EchangeStatus
    par: any
    raison?: string
    a: string
  }[]
  rendezVous?: RendezVous | null
  confirmations?: { [userId: string]: Confirmation }
  delaiConfirmationExpires?: string
  createdAt: string
  updatedAt: string
}

export interface EchangeResponse {
  success: boolean
  message?: string
  data?: {
    echange?: Echange
    statut?: string
    confirmationsCount?: number
    confirmationsNeeded?: number
    details?: { [userId: string]: Confirmation }
    expiresAt?: string
  } | Echange | Echange[] | { ongoing: Echange[]; completed: Echange[] }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  token: string
): Promise<T> {
  console.log("🔍 Token avant envoi:", token)
  console.log("📏 Longueur du token:", token?.length)
  console.log("🔤 Premiers 50 chars:", token?.substring(0, 50))

  const authHeader = `Bearer ${token}`
  console.log("📤 Header Authorization complet:", authHeader)

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: authHeader,
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

  getById(id: string, token: string) {
    return request<EchangeResponse>(`/api/echanges/${id}`, { method: "GET" }, token)
  },

  getHistory(token: string) {
    return request<EchangeResponse>(`/api/echanges/history`, { method: "GET" }, token)
  },

  create(utilisateurProprietaire: string, annonceId: string, token: string, messageInitial?: string) {
    return request<EchangeResponse>(
      "/api/echanges",
      {
        method: "POST",
        body: JSON.stringify({
          // Backend expected keys
          annonceId,
          utilisateurProprietaire,
          messageInitial,
          // Compatibility aliases
          annonce: annonceId,
          proprietaireId: utilisateurProprietaire,
        }),
      },
      token,
    )
  },

  proposeRendezVous(echangeId: string, token: string, lieu: string, dateProposee: string, raison?: string) {
    return request<EchangeResponse>(
      `/api/echanges/${echangeId}/proposition-rendez-vous`,
      {
        method: "POST",
        body: JSON.stringify({ lieu, dateProposee, raison }),
      },
      token,
    )
  },

  accepterRendezVous(echangeId: string, token: string, dateAcceptee?: string) {
    return request<EchangeResponse>(
      `/api/echanges/${echangeId}/accepter-rendez-vous`,
      {
        method: "PATCH",
        body: JSON.stringify({ dateAcceptee }),
      },
      token,
    )
  },

  refuserRendezVous(echangeId: string, token: string, raison?: string) {
    return request<EchangeResponse>(
      `/api/echanges/${echangeId}/refuser-rendez-vous`,
      {
        method: "PATCH",
        body: JSON.stringify({ raison }),
      },
      token,
    )
  },

  confirmerRencontre(echangeId: string, token: string, raison?: string) {
    return request<EchangeResponse>(
      `/api/echanges/${echangeId}/confirmer-rencontre`,
      {
        method: "PATCH",
        body: JSON.stringify({ raison }),
      },
      token,
    )
  },

  getStatusConfirmations(echangeId: string, token: string) {
    return request<EchangeResponse>(
      `/api/echanges/${echangeId}/status-confirmations`,
      { method: "GET" },
      token,
    )
  },

  // Legacy methods for backward compatibility
  accept(id: string, token: string) {
    return request<EchangeResponse>(`/api/echanges/${id}/accept`, { method: "PUT" }, token)
  },

  refuse(id: string, token: string) {
    return request<EchangeResponse>(`/api/echanges/${id}/refuse`, { method: "PUT" }, token)
  },

  complete(id: string, token: string) {
    return request<EchangeResponse>(`/api/echanges/${id}/complete`, { method: "PUT" }, token)
  },

  completeWithDetails(id: string, lieuEchange: string, prixFinal?: number, token?: string) {
    return request<EchangeResponse>(
      `/api/echanges/${id}/complete`,
      {
        method: "PUT",
        body: JSON.stringify({ lieuEchange, prixFinal }),
      },
      token || "",
    )
  },

  cancel(id: string, token: string) {
    return request<EchangeResponse>(`/api/echanges/${id}/cancel`, { method: "PUT" }, token)
  },
}
