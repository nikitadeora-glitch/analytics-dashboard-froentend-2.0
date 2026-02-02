// src/api/api.js
import axios from 'axios';
import { getStoredUtms } from '../utils/utm';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Debug logging
console.log('🔧 API Configuration:');
console.log('baseURL:', import.meta.env.VITE_API_URL);
console.log('Environment mode:', import.meta.env.MODE);

// Token management
const getToken = () => localStorage.getItem('auth_token');
const setToken = (token) => {
  if (token) {
    localStorage.setItem('auth_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('auth_token');
    delete api.defaults.headers.common['Authorization'];
  }
};
const removeToken = () => {
  localStorage.removeItem('auth_token');
  delete api.defaults.headers.common['Authorization'];
};

export { getToken, setToken, removeToken };

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add UTM data to auth/lead endpoints
    const UTM_ENDPOINTS = ['/login', '/signup', '/forgot-password', '/google', '/lead/submit'];
    const url = config.url || '';
    const shouldAttach = UTM_ENDPOINTS.some((p) => url.includes(p));

    if (shouldAttach && config.method?.toLowerCase() !== 'get') {
      const utms = getStoredUtms();
      config.data = {
        ...(config.data || {}),
        utm: utms,
      };
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('🔐 401 Unauthorized - Checking token expiration...');
      
      const token = getToken();
      if (token) {
        try {
          // Check if token is expired
          const payload = JSON.parse(atob(token.split('.')[1]))
          const now = Date.now() / 1000
          
          if (payload.exp < now) {
            console.log('❌ Token expired - removing and redirecting to login');
            removeToken();
            // Only redirect if we're not already on login page
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          } else {
            console.log('⚠️ Token valid but got 401 - possible server issue');
            // Token is valid but server returned 401, might be server restart
            // Try once more after a short delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            return api(originalRequest);
          }
        } catch (decodeError) {
          console.error('❌ Failed to decode token:', decodeError);
          removeToken();
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      } else {
        console.log('🔐 No token found - redirecting to login');
        // Only redirect if we're not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// API Endpoints
export const authAPI = {
  login: (credentials) => api.post('/login', credentials),
  register: (userData) => api.post('/signup', userData),
  forgotPassword: (data) => api.post('/forgot-password', data),
  googleLogin: (data) => api.post("/google", data),
  resetPassword: (data) => api.post('/reset-password', data),
  verifyResetToken: (token) => api.get(`/verify-reset-token?token=${token}`),
  getMe: () => api.get('/me'),
  logout: () => api.post('/logout'),
};

export const visitorsAPI = {
  getActivity: (projectId, limit = 1000) => 
    api.get(`/visitors/${projectId}/activity?limit=${limit}`),
  getActivityView: (projectId, limit = null, startDate = null, endDate = null) => {
    let url = `/visitors/${projectId}/activity-view`
    const params = []
    
    if (startDate && endDate) {
      params.push(`start_date=${encodeURIComponent(startDate)}`)
      params.push(`end_date=${encodeURIComponent(endDate)}`)
    }
    
    if (limit !== null) {
      params.push(`limit=${limit}`)
    }
    
    if (params.length > 0) {
      url += `?${params.join('&')}`
    }
    
    console.log('🔍 VisitorsAPI - Making request to:', url)
    return api.get(url)
  },
  getPath: (projectId, visitorId) => 
    api.get(`/visitors/${projectId}/path/${visitorId}`),
  getMap: (projectId) => 
    api.get(`/visitors/${projectId}/map`),
  getMapView: (projectId, days = 30) => 
    api.get(`/visitors/${projectId}/map-view?days=${days}`),
  getVisitorsByLocation: (projectId, lat, lng, days = 30) => 
    api.get(`/visitors/${projectId}/visitors-at-location`, { params: { lat, lng, days } }),
  getAllSessions: (projectId, visitorId, startDate = null, endDate = null) => {
    let url = `/visitors/${projectId}/visitor-sessions/${visitorId}`
    const params = []
    
    if (startDate && endDate) {
      params.push(`start_date=${encodeURIComponent(startDate)}`)
      params.push(`end_date=${encodeURIComponent(endDate)}`)
    }
    
    if (params.length > 0) {
      url += `?${params.join('&')}`
    }
    
    console.log('🔍 VisitorsAPI - Getting visitor sessions:', url)
    return api.get(url)
  },
  getVisitorDetail: (projectId, visitorId) => 
    api.get(`/visitors/${projectId}/visitor-detail/${visitorId}`),
  getVisitorDetailByIP: (projectId, ipAddress) => 
    api.get(`/visitors/${projectId}/visitor-detail-by-ip/${ipAddress}`),
  getVisitorsByPage: (projectId, pageUrl) => 
    api.get(`/visitors/${projectId}/by-page`, { params: { page_url: pageUrl } }),
  getBulkSessions: (projectId, visitorIds) => 
    api.post(`/visitors/${projectId}/bulk-sessions`, visitorIds),
  getGeographicData: (projectId, startDate = null, endDate = null) => {
    let url = `/visitors/${projectId}/geographic-data`
    const params = []
    
    if (startDate && endDate) {
      params.push(`start_date=${encodeURIComponent(startDate)}`)
      params.push(`end_date=${encodeURIComponent(endDate)}`)
    }
    
    if (params.length > 0) {
      url += `?${params.join('&')}`
    }
    
    console.log('🌍 VisitorsAPI - Getting geographic data:', url)
    return api.get(url)
  }
};

export const projectsAPI = {
  getAll: () => api.get('/projects/'),
  getAllStats: () => api.get('/projects/stats/all'),
  getOne: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects/', data),
  delete: (id) => api.delete(`/projects/${id}`),
  getDeleted: () => api.get('/projects/deleted'),
  restore: (id) => api.post(`/projects/${id}/restore`)
};

export const analyticsAPI = {
  getSummary: (projectId, days) => 
    api.get(`/analytics/${projectId}/summary?days=${days}`),
  getSummaryView: (projectId, days) => 
    api.get(`/analytics/${projectId}/summary-view?days=${days}`),
  getHourlyData: (projectId, date) => 
    api.get(`/analytics/${projectId}/hourly/${encodeURIComponent(date)}`),
  getHourlyDataRange: (projectId, startDate, endDate) => 
    api.get(`/analytics/${projectId}/hourly-range?start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`),
  trackVisit: (projectId, data) => 
    api.post(`/analytics/${projectId}/track`, data)
};

export const pagesAPI = {
  getPagesOverview: (projectId, limit = 10) => 
    api.get(`/pages/${projectId}/pages-overview?limit=${limit}`),
  getMostVisited: (projectId, limit = 10, startDate = null, endDate = null, offset = 0) => {
    let url = `/pages/${projectId}/most-visited`
    const params = []
    
    params.push(`limit=${limit}`)
    params.push(`offset=${offset}`) // Use dynamic offset
    
    if (startDate && endDate) {
      params.push(`start_date=${encodeURIComponent(startDate)}`)
      params.push(`end_date=${encodeURIComponent(endDate)}`)
    }
    
    if (params.length > 0) {
      url += `?${params.join('&')}`
    }
    
    console.log('📄 PagesAPI - Getting most visited:', url)
    // Add cache-busting timestamp for day 1 data
    if (startDate === endDate) {
      url += url.includes('?') ? '&' : '?'
      url += `_t=${Date.now()}`
    }
    return api.get(url)
  },
  getEntryPages: (projectId, limit = 10, startDate = null, endDate = null, offset = 0) => {
    let url = `/pages/${projectId}/entry-pages`
    const params = []
    
    params.push(`limit=${limit}`)
    params.push(`offset=${offset}`) // Use dynamic offset
    
    if (startDate && endDate) {
      params.push(`start_date=${encodeURIComponent(startDate)}`)
      params.push(`end_date=${encodeURIComponent(endDate)}`)
    }
    
    if (params.length > 0) {
      url += `?${params.join('&')}`
    }
    
    console.log('📄 PagesAPI - Getting entry pages:', url)
    // Add cache-busting timestamp for day 1 data
    if (startDate === endDate) {
      url += url.includes('?') ? '&' : '?'
      url += `_t=${Date.now()}`
    }
    return api.get(url)
  },
  getExitPages: (projectId, limit = 10, startDate = null, endDate = null, offset = 0) => {
    let url = `/pages/${projectId}/exit-pages`
    const params = []
    
    params.push(`limit=${limit}`)
    params.push(`offset=${offset}`) // Use dynamic offset
    
    if (startDate && endDate) {
      params.push(`start_date=${encodeURIComponent(startDate)}`)
      params.push(`end_date=${encodeURIComponent(endDate)}`)
    }
    
    if (params.length > 0) {
      url += `?${params.join('&')}`
    }
    
    console.log('📄 PagesAPI - Getting exit pages:', url)
    // Add cache-busting timestamp for day 1 data
    if (startDate === endDate) {
      url += url.includes('?') ? '&' : '?'
      url += `_t=${Date.now()}`
    }
    return api.get(url)
  },
  getPageActivity: (projectId, hours = 24) => 
    api.get(`/pages/${projectId}/page-activity?hours=${hours}`)
};

export const trafficAPI = {
  getTrafficOverview: (projectId) => 
    api.get(`/traffic/${projectId}/traffic-overview`),
  getSources: (projectId, startDate, endDate) => {
    let url = `/traffic/${projectId}/sources`
    if (startDate && endDate) {
      url += `?start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`
    }
    console.log('🌐 TrafficAPI - Making request to:', url)
    return api.get(url)
  },
  getSourceDetail: (projectId, sourceType, startDate, endDate) => {
    let url = `/traffic/${projectId}/source-detail/${sourceType}`
    if (startDate && endDate) {
      url += `?start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`
    }
    console.log('🌐 TrafficAPI - Getting source detail:', url)
    return api.get(url)
  },
  getKeywords: (projectId, limit = 20) => 
    api.get(`/traffic/${projectId}/keywords?limit=${limit}`),
  getReferrers: (projectId) => 
    api.get(`/traffic/${projectId}/referrers`),
  getExitLinks: (projectId, startDate, endDate) => {
    let url = `/traffic/${projectId}/exit-links`
    if (startDate && endDate) {
      url += `?start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`
    }
    console.log('🚪 TrafficAPI - Getting exit links:', url)
    return api.get(url)
  }
};

export const reportsAPI = {
  exportCSV: (projectId, days = 30) => 
    api.get(`/reports/${projectId}/export/csv?days=${days}`),
  getSummaryReport: (projectId, startDate, endDate) => {
    return api.get(`/reports/${projectId}/summary-report`, {
      params: { start_date: startDate, end_date: endDate }
    })
  }
};

export const leadsAPI = {
  submit: (leadData) => api.post('/lead/submit', leadData)
};

// Token management exports
export const tokenManager = {
  getToken,
  setToken,
  removeToken,
  isAuthenticated: () => !!getToken()
};

export default api;