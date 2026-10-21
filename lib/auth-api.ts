const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export interface RegisterPayload {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface ConfirmPayload {
  email: string
  code: string
}

export interface ResendConfirmationPayload {
  email: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface AuthUser {
  _id: string
  firstName: string
  lastName: string
  email: string
  isVerified?: boolean
  role?: 'user' | 'admin'
  isBanned?: boolean
  createdAt?: string
  updatedAt?: string
  [key: string]: unknown
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    user: AuthUser
    token: string
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || data.error || "Une erreur est survenue.")
  }

  return data as T
}

export const authApi = {
  register(payload: RegisterPayload) {
    return request<{ message: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  confirm(payload: ConfirmPayload) {
    return request<{ message: string; token?: string }>("/api/auth/confirm", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  resendConfirmation(payload: ResendConfirmationPayload) {
    return request<{ message: string }>("/api/auth/resend-confirmation", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  login(payload: LoginPayload) {
    return request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  getMe(token: string) {
    return request<{ success: boolean; data: { user: AuthUser } }>("/api/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.data?.user)
  },

  changePassword(payload: ChangePasswordPayload, token: string) {
    return request<{ success: boolean; message: string }>("/api/auth/change-password", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
  },
}
