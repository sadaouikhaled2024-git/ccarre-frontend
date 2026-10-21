const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export type ReportType = "annonce" | "user" | "message"

export interface ReportPayload {
  type: ReportType
  targetId: string
  reason: string
  description: string
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
  
  console.log('[REPORT API] Response status:', res.status);
  console.log('[REPORT API] Response data:', data);
  
  if (!res.ok) {
    const errorMessage = data.message || data.error || `HTTP ${res.status}`;
    console.error('[REPORT API] Error:', errorMessage);
    throw new Error(errorMessage)
  }
  return data as T
}

export const reportApi = {
  create(payload: ReportPayload, token: string) {
    console.log('[REPORT API] Sending payload:', {
      type: payload.type,
      targetId: payload.targetId,
      reason: payload.reason,
      descriptionLength: payload.description?.length,
    });
    
    return request<ReportResponse>(`/api/reports`, {
      method: "POST",
      body: JSON.stringify(payload),
    }, token)
  },

  /**
   * Create a report for an announcement
   */
  createAnnonceReport(targetId: string, reason: string, description: string, token: string) {
    return this.create({
      type: "annonce",
      targetId,
      reason,
      description,
    }, token)
  },

  /**
   * Create a report for a user
   */
  createUserReport(targetId: string, reason: string, description: string, token: string) {
    return this.create({
      type: "user",
      targetId,
      reason,
      description,
    }, token)
  },
}
