const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1';

interface FetchOptions extends RequestInit {
  token?: string;
}

export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    // Build detailed error message
    let errorMessage = data.message || data.error || 'An error occurred';
    
    // If there are validation details, append them
    if (data.details && Array.isArray(data.details)) {
      const fieldErrors = data.details
        .map((d: { field: string; message: string }) => `${d.field}: ${d.message}`)
        .join(', ');
      errorMessage = `${errorMessage} (${fieldErrors})`;
    }
    
    throw new Error(errorMessage);
  }
  
  return data;
}

// Auth API
export const authApi = {
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'CLIENT' | 'PROVIDER';
    roles?: ('CLIENT' | 'PROVIDER')[];
  }) => apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  login: (data: { email: string; password: string }) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  getMe: (token: string) =>
    apiFetch('/auth/me', { token }),
  
  logout: (token: string, refreshToken: string) =>
    apiFetch('/auth/logout', {
      method: 'POST',
      token,
      body: JSON.stringify({ refreshToken }),
    }),
  
  switchRole: (role: string, token: string) =>
    apiFetch('/auth/switch-role', {
      method: 'POST',
      token,
      body: JSON.stringify({ role }),
    }),
  
  addRole: (role: string, token: string) =>
    apiFetch('/auth/add-role', {
      method: 'POST',
      token,
      body: JSON.stringify({ role }),
    }),
};

// Providers API
export const providersApi = {
  search: (params: Record<string, string | number | undefined>, token?: string) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    return apiFetch(`/providers/search?${searchParams.toString()}`, { token });
  },
  
  getById: (id: string, token?: string) =>
    apiFetch(`/providers/${id}`, { token }),
  
  getPortfolio: (id: string) =>
    apiFetch(`/providers/${id}/portfolio`),
    
  createProfile: (data: Record<string, unknown>, token: string) =>
    apiFetch('/providers/profile', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    }),
    
  getMyProfiles: (token: string) =>
    apiFetch('/providers/profile/all', { token }),
    
  updateProfile: (data: Record<string, unknown>, token: string) =>
    apiFetch('/providers/profile', {
      method: 'PUT',
      token,
      body: JSON.stringify(data),
    }),
};

// Event Requests API
export const eventRequestsApi = {
  create: (data: Record<string, unknown>, token: string) =>
    apiFetch('/event-requests', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    }),
  
  getMyRequests: (token: string) =>
    apiFetch('/event-requests/my-requests', { token }),
  
  getById: (id: string, token: string) =>
    apiFetch(`/event-requests/${id}`, { token }),
  
  submit: (id: string, token: string) =>
    apiFetch(`/event-requests/${id}/submit`, {
      method: 'POST',
      token,
    }),
    
  getAvailable: (token: string) =>
    apiFetch('/event-requests/available/for-providers', { token }),
};

// Quotes API
export const quotesApi = {
  create: (data: Record<string, unknown>, token: string) =>
    apiFetch('/quotes', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    }),
  
  getMyQuotes: (token: string) =>
    apiFetch('/quotes/my', { token }),
  
  getById: (id: string, token: string) =>
    apiFetch(`/quotes/${id}`, { token }),
  
  accept: (id: string, token: string) =>
    apiFetch(`/quotes/${id}/accept`, {
      method: 'POST',
      token,
    }),
  
  reject: (id: string, token: string) =>
    apiFetch(`/quotes/${id}/reject`, {
      method: 'POST',
      token,
    }),
};

// Bookings API
export const bookingsApi = {
  getClientBookings: (token: string) =>
    apiFetch('/bookings/client', { token }),
  
  getProviderBookings: (token: string) =>
    apiFetch('/bookings/provider', { token }),
  
  getById: (id: string, token: string) =>
    apiFetch(`/bookings/${id}`, { token }),
  
  payDeposit: (id: string, paymentData: Record<string, unknown>, token: string) =>
    apiFetch(`/bookings/${id}/pay-deposit`, {
      method: 'POST',
      token,
      body: JSON.stringify(paymentData),
    }),
};

// Reviews API  
export const reviewsApi = {
  create: (data: Record<string, unknown>, token: string) =>
    apiFetch('/reviews', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    }),
  
  getProviderReviews: (providerId: string) =>
    apiFetch(`/reviews/provider/${providerId}`),
};

// Menu Items API
export const menuItemsApi = {
  getByProvider: (providerId: string) =>
    apiFetch(`/providers/${providerId}/menu-items`),
  
  create: (data: Record<string, unknown>, token: string) =>
    apiFetch('/providers/menu-items', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    }),
  
  update: (itemId: string, data: Record<string, unknown>, token: string) =>
    apiFetch(`/providers/menu-items/${itemId}`, {
      method: 'PUT',
      token,
      body: JSON.stringify(data),
    }),
  
  delete: (itemId: string, token: string) =>
    apiFetch(`/providers/menu-items/${itemId}`, {
      method: 'DELETE',
      token,
    }),
};

// Users API
export const usersApi = {
  getProfile: (token: string) =>
    apiFetch('/users/profile', { token }),
    
  updateProfile: (data: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  }) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    return apiFetch('/users/profile', {
      method: 'PUT',
      token,
      body: JSON.stringify(data),
    });
  },

  updateAvatar: (avatarUrl: string) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    return apiFetch('/users/avatar', {
      method: 'PUT',
      token,
      body: JSON.stringify({ avatarUrl }),
    });
  },

  updateBanner: (bannerUrl: string | null) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    return apiFetch('/users/banner', {
      method: 'PUT',
      token,
      body: JSON.stringify({ bannerUrl }),
    });
  },
};
