import axios from 'axios';

// Base API URL - Update this to your real-estate-apis URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://xsite.tech';

console.log('🌐 API Base URL:', API_BASE_URL);

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
  withCredentials: false, // Set to true if you need cookies
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle API response format
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    // The API returns { success: true, data: ... }
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      message: error.message,
      code: error.code,
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    
    // Provide user-friendly error messages
    if (error.code === 'ERR_NETWORK') {
      error.userMessage = 'Cannot connect to server. Please check your internet connection or try again later.';
    } else if (error.code === 'ECONNABORTED') {
      error.userMessage = 'Request timeout. Please try again.';
    } else if (error.response?.status === 404) {
      error.userMessage = 'Resource not found.';
    } else if (error.response?.status === 500) {
      error.userMessage = 'Server error. Please try again later.';
    } else {
      error.userMessage = error.response?.data?.message || 'An error occurred. Please try again.';
    }
    
    return Promise.reject(error);
  }
);

// Client API
export const clientAPI = {
  getAll: () => api.get('/api/client'),
  getById: (id: string) => api.get(`/api/client?id=${id}`),
  create: (data: any) => api.post('/api/client', data),
  update: (id: string, data: any) => api.put(`/api/client?id=${id}`, data),
  delete: (id: string) => api.delete(`/api/client?id=${id}`),
};

// Admin API
export const adminAPI = {
  getAll: () => api.get('/api/admin'),
  getById: (id: string) => api.get(`/api/admin?id=${id}`),
  create: (data: any) => api.post('/api/admin', data),
  update: (id: string, data: any) => api.put(`/api/admin?id=${id}`, data),
  delete: (id: string) => api.delete(`/api/admin?id=${id}`),
  getByClientId: (clientId: string) => api.get(`/api/admin?clientId=${clientId}`),
};

// Stats API
export const statsAPI = {
  getDashboard: async () => {
    const [clientsResponse, adminsResponse] = await Promise.all([
      clientAPI.getAll(),
      adminAPI.getAll().catch(() => ({ data: { data: [] } })) // Handle if admin API doesn't exist yet
    ]);
    
    const clients = clientsResponse.data.data || [];
    const admins = adminsResponse.data.data || [];
    
    return {
      totalClients: clients.length || 0,
      activeClients: clients.filter((c: any) => c.isLicenseActive)?.length || 0,
      expiredLicenses: clients.filter((c: any) => !c.isLicenseActive)?.length || 0,
      totalAdmins: admins.length || 0,
    };
  },
};
