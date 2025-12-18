import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

// Token management
const getToken = () => localStorage.getItem('authToken')
const setToken = (token) => localStorage.setItem('authToken', token)
const removeToken = () => localStorage.removeItem('authToken')

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshResponse = await api.post('/auth/refresh')
        const newToken = refreshResponse.data.token
        setToken(newToken)
        
        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed, redirect to login
        removeToken()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export const projectsAPI = {
  getAll: () => api.get('/projects/'),
  getAllStats: () => api.get('/projects/stats/all'),
  getOne: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects/', data),
  delete: (id) => api.delete(`/projects/${id}`)
}

export const analyticsAPI = {
  getSummary: (projectId, days = 30) => api.get(`/analytics/${projectId}/summary?days=${days}`),
  getHourlyData: (projectId, date) => api.get(`/analytics/${projectId}/hourly/${encodeURIComponent(date)}`),
  trackVisit: (projectId, data) => api.post(`/analytics/${projectId}/track`, data)
}

export const visitorsAPI = {
  getActivity: (projectId, limit = 50) => api.get(`/visitors/${projectId}/activity?limit=${limit}`),
  getPath: (projectId, visitorId) => api.get(`/visitors/${projectId}/path/${visitorId}`),
  getMap: (projectId) => api.get(`/visitors/${projectId}/map`),
  getAllSessions: (projectId, visitorId) => api.get(`/visitors/${projectId}/visitor-sessions/${visitorId}`),
  getVisitorsByPage: (projectId, pageUrl) => api.get(`/visitors/${projectId}/by-page`, { params: { page_url: pageUrl } }),
  getBulkSessions: (projectId, visitorIds) => api.post(`/visitors/${projectId}/bulk-sessions`, visitorIds)
}

export const pagesAPI = {
  getMostVisited: (projectId, limit = 100) => api.get(`/pages/${projectId}/most-visited?limit=${limit}`),
  getEntryPages: (projectId, limit = 100) => api.get(`/pages/${projectId}/entry-pages?limit=${limit}`),
  getExitPages: (projectId, limit = 100) => api.get(`/pages/${projectId}/exit-pages?limit=${limit}`),
  getPageActivity: (projectId, hours = 24) => api.get(`/pages/${projectId}/page-activity?hours=${hours}`)
}

export const trafficAPI = {
  getSources: (projectId) => api.get(`/traffic/${projectId}/sources`),
  getKeywords: (projectId, limit = 20) => api.get(`/traffic/${projectId}/keywords?limit=${limit}`),
  getReferrers: (projectId) => api.get(`/traffic/${projectId}/referrers`),
  getExitLinks: (projectId) => api.get(`/traffic/${projectId}/exit-links`)
}

export const reportsAPI = {
  exportCSV: (projectId, days = 30) => api.get(`/reports/${projectId}/export/csv?days=${days}`),
  getSummaryReport: (projectId, startDate, endDate) =>
    api.get(`/reports/${projectId}/summary-report`, { params: { start_date: startDate, end_date: endDate } })
}

export const authAPI = {
  login: (credentials) => {
    console.log('🔐 Login request:', credentials)
    return api.post('/auth/login', credentials)
  },
  signup: (userData) => {
    console.log('📝 Signup request:', userData)
    return api.post('/auth/signup', userData)
  },
  forgotPassword: (data) => {
    console.log('📧 Forgot password request:', data)
    return api.post('/auth/forgot-password', data)
  },
  verifyResetToken: (token) => {
    console.log('🔍 Verify reset token request:', token.substring(0, 10) + '...')
    return api.get(`/auth/verify-reset-token/${token}`)
  },
  resetPassword: (data) => {
    console.log('🔑 Reset password request:', { token: data.token, password: '***' })
    return api.post('/auth/reset-password', data)
  },
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  resendVerification: (email) => api.post('/auth/resend-verification', { email })
}

// Export token management functions
export const tokenManager = {
  getToken,
  setToken,
  removeToken,
  isAuthenticated: () => !!getToken()
}

export default api
