import axios from 'axios'

const api = axios.create({
  baseURL: '/api'
})

export const projectsAPI = {
  getAll: () => api.get('/projects/'),
  getAllStats: () => api.get('/projects/stats/all'),
  getOne: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects/', data),
  delete: (id) => api.delete(`/projects/${id}`)
}

export const analyticsAPI = {
  getSummary: (projectId) => api.get(`/analytics/${projectId}/summary`),
  trackVisit: (projectId, data) => api.post(`/analytics/${projectId}/track`, data)
}

export const visitorsAPI = {
  getActivity: (projectId, limit = 50) => api.get(`/visitors/${projectId}/activity?limit=${limit}`),
  getPath: (projectId, visitorId) => api.get(`/visitors/${projectId}/path/${visitorId}`),
  getMap: (projectId) => api.get(`/visitors/${projectId}/map`),
  getAllSessions: (projectId, visitorId) => api.get(`/visitors/${projectId}/visitor-sessions/${visitorId}`),
  getVisitorsByPage: (projectId, pageUrl) => api.get(`/visitors/${projectId}/by-page`, { params: { page_url: pageUrl }})
}

export const pagesAPI = {
  getMostVisited: (projectId, limit = 10) => api.get(`/pages/${projectId}/most-visited?limit=${limit}`),
  getEntryPages: (projectId) => api.get(`/pages/${projectId}/entry-pages`),
  getExitPages: (projectId) => api.get(`/pages/${projectId}/exit-pages`),
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
    api.get(`/reports/${projectId}/summary-report`, { params: { start_date: startDate, end_date: endDate }})
}

export default api
