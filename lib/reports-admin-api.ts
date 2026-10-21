const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export type ReportStatus = "OUVERT" | "EN_COURS" | "RESOLU"
export type ReportType = "annonce" | "user" | "message"
export type ReportReason = "arnaque" | "prix_suspect" | "spam" | "contenu_offensant" | "autre"
export type ReportPriority = "low" | "normal" | "high" | "urgent"
export type AdminAction = "BAN_USER" | "REMOVE_ANNONCE" | "WARN_USER" | "NONE"

export interface ReportedBy {
  _id: string
  firstName: string
  lastName: string
  email: string
}

export interface Report {
  _id: string
  type: ReportType
  targetId: string
  reportedBy: ReportedBy
  reason: ReportReason
  description: string
  status: ReportStatus
  priority: ReportPriority
  riskScoreDelta?: number
  createdAt: string
  updatedAt?: string
  adminNotes?: string
  targetData?: {
    // For annonces
    title?: string
    description?: string
    images?: string[]
    category?: string
    price?: number
    status?: string
    owner?: {
      firstName: string
      lastName: string
      email: string
    }
    // For users
    firstName?: string
    lastName?: string
    email?: string
    riskScore?: number
    reportCount?: number
    isBanned?: boolean
    createdAt?: string
    // For messages
    contenu?: string
    timestamp?: string
    expediteur?: {
      firstName: string
      lastName: string
      email: string
    }
  }
}

export interface ReportListResponse {
  success: boolean
  data: Report[]
  pagination: {
    total: number
    page: number
    pages: number
    limit: number
  }
}

export interface StatsResponse {
  success: boolean
  data: {
    summary: {
      total: number
      open: number
      inProgress: number
      resolved: number
      rejected: number
    }
    breakdowns: {
      byStatus: Array<{ status: ReportStatus; count: number }>
      byType: Array<{ type: ReportType; count: number }>
      byReason: Array<{ reason: ReportReason; count: number }>
      byPriority: Array<{ priority: ReportPriority; count: number }>
    }
  }
}

export interface TopReportedResponse {
  success: boolean
  data: Array<{
    _id: string
    reportCount: number
    reasons: ReportReason[]
    lastReportedAt: string
  }>
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

export const reportsAdminApi = {
  // Get reports with filters
  getList(filters?: {
    status?: ReportStatus
    type?: ReportType
    priority?: ReportPriority
    reason?: ReportReason
    page?: number
    limit?: number
  }, token?: string) {
    const params = new URLSearchParams()
    if (filters?.status) params.append("status", filters.status)
    if (filters?.type) params.append("type", filters.type)
    if (filters?.priority) params.append("priority", filters.priority)
    if (filters?.reason) params.append("reason", filters.reason)
    if (filters?.page) params.append("page", String(filters.page))
    if (filters?.limit) params.append("limit", String(filters.limit))

    const queryString = params.toString()
    return request<ReportListResponse>(`/api/reports/admin/list${queryString ? `?${queryString}` : ""}`, {}, token)
  },

  // Get statistics
  getStats(token?: string) {
    return request<StatsResponse>(`/api/reports/admin/stats`, {}, token)
  },

  // Get top reported content
  getTopReported(type?: ReportType, limit: number = 10, token?: string) {
    const params = new URLSearchParams()
    if (type) params.append("type", type)
    params.append("limit", String(limit))

    const queryString = params.toString()
    return request<TopReportedResponse>(`/api/reports/admin/top-reported?${queryString}`, {}, token)
  },

  // Search reports
  search(filters?: {
    q?: string
    id?: string
    type?: string
    status?: string
    page?: number
    limit?: number
  }, token?: string) {
    const params = new URLSearchParams()
    if (filters?.q) params.append("q", filters.q)
    if (filters?.id) params.append("id", filters.id)
    if (filters?.type) params.append("type", filters.type)
    if (filters?.status) params.append("status", filters.status)
    if (filters?.page) params.append("page", String(filters.page))
    if (filters?.limit) params.append("limit", String(filters.limit))

    const queryString = params.toString()
    return request<ReportListResponse>(`/api/reports/admin/search${queryString ? `?${queryString}` : ""}`, {}, token)
  },

  // Update report status
  updateStatus(id: string, status: ReportStatus, adminNotes?: string, token?: string) {
    return request<{ success: boolean; data: Report }>(`/api/reports/admin/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, adminNotes }),
    }, token)
  },

  // Resolve report with action
  resolve(id: string, status: ReportStatus, action: AdminAction, adminNotes?: string, token?: string) {
    return request<{ success: boolean; data: Report; actionTaken: any }>(
      `/api/reports/admin/${id}/resolve`,
      {
        method: "PUT",
        body: JSON.stringify({ status, action, adminNotes }),
      },
      token,
    )
  },

  // Bulk update reports
  bulkUpdate(reportIds: string[], status: ReportStatus, action: AdminAction, adminNotes?: string, token?: string) {
    return request<{ success: boolean; data: Array<{ reportId: string; success: boolean; data: Report }> }>(
      `/api/reports/admin/bulk-update`,
      {
        method: "POST",
        body: JSON.stringify({ reportIds, status, action, adminNotes }),
      },
      token,
    )
  },

  // Delete report
  delete(id: string, token?: string) {
    return request<{ success: boolean; data: Report }>(`/api/reports/admin/${id}`, {
      method: "DELETE",
    }, token)
  },
}
