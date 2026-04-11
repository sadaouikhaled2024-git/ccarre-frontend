const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export interface UserStats {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: string
  isBanned: boolean
  reportCount: number
  riskScore?: number
  createdAt: string
  campus?: string
}

export interface UsersPaginatedResponse {
  success: boolean
  data: {
    users: UserStats[]
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

export const usersAdminApi = {
  // Get paginated list of users
  async getList(
    filters?: {
      search?: string
      role?: string
      isBanned?: boolean
      sortBy?: string
    },
    page = 1,
    limit = 10,
    token?: string
  ) {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.role && { role: filters.role }),
      ...(filters?.isBanned !== undefined && { isBanned: String(filters.isBanned) }),
      ...(filters?.sortBy && { sortBy: filters.sortBy }),
    })

    return request<UsersPaginatedResponse>(
      `/api/admin/users?${params.toString()}`,
      {},
      token
    )
  },

  // Get user by ID
  async getById(userId: string, token?: string) {
    return request<{ success: boolean; data: UserStats }>(
      `/api/admin/users/${userId}`,
      {},
      token
    )
  },

  // Ban user
  async banUser(userId: string, reason?: string, token?: string) {
    return request<{ success: boolean; data: UserStats }>(
      `/api/admin/users/${userId}/ban`,
      {
        method: "POST",
        body: JSON.stringify({ reason }),
      },
      token
    )
  },

  // Unban user
  async unbanUser(userId: string, token?: string) {
    return request<{ success: boolean; data: UserStats }>(
      `/api/admin/users/${userId}/unban`,
      {
        method: "POST",
      },
      token
    )
  },

  // Get user statistics
  async getStats(token?: string) {
    return request<{
      success: boolean
      data: {
        total: number
        banned: number
        reported: number
        avgReportCount: number
      }
    }>("/api/admin/users/stats", {}, token)
  },
}
