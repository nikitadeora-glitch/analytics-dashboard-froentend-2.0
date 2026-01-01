// src/api/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Token management
const getToken = () => localStorage.getItem('authToken');
const setToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};
const removeToken = () => {
  localStorage.removeItem('authToken');
  delete api.defaults.headers.common['Authorization'];
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      removeToken();
    }
    
    return Promise.reject(error);
  }
);

// API Endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/signup', userData),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  verifyResetToken: (token) => api.get(`/auth/verify-reset-token?token=${token}`),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const visitorsAPI = {
  getActivity: (projectId, limit = 1000) => 
    api.get(`/visitors/${projectId}/activity?limit=${limit}`),
  getActivityView: (projectId, limit = 1000) => 
    api.get(`/visitors/${projectId}/activity-view?limit=${limit}`),
  getPath: (projectId, visitorId) => 
    api.get(`/visitors/${projectId}/path/${visitorId}`),
  getMap: (projectId) => 
    api.get(`/visitors/${projectId}/map`),
  getMapView: (projectId, days = 30) => 
    api.get(`/visitors/${projectId}/map-view?days=${days}`),
  getVisitorsByLocation: (projectId, lat, lng, days = 30) => 
    api.get(`/visitors/${projectId}/visitors-at-location`, { params: { lat, lng, days } }),
  getAllSessions: (projectId, visitorId) => 
    api.get(`/visitors/${projectId}/visitor-sessions/${visitorId}`),
  getVisitorsByPage: (projectId, pageUrl) => 
    api.get(`/visitors/${projectId}/by-page`, { params: { page_url: pageUrl } }),
  getBulkSessions: (projectId, visitorIds) => 
    api.post(`/visitors/${projectId}/bulk-sessions`, visitorIds)
};

export const projectsAPI = {
  getAll: () => api.get('/projects/'),
  getAllStats: () => api.get('/projects/stats/all'),
  getOne: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects/', data),
  delete: (id) => api.delete(`/projects/${id}`)
};

export const analyticsAPI = {
  getSummary: (projectId, days = 30) => 
    api.get(`/analytics/${projectId}/summary?days=${days}`),
  getSummaryView: (projectId, days = 30) => 
    api.get(`/analytics/${projectId}/summary-view?days=${days}`),
  getHourlyData: (projectId, date) => 
    api.get(`/analytics/${projectId}/hourly/${encodeURIComponent(date)}`),
  trackVisit: (projectId, data) => 
    api.post(`/analytics/${projectId}/track`, data)
};

export const pagesAPI = {
  getPagesOverview: (projectId, limit = 10) => 
    api.get(`/pages/${projectId}/pages-overview?limit=${limit}`),
  getMostVisited: (projectId, limit = 1000) => 
    api.get(`/pages/${projectId}/most-visited?limit=${limit}`),
  getEntryPages: (projectId, limit = 1000) => 
    api.get(`/pages/${projectId}/entry-pages?limit=${limit}`),
  getExitPages: (projectId, limit = 1000) => 
    api.get(`/pages/${projectId}/exit-pages?limit=${limit}`),
  getPageActivity: (projectId, hours = 24) => 
    api.get(`/pages/${projectId}/page-activity?hours=${hours}`)
};

export const trafficAPI = {
  getTrafficOverview: (projectId) => 
    api.get(`/traffic/${projectId}/traffic-overview`),
  getSources: (projectId) => 
    api.get(`/traffic/${projectId}/sources`),
  getKeywords: (projectId, limit = 20) => 
    api.get(`/traffic/${projectId}/keywords?limit=${limit}`),
  getReferrers: (projectId) => 
    api.get(`/traffic/${projectId}/referrers`),
  getExitLinks: (projectId) => 
    api.get(`/traffic/${projectId}/exit-links`)
};

export const reportsAPI = {
  exportCSV: (projectId, days = 30) => 
    api.get(`/reports/${projectId}/export/csv?days=${days}`),
  getSummaryReport: (projectId, startDate, endDate) =>
    api.get(`/reports/${projectId}/summary-report`, { 
      params: { start_date: startDate, end_date: endDate } 
    })
};

// Token management exports
export const tokenManager = {
  getToken,
  setToken,
  removeToken,
  isAuthenticated: () => !!getToken()
};

export default api;