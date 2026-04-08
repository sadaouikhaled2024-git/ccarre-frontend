const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_BASE = `${API_URL}/api/admin`;

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | undefined {
  if (typeof window === 'undefined') return undefined; // For SSR
  try {
    const token = localStorage.getItem('ccarre_token');
    return token ?? undefined;
  } catch (error) {
    console.error('Error reading auth token:', error);
    return undefined;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>) || {},
  };

  // Use provided token or get from localStorage
  const finalToken = token || getAuthToken();
  if (finalToken) {
    headers['Authorization'] = `Bearer ${finalToken}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    try {
      const error = await response.json();
      console.error('API Error Response:', error);
      errorMessage = error.message || error.error || errorMessage;
    } catch (parseError) {
      console.error('Error parsing error response:', parseError);
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export interface DashboardStats {
  totalAnnonces: number;
  reportedAnnonces: number;
  highRiskAnnonces: number;
  totalUsers: number;
  bannedUsers: number;
  totalReports: number;
  openReports: number;
  urgentReports: number;
  timestamp: string;
}

export interface Annonce {
  _id: string;
  title: string;
  owner: {
    firstName: string;
    lastName: string;
    email: string;
  };
  reportCount: number;
  riskScore: number;
  isSuspicious: boolean;
  createdAt: string;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  riskScore: number;
  reportCount: number;
  isBanned: boolean;
  createdAt: string;
}

export interface Report {
  _id: string;
  type: string;
  reason: string;
  status: string;
  priority: string;
  reportedBy: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/* ════════════════════════════════════════════════════════════════════
    DASHBOARD
════════════════════════════════════════════════════════════════════ */

export const getDashboardStats = async (token?: string): Promise<DashboardStats> => {
  const finalToken = token || getAuthToken();
  
  console.log('Fetching dashboard stats...');
  console.log('Token available:', !!finalToken);
  console.log('API_BASE:', API_BASE);
  console.log('Full URL will be:', `${API_BASE}/dashboard/stats`);
  
  try {
    const response = await request<any>(
      '/dashboard/stats',
      { method: 'GET' },
      finalToken,
    );
    
    console.log('Raw response received:', response);
    console.log('Response type:', typeof response);
    console.log('Response keys:', response ? Object.keys(response) : 'null/undefined');
    
    // Handle different response structures - backend likely wraps in {data: {...}}
    let data: any;
    
    if (response?.data && typeof response.data === 'object') {
      console.log('Found response.data, using it');
      console.log('Data object:', response.data);
      data = response.data;
    } else if (response?.totalAnnonces !== undefined) {
      // Response is already the stats object
      console.log('Response is already stats object');
      data = response;
    } else if (response?.success === false) {
      throw new Error(response.message || 'API returned success: false');
    } else {
      console.warn('Unexpected response structure:', response);
      throw new Error('Invalid response structure - missing expected fields');
    }
    
    console.log('Final data to return:', data);
    console.log('Final data properties:', {
      totalAnnonces: data?.totalAnnonces,
      totalUsers: data?.totalUsers,
      openReports: data?.openReports,
    });
    
    // Validate that we have the expected fields
    if (!data || typeof data !== 'object') {
      throw new Error('Response data is not a valid object');
    }
    
    return data as DashboardStats;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

/* ════════════════════════════════════════════════════════════════════
    ANNONCES
════════════════════════════════════════════════════════════════════ */

export const getAnnonces = async (filter = 'all', page = 1, limit = 20, token?: string) => {
  const finalToken = token || getAuthToken();
  const params = new URLSearchParams({ filter, page: String(page), limit: String(limit) });
  const response = await request<ApiResponse<Annonce[]>>(`/annonces?${params.toString()}`, { method: 'GET' }, finalToken);
  return response as ApiResponse<Annonce[]>;
};

export const getAnnonceDetail = async (id: string, token?: string) => {
  const finalToken = token || getAuthToken();
  const response = await request<ApiResponse<any>>(`/annonces/${id}`, { method: 'GET' }, finalToken);
  return (response as ApiResponse<any>).data;
};

export const deleteAnnonce = async (id: string, reason: string, token?: string) => {
  const finalToken = token || getAuthToken();
  const response = await request<ApiResponse<Annonce>>(`/annonces/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  }, finalToken);
  return response as ApiResponse<Annonce>;
};

export const updateAnnonceRiskScore = async (
  id: string,
  riskScore: number,
  reasons: string[],
  token?: string,
) => {
  const finalToken = token || getAuthToken();
  const response = await request<ApiResponse<Annonce>>(`/annonces/${id}/risk-score`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ riskScore, reasons }),
  }, finalToken);
  return response as ApiResponse<Annonce>;
};

/* ════════════════════════════════════════════════════════════════════
    UTILISATEURS
════════════════════════════════════════════════════════════════════ */

export const getUsers = async (filter = 'all', page = 1, limit = 20, token?: string) => {
  const finalToken = token || getAuthToken();
  const params = new URLSearchParams({ filter, page: String(page), limit: String(limit) });
  const response = await request<ApiResponse<User[]>>(`/users?${params.toString()}`, { method: 'GET' }, finalToken);
  return response as ApiResponse<User[]>;
};

export const banUser = async (userId: string, reason: string, token?: string) => {
  const finalToken = token || getAuthToken();
  const response = await request<ApiResponse<User>>(`/users/${userId}/ban`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  }, finalToken);
  return response as ApiResponse<User>;
};

export const unbanUser = async (userId: string, token?: string) => {
  const finalToken = token || getAuthToken();
  const response = await request<ApiResponse<User>>(`/users/${userId}/unban`, { method: 'POST' }, finalToken);
  return response as ApiResponse<User>;
};

/* ════════════════════════════════════════════════════════════════════
    SIGNALEMENTS
════════════════════════════════════════════════════════════════════ */

export const getReports = async (status = 'all', priority = 'all', page = 1, limit = 20, token?: string) => {
  const finalToken = token || getAuthToken();
  const params = new URLSearchParams({ status, priority, page: String(page), limit: String(limit) });
  const response = await request<ApiResponse<Report[]>>(`/reports?${params.toString()}`, { method: 'GET' }, finalToken);
  return response as ApiResponse<Report[]>;
};

export const updateReportStatus = async (
  reportId: string,
  status: string,
  priority?: string,
  adminNotes?: string,
  token?: string,
) => {
  const finalToken = token || getAuthToken();
  const body: any = { status };
  
  if (priority && priority !== 'undefined') {
    body.priority = priority;
  }
  if (adminNotes && adminNotes !== 'undefined') {
    body.adminNotes = adminNotes;
  }
  
  const response = await request<ApiResponse<Report>>(`/reports/${reportId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }, finalToken);
  return response as ApiResponse<Report>;
};

export const deleteReport = async (reportId: string, token?: string) => {
  const finalToken = token || getAuthToken();
  const response = await request<ApiResponse<any>>(`/reports/${reportId}`, { method: 'DELETE' }, finalToken);
  return response as ApiResponse<any>;
};

/* ════════════════════════════════════════════════════════════════════
    MESSAGES
════════════════════════════════════════════════════════════════════ */

export const getMessages = async (page = 1, limit = 20, token?: string) => {
  const finalToken = token || getAuthToken();
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  const response = await request<ApiResponse<any>>(`/messages?${params.toString()}`, { method: 'GET' }, finalToken);
  return response as ApiResponse<any>;
};

export const deleteMessage = async (messageId: string, reason: string, token?: string) => {
  const finalToken = token || getAuthToken();
  const response = await request<ApiResponse<any>>(`/messages/${messageId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  }, finalToken);
  return response as ApiResponse<any>;
};

/* ════════════════════════════════════════════════════════════════════
    BLOCAGES
════════════════════════════════════════════════════════════════════ */

export const getBlockedUsers = async (page = 1, limit = 20, token?: string) => {
  const finalToken = token || getAuthToken();
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  const response = await request<ApiResponse<any>>(`/blocked-users?${params.toString()}`, { method: 'GET' }, finalToken);
  return response as ApiResponse<any>;
};

export const unblockUser = async (blockId: string, token?: string) => {
  const finalToken = token || getAuthToken();
  const response = await request<ApiResponse<any>>(`/blocked-users/${blockId}`, { method: 'DELETE' }, finalToken);
  return response as ApiResponse<any>;
};

/* ════════════════════════════════════════════════════════════════════
    ANALYTICS
════════════════════════════════════════════════════════════════════ */

export const getAnalytics = async (period = '7d', token?: string) => {
  const finalToken = token || getAuthToken();
  try {
    const params = new URLSearchParams({ period });
    console.log(`Fetching analytics with period: ${period}`);
    const response = await request<ApiResponse<any>>(`/analytics?${params.toString()}`, { method: 'GET' }, finalToken);
    console.log('Analytics response:', response);
    
    if (response && response.data) {
      return response.data;
    }
    
    // If no data structure, return response as-is
    return response;
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    throw error;
  }
};
