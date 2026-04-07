const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export type ReportTargetType = "USER" | "ANNONCE"

export interface ReportPayload {
  targetId: string
  targetType: ReportTargetType
  reason: string
}

export interface ReportResponse {
  success: boolean
  message?: string
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

export const reportApi = {
  create(payload: ReportPayload, token: string) {
    return request<ReportResponse>(`/api/reports`, {
      method: "POST",
      body: JSON.stringify(payload),
    }, token)
  },
}
