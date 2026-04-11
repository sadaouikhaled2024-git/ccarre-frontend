const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export interface Campus {
  _id: string
  name: string
  city: string
}

export interface UserProfile {
  _id: string
  firstName: string
  lastName: string
  email: string
  address?: string
  campus?: string | Campus
  profilePhoto?: string
  phone?: string
  bio?: string
  role?: string
  isBanned?: boolean
  createdAt: string
}

export interface PublicProfile {
  _id: string
  firstName: string
  lastName: string
  profilePhoto?: string
  bio?: string
  campus?: Campus | string
  joinedAt?: string
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

export const profileApi = {
  // Get current user's profile
  getProfile(token?: string) {
    return request<{ success: boolean; data: UserProfile }>("/api/profile", {}, token)
  },

  // Update profile
  updateProfile(
    updates: {
      firstName?: string
      lastName?: string
      address?: string
      campus?: string
    },
    token?: string,
  ) {
    return request<{ success: boolean; data: UserProfile }>("/api/profile", {
      method: "PUT",
      body: JSON.stringify(updates),
    }, token)
  },

  // Upload profile photo
  uploadPhoto(file: File, token?: string) {
    const formData = new FormData()
    formData.append("file", file)

    const headers: Record<string, string> = {}
    const finalToken = token || getAuthToken()
    if (finalToken) {
      headers["Authorization"] = `Bearer ${finalToken}`
    }

    return fetch(`${API_URL}/api/profile/photo`, {
      method: "POST",
      headers,
      body: formData,
    }).then((res) => {
      if (!res.ok) {
        throw new Error(`Upload failed: ${res.statusText}`)
      }
      return res.json() as Promise<{ success: boolean; data: UserProfile }>
    })
  },

  // Delete profile photo
  deletePhoto(token?: string) {
    return request<{ success: boolean; data: UserProfile }>("/api/profile/photo", {
      method: "DELETE",
    }, token)
  },

  // Get public profile
  getPublicProfile(userId: string, token?: string) {
    return request<{ success: boolean; data: PublicProfile }>(`/api/profile/public/${userId}`, {}, token)
  },

  // Get all campuses
  getCampuses(token?: string) {
    return request<{ success: boolean; data: Campus[] }>("/api/campuses", {}, token)
  },
}
