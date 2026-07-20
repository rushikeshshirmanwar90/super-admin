import axios from 'axios';

// Base API URL - Update this to your real-estate-apis URL
const API_BASE_URL = process.env.NEXT_PUBLIC_DOMAIN || 'https://xsite.tech';

// Bearer Token for API Authentication (token only, without "Bearer " prefix)
const API_TOKEN = process.env.NEXT_PUBLIC_BEARER_TOKEN;

// Construct full bearer token with "Bearer " prefix
const BEARER_TOKEN = `Bearer ${API_TOKEN}`;

console.log('🌐 API Base URL:', API_BASE_URL);
console.log('🔐 Bearer Token configured:', API_TOKEN ? 'Yes' : 'No');
console.log('🔐 Token (first 20 chars):', API_TOKEN?.substring(0, 20) + '...');

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': BEARER_TOKEN, // ✅ Add bearer token to all requests
  },
  timeout: 30000, // 30 seconds timeout
  withCredentials: false, // Set to true if you need cookies
});

// Add request interceptor for debugging and token injection
api.interceptors.request.use(
  (config) => {
    // ✅ Ensure bearer token is always present in requests
    if (!config.headers['Authorization']) {
      config.headers['Authorization'] = BEARER_TOKEN;
    }
    
    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      hasAuth: !!config.headers['Authorization'],
      authHeader: String(config.headers['Authorization']).substring(0, 30) + '...',
    });
    
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
    } else if (error.response?.status === 401) {
      error.userMessage = 'Unauthorized. Please check your authentication token.';
    } else if (error.response?.status === 403) {
      error.userMessage = 'Forbidden. You do not have permission to access this resource.';
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

// Client API (uses /api/clients - plural)
export const clientAPI = {
  getAll: () => api.get('/api/clients'),
  getById: (id: string) => api.get(`/api/clients?id=${id}`),
  create: (data: any) => api.post('/api/clients', data),
  update: (id: string, data: any) => api.put(`/api/clients?id=${id}`, data),
  delete: (id: string) => api.delete(`/api/clients?email=${id}`), // Note: delete uses email parameter
};

// Admin API (uses /api/admin - route group (users) is not in URL)
export const adminAPI = {
  getAll: () => api.get('/api/admin'),
  getById: (id: string) => api.get(`/api/admin?id=${id}`),
  create: (data: any) => api.post('/api/admin', data),
  update: (id: string, data: any) => api.put(`/api/admin?id=${id}`, data),
  delete: (id: string) => api.delete(`/api/admin?id=${id}`),
  getByClientId: (clientId: string) => {
    // Since API doesn't support clientId filter, get all and filter on frontend
    return api.get('/api/admin').then(response => {
      const allAdmins = response.data.data || []
      const filteredAdmins = Array.isArray(allAdmins) 
        ? allAdmins.filter((admin: any) => admin.clientId === clientId)
        : []
      return {
        ...response,
        data: {
          ...response.data,
          data: filteredAdmins
        }
      }
    })
  },
};

// Stats API
export const statsAPI = {
  getDashboard: async () => {
    try {
      const [clientsResponse, adminsResponse] = await Promise.all([
        clientAPI.getAll(),
        adminAPI.getAll().catch(() => ({ data: { success: true, data: [] } })) // Handle if admin API doesn't exist yet
      ]);
      
      console.log('📊 Dashboard API Responses:', {
        clientsResponse: clientsResponse.data,
        adminsResponse: adminsResponse.data,
      });
      
      // Handle different response structures
      // API might return: { success: true, data: [...] } or { success: true, data: { clients: [...] } }
      let clients = [];
      let admins = [];
      
      // Extract clients data
      if (clientsResponse.data.success) {
        if (Array.isArray(clientsResponse.data.data)) {
          clients = clientsResponse.data.data;
        } else if (clientsResponse.data.data && Array.isArray(clientsResponse.data.data.clients)) {
          clients = clientsResponse.data.data.clients;
        } else if (clientsResponse.data.data && typeof clientsResponse.data.data === 'object') {
          // If data is an object, try to extract array from it
          clients = Object.values(clientsResponse.data.data).filter(item => Array.isArray(item))[0] || [];
        }
      }
      
      // Extract admins data
      if (adminsResponse.data.success) {
        if (Array.isArray(adminsResponse.data.data)) {
          admins = adminsResponse.data.data;
        } else if (adminsResponse.data.data && Array.isArray(adminsResponse.data.data.admins)) {
          admins = adminsResponse.data.data.admins;
        } else if (adminsResponse.data.data && typeof adminsResponse.data.data === 'object') {
          // If data is an object, try to extract array from it
          admins = Object.values(adminsResponse.data.data).filter(item => Array.isArray(item))[0] || [];
        }
      }
      
      console.log('📊 Extracted data:', {
        clientsCount: clients.length,
        adminsCount: admins.length,
        clientsSample: clients[0],
        adminsSample: admins[0],
      });
      
      // Ensure clients and admins are arrays
      if (!Array.isArray(clients)) {
        console.warn('⚠️ Clients is not an array:', typeof clients, clients);
        clients = [];
      }
      
      if (!Array.isArray(admins)) {
        console.warn('⚠️ Admins is not an array:', typeof admins, admins);
        admins = [];
      }
      
      return {
        totalClients: clients.length || 0,
        activeClients: clients.filter((c: any) => c.license !== 0)?.length || 0,
        expiredLicenses: clients.filter((c: any) => c.license === 0)?.length || 0,
        totalAdmins: admins.length || 0,
      };
    } catch (error) {
      console.error('❌ Error in getDashboard:', error);
      // Return default values on error
      return {
        totalClients: 0,
        activeClients: 0,
        expiredLicenses: 0,
        totalAdmins: 0,
      };
    }
  },
};
