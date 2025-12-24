import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { visitorsAPI } from '../../api/api'

// Helper function to process and calculate time spent for session journey
const processSessionJourney = (sessionData, visit) => {
  const journey = sessionData?.page_journey
  if (!journey || journey.length === 0) return []

  const result = []
  const sessionDuration = sessionData.session_duration

  for (let i = 0; i < journey.length; i++) {
    const page = journey[i]
    let timeSpent = Number(page.time_spent) || 0

    if (timeSpent === 0) {
      if (journey.length > 1) {
        const currentTs = page.timestamp || page.visited_at || page.created_at || page.time
        const currentPageTime = currentTs ? new Date(currentTs).getTime() : NaN

        const nextPage = journey[i + 1]
        if (nextPage && !isNaN(currentPageTime)) {
          const nextTs = nextPage.timestamp || nextPage.visited_at || nextPage.created_at || nextPage.time
          const nextPageTime = nextTs ? new Date(nextTs).getTime() : NaN

          if (!isNaN(nextPageTime)) {
            const diff = Math.floor((nextPageTime - currentPageTime) / 1000)
            timeSpent = (diff > 0 && diff < 1800) ? diff : 45
          }
        } else if (i === journey.length - 1) {
          timeSpent = Math.min(60, sessionDuration || 45)
        }
      } else {
        timeSpent = sessionDuration || 60
      }
      if (timeSpent === 0) timeSpent = 30
    }

    result.push({
      ...page,
      time_spent: timeSpent,
      time_spent_original: page.time_spent,
      time_spent_calculated: timeSpent !== (Number(page.time_spent) || 0)
    })
  }
  return result
}

// Internal helper to process a single visitor's session details
const processSingleVisitorSession = async (visit, projectId, allVisitorsData) => {
  const visitorData = allVisitorsData?.find(v => v.visitor_id === visit.visitor_id) || {}

  try {
    const pathResponse = await visitorsAPI.getAllSessions(projectId, visit.visitor_id)
    const sessions = pathResponse.data?.sessions || []
    const sessionData = sessions.find(s => s.session_number === visit.session_id)

    const processedJourney = processSessionJourney(sessionData, visit)

    return {
      ...visitorData, // Original visitor info (country, city, etc)
      ...visit,       // Visit specific info (visited_at, etc)
      path: processedJourney,
      entry_page: sessionData?.entry_page,
      exit_page: sessionData?.exit_page,
      total_time: sessionData?.session_duration || visit.time_spent || 0 // Restored original key 'total_time'
    }
  } catch (error) {
    console.warn(`Could not fetch details for visitor ${visit.visitor_id}:`, error)
    return { ...visitorData, ...visit, path: [] }
  }
}

// Async thunk for fetching initial session details
export const fetchSessionDetails = createAsyncThunk(
  'session/fetchSessionDetails',
  async ({ projectId, selectedPageSessions, limit = 10 }, { rejectWithValue }) => {
    try {
      if (!selectedPageSessions?.visits?.length) {
        return { sessions: [], hasMore: false, currentLimit: limit, totalSessions: 0, visitors: [] }
      }

      // Fetch all visitors - we'll store this to reuse during pagination
      const visitorsResponse = await visitorsAPI.getActivity(projectId, 1000)
      const allVisitors = visitorsResponse.data || []

      const visitsToProcess = selectedPageSessions.visits.slice(0, limit)
      const detailsPromises = visitsToProcess.map(visit =>
        processSingleVisitorSession(visit, projectId, allVisitors)
      )

      const results = await Promise.allSettled(detailsPromises)
      const details = results.filter(r => r.status === 'fulfilled').map(r => r.value)

      return {
        sessions: details,
        hasMore: selectedPageSessions.visits.length > limit,
        currentLimit: limit,
        totalSessions: selectedPageSessions.visits.length,
        visitors: allVisitors // Pass this to state for caching
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Async thunk for fetching more session details (pagination)
export const fetchMoreSessionDetails = createAsyncThunk(
  'session/fetchMoreSessionDetails',
  async ({ projectId, selectedPageSessions, limit }, { rejectWithValue, getState }) => {
    try {
      const { currentLimit, cachedVisitors } = getState().session

      if (!selectedPageSessions?.visits?.length) {
        throw new Error('No visits data available')
      }

      const newVisits = selectedPageSessions.visits.slice(currentLimit, limit)
      if (newVisits.length === 0) {
        return { newSessions: [], hasMore: false, currentLimit, totalSessions: selectedPageSessions.visits.length }
      }

      // Optimization: Use cached visitors if available, otherwise fetch
      let allVisitors = cachedVisitors
      if (!allVisitors || allVisitors.length === 0) {
        const visitorsResponse = await visitorsAPI.getActivity(projectId, 1000)
        allVisitors = visitorsResponse.data || []
      }

      const detailsPromises = newVisits.map(visit =>
        processSingleVisitorSession(visit, projectId, allVisitors)
      )

      const results = await Promise.allSettled(detailsPromises)
      const newSessions = results.filter(r => r.status === 'fulfilled').map(r => r.value)

      return {
        newSessions,
        hasMore: selectedPageSessions.visits.length > limit,
        currentLimit: limit,
        totalSessions: selectedPageSessions.visits.length,
        visitors: allVisitors
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)


// Helper function for time formatting (same as original)
const formatTimeSpent = (seconds) => {
  if (!seconds || seconds === 0 || seconds === null || seconds === undefined) return '0s'
  const totalSeconds = Math.floor(Number(seconds))
  if (totalSeconds <= 0) return '0s'

  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
}

const sessionSlice = createSlice({
  name: 'session',
  initialState: {
    sessionDetails: [],
    loading: false,
    loadingMore: false,
    error: null,
    hasMore: true,
    currentLimit: 10,
    totalSessions: 0,
    cachedVisitors: [], // Store visitors list for pagination
    lastFetch: null,
  },
  reducers: {
    clearSessionDetails: (state) => {
      state.sessionDetails = []
      state.error = null
      state.hasMore = true
      state.currentLimit = 10
      state.totalSessions = 0
      state.loadingMore = false
    },
    setCachedData: (state, action) => {
      const { key, data } = action.payload
      state.cache[key] = {
        data,
        timestamp: Date.now()
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSessionDetails.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSessionDetails.fulfilled, (state, action) => {
        state.loading = false
        state.sessionDetails = action.payload.sessions
        state.hasMore = action.payload.hasMore
        state.currentLimit = action.payload.currentLimit
        state.totalSessions = action.payload.totalSessions
        state.cachedVisitors = action.payload.visitors // Cache visitors
      })
      .addCase(fetchSessionDetails.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchMoreSessionDetails.pending, (state) => {
        state.loadingMore = true
        state.error = null
      })
      .addCase(fetchMoreSessionDetails.fulfilled, (state, action) => {
        state.loadingMore = false
        // APPEND new sessions to existing ones instead of replacing
        state.sessionDetails = [...state.sessionDetails, ...action.payload.newSessions]
        state.hasMore = action.payload.hasMore
        state.currentLimit = action.payload.currentLimit
        state.totalSessions = action.payload.totalSessions
        state.cachedVisitors = action.payload.visitors // Update/Keep cache
      })
      .addCase(fetchMoreSessionDetails.rejected, (state, action) => {
        state.loadingMore = false
        state.error = action.payload
      })
  },
})

export const { clearSessionDetails, setCachedData } = sessionSlice.actions
export default sessionSlice.reducer