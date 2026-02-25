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



  getActivityView: (projectId, limit = null, startDate = null, endDate = null, filters = {}) => {



    let url = `/visitors/${projectId}/activity-view`



    const params = new URLSearchParams()







    if (startDate && endDate) {



      params.append('start_date', startDate)



      params.append('end_date', endDate)



    }







    if (limit !== null) {



      params.append('limit', limit)



    }







    // Add filter parameters



    Object.keys(filters).forEach(key => {



      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {



        params.append(key, filters[key])



      }



    })







    if (params.toString()) {



      url += `?${params.toString()}`



    }







    // Add cache-busting timestamp for 1-day data to prevent browser caching



    if (startDate && endDate && startDate === endDate) {



      url += url.includes('?') ? '&' : '?'



      url += `_t=${Date.now()}`



    }







    console.log('🔍 VisitorsAPI - Making request to:', url)



    return api.get(url)



  },



  getPath: (projectId, visitorId) =>



    api.get(`/visitors/${projectId}/path/${visitorId}`),



  getVisitorSessions: (projectId, visitorId, limit = null, startDate = null, endDate = null, filterParams = {}) => {



    let url = `/visitors/${projectId}/visitor-sessions/${visitorId}`



    const params = []







    if (limit !== null) params.push(`limit=${limit}`)



    if (startDate) params.push(`start_date=${encodeURIComponent(startDate)}`)



    if (endDate) params.push(`end_date=${encodeURIComponent(endDate)}`)


    
    // Add filter parameters
    Object.keys(filterParams).forEach(key => {
      if (filterParams[key] !== undefined && filterParams[key] !== null) {
        params.push(`${key}=${encodeURIComponent(filterParams[key])}`)
      }
    })


    if (params.length > 0) {


      url += `?${params.join('&')}`


    }


    console.log('🔍 VisitorsAPI - Getting visitor sessions:', url)


    return api.get(url)


  },



  getVisitorDetail: (projectId, visitorId) =>



    api.get(`/visitors/${projectId}/visitor-detail/${visitorId}`),



  getGeographicData: (projectId, limit = null, startDate = null, endDate = null) => {



    let url = `/visitors/${projectId}/geographic-data`



    const params = []







    if (limit !== null) params.push(`limit=${limit}`)



    if (startDate) params.push(`start_date=${encodeURIComponent(startDate)}`)



    if (endDate) params.push(`end_date=${encodeURIComponent(endDate)}`)







    if (params.length > 0) {



      url += `?${params.join('&')}`



    }







    console.log('🌍 VisitorsAPI - Getting geographic data:', url)



    return api.get(url)



  },



  getCountries: () =>



    api.get('/visitors/countries'),



  getCountryCities: () =>



    api.get('/visitors/country-cities'),



  getUtmSources: (projectId) =>



    api.get(`/visitors/${projectId}/utm-sources`),



  getUtmMediums: (projectId) =>



    api.get(`/visitors/${projectId}/utm-mediums`),



  getUtmCampaigns: (projectId) =>



    api.get(`/visitors/${projectId}/utm-campaigns`),



  getMapView: (projectId, params = {}) => {



    const queryParams = new URLSearchParams()







    // Add days parameter if provided



    if (params.days) {



      queryParams.append('days', params.days)



    } else {



      queryParams.append('days', 30) // default



    }







    // Add filter parameters



    Object.keys(params).forEach(key => {



      if (key !== 'days') {



        queryParams.append(key, params[key])



      }



    })







    return api.get(`/visitors/${projectId}/map-view?${queryParams.toString()}`)



  },



  getVisitorsByLocation: (projectId, latitude, longitude, days = 30) =>



    api.get(`/visitors/${projectId}/visitors-at-location?lat=${latitude}&lng=${longitude}&days=${days}`)



};







export const projectsAPI = {



  getAll: () => api.get('/projects/'),



  getAllStats: () => api.get('/projects/stats/all'),



  getOne: (id) => api.get(`/projects/${id}`),



  create: (data) => api.post('/projects/', data),



  delete: (id) => api.delete(`/projects/${id}`),



  getDeleted: () => api.get('/projects/deleted'),



  restore: (id) => api.post(`/projects/${id}/restore`),



  checkScriptStatus: (id) => api.get(`/projects/${id}/script-status`)



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



  getMostVisited: (projectId, limit = 10, startDate = null, endDate = null, offset = 0, filters = {}) => {



    let url = `/pages/${projectId}/most-visited`



    const params = []







    params.push(`limit=${limit}`)



    params.push(`offset=${offset}`) // Use dynamic offset







    if (startDate && endDate) {



      params.push(`start_date=${encodeURIComponent(startDate)}`)



      params.push(`end_date=${encodeURIComponent(endDate)}`)



    }







    // Add filter parameters



    Object.entries(filters).forEach(([key, value]) => {



      if (value !== undefined && value !== null && value !== '') {



        params.push(`${key}=${encodeURIComponent(value)}`)



      }



    })







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



  getEntryPages: (projectId, limit = 10, startDate = null, endDate = null, offset = 0, filters = {}) => {



    let url = `/pages/${projectId}/entry-pages`



    const params = []







    params.push(`limit=${limit}`)



    params.push(`offset=${offset}`) // Use dynamic offset







    if (startDate && endDate) {



      params.push(`start_date=${encodeURIComponent(startDate)}`)



      params.push(`end_date=${encodeURIComponent(endDate)}`)



    }







    // Add filter parameters



    Object.entries(filters).forEach(([key, value]) => {



      if (value !== undefined && value !== null && value !== '') {



        params.push(`${key}=${encodeURIComponent(value)}`)



      }



    })







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



  getExitPages: (projectId, limit = 10, startDate = null, endDate = null, offset = 0, filters = {}) => {



    let url = `/pages/${projectId}/exit-pages`



    const params = []







    params.push(`limit=${limit}`)



    params.push(`offset=${offset}`) // Use dynamic offset







    if (startDate && endDate) {



      params.push(`start_date=${encodeURIComponent(startDate)}`)



      params.push(`end_date=${encodeURIComponent(endDate)}`)



    }







    // Add filter parameters



    Object.entries(filters).forEach(([key, value]) => {



      if (value !== undefined && value !== null && value !== '') {



        params.push(`${key}=${encodeURIComponent(value)}`)



      }



    })







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



  getSources: (projectId, startDate, endDate, filterParams = {}) => {



    let url = `/traffic/${projectId}/sources`



    const params = new URLSearchParams()







    if (startDate && endDate) {



      params.append('start_date', startDate)



      params.append('end_date', endDate)



    }







    // Add filter parameters



    Object.keys(filterParams).forEach(key => {



      if (filterParams[key] !== undefined && filterParams[key] !== '') {



        params.append(key, filterParams[key])



      }



    })







    if (params.toString()) {



      url += `?${params.toString()}`



    }







    console.log('🌐 TrafficAPI - Making request to:', url)



    console.log('🌐 TrafficAPI - Filter params:', filterParams)



    return api.get(url)



  },



  getSourceDetail: (projectId, sourceType, startDate, endDate, filterParams = {}) => {

    let url = `/traffic/${projectId}/source-detail/${sourceType}`

    // Build query parameters
    const queryParams = new URLSearchParams()
    
    if (startDate && endDate) {
      queryParams.append('start_date', startDate)
      queryParams.append('end_date', endDate)
    }

    // Add filter parameters
    Object.keys(filterParams).forEach(key => {
      if (filterParams[key] !== undefined && filterParams[key] !== null && filterParams[key] !== '') {
        queryParams.append(key, filterParams[key])
      }
    })

    // Add query string to URL if we have parameters
    const queryString = queryParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }

    console.log('🌐 TrafficAPI - Getting source detail with filters:', url)
    console.log('🔍 Filter parameters used:', filterParams)

    return api.get(url)

  },



  getKeywords: (projectId, limit = 20) =>



    api.get(`/traffic/${projectId}/keywords?limit=${limit}`),



  getReferrers: (projectId) =>



    api.get(`/traffic/${projectId}/referrers`),



  getExitLinks: (projectId, startDate, endDate, filters = {}) => {



    let url = `/traffic/${projectId}/exit-links`



    const params = new URLSearchParams()







    if (startDate && endDate) {



      params.append('start_date', startDate)



      params.append('end_date', endDate)



    }







    // Add filter parameters



    Object.keys(filters).forEach(key => {



      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {



        params.append(key, filters[key])



      }



    })







    if (params.toString()) {



      url += `?${params.toString()}`



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



  submit: (leadData) => api.post('/lead/submit', leadData, {



    headers: {



      'Access-Control-Allow-Origin': '*',



      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',



      'Access-Control-Allow-Headers': 'Content-Type'



    }



  })



};







export const aiInsightsAPI = {



  streamResponse: async (question, userId, onMessage, onError, onDone, onStatus) => {



    try {



      console.log('🤖 AI Insights API Call:')



      console.log('Question:', question)



      console.log('User ID:', userId)



      console.log('Type of userId:', typeof userId)







      const requestBody = {



        question: question,



        user_id: parseInt(userId) || userId  // Ensure userId is a number



      }







      console.log('Request Body:', requestBody)







      const response = await fetch('/api/insights/agent/stream', {



        method: 'POST',



        headers: {



          'Content-Type': 'application/json',



          'Accept': 'text/event-stream',



          'Cache-Control': 'no-cache',



        },



        body: JSON.stringify(requestBody)



      });







      if (!response.ok) {



        throw new Error(`HTTP error! status: ${response.status}`);



      }







      const reader = response.body.getReader();



      const decoder = new TextDecoder();



      let accumulatedResponse = "";



      let currentEvent = "";



      let finalInsightChunks = [];



      let isFinalInsightMode = false;







      while (true) {



        const { done, value } = await reader.read();







        if (done) {



          if (onDone) onDone();



          break;



        }







        const chunk = decoder.decode(value, { stream: true });



        const lines = chunk.split('\n');







        lines.forEach(line => {



          console.log('🔍 Processing line:', line);







          if (line.startsWith('event: ')) {



            currentEvent = line.replace('event: ', '').trim();



            console.log('📋 Event type:', currentEvent);







            if (currentEvent === 'final_insight') {



              isFinalInsightMode = true;



              console.log('🎯 Final Insight Mode Started!');



            }



          } else if (line.startsWith('data: ')) {



            const data = line.replace('data: ', '').trim();



            console.log('📦 Data received:', data);



            console.log('🎯 Current event:', currentEvent);







            // Handle different event types from backend



            if (currentEvent === 'stage') {



              console.log('🎭 Stage event:', data);



              if (onStatus) onStatus(data); // "Thinking...", "Executing SQL...", etc.



            } else if (currentEvent === 'insight') {



              console.log('💡 Insight event:', data);



              accumulatedResponse += data + "\n";



              console.log('📝 Accumulated response so far:', accumulatedResponse);



              if (onMessage) onMessage(accumulatedResponse);



            } else if (currentEvent === 'final_insight') {



              console.log('🎯 FINAL INSIGHT EVENT!');



              console.log('📄 Final data:', data);



              console.log('📊 Data length:', data.length);



              console.log('🔍 Data preview:', data.substring(0, 100) + '...');







              // Accumulate all final_insight chunks



              finalInsightChunks.push(data);



              console.log('🧩 Final chunks collected:', finalInsightChunks.length);







            } else if (currentEvent === 'error') {



              console.log('❌ Error event:', data);



              if (onError) onError(new Error(data));



            } else if (currentEvent === 'end') {



              console.log('🏁 End event received');







              // When stream ends, send complete final_insight



              if (isFinalInsightMode && finalInsightChunks.length > 0) {



                const completeFinalInsight = finalInsightChunks.join('');



                console.log('🎯 Sending complete final insight:', completeFinalInsight.substring(0, 100) + '...');



                console.log('📊 Complete length:', completeFinalInsight.length);



                if (onMessage) onMessage(completeFinalInsight);



              }







              if (onDone) onDone();



            }



          }



        });



      }



    } catch (error) {



      console.error('Stream error:', error);



      if (onError) onError(error);



    }



  }



};







// Token management exports



export const tokenManager = {



  getToken,



  setToken,



  removeToken,



  isAuthenticated: () => !!getToken()



};







export default api;