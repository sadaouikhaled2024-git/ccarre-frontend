const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export interface AnnonceImage {
  url: string
}

export interface AnnonceOwner {
  _id: string
  firstName: string
  lastName: string
  email: string
}

export interface Annonce {
  _id: string
  title: string
  description: string
  type: "vente" | "echange" | "pret" | "demandePret"
  category: string
  price?: number
  exchangeFor?: string
  exchangeImage?: string
  borrowPeriod?: string
  images: string[]
  owner: AnnonceOwner
  status: "disponible" | "reserve" | "vendu"
  createdAt: string
  updatedAt: string
}

export interface AnnonceResponse {
  success: boolean
  message: string
  data?: {
    annonce: Annonce
    annonces?: Annonce[]
  }
  count?: number
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || `API Error: ${res.status}`)
  }

  return res.json()
}

export const annonceApi = {
  // Créer une annonce
  async create(formData: FormData, token: string): Promise<AnnonceResponse> {
    const res = await fetch(`${API_URL}/api/annonces`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new Error(error.message || "Erreur lors de la création de l'annonce")
    }

    return res.json()
  },

  // Récupérer toutes les annonces avec filtres optionnels
  async getAll(filters?: Record<string, string>, token?: string): Promise<AnnonceResponse> {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
    }

    const query = params.toString() ? `?${params.toString()}` : ""
    return request<AnnonceResponse>(`/api/annonces${query}`, {}, token)
  },

  // Récupérer une annonce par ID
  async getById(id: string, token?: string): Promise<AnnonceResponse> {
    return request<AnnonceResponse>(`/api/annonces/${id}`, {}, token)
  },

  // Modifier une annonce
  async update(id: string, formData: FormData, token: string): Promise<AnnonceResponse> {
    const res = await fetch(`${API_URL}/api/annonces/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new Error(error.message || "Erreur lors de la modification")
    }

    return res.json()
  },

  // Supprimer une annonce
  async delete(id: string, token: string): Promise<AnnonceResponse> {
    return request<AnnonceResponse>(
      `/api/annonces/${id}`,
      {
        method: "DELETE",
      },
      token
    )
  },
}
