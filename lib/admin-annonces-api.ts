const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export interface AnnonceStats {
  _id: string
  title: string
  status: string
  category: string
  price: number
  reportCount: number
  riskScore?: number
  creator: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  createdAt: string
}

export interface AnnoncesPaginatedResponse {
  success: boolean
  data: {
    annonces: AnnonceStats[]
    total: number
    page: number
    limit: number
  }
}

function getAuthToken(): string | undefined {
  if (typeof window === "undefined") return undefined
  try {
    return localStorage.getItem("ccarre_token") ?? undefined
  } catch (error) {
    console.error("Error reading auth token:", error)
    return undefined
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>) || {},
  }

  const finalToken = token || getAuthToken()
  if (finalToken) {
    headers["Authorization"] = `Bearer ${finalToken}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`
    try {
      const error = await response.json()
      errorMessage = error.message || error.error || errorMessage
    } catch (parseError) {
      // Silent
    }
    throw new Error(errorMessage)
  }

  return response.json()
}

export const annoncesAdminApi = {
  // Get paginated list of announcements
  async getList(
    filters?: {
      search?: string
      status?: string
      category?: string
      sortBy?: string
      hasReports?: boolean
    },
    page = 1,
    limit = 10,
    token?: string
  ) {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.category && { category: filters.category }),
      ...(filters?.sortBy && { sortBy: filters.sortBy }),
      ...(filters?.hasReports !== undefined && { hasReports: String(filters.hasReports) }),
    })

    return request<AnnoncesPaginatedResponse>(
      `/api/admin/annonces?${params.toString()}`,
      {},
      token
    )
  },

  // Get announcement by ID
  async getById(annonceId: string, token?: string) {
    return request<{ success: boolean; data: AnnonceStats }>(
      `/api/admin/annonces/${annonceId}`,
      {},
      token
    )
  },

  // Update announcement status
  async updateStatus(annonceId: string, status: string, token?: string) {
    return request<{ success: boolean; data: AnnonceStats }>(
      `/api/admin/annonces/${annonceId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      },
      token
    )
  },

  // Delete announcement
  async delete(annonceId: string, reason?: string, token?: string) {
    return request<{ success: boolean }>(
      `/api/admin/annonces/${annonceId}`,
      {
        method: "DELETE",
        body: JSON.stringify({ reason }),
      },
      token
    )
  },

  // Get announcement statistics
  async getStats(token?: string) {
    return request<{
      success: boolean
      data: {
        total: number
        disponible: number
        vendu: number
        reported: number
        avgReportCount: number
      }
    }>("/api/admin/annonces/stats", {}, token)
  },
}
