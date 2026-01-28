import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchSessionDetails, clearSessionDetails, fetchMoreSessionDetails } from '../../store/slices/sessionSlice'
import { Skeleton, Box } from '@mui/material'
import { Calendar, ChevronDown, Smartphone, Monitor, Globe, ExternalLink } from 'lucide-react'

// Globe Icon Component
export function NotoGlobeShowingAsiaAustralia(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 128 128" {...props}><radialGradient id="IconifyId19bfeda96e6ce79250" cx="43.972" cy="29.066" r="90.951" gradientTransform="matrix(.6257 .78 -.5815 .4665 33.359 -18.792)" gradientUnits="userSpaceOnUse"><stop offset=".506" stop-color="#17A1F3"/><stop offset=".767" stop-color="#1B7FFA"/><stop offset=".962" stop-color="#1366F0"/><stop offset="1" stop-color="#1160EE"/></radialGradient><path fill="url(#IconifyId19bfeda96e6ce79250)" d="M3.14 64.68c.68 24.4 16.99 59.55 61.45 59.1c43.32-.44 60.76-36.3 59.4-62.06c-1.37-25.76-21.66-57.46-61.79-57.23c-40.14.22-59.8 33.96-59.06 60.19"/><path fill="#4B9EEC" d="M47.21 22.14c.28.38 1.55-.08 2.15-.05s1.25.27 1.33.82c.08.54-.52.63-.87 1.33c-.18.36-1.39 2.79-.73 3.07c.87.38 1.3-.49 1.49-.9s.65-1.28.65-1.28s.52-1.14 1.2-1.06c1.22.14.73 1.88.73 1.88s-.27 1.3.38 1.6s1.28.08 1.63-.05c.35-.14.95 0 1.66-.3s1.01-.57 1.49-.76c.49-.19.92-.08.98-.52c.05-.43-.38-.87-1.11-.92s-1.63.79-1.93 1.06s-1.28.46-1.39-.24s.52-.76.98-1.03s.76-.65.76-.65s-.84-1.09-1.09-1.17c-.24-.08-1.22.22-2.2-.46c-.91-.63-1.28-1.49-1.52-1.71s-1.33-.57-2.39-.35s-2.64 1.09-2.2 1.69"/><path fill="#7ADD8A" d="M5.54 46.98C11.5 26.73 28.47 7.24 56.48 4.75l.14 1.34s2.57.69 3.82.76s2.57.14 2.98 0c.42-.14 2.22-2.31 2.22-2.31c7.18.3 13.68 1.64 19.52 3.79c0 0 .22 2.38-.11 2.87s-.27 2.46-.11 3.23s.77 3.45.55 5.09s.11 4.05-1.04 3.83s-2.19-4.38-2.96-5.2s.33-2.85-.22-4.05s-.88-1.75-2.13-1.26s-1.59 2.96-2.85 3.45s-2.41-.6-3.12-.6s-3.5 1.26-4.05 2.9s-.33 2.9 1.15 3.07c1.48.16 1.31-.66 2.13-.44s1.04 2.24 1.37 2.96c.33.71.93 1.48.99 2.9c.05 1.42-.6 3.78-1.31 4.6s-1.09 3.01-2.13 3.61s-2.35.27-3.28.6s-.6 1.64-1.48 2.35s-1.75.99-1.75.99s2.08 2.13 2.03 3.67c-.05 1.53.05 2.52-1.81 3.34s-1.53-.27-1.48-1.75s-.05-2.24-.05-2.24s-1.26-.38-1.53-.66c-.27-.27-.38-.66-.38-.66s-1.64-.33-1.97-.38s-.88.16-1.15-.38c-.27-.55.49-1.42.11-1.64s-2.57 1.31-3.01 2.03c-.44.71.38 1.37.71 1.75s1.37 0 1.42.49s-.22 1.53-.55 1.86s-.82.88-.77 1.26s1.92 1.81 2.13 2.3s1.09.38 1.15 1.81c.05 1.42-.38 2.41-.99 3.12c-.6.71-1.26 1.42-1.42 1.53s-1.26 1.97-2.08 2.63s-2.63 2.13-4 2.57s-3.74.19-4.88.98s-.97 2.15-1.76 2.8s-1.26.86-1.8.18s-.36-1.44-.04-1.72c.32-.29.93-.61.29-1.04c-.65-.43-1.15 0-1.83.47s-1.69 1.01-1.33 2.08c.36 1.08 1.97 2.37 2.51 3.16s.86 1.44.83 2.23c-.04.79.18.97-.57 1.58s-.86.43-2.12 1.11s-2.15 1.58-2.84 1.18s-.83-1.08-.83-1.08s-1.83-2.19-2.33-2.59c-.5-.39-1.8-.68-1.94-.36s-.11 1.76.04 2.41c.14.65.36 1.69.36 2.05s1.15 1.22 1.8 1.58s1.22.25 1.62.86c.39.61 1.04 1.9 1.36 2.73s1.4 2.12 1.4 2.12s2.37 2.15 2.59 2.69s1.26 1.01 1.01 1.83c-.25.83-.61 1.44-1.62 1.36c-1.01-.07-2.59-1.08-3.09-1.36c-.5-.29-1.72-.79-1.72-.79s-2.91-2.98-3.27-3.41s-2.19-1.8-2.51-2.37s-1.9-1.9-2.15-2.33s.04-1.01.54-.86c.5.14 2.59 1.94 3.05 2.3c.47.36 1.9.86 1.9.86s-1.26-2.05-1.72-2.62c-.47-.57-1.47-1.44-1.72-3.27s-.39-3.48-.5-3.88s-1.01-2.62-1.29-2.98s-1.54.29-2.01-.39s-.18-3.73-.18-3.73s-2.23-4.13-2.73-4.27s-2.15-.36-2.8 0s-2.8 2.26-3.12 2.55s-2.26 1.94-2.66 2.12c-.39.18-.97.47-.97.47s-.47 2.37-.65 2.62s-.32 2.08-.57 2.73s-.61 1.83-1.44 1.8c-.83-.04-.75-.61-1.01-2.33c-.25-1.72-1.08-3.99-1.26-5.78c-.18-1.8-.47-6.75-.61-7.04s-1.04.07-1.08-.79s.41-3.9.04-4.74c-.49-1.07-2.04-2.02-2.04-2.02"/><path fill="#159FF7" d="M50.05 20c-.64-.12-1.12 1.2-2.14 1.92c-1.03.72-2.1.8-2.14 1.29s.98 2.19 1.87 2.23s2.22-.73 2.9-1.47c.94-1.02 1.16-3.65-.49-3.97"/><path fill="#7ADD8A" d="M75.03 21.99c-.25.09-.53.61-.55.98c-.02.69 1.26 2.55 1.31 2.97s.23 2.21.29 2.88c.07.81.14 1.49.5 1.55c.59.1 1.36-1.05 1.52-1.62c.17-.57.52-2.74.36-3.19c-.17-.45-.36-1.13-.98-1.81c-.74-.8-1.92-1.95-2.45-1.76m2.1 9.52c-.54.14-.59.95-.74 2.43c-.14 1.47.02 3.83.02 4.52s-.07 1.17-.07 1.17s-.57 1.64-.62 1.88s-1.33 1.38-1.74 1.78c-.4.4-1.52 1.33-1.52 1.33s-1.47-.24-2.12-.05c-2.43.71-2.55 1.93-2.55 1.93s-.69.54-.78 1.12c-.17 1 .83 1.83 1.78 1.71c.98-.12 2.21-.93 2.93-1.07c.71-.14 1.93-.5 2.9-1.47s2.12-2.59 2.43-2.81s1.19-.48 1.31-2.12s.55-5.38.48-5.61c-.07-.24 1.5-1 1.55-1.38s.36-1.5 0-1.57s-1.41-.24-1.81-.45c-.88-.48-.88-1.48-1.45-1.34M55.22 62.15c-.24.04-.21 1.64-.19 2.5c0 .18-.43.71.12 2.09c.43 1.08 1.28 1.74 1.28 1.74s-.31 3.21.52 4.26c.25.32 1.5 0 1.88.33s.79.73 1.28.9c.48.17 1.93.19 2.14-.19s-.45-1.4-.48-1.62c-.02-.21.48-.74.31-1.31s-2.85-4.09-3.33-4.23s-.76.19-1.28-.4c-.36-.4-.67-1.09-.62-2.14c.06-1.05-.42-2.15-1.63-1.93m-4.33 6.92c-.51.52-1.12 2.83-1.26 3.14s-1.64 1.76-2.24 2.16c-.56.38-1.86 1.67-2 2.02c-.14.36-1.33-.05-2 .05c-.57.08-1.62 1-1.78 1.4c-.17.4.17 1.12.57 1.83s1.28 1.45 1.57 1.76s1.17 1.01 1.43 1.17c.55.33 1.86-.33 2.81-.07s1.81.73 2.09.59c.83-.4 1.4-2.31 1.93-3.62c.76-1.91.88-2.33.88-2.33s.59-.43.9-1.14s.05-1.76.29-3.28s.51-2.09.69-2.9c.17-.74.19-1.33-.21-1.52s-2.53-.43-3.67.74M54 82.8c-.12-.19-.64-.9-.48-2.43c.17-1.52.67-2.5.71-2.69c.05-.19 1.88-1.43 2.55-1.43s1.14.31 1.21.43s.29.33.64.26c.36-.07.64-.74.57-.98s.07-.67.38-.69s.36.64.33 1.26c-.02.62-.1.81-.62 1.05s-2.07.57-2.47 1.14s-.14 1.88-.14 2.09s.93.71 1 1.24c.08.58-.17 1.03-1.95 1.09c-1.27.06-1.73-.34-1.73-.34m8.64-5.57s-1.09.4-1.28.55c-.19.14-.15.68.05.88c.29.29 1.5.02 2.12.1c.54.06 1.09.19 1.76.19c.59 0 .88-.93.69-1.19s-1.21-2.16-1-2.52s.57-.98.55-1.26c-.04-.48-1.28-.4-1.67-.19c-.38.21-.78 1.09-1.07 1.52c-.29.42-.15 1.92-.15 1.92m-18.72 7.92c-.17.08-.81 1.21-.48 1.67c.33.45.69.4 3.71.45s3.79-.08 3.97-.17c.24-.12 2.43-.19 3.38-.81s2.26-.88 2.66-.9s1.19.02 1.45-.17s1.12-.5.93-1.17s-.69 0-3.26.12c-2.17.1-6.18 1.03-6.78 1.05c-.78.03-5.27-.21-5.58-.07m18.01-2.85c-.88.78-1.38 1.24-1 1.71c.28.35 1.19-.29 1.74-.76c.55-.48 1.63-1.1 1.17-1.64c-.44-.5-1.26.1-1.91.69m5.54-7.76c-.11.16.05.98.12 1.19s1.05.55 1.62 1.21c.57.67.57 1.36.74 1.47c.17.12 2.71.02 3.24-.07s1.4-.14 2.5-.17c1.09-.02 2.7.06 2.97.12c.4.1.9.36 1.05.78c.09.28.22.8-.02 1.07s-.71.21-.76.69s-.05.9.62.86c.67-.05 2.81.07 3.33.05s1.67.48 2.24.19s2.12-.67 2.14-1.17s-.38-.62-.17-1.12c.25-.59.83-.48 1.45-.17s2.35 1.67 2.83 1.71s1.59-.21 1.64-.62c.05-.4-.5-.76-.83-.76s-.95-.19-1.14-.33s-1.64-2.02-1.88-2.28s-.12-1.28-.19-1.45s-1.31-.24-1.5-.43s-2.59-2.14-3.47-2.4s-7.61.05-7.95.21c-.33.17-2.19 3.07-2.9 2.97S72.6 74 71.7 73.52s-3.97.64-4.23 1.02m13.47 39.88c-.27.07-1.29-.22-1.58.11c-.29.32-.54 1.29-.47 1.76s.58 1.4 1.33 1.47c1.05.1 2.59-1.55 2.55-2.3c-.03-.75-.97-1.26-1.83-1.04m12.29-1.22c-.54.23-.97-1.47-1.62-1.44c-.47.03-1.89 1.17-3.09 2.01c-1.24.87-1.98 1.11-2.19 2.01c-.06.25.11.97 1.26 1.11s5.32-2.27 6.11-2.8s3.74-2.37 3.85-3.06c.11-.68-.86-2.37-.93-2.84s-.4-1.65-.79-1.62c-.4.04-.7.47-.61 1.44c.04.48-.03 1.16-.05 1.35c-.09.67-.36.78-.62.93c-.33.19-.77.31-.98.96c-.29.83.35 1.66-.34 1.95M77.52 87.47c-.05.71.97 1.6 1.37 1.97c.71.66 1.7 1.48 2.69 1.53s1.97-.38 2.19-.88c.22-.49 1.48-3.01 1.48-3.67s.44-2.3.49-2.74s.38-.6.93-.6s.71.33 1.04.93s.66 1.64 1.04 2.3s1.15 2.03 1.15 2.03s-.16 1.75 0 2.63s2.52 3.51 2.52 4.33s-.22 1.37.16 1.92s1.21.88 1.32 1.21s.44 1.64.27 2.36c-.16.71-.71 2.74-1.97 4s-3.18 2.79-3.18 2.79s-2.05 2.81-2.93 3.52s-1.57 1.22-2 1.41c-.35.15-1.42 1.15-4.27 1.04s-3.56-1.21-4.06-1.59c-.49-.38-1.59-.3-1.86-.71c-.44-.66 0-1.1-.11-1.81c-.06-.36-.49-1.26-1.92-1.48s-5.43.27-6.41.55c-.99.27-1.83 1.34-2.74 1.21c-1.15-.16-2.3.44-4.11.33c-1.86-.11-3.12-1.26-2.52-1.75c.27-.22.77-.66.49-1.37c-.27-.71-2.36-4.82-2.96-6.08s-1.37-2.62-1.32-3.73c.16-3.29 1.59-3.18 1.92-3.34s.71.05 1.26-.27c.55-.33 2.74-1.15 3.07-1.64s.38-1.81.77-2.14c.38-.33 3.84-3.34 4.55-3.78s1.37-.27 1.59.16s1.04.88 1.81.71c1.61-.34 1.21-2.25 1.97-2.74c.77-.49 3.4-.99 5.59-.71s3.23.27 3.51 1.42s-.82 2.68-.82 2.68"/><radialGradient id="IconifyId19bfeda96e6ce79252" cx="64.536" cy="88.962" r="19.144" fx="53.958" fy="95.795" gradientTransform="matrix(.068 .9977 -1.4592 .0994 189.96 15.728)" gradientUnits="userSpaceOnUse"><stop offset=".611" stop-color="#E3DDA6"/><stop offset=".966" stop-color="#E3DDA6" stop-opacity=".087"/><stop offset="1" stop-color="#E3DDA6" stop-opacity="0"/></radialGradient><path fill="url(#IconifyId19bfeda96e6ce79252)" d="M87.13 105.61s6.88-4.11 7.05-4.83c.16-.71-.16-2.03-.27-2.36s-.93-.66-1.32-1.21c-.38-.55-.16-1.1-.16-1.92s-2.36-3.45-2.52-4.33s0-2.63 0-2.63s-.77-1.37-1.15-2.03s-.71-1.7-1.04-2.3s-.49-.93-1.04-.93s-.88.16-.93.6s-.49 2.08-.49 2.74s-1.26 3.18-1.48 3.67s-1.21.93-2.19.88c-.99-.05-1.97-.88-2.69-1.53c-.4-.37-1.42-1.26-1.37-1.97c0 0 1.1-1.53.82-2.69s-1.32-1.15-3.51-1.42s-4.82.22-5.59.71s-.37 2.4-1.97 2.74c-.77.16-1.59-.27-1.81-.71s-.88-.6-1.59-.16s-4.17 3.45-4.55 3.78s-.44 1.64-.77 2.14s-2.52 1.32-3.07 1.64c-.55.33-.93.11-1.26.27s-1.75.05-1.92 3.34c-.06 1.11.71 2.47 1.32 3.73c.6 1.26 2.69 5.37 2.96 6.08s-.22 1.15-.49 1.37c-.6.49.66 1.64 2.52 1.75c1.81.11 2.96-.49 4.11-.33c.91.13 1.75-.93 2.74-1.21c.99-.27 4.99-.77 6.41-.55s1.86 1.12 1.92 1.48c.11.71 6.77-1.16 6.77-1.16z"/></svg>
  )
}

function PagesSessionView({ projectId, selectedPageSessions, pageType, onBack, project }) {
  const dispatch = useDispatch()
  const { sessionDetails, loading, loadingMore, error, hasMore, currentLimit } = useSelector(state => state.session)

  // Local state for pagination
  const [loadCount, setLoadCount] = useState(0)
  
  // Date filter state - sync with Pages.jsx initially
  const [period, setPeriod] = useState(() => {
    // First check if period is passed from Pages.jsx
    if (selectedPageSessions?.currentPeriod) {
      return selectedPageSessions.currentPeriod
    }
    // Then check localStorage
    const savedPeriod = localStorage.getItem(`pages-session-period-${projectId}`)
    return savedPeriod || '1'  // Default to 1 day
  })
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false)

  // Sync period with Pages.jsx when selectedPageSessions changes
  useEffect(() => {
    if (selectedPageSessions?.currentPeriod && selectedPageSessions.currentPeriod !== period) {
      console.log('📅 Syncing period from Pages.jsx:', selectedPageSessions.currentPeriod)
      setPeriod(selectedPageSessions.currentPeriod)
    }
  }, [selectedPageSessions?.currentPeriod])

  useEffect(() => {
    if (selectedPageSessions) {
      // Reset load count and fetch data - no date filtering needed (already filtered by backend)
      setLoadCount(0)
      
      console.log('📅 PagesSessionView - Loading data with period:', period)
      console.log('📊 Total visits from Pages.jsx:', selectedPageSessions.visits?.length)
      
      dispatch(fetchSessionDetails({ 
        projectId, 
        selectedPageSessions, 
        limit: 20  // Start with 20 sessions chunk
      }))
    }

    // Cleanup on unmount
    return () => {
      dispatch(clearSessionDetails())
    }
  }, [dispatch, projectId, selectedPageSessions, period])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPeriodDropdown && !event.target.closest('[data-period-dropdown]')) {
        setShowPeriodDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showPeriodDropdown])

  // Date range function - same as Pages.jsx
  const getDateRange = (days) => {
    // Get current date in IST
    const nowIST = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
    )
    
    // For end date, use today (current date)
    const endDate = new Date(nowIST)
    
    // For start date, go back by (days - 1) to include today
    const startDate = new Date(nowIST)
    const daysToSubtract = parseInt(days) - 1
    startDate.setDate(endDate.getDate() - daysToSubtract)
    
    console.log(`📅 PagesSessionView Date Range for ${days} days:`)
    console.log(`  Start Date: ${startDate.toISOString().split('T')[0]}`)
    console.log(`  End Date: ${endDate.toISOString().split('T')[0]}`)
    
    const format = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

    return {
      startDate: format(startDate),
      endDate: format(endDate)
    }
  }

  const handlePeriodChange = (newPeriod) => {
    console.log('📅 PagesSessionView - Period changing from:', period, 'to:', newPeriod)
    setPeriod(newPeriod)
    localStorage.setItem(`pages-session-period-${projectId}`, newPeriod)
    setShowPeriodDropdown(false)
    
    // Note: When period changes, we need fresh data from backend
    // This will trigger useEffect to reload data
    console.log('📅 PagesSessionView - Period changed, will reload data via useEffect')
  }

  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return

    // Load 20 more sessions at a time (chunked loading)
    const newLimit = currentLimit + 20

    console.log(`📥 Loading more sessions: ${currentLimit} → ${newLimit}`)
    console.log(`📊 Total available sessions: ${selectedPageSessions?.visits?.length}`)

    dispatch(fetchMoreSessionDetails({
      projectId,
      selectedPageSessions,
      limit: newLimit
    }))

    setLoadCount(prev => prev + 1)
  }

  // Optimized time formatting
  const formatTimeSpent = (seconds) => {
    // Handle null, undefined, or invalid values
    if (seconds === null || seconds === undefined || seconds === '' || isNaN(seconds)) {
      return '0s'
    }

    const totalSeconds = Math.floor(Number(seconds))

    if (totalSeconds <= 0) return '0s'

    const hours = Math.floor(totalSeconds / 3600)
    const mins = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60

    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`
    } else if (mins > 0) {
      return `${mins}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  // Calculate total session time
  const calculateSessionTime = (path) => {
    if (!path || path.length === 0) return 0
    return path.reduce((total, page) => {
      const timeSpent = Number(page.time_spent) || 0
      return total + timeSpent
    }, 0)
  }

  const getCountryCode = (country) => {
    const codes = {
      'United States': 'US',
      'India': 'IN',
      'United Kingdom': 'UK',
      'Canada': 'CA',
      'Singapore': 'SG',
      'China': 'CN',
      'Bangladesh': 'BD',
      'Pakistan': 'PK',
      'Australia': 'AU',
      'Germany': 'DE',
      'France': 'FR',
      'Japan': 'JP',
      'Brazil': 'BR',
      'Russia': 'RU',
      'South Korea': 'KR',
      'Mexico': 'MX',
      'Italy': 'IT',
      'Spain': 'ES',
      'Netherlands': 'NL',
      'Switzerland': 'CH'
    }
    return codes[country] || 'XX'
  }

  // Helper to format date – treats backend data as UTC and converts to local (IST)
  const formatToIST = (dateString, options = {}) => {
    if (!dateString) return ''

    // Ensure the date string is treated as UTC if it lacks timezone info
    let utcString = dateString
    if (typeof dateString === 'string' && !dateString.endsWith('Z') && !dateString.includes('+')) {
      utcString = dateString + 'Z'
    }

    const date = new Date(utcString)

    // Check if valid date
    if (isNaN(date.getTime())) return dateString

    // Format using browser's locale
    return date.toLocaleString('en-IN', options)
  }

  if (loading) return (
    <>
      {/* Header */}
      <div className="header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '98%' }}>
          <div>
            <h1 style={{ margin: 0 }}>{pageType === 'entry' ? 'Entry Page' : pageType === 'top' ? 'Top Page' : 'Exit Page'} Sessions</h1>
            <button
              onClick={onBack}
              style={{
                padding: '8px 16px',
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#010812ff',
                transition: 'all 0.2s',
                marginTop: '8px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
              ← Back to Pages
            </button>
          </div>
          
          {/* Date Filter - Same as Pages.jsx */}
          <div style={{ position: 'relative' }} data-period-dropdown>
            <div
              onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: '#2563eb',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                color: '#ffffffff',
                transition: 'all 0.2s',
                userSelect: 'none'
              }}
            >
              <Calendar size={16} />
              <span>
                {period === '1' ? '1 Day' : period === '7' ? '7 Days' : period === '30' ? '30 Days' : '60 Days'}
              </span>
              <ChevronDown size={16} />
            </div>

            {/* Dropdown */}
            {showPeriodDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '4px',
                background: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                zIndex: 1000,
                minWidth: '120px',
                overflow: 'hidden'
              }}>
                {['1', '7', '30', '60'].map((p) => (
                  <div
                    key={p}
                    onClick={() => handlePeriodChange(p)}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: period === p ? '#1e40af' : '#374151',
                      background: period === p ? '#eff6ff' : 'white',
                      borderBottom: p !== '60' ? '1px solid #f3f4f6' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    {p === '1' ? '1 Day' : p === '7' ? '7 Days' : p === '30' ? '30 Days' : '60 Days'}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {project && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#64748b',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            <span>Project: {project.name}</span>
          </div>
        )}
      </div>

      <div className="content">
        <div className="chart-container" style={{ padding: 0 }}>
          {/* Optimized Material UI Skeleton Loader */}
          {[1].map((idx) => (
            <Box
              key={idx}
              sx={{
                padding: '10px 20px',
                borderBottom: 'none',
                transition: 'background 0.2s'
              }}
            >
              {/* Main Row Skeleton - Exact Grid Layout */}
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr 200px 140px 240px',
                alignItems: 'start',
                gap: '20px'
              }}>
                {/* Date Only Skeleton - First Column */}
                <Box>
                  <Skeleton variant="text" width="100%" height={16} animation="wave" />
                </Box>

                {/* Time & URLs Skeleton - Second Column */}
                <Box>
                  <Skeleton variant="text" width="90%" height={15} animation="wave" sx={{ marginBottom: '4px' }} />
                  <Skeleton variant="text" width="100%" height={14} animation="wave" sx={{ marginBottom: '4px' }} />
                  <Skeleton variant="text" width="85%" height={12} animation="wave" />
                </Box>

                {/* Location & IP Skeleton - Third Column */}
                <Box>
                  <Skeleton variant="text" width="80%" height={16} animation="wave" sx={{ marginBottom: '4px' }} />
                  <Skeleton variant="text" width="60%" height={14} animation="wave" sx={{ marginBottom: '4px' }} />
                  <Skeleton variant="text" width="70%" height={12} animation="wave" />
                </Box>

                {/* Session Number & Total Time Skeleton - Fourth Column */}
                <Box sx={{ textAlign: 'center' }}>
                  <Skeleton variant="text" width="100%" height={18} animation="wave" sx={{ marginBottom: '6px' }} />
                  <Skeleton variant="rounded" width="80%" height={24} animation="wave" sx={{ margin: '0 auto' }} />
                </Box>

                {/* Device & Browser Skeleton - Fifth Column */}
                <Box sx={{ textAlign: 'right' }}>
                  <Skeleton variant="text" width="90%" height={16} animation="wave" sx={{ marginBottom: '4px', marginLeft: 'auto' }} />
                  <Skeleton variant="text" width="100%" height={15} animation="wave" sx={{ marginBottom: '4px' }} />
                  <Skeleton variant="text" width="75%" height={12} animation="wave" sx={{ marginLeft: 'auto' }} />
                </Box>
              </Box>

              {/* Session Stats Skeleton */}
              <Box sx={{
                marginTop: '12px',
                padding: '8px 16px',
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '20px'
              }}>
                <Skeleton variant="text" width={120} height={14} animation="wave" />
                <Skeleton variant="text" width={140} height={14} animation="wave" />
                <Skeleton variant="text" width={100} height={14} animation="wave" />
              </Box>

              {/* User Journey Skeleton - Show for all page types */}
              {pageType && (
                <Box sx={{
                  marginTop: '16px',
                  paddingLeft: '20px'
                }}>
                  <Skeleton variant="text" width={150} height={14} animation="wave" sx={{ marginBottom: '12px' }} />

                  {[1, 2].map((pidx) => (
                    <Box
                      key={pidx}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '40px 1fr 120px',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '8px',
                        padding: '8px 5px'
                      }}
                    >
                      {/* Step Number Skeleton */}
                      <Skeleton variant="circular" width={25} height={25} animation="wave" />

                      {/* Page Info Skeleton */}
                      <Box sx={{ minWidth: 0 }}>
                        <Skeleton variant="text" width={60} height={12} animation="wave" sx={{ marginBottom: '4px' }} />
                        <Skeleton variant="text" width="90%" height={14} animation="wave" sx={{ marginBottom: '4px' }} />
                        <Skeleton variant="text" width="100%" height={12} animation="wave" />
                      </Box>

                      {/* Time Spent Skeleton */}
                      <Box sx={{ textAlign: 'right' }}>
                        <Skeleton variant="text" width={60} height={18} animation="wave" sx={{ marginBottom: '4px', marginLeft: 'auto' }} />
                        <Skeleton variant="text" width={80} height={12} animation="wave" sx={{ marginLeft: 'auto' }} />
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          ))}
        </div>
      </div>
    </>
  )

  if (error) {
    console.error('Session loading error:', error)
    return <div className="loading">Error loading session details: {error}</div>
  }

  return (
    <>
      <div className="header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '98%' }}>
          <div>
            <h1 style={{ margin: 0 }}>{pageType === 'entry' ? 'Entry Page' : pageType === 'top' ? 'Top Page' : 'Exit Page'} Sessions</h1>
            <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px', marginBottom: '12px' }}>
              {selectedPageSessions?.title || selectedPageSessions?.page || selectedPageSessions?.url}
            </div>
            <button
              onClick={onBack}
              style={{
                padding: '8px 16px',
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#010812ff',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
              ← Back to Pages
            </button>
          </div>
          
          {/* Date Filter - Same as Pages.jsx */}
          <div style={{ position: 'relative' }} data-period-dropdown>
            <div
              onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: '#2563eb',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                color: '#ffffffff',
                transition: 'all 0.2s',
                userSelect: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#2563eb'
                e.currentTarget.style.borderColor = '#2563eb'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#3b82f6'
                e.currentTarget.style.borderColor = '#3b82f6'
              }}
            >
              <Calendar size={16} />
              <span>
                {period === '1' ? '1 Day' : period === '7' ? '7 Days' : period === '30' ? '30 Days' : '60 Days'}
              </span>
              <ChevronDown size={16} style={{
                transform: showPeriodDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }} />
            </div>

            {/* Dropdown */}
            {showPeriodDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '4px',
                background: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                zIndex: 1000,
                minWidth: '120px',
                overflow: 'hidden'
              }}>
                {['1', '7', '30', '60'].map((p) => (
                  <div
                    key={p}
                    onClick={() => handlePeriodChange(p)}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: period === p ? '#1e40af' : '#374151',
                      background: period === p ? '#eff6ff' : 'white',
                      borderBottom: p !== '60' ? '1px solid #f3f4f6' : 'none',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (period !== p) {
                        e.currentTarget.style.background = '#f9fafb'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (period !== p) {
                        e.currentTarget.style.background = 'white'
                      }
                    }}
                  >
                    {p === '1' ? '1 Day' : p === '7' ? '7 Days' : p === '30' ? '30 Days' : '60 Days'}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {project && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#64748b',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            <span>Project: {project.name}</span>
          </div>
        )}
      </div>

      <div className="content">
        <div className="chart-container" style={{ 
          padding: 0,
          maxWidth: '100%',
          overflowX: 'hidden',
          width: '100%'
        }}>
          {sessionDetails.length === 0 ? (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center',

            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛤️</div>
              <p style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>No Journey Data Available</p>
              <p style={{ fontSize: '14px' }}>Sessions without page journey are not displayed</p>
            </div>
          ) : sessionDetails.map((session, idx) => {
            const visitDate = new Date(session.visited_at)
            const totalSessionTime = calculateSessionTime(session.path)

            return (
              <div
                key={idx}
                className="session-card"
                style={{
                  padding: '15px 20px',
                  borderBottom: idx < sessionDetails.length - 1 ? '1px solid #e2e8f0' : 'none',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {/* Main Row */}
                <div className="session-grid">
                  {/* Date Only - First Column */}
                  <div className="session-col" data-label="Visited At">
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                      {formatToIST(session.visited_at, {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </div>

                  {/* Time + URLs - Second Column */}
                  <div className="session-col" data-label="Time & URLs">
                    {/* Time */}
                    <div>
                      {/* Time */}
                      {/* Time - Converted to IST (Railway Format HH:MM:SS) */}
                      <div style={{ fontSize: '11px', fontWeight: '500', color: '#475569', marginBottom: '2px' }}>
                        {formatToIST(session.visited_at, {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: false
                        })}
                        <span style={{ marginLeft: '4px', fontSize: '9px', color: '#64748b' }}>
                          (IST)
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                        <a
                          href={selectedPageSessions.url || selectedPageSessions.page}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '10px',
                            color: '#3b82f6',
                            textDecoration: 'none',
                            display: 'inline',
                            marginBottom: '2px',
                            wordBreak: 'break-all'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                          onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                        >
                          {selectedPageSessions.url || selectedPageSessions.page}
                        </a>
                        <a
                          href={selectedPageSessions.url || selectedPageSessions.page}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#3b82f6',
                            cursor: 'pointer',
                            flexShrink: 0,
                            marginBottom: '2px'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#2563eb'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#3b82f6'}
                        >
                          <ExternalLink size={12} />
                        </a>
                      </div>
                      {session.referrer && session.referrer !== 'direct' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                          <a
                            href={session.referrer}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: '10px',
                              color: '#10b981',
                              textDecoration: 'none',
                              display: 'inline',
                              wordBreak: 'break-all'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                          >
                            {session.referrer}
                          </a>
                          <a
                            href={session.referrer}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#10b981',
                              cursor: 'pointer',
                              flexShrink: 0
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#059669'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#10b981'}
                          >
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      ) : (
                        <div style={{ fontSize: '10px', color: '#94a3b8', fontStyle: 'italic' }}>
                          Direct visit
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Location & IP - Third Column */}
                  <div className="session-col" data-label="Location & IP">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>
                        {getCountryCode(session.country)} {session.city || 'Unknown'}, {session.country || 'Unknown'}
                      </span>
                      {session.referrer_source && (
                        <span style={{
                          fontSize: '9px',
                          fontWeight: '600',
                          color: '#dc2626',
                          background: '#fee2e2',
                          padding: '1px 4px',
                          borderRadius: '3px'
                        }}>
                          {session.referrer_source}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                      {session.ip_address || 'Unknown IP'}
                    </div>
                    <div style={{ fontSize: '9px', color: '#10b981', fontWeight: '500' }}>
                      {session.referrer && session.referrer !== 'direct' ? '(referring link)' : '(No referring link)'}
                    </div>
                  </div>

                  {/* Session Number & Total Time - Fourth Column */}
                  <div className="session-col" data-label="Session Info">
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      margin: '8px 0'
                    }}>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: 'black' }}>
                        Session #{String(session.session_id).substring(0, 8)}
                      </span>
                      {totalSessionTime > 0 && (
                        <div style={{
                          fontSize: '11px',
                          fontWeight: '600',
                          color: '#10b981',
                          background: '#f0fdf4',
                          padding: '2px 6px',
                          borderRadius: '10px',
                          border: '1px solid #bbf7d0'
                        }}>
                          Total: {formatTimeSpent(totalSessionTime)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Device & Browser - Fifth Column */}
                  <div className="session-col" data-label="Device & Browser">
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '4px',
                      margin: '8px 0'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                        {session.device_type === 'mobile' ? (
                          <Smartphone size={20} />
                        ) : (
                          <Monitor size={20} />
                        )}
                        <Globe size={20} />
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: '#1e293b' }}>
                        {session.os || 'Unknown OS'}, {session.browser || 'Unknown Browser'}
                      </div>
                      <div style={{ fontSize: '9px', color: '#64748b' }}>
                        {session.screen_resolution || 'Unknown Resolution'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Session Stats - Only show if there's meaningful time data */}
                {session.path && session.path.length > 0 && totalSessionTime > 0 && (
                  <div className="session-stats-bar" style={{
                    marginTop: '12px',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>
                      <strong>{session.path.length}</strong> pages visited
                    </span>
                    <span>
                      Avg: <strong style={{ color: '#10b981' }}>
                        {formatTimeSpent(totalSessionTime / session.path.length)}
                      </strong> per page
                    </span>
                    <span>
                      Longest: <strong style={{ color: '#3b82f6' }}>
                        {formatTimeSpent(Math.max(...session.path.map(p => Number(p.time_spent) || 0)))}
                      </strong>
                    </span>
                  </div>
                )}

                {/* Visitor Journey - Show for all page types including exit pages */}
                {session.path && session.path.length > 0 && (
                  <div className="visitor-journey-container" style={{
                    marginTop: '16px',
                    paddingLeft: '20px',
                  }}>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      color: '#64748b',
                      marginBottom: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      User Journey ({session.path.length} pages)
                    </div>

                    {session.path.map((page, pidx) => (
                      <div
                        key={pidx}
                        className="journey-step"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '40px 1fr 120px',
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '8px',
                          padding: '8px 5px',
                          position: 'relative'
                        }}
                      >
                        {/* Step Number */}
                        <div style={{
                          minWidth: '25px',
                          height: '30px',
                          background: pidx === 0 ? '#059669' : pidx === session.path.length - 1 ? '#dc2626' : '#3b82f6',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: '700',
                          flexShrink: 0
                        }}>
                          {pidx + 1}
                        </div>

                        {/* Page Info */}
                        <div style={{ minWidth: 0 }}>
                          <div style={{
                            fontSize: '10px',
                            color: pidx === 0 ? '#059669' : pidx === session.path.length - 1 ? '#dc2626' : '#64748b',
                            fontWeight: '600',
                            marginBottom: '2px',
                            textTransform: 'uppercase'
                          }}>
                            {pidx === 0 ? ' Entry' : pidx === session.path.length - 1 ? ' Exit' : `Step ${pidx + 1}`}
                          </div>
                          <div style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            color: '#1e293b',
                            marginBottom: '2px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {page.title || 'Untitled Page'}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                            <a
                              href={page.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontSize: '10px',
                                color: '#3b82f6',
                                textDecoration: 'none',
                                wordBreak: 'break-all',
                                whiteSpace: 'normal',
                                display: 'inline'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                            >
                              {page.url}
                            </a>
                            <a
                              href={page.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#3b82f6',
                                cursor: 'pointer',
                                flexShrink: 0
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.color = '#2563eb'}
                              onMouseLeave={(e) => e.currentTarget.style.color = '#3b82f6'}
                            >
                              <ExternalLink size={12} />
                            </a>
                          </div>
                        </div>

                        {/* Time Spent - Enhanced Display */}
                        <div className="journey-time" style={{
                          textAlign: 'right',
                          flexShrink: 0
                        }}>
                          {/* Optimized - removed excessive logging */}

                          <div style={{
                            fontSize: '16px',
                            fontWeight: '700',
                            color: page.time_spent && Number(page.time_spent) > 0 ? '#10b981' : '#94a3b8',
                            marginBottom: '2px'
                          }}>
                            {formatTimeSpent(page.time_spent)}
                            {page.time_spent_calculated && (
                              <span style={{
                                fontSize: '8px',
                                color: '#f59e0b',
                                marginLeft: '4px',
                                fontWeight: '500'
                              }}>
                                *
                              </span>
                            )}
                          </div>
                          <div style={{
                            fontSize: '9px',
                            color: '#64748b'
                          }}>
                            Time Spent
                          </div>

                          {/* Raw time_spent value for debugging */}
                          <div style={{
                            fontSize: '7px',
                            color: '#94a3b8',
                            marginTop: '1px'
                          }}>
                            {page.time_spent_calculated ? 'Calc' : 'Raw'}: {page.time_spent}s
                            {page.time_spent_original !== undefined && page.time_spent_calculated && (
                              <span style={{ marginLeft: '4px' }}>
                                (Orig: {page.time_spent_original})
                              </span>
                            )}
                          </div>

                          {/* Percentage of session */}
                          {page.time_spent && Number(page.time_spent) > 0 && totalSessionTime > 0 && (
                            <div style={{
                              fontSize: '8px',
                              color: '#10b981',
                              marginTop: '2px',
                              fontWeight: '500'
                            }}>
                              {((Number(page.time_spent) / totalSessionTime) * 100).toFixed(1)}% of session
                            </div>
                          )}
                        </div>


                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {/* Load More Button */}
          {hasMore && sessionDetails.length > 0 && (
            <div style={{ padding: '20px', textAlign: 'center', borderTop: '1px solid #e2e8f0' }}>
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                style={{

                  color: 'black',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: loadingMore ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  minWidth: '140px'
                }}
                onMouseEnter={(e) => {
                  if (!loadingMore) {

                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loadingMore) {

                    e.currentTarget.style.transform = 'translateY(0)'
                  }
                }}
              >
                {loadingMore ? ' Loading...' : 'Load More Sessions'}
              </button>
              <div style={{
                fontSize: '12px',
                color: '#64748b',
                marginTop: '8px'
              }}>
                Showing {sessionDetails.length} of {selectedPageSessions?.visits?.length || 0} total sessions
              </div>
            </div>
          )}
        </div>
      </div>
      <style>
        {`
          .session-grid {
            display: grid;
            grid-template-columns: 260px 300px 260px 260px 400px;
            align-items: start;
            gap: 20px;
          }

          @media (max-width: 768px) {
            .header h1 {
              font-size: 20px !important;
            }
            .content {
              padding: 10px !important;
              overflow-x: hidden !important;
            }
            .chart-container {
               background: transparent !important;
               box-shadow: none !important;
               border-radius: 0 !important;
            }
            .session-card {
              background: white !important;
              border-radius: 12px !important;
              margin-bottom: 15px !important;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
              border: 1px solid #e2e8f0 !important;
              padding: 15px !important;
            }
            .session-grid {
              display: block !important;
            }
            .session-col {
              display: flex !important;
              justify-content: space-between !important;
              align-items: center !important;
              padding: 8px 0 !important;
              border-bottom: 1px solid #f1f5f9 !important;
              text-align: right !important;
            }
            .session-col:last-child {
              border-bottom: none !important;
            }
            .session-col:before {
              content: attr(data-label);
              font-weight: 600;
              color: #64748b;
              font-size: 11px;
              text-align: left !important;
              margin-right: 15px !important;
            }
            .session-col > div {
                max-width: 65% !important;
            }
            .session-stats-bar {
                flex-direction: column !important;
                gap: 8px !important;
                text-align: center !important;
                background: #f8fafc !important;
                padding: 12px !important;
            }
            .visitor-journey-container {
                padding-left: 0 !important;
                margin-top: 20px !important;
            }
            .journey-step {
                grid-template-columns: 35px 1fr !important;
                gap: 10px !important;
            }
            .journey-time {
                grid-column: 2 / 3 !important;
                text-align: left !important;
                margin-top: 5px !important;
                display: flex !important;
                align-items: center !important;
                gap: 10px !important;
            }
          }
        `}
      </style>
    </>
  )
}

export default PagesSessionView