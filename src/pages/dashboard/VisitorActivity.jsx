import { useState, useEffect } from 'react'
import { visitorsAPI, projectsAPI } from '../../api/api'
import { Skeleton, Box, Grid } from '@mui/material'
import { Calendar, ChevronDown, Smartphone, Monitor, Globe, ExternalLink, X } from 'lucide-react'
import { formatUrl } from '../../utils/urlUtils'
import VisitorDetail from './VisitorDetail'

// Globe Icon Component
function NotoGlobeShowingAsiaAustralia(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 128 128" {...props}><radialGradient id="IconifyId19bfeda96e6ce79250" cx="43.972" cy="29.066" r="90.951" gradientTransform="matrix(.6257 .78 -.5815 .4665 33.359 -18.792)" gradientUnits="userSpaceOnUse"><stop offset=".506" stop-color="#17A1F3"/><stop offset=".767" stop-color="#1B7FFA"/><stop offset=".962" stop-color="#1366F0"/><stop offset="1" stop-color="#1160EE"/></radialGradient><path fill="url(#IconifyId19bfeda96e6ce79250)" d="M3.14 64.68c.68 24.4 16.99 59.55 61.45 59.1c43.32-.44 60.76-36.3 59.4-62.06c-1.37-25.76-21.66-57.46-61.79-57.23c-40.14.22-59.8 33.96-59.06 60.19"/><path fill="#4B9EEC" d="M47.21 22.14c.28.38 1.55-.08 2.15-.05s1.25.27 1.33.82c.08.54-.52.63-.87 1.33c-.18.36-1.39 2.79-.73 3.07c.87.38 1.3-.49 1.49-.9s.65-1.28.65-1.28s.52-1.14 1.2-1.06c1.22.14.73 1.88.73 1.88s-.27 1.3.38 1.6s1.28.08 1.63-.05c.35-.14.95 0 1.66-.3s1.01-.57 1.49-.76c.49-.19.92-.08.98-.52c.05-.43-.38-.87-1.11-.92s-1.63.79-1.93 1.06s-1.28.46-1.39-.24s.52-.76.98-1.03s.76-.65.76-.65s-.84-1.09-1.09-1.17c-.24-.08-1.22.22-2.2-.46c-.91-.63-1.28-1.49-1.52-1.71s-1.33-.57-2.39-.35s-2.64 1.09-2.2 1.69"/><path fill="#7ADD8A" d="M5.54 46.98C11.5 26.73 28.47 7.24 56.48 4.75l.14 1.34s2.57.69 3.82.76s2.57.14 2.98 0c.42-.14 2.22-2.31 2.22-2.31c7.18.3 13.68 1.64 19.52 3.79c0 0 .22 2.38-.11 2.87s-.27 2.46-.11 3.23s.77 3.45.55 5.09s.11 4.05-1.04 3.83s-2.19-4.38-2.96-5.2s.33-2.85-.22-4.05s-.88-1.75-2.13-1.26s-1.59 2.96-2.85 3.45s-2.41-.6-3.12-.6s-3.5 1.26-4.05 2.9s-.33 2.9 1.15 3.07c1.48.16 1.31-.66 2.13-.44s1.04 2.24 1.37 2.96c.33.71.93 1.48.99 2.9c.05 1.42-.6 3.78-1.31 4.6s-1.09 3.01-2.13 3.61s-2.35.27-3.28.6s-.6 1.64-1.48 2.35s-1.75.99-1.75.99s2.08 2.13 2.03 3.67c-.05 1.53.05 2.52-1.81 3.34s-1.53-.27-1.48-1.75s-.05-2.24-.05-2.24s-1.26-.38-1.53-.66c-.27-.27-.38-.66-.38-.66s-1.64-.33-1.97-.38s-.88.16-1.15-.38c-.27-.55.49-1.42.11-1.64s-2.57 1.31-3.01 2.03c-.44.71.38 1.37.71 1.75s1.37 0 1.42.49s-.22 1.53-.55 1.86s-.82.88-.77 1.26s1.92 1.81 2.13 2.3s1.09.38 1.15 1.81c.05 1.42-.38 2.41-.99 3.12c-.6.71-1.26 1.42-1.42 1.53s-1.26 1.97-2.08 2.63s-2.63 2.13-4 2.57s-3.74.19-4.88.98s-.97 2.15-1.76 2.8s-1.26.86-1.8.18s-.36-1.44-.04-1.72c.32-.29.93-.61.29-1.04c-.65-.43-1.15 0-1.83.47s-1.69 1.01-1.33 2.08c.36 1.08 1.97 2.37 2.51 3.16s.86 1.44.83 2.23c-.04.79.18.97-.57 1.58s-.86.43-2.12 1.11s-2.15 1.58-2.84 1.18s-.83-1.08-.83-1.08s-1.83-2.19-2.33-2.59c-.5-.39-1.8-.68-1.94-.36s-.11 1.76.04 2.41c.14.65.36 1.69.36 2.05s1.15 1.22 1.8 1.58s1.22.25 1.62.86c.39.61 1.04 1.9 1.36 2.73s1.4 2.12 1.4 2.12s2.37 2.15 2.59 2.69s1.26 1.01 1.01 1.83c-.25.83-.61 1.44-1.62 1.36c-1.01-.07-2.59-1.08-3.09-1.36c-.5-.29-1.72-.79-1.72-.79s-2.91-2.98-3.27-3.41s-2.19-1.8-2.51-2.37s-1.9-1.9-2.15-2.33s.04-1.01.54-.86c.5.14 2.59 1.94 3.05 2.3c.47.36 1.9.86 1.9.86s-1.26-2.05-1.72-2.62c-.47-.57-1.47-1.44-1.72-3.27s-.39-3.48-.5-3.88s-1.01-2.62-1.29-2.98s-1.54.29-2.01-.39s-.18-3.73-.18-3.73s-2.23-4.13-2.73-4.27s-2.15-.36-2.8 0s-2.8 2.26-3.12 2.55s-2.26 1.94-2.66 2.12c-.39.18-.97.47-.97.47s-.47 2.37-.65 2.62s-.32 2.08-.57 2.73s-.61 1.83-1.44 1.8c-.83-.04-.75-.61-1.01-2.33c-.25-1.72-1.08-3.99-1.26-5.78c-.18-1.8-.47-6.75-.61-7.04s-1.04.07-1.08-.79s.41-3.9.04-4.74c-.49-1.07-2.04-2.02-2.04-2.02"/><path fill="#159FF7" d="M50.05 20c-.64-.12-1.12 1.2-2.14 1.92c-1.03.72-2.1.8-2.14 1.29s.98 2.19 1.87 2.23s2.22-.73 2.9-1.47c.94-1.02 1.16-3.65-.49-3.97"/><path fill="#7ADD8A" d="M75.03 21.99c-.25.09-.53.61-.55.98c-.02.69 1.26 2.55 1.31 2.97s.23 2.21.29 2.88c.07.81.14 1.49.5 1.55c.59.1 1.36-1.05 1.52-1.62c.17-.57.52-2.74.36-3.19c-.17-.45-.36-1.13-.98-1.81c-.74-.8-1.92-1.95-2.45-1.76m2.1 9.52c-.54.14-.59.95-.74 2.43c-.14 1.47.02 3.83.02 4.52s-.07 1.17-.07 1.17s-.57 1.64-.62 1.88s-1.33 1.38-1.74 1.78c-.4.4-1.52 1.33-1.52 1.33s-1.47-.24-2.12-.05c-2.43.71-2.55 1.93-2.55 1.93s-.69.54-.78 1.12c-.17 1 .83 1.83 1.78 1.71c.98-.12 2.21-.93 2.93-1.07c.71-.14 1.93-.5 2.9-1.47s2.12-2.59 2.43-2.81s1.19-.48 1.31-2.12s.55-5.38.48-5.61c-.07-.24 1.5-1 1.55-1.38s.36-1.5 0-1.57s-1.41-.24-1.81-.45c-.88-.48-.88-1.48-1.45-1.34M55.22 62.15c-.24.04-.21 1.64-.19 2.5c0 .18-.43.71.12 2.09c.43 1.08 1.28 1.74 1.28 1.74s-.31 3.21.52 4.26c.25.32 1.5 0 1.88.33s.79.73 1.28.9c.48.17 1.93.19 2.14-.19s-.45-1.4-.48-1.62c-.02-.21.48-.74.31-1.31s-2.85-4.09-3.33-4.23s-.76.19-1.28-.4c-.36-.4-.67-1.09-.62-2.14c.06-1.05-.42-2.15-1.63-1.93m-4.33 6.92c-.51.52-1.12 2.83-1.26 3.14s-1.64 1.76-2.24 2.16c-.56.38-1.86 1.67-2 2.02c-.14.36-1.33-.05-2 .05c-.57.08-1.62 1-1.78 1.4c-.17.4.17 1.12.57 1.83s1.28 1.45 1.57 1.76s1.17 1.01 1.43 1.17c.55.33 1.86-.33 2.81-.07s1.81.73 2.09.59c.83-.4 1.4-2.31 1.93-3.62c.76-1.91.88-2.33.88-2.33s.59-.43.9-1.14s.05-1.76.29-3.28s.51-2.09.69-2.9c.17-.74.19-1.33-.21-1.52s-2.53-.43-3.67.74M54 82.8c-.12-.19-.64-.9-.48-2.43c.17-1.52.67-2.5.71-2.69c.05-.19 1.88-1.43 2.55-1.43s1.14.31 1.21.43s.29.33.64.26c.36-.07.64-.74.57-.98s.07-.67.38-.69s.36.64.33 1.26c-.02.62-.1.81-.62 1.05s-2.07.57-2.47 1.14s-.14 1.88-.14 2.09s.93.71 1 1.24c.08.58-.17 1.03-1.95 1.09c-1.27.06-1.73-.34-1.73-.34m8.64-5.57s-1.09.4-1.28.55c-.19.14-.15.68.05.88c.29.29 1.5.02 2.12.1c.54.06 1.09.19 1.76.19c.59 0 .88-.93.69-1.19s-1.21-2.16-1-2.52s.57-.98.55-1.26c-.04-.48-1.28-.4-1.67-.19c-.38.21-.78 1.09-1.07 1.52c-.29.42-.15 1.92-.15 1.92m-18.72 7.92c-.17.08-.81 1.21-.48 1.67c.33.45.69.4 3.71.45s3.79-.08 3.97-.17c.24-.12 2.43-.19 3.38-.81s2.26-.88 2.66-.9s1.19.02 1.45-.17s1.12-.5.93-1.17s-.69 0-3.26.12c-2.17.1-6.18 1.03-6.78 1.05c-.78.03-5.27-.21-5.58-.07m18.01-2.85c-.88.78-1.38 1.24-1 1.71c.28.35 1.19-.29 1.74-.76c.55-.48 1.63-1.1 1.17-1.64c-.44-.5-1.26.1-1.91.69m5.54-7.76c-.11.16.05.98.12 1.19s1.05.55 1.62 1.21c.57.67.57 1.36.74 1.47c.17.12 2.71.02 3.24-.07s1.4-.14 2.5-.17c1.09-.02 2.7.06 2.97.12c.4.1.90.36 1.05.78c.09.28.22.8-.02 1.07s-.71.21-.76.69s-.05.9.62.86c.67-.05 2.81.07 3.33.05s1.67.48 2.24.19s2.12-.67 2.14-1.17s-.38-.62-.17-1.12c.25-.59.83-.48 1.45-.17s2.35 1.67 2.83 1.71s1.59-.21 1.64-.62c.05-.4-.5-.76-.83-.76s-.95-.19-1.14-.33s-1.64-2.02-1.88-2.28s-.12-1.28-.19-1.45s-1.31-.24-1.5-.43s-2.59-2.14-3.47-2.4s-7.61.05-7.95.21c-.33.17-2.19 3.07-2.9 2.97S72.6 74 71.7 73.52s-3.97.64-4.23 1.02m13.47 39.88c-.27.07-1.29-.22-1.58.11c-.29.32-.54 1.29-.47 1.76s.58 1.4 1.33 1.47c1.05.1 2.59-1.55 2.55-2.3c-.03-.75-.97-1.26-1.83-1.04m12.29-1.22c-.54.23-.97-1.47-1.62-1.44c-.47.03-1.89 1.17-3.09 2.01c-1.24.87-1.98 1.11-2.19 2.01c-.06.25.11.97 1.26 1.11s5.32-2.27 6.11-2.8s3.74-2.37 3.85-3.06c.11-.68-.86-2.37-.93-2.84s-.4-1.65-.79-1.62c-.4.04-.7.47-.61 1.44c.04.48-.03 1.16-.05 1.35c-.09.67-.36.78-.62.93c-.33.19-.77.31-.98.96c-.29.83.35 1.66-.34 1.95M77.52 87.47c-.05.71.97 1.6 1.37 1.97c.71.66 1.7 1.48 2.69 1.53s1.97-.38 2.19-.88c.22-.49 1.48-3.01 1.48-3.67s.44-2.3.49-2.74s.38-.6.93-.6s.71.33 1.04.93s.66 1.64 1.04 2.3s1.15 2.03 1.15 2.03s-.16 1.75 0 2.63s2.52 3.51 2.52 4.33s-.22 1.37.16 1.92s1.21.88 1.32 1.21s.44 1.64.27 2.36c-.16.71-.71 2.74-1.97 4s-3.18 2.79-3.18 2.79s-2.05 2.81-2.93 3.52s-1.57 1.22-2 1.41c-.35.15-1.42 1.15-4.27 1.04s-3.56-1.21-4.06-1.59c-.49-.38-1.59-.3-1.86-.71c-.44-.66 0-1.1-.11-1.81c-.06-.36-.49-1.26-1.92-1.48s-5.43.27-6.41.55c-.99.27-1.83 1.34-2.74 1.21c-1.15-.16-2.3.44-4.11.33c-1.86-.11-3.12-1.26-2.52-1.75c.27-.22.77-.66.49-1.37c-.27-.71-2.36-4.82-2.96-6.08s-1.37-2.62-1.32-3.73c.16-3.29 1.59-3.18 1.92-3.34s.71.05 1.26-.27c.55-.33 2.74-1.15 3.07-1.64s.38-1.81.77-2.14c.38-.33 3.84-3.34 4.55-3.78s1.37-.27 1.59.16s1.04.88 1.81.71c1.61-.34 1.21-2.25 1.97-2.74c.77-.49 3.4-.99 5.59-.71s3.23.27 3.51 1.42s-.82 2.68-.82 2.68"/><radialGradient id="IconifyId19bfeda96e6ce79252" cx="64.536" cy="88.962" r="19.144" fx="53.958" fy="95.795" gradientTransform="matrix(.068 .9977 -1.4592 .0994 189.96 15.728)" gradientUnits="userSpaceOnUse"><stop offset=".611" stop-color="#E3DDA6"/><stop offset=".966" stop-color="#E3DDA6" stop-opacity=".087"/><stop offset="1" stop-color="#E3DDA6" stop-opacity="0"/></radialGradient><path fill="url(#IconifyId19bfeda96e6ce79252)" d="M87.13 105.61s6.88-4.11 7.05-4.83c.16-.71-.16-2.03-.27-2.36s-.93-.66-1.32-1.21c-.38-.55-.16-1.1-.16-1.92s-2.36-3.45-2.52-4.33s0-2.63 0-2.63s-.77-1.37-1.15-2.03s-.71-1.7-1.04-2.3s-.49-.93-1.04-.93s-.88.16-.93.6s-.49 2.08-.49 2.74s-1.26 3.18-1.48 3.67s-1.21.93-2.19.88c-.99-.05-1.97-.88-2.69-1.53c-.4-.37-1.42-1.26-1.37-1.97c0 0 1.1-1.53.82-2.69s-1.32-1.15-3.51-1.42s-4.82.22-5.59.71s-.37 2.4-1.97 2.74c-.77.16-1.59-.27-1.81-.71s-.88-.6-1.59-.16s-4.17 3.45-4.55 3.78s-.44 1.64-.77 2.14s-2.52 1.32-3.07 1.64c-.55.33-.93.11-1.26.27s-1.75.05-1.92 3.34c-.06 1.11.71 2.47 1.32 3.73c.6 1.26 2.69 5.37 2.96 6.08s-.22 1.15-.49 1.37c-.6.49.66 1.64 2.52 1.75c1.81.11 2.96-.49 4.11-.33c.91.13 1.75-.93 2.74-1.21c.99-.27 4.99-.77 6.41-.55s1.86 1.12 1.92 1.48c.11.71 6.77-1.16 6.77-1.16z"/></svg>
  )
}

function VisitorActivity({ projectId }) {
  const [visitors, setVisitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState(null)
  const [error, setError] = useState(null)
  const [displayCount, setDisplayCount] = useState(10)
  const [dateFilter, setDateFilter] = useState(() => {
    // Get saved filter from localStorage, default to '7' (7 days)
    const savedFilter = localStorage.getItem(`visitor-activity-filter-${projectId}`)
    return savedFilter || '7'  // Default to 7 days
  })
  const [showDateDropdown, setShowDateDropdown] = useState(false)
  const [showVisitorModal, setShowVisitorModal] = useState(false)
  const [selectedVisitorId, setSelectedVisitorId] = useState(null)

  useEffect(() => {
    loadVisitors()
    loadProjectInfo()
  }, [projectId, dateFilter])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDateDropdown && !event.target.closest('[data-date-dropdown]')) {
        setShowDateDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showDateDropdown])

  const loadProjectInfo = async () => {
    try {
      const response = await projectsAPI.getOne(projectId)
      setProject(response.data)
    } catch (error) {
      console.error('Error loading project info:', error)
    }
  }

  const getDateRange = (days) => {
    // Get current date in local timezone
    const today = new Date()
    
    // For 1 day: today 00:00:00 to today 23:59:59 (local time)
    // For 7 days: 6 days ago 00:00:00 to today 23:59:59 (local time)  
    // For 30 days: 29 days ago 00:00:00 to today 23:59:59 (local time)
    
    const endDate = new Date(today)
    endDate.setHours(23, 59, 59, 999) // End of today (local time)
    
    const startDate = new Date(today)
    if (days === '1') {
      // For 1 day, start from today 00:00:00 (local time)
      startDate.setHours(0, 0, 0, 0)
    } else {
      // For multiple days, go back (days-1) from today and start from 00:00:00
      startDate.setDate(today.getDate() - (parseInt(days) - 1))
      startDate.setHours(0, 0, 0, 0)
    }
    
    // Convert to UTC for API
    const startUTC = new Date(startDate.getTime() - (startDate.getTimezoneOffset() * 60000)).toISOString()
    const endUTC = new Date(endDate.getTime() - (endDate.getTimezoneOffset() * 60000)).toISOString()
    
    console.log(`📅 Date Range for ${days} day(s):`)
    console.log(`  Local Start: ${startDate.toLocaleString()}`)
    console.log(`  Local End: ${endDate.toLocaleString()}`)
    console.log(`  UTC Start: ${startUTC}`)
    console.log(`  UTC End: ${endUTC}`)
    
    return {
      startDate: startUTC,
      endDate: endUTC
    }
  }

  const loadVisitors = async () => {
    try {
      setError(null)
      setLoading(true)
      
      console.log('🔄 VisitorActivity - Loading data with filter:', dateFilter)
      
      let response
      // Always use date filtering - removed 'all' option
      const { startDate, endDate } = getDateRange(dateFilter)
      console.log('📅 VisitorActivity - Using date range:', { startDate, endDate, filter: dateFilter })
      console.log('🔄 VisitorActivity - Making API call with date range:', { startDate, endDate })
      response = await visitorsAPI.getActivityView(projectId, null, startDate, endDate)
      console.log('📊 VisitorActivity - API response received:', response.data?.length, 'visitors')
      
      setVisitors(response.data || [])
      console.log(`✅ Loaded ${response.data?.length || 0} visitors for ${dateFilter} days`)
    } catch (error) {
      console.error('Error loading visitors:', error)
      setError('Failed to load visitor activity. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDateFilterChange = (newFilter) => {
    console.log('📅 VisitorActivity - Date filter changing from:', dateFilter, 'to:', newFilter)
    setDateFilter(newFilter)
    setDisplayCount(10) // Reset display count when filter changes
    setShowDateDropdown(false)
    // Save filter to localStorage so it persists on page reload
    localStorage.setItem(`visitor-activity-filter-${projectId}`, newFilter)
    
    // Log the new date range for debugging
    const { startDate, endDate } = getDateRange(newFilter)
    console.log('📅 VisitorActivity - New date range:', { startDate, endDate, filter: newFilter })
    console.log('🔄 VisitorActivity - Triggering data reload with new filter')
    
    // Set loading to true immediately to show skeleton when filter changes
    setLoading(true)
  }

  const loadMore = () => {
    setDisplayCount(prev => prev + 10)
  }

  const getCountryFlag = (country) => {
    const flags = {
      'United States': '🇺🇸',
      'India': '🇮🇳',
      'United Kingdom': '🇬🇧',
      'Canada': '🇨🇦',
      'Singapore': '🇸🇬',
      'China': '🇨🇳'
    }
    return flags[country] || <Globe style={{ fontSize: '16px' }} />
  }

  const getDeviceIcon = (device) => {
    if (device?.toLowerCase().includes('mobile')) return <Smartphone size={16} />
    if (device?.toLowerCase().includes('tablet')) return <Smartphone size={16} />
    return <Monitor size={16} />
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

    // Format using browser's locale (converts UTC to Local/IST)
    return date.toLocaleString('en-IN', options)
  }

  // Handle IP address click - get visitor ID and show modal
  const handleIPClick = (e, ipAddress, visitor) => {
    e.stopPropagation()
    console.log('🔍 IP Address clicked:', ipAddress)
    console.log('🔍 Full Visitor Data:', JSON.stringify(visitor, null, 2))
    
    if (ipAddress && ipAddress !== 'Unknown IP' && visitor) {
      // Try different possible visitor ID field names
      const visitorId = visitor.visitor_id || visitor.visitorId || visitor.visitorID || visitor.id || visitor.session_id
      
      console.log('🆔 Extracted Visitor ID:', visitorId)
      
      if (visitorId) {
        console.log('🆔 Using visitor ID from visitor data:', visitorId)
        
        // Show modal with visitor ID
        setSelectedVisitorId(visitorId)
        setShowVisitorModal(true)
      } else {
        console.log('❌ No visitor ID found in visitor data')
        console.log('❌ Available fields:', Object.keys(visitor))
      }
    }
  }

  // Close modal handler
  const closeVisitorModal = () => {
    setShowVisitorModal(false)
    setSelectedVisitorId(null)
  }

  // Date Filter Component
  const DateFilterComponent = () => (
    <div style={{ position: 'relative' }} data-date-dropdown>
      <div
        onClick={() => setShowDateDropdown(!showDateDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: '#3b82f6', // Yellow background
                
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                color: '#eeedebff',
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
          {dateFilter === '1' ? '1 Day' : dateFilter === '7' ? '7 Days' : dateFilter === '30' ? '30 Days' : '60 Days'}
        </span>
        <ChevronDown size={16} style={{
          transform: showDateDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s'
        }} />
      </div>

      {/* Dropdown */}
      {showDateDropdown && (
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
          {['1', '7', '30', '60'].map((filter) => (
            <div
              key={filter}
              onClick={() => handleDateFilterChange(filter)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: dateFilter === filter ? '#1e40af' : '#374151',
                background: dateFilter === filter ? '#eff6ff' : 'white',
                borderBottom: filter !== '60' ? '1px solid #f3f4f6' : 'none',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (dateFilter !== filter) {
                  e.currentTarget.style.background = '#f9fafb'
                }
              }}
              onMouseLeave={(e) => {
                if (dateFilter !== filter) {
                  e.currentTarget.style.background = 'white'
                }
              }}
            >
              {filter === '1' ? '1 Day' : filter === '7' ? '7 Days' : filter === '30' ? '30 Days' : '60 Days'}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <>
        <div className="header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '98%' }}>
            <h1 style={{ margin: 0 }}>Visitor Activity</h1>
            <DateFilterComponent />
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
          <Box className="chart-container" sx={{
            padding: 0,
            overflowX: 'hidden',
            width: '100%'
          }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <Box key={i} sx={{
                padding: '12px 20px',
                borderBottom: i < 8 ? '1px solid #e2e8f0' : 'none'
              }}>
                <Grid container spacing={2} sx={{ overflow: 'hidden', width: '100%' }}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                      <Box>
                        <Skeleton variant="text" width={70} height={10} animation="wave" sx={{ marginBottom: 0.25 }} />
                        <Skeleton variant="text" width={40} height={12} animation="wave" />
                      </Box>
                      <Box>
                        <Skeleton variant="text" width={100} height={10} animation="wave" sx={{ marginBottom: 0.25 }} />
                        <Skeleton variant="text" width={150} height={12} animation="wave" />
                      </Box>
                      <Box>
                        <Skeleton variant="text" width={60} height={10} animation="wave" sx={{ marginBottom: 0.25 }} />
                        <Skeleton variant="text" width={120} height={12} animation="wave" />
                      </Box>
                      <Box>
                        <Skeleton variant="text" width={80} height={10} animation="wave" sx={{ marginBottom: 0.25 }} />
                        <Skeleton variant="text" width={200} height={12} animation="wave" />
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                      <Box>
                        <Skeleton variant="text" width={90} height={10} animation="wave" sx={{ marginBottom: 0.25 }} />
                        <Skeleton variant="text" width={60} height={12} animation="wave" />
                      </Box>
                      <Box>
                        <Skeleton variant="text" width={50} height={10} animation="wave" sx={{ marginBottom: 0.25 }} />
                        <Skeleton variant="text" width={140} height={12} animation="wave" />
                      </Box>
                      <Box>
                        <Skeleton variant="text" width={50} height={10} animation="wave" sx={{ marginBottom: 0.25 }} />
                        <Skeleton variant="text" width={100} height={12} animation="wave" />
                      </Box>
                      <Box>
                        <Skeleton variant="text" width={60} height={10} animation="wave" sx={{ marginBottom: 0.25 }} />
                        <Skeleton variant="text" width={180} height={12} animation="wave" />
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Box>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <div className="header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '98%' }}>
            <h1 style={{ margin: 0 }}>Visitor Activity</h1>
            <DateFilterComponent />
          </div>
        </div>
        <div className="content">
          <div className="chart-container" style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '16px', color: '#ef4444', marginBottom: '10px' }}>{error}</div>
            <button
              onClick={loadVisitors}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '98%' }}>
          <h1 style={{ margin: 0 }}>Visitor Activity</h1>
          <DateFilterComponent />
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
            {!loading && visitors.length > 0 && (
              <span style={{ color: '#10b981', marginLeft: '8px' }}>
                • {visitors.length} visitors found
                <span style={{ color: '#64748b', marginLeft: '4px' }}>
                  (last {dateFilter} day{dateFilter !== '1' ? 's' : ''})
                </span>
              </span>
            )}
          </div>
        )}
      </div>

      <div className="content">
        <div className="chart-container" style={{
          padding: 0,
          overflowX: 'hidden',
          width: '100%'
        }}>
          {visitors.length > 0 ? (
            <div>
              {visitors.slice(0, displayCount).map((visitor, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '5px 20px',
                    borderBottom: idx < visitors.length - 1 ? '2px solid #1e293b' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: window.innerWidth > 768 ? 'minmax(0, 1fr) minmax(0, 1fr)' : '1fr',
                    gap: '16px',
                    overflow: 'hidden',
                    width: '100%'
                  }}>
                    {/* Left Column */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      minWidth: 0,
                      overflow: 'hidden'
                    }}>
                      {/* Page Views */}
                      <div>
                        <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                          Page Views:
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>
                          {visitor.page_views || 'N/A'}
                        </div>
                      </div>

                      {/* Local Time (Converted to IST) */}
                      <div>
                        <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                          Visit Time:
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#10b981' }}>
                          {formatToIST(visitor.visited_at, {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}<br />
                          {formatToIST(visitor.visited_at, {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false
                          })} (IST)
                        </div>
                      </div>

                      {/* Resolution */}
                      <div>
                        <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                          Resolution:
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>
                          {visitor.screen_resolution || 'Unknown'}
                        </div>
                      </div>

                      {/* System */}
                      <div>
                        <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                          System:
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '16px',marginTop: '2px' }}>{getDeviceIcon(visitor.device)}</span>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>
                            {visitor.os || 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      minWidth: 0,
                      overflow: 'hidden'
                    }}>
                      {/* Total Sessions */}
                      <div>
                        <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                          Total Sessions:
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#3b82f6' }}>
                          {visitor.total_sessions || 'N/A'}
                        </div>
                      </div>

                      {/* Location */}
                      <div>
                        <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                          Location:
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '10px' }}>{getCountryFlag(visitor.country)}</span>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>
                            {[visitor.city, visitor.state, visitor.country].filter(Boolean).join(', ') || 'Unknown'}
                          </span>
                        </div>
                      </div>

                      {/* ISP / IP Address - Clickable */}
                      <div>
                        <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                          ISP / IP Address:
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          fontWeight: '600', 
                          color: '#1e293b',
                          wordBreak: 'break-word',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span style={{ flex: 1 }}>
                            {visitor.isp || 'Unknown'}
                          </span>
                          <span 
                            onClick={(e) => handleIPClick(e, visitor.ip_address, visitor)}
                            style={{ 
                              color: visitor.ip_address && visitor.ip_address !== 'Unknown IP' && visitor.ip_address !== 'N/A' ? '#3b82f6' : '#64748b', 
                              cursor: visitor.ip_address && visitor.ip_address !== 'Unknown IP' && visitor.ip_address !== 'N/A' ? 'pointer' : 'default',
                              textDecoration: 'none',
                              backgroundColor: visitor.ip_address && visitor.ip_address !== 'Unknown IP' && visitor.ip_address !== 'N/A' ,
                              padding: '2px 4px',
                              borderRadius: '3px',
                              border: visitor.ip_address && visitor.ip_address !== 'Unknown IP' && visitor.ip_address !== 'N/A' ,
                              transition: 'all 0.2s ease',
                              
                              fontFamily: 'monospace'
                            }}
                            onMouseEnter={(e) => {
                              if (visitor.ip_address && visitor.ip_address !== 'Unknown IP' && visitor.ip_address !== 'N/A') {
                                e.currentTarget.style.backgroundColor = '#dbeafe'
                                e.currentTarget.style.borderColor = '#93c5fd'
                                e.currentTarget.style.textDecoration = 'underline'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (visitor.ip_address && visitor.ip_address !== 'Unknown IP' && visitor.ip_address !== 'N/A') {
                                e.currentTarget.style.backgroundColor = '#f0f9ff'
                                e.currentTarget.style.borderColor = '#bfdbfe'
                                e.currentTarget.style.textDecoration = 'none'
                              }
                            }}
                          >
                            ({visitor.ip_address || 'N/A'})
                          </span>
                          {visitor.ip_address && visitor.ip_address !== 'Unknown IP' && visitor.ip_address !== 'N/A' && (
                            <div
                              onClick={(e) => handleIPClick(e, visitor.ip_address, visitor)}
                              style={{
                                cursor: 'pointer',
                                color: '#3b82f6',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.color = '#2563eb'}
                              onMouseLeave={(e) => e.currentTarget.style.color = '#3b82f6'}
                              title="View Visitor Details"
                            >
                              <ExternalLink size={12} />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Referring URL */}
                      <div>
                        <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                          Referring URL:
                        </div>
                        <div style={{
                          fontSize: '12px',
                          fontWeight: '600',
                          color: visitor.referrer && visitor.referrer !== 'direct' ? '#10b981' : '#64748b',
                          wordBreak: 'break-word',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {visitor.referrer && visitor.referrer !== 'direct' ? visitor.referrer : '(No referring link)'}
                        </div>
                      </div>

                      {/* Visit Page - Clickable */}
                      <div>
                        <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                          Visit Page:
                        </div>
                        {visitor.entry_page ? (
                          <a
                            href={visitor.entry_page}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: '14px',
                              color: '#3b82f6',
                              textDecoration: 'none',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: 'block',
                              maxWidth: '300px'
                            }}
                            title={visitor.entry_page}
                          >
                            {formatUrl(visitor.entry_page)}
                          </a>
                        ) : (
                          <div style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#64748b',
                            fontStyle: 'italic'
                          }}>
                            Unknown
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Load More Button */}
              {displayCount < visitors.length && (
                <div style={{
                  padding: '20px',
                  textAlign: 'center',
                  borderTop: '1px solid #e2e8f0'
                }}>
                  <button
                    onClick={loadMore}
                    style={{
                      padding: '10px 24px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                  >
                    Load More ({visitors.length - displayCount} remaining)
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
              <p style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>No visitor activity yet</p>
              <p style={{ fontSize: '14px', color: '#64748b' }}>Start tracking visitors to see their activity here</p>
              <button
                onClick={loadVisitors}
                style={{
                  marginTop: '16px',
                  padding: '8px 16px',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Refresh
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Visitor Detail Modal */}
      {showVisitorModal && selectedVisitorId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '90%',
            height: '90%',
            maxWidth: '1200px',
            maxHeight: '800px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px',
              borderBottom: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc'
            }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                Visitor Details
              </h2>
              <button
                onClick={closeVisitorModal}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X size={20} color="#64748b" />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{
              height: 'calc(100% - 73px)',
              overflow: 'auto',
              padding: '0'
            }}>
              <VisitorDetail 
                projectId={projectId} 
                visitorId={selectedVisitorId}
                isModal={true}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default VisitorActivity