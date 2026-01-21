import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { visitorsAPI, projectsAPI } from '../../api/api'
import { Filter, Download, ExternalLink, ChevronRight, X, Globe, Calendar, ChevronDown } from 'lucide-react'
import { formatUrl } from '../../utils/urlUtils'

function VisitorPath({ projectId }) {
  const location = useLocation()
  const [visitors, setVisitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReferrer, setSelectedReferrer] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedVisitorSessions, setSelectedVisitorSessions] = useState(null)
  const [loadingVisitorSessions, setLoadingVisitorSessions] = useState(false)
  const [project, setProject] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [dateFilter, setDateFilter] = useState(() => {
    // Get saved filter from localStorage, default to '1' (1 day)
    const savedFilter = localStorage.getItem(`visitor-path-filter-${projectId}`)
    return savedFilter || '1'
  })
  const [showDateDropdown, setShowDateDropdown] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadVisitors()
    loadProjectInfo()

    // Check if we received a visitor_id from navigation state
    if (location.state?.selectedVisitorId) {
      loadVisitorSessions(location.state.selectedVisitorId)
    }
  }, [projectId, location.state, dateFilter])

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

  const loadVisitors = async (append = false) => {
    try {
      setError(null)
      if (!append) {
        setLoading(true)
        setVisitors([])
      } else {
        setIsLoadingMore(true)
      }
      
      console.log('VisitorPath - Loading data with filter:', dateFilter)
      
      let response
      const currentLimit = append ? visitors.length + 50 : 50
      
      if (dateFilter === 'all') {
        // Load all data without date filtering but with limit
        response = await visitorsAPI.getActivityView(projectId, currentLimit, null, null)
      } else {
        // Load data with date filtering and limit
        const { startDate, endDate } = getDateRange(dateFilter)
        console.log('VisitorPath - Using date range:', { startDate, endDate })
        response = await visitorsAPI.getActivityView(projectId, currentLimit, startDate, endDate)
      }
      
      const newVisitors = response.data || []
      
      if (append) {
        setVisitors(newVisitors)
      } else {
        setVisitors(newVisitors)
      }
      
      // Check if there might be more data
      setHasMore(newVisitors.length === currentLimit)
      
      console.log(`✅ Loaded ${newVisitors.length} visitors for ${dateFilter === 'all' ? 'all time' : dateFilter + ' days'}`)
    } catch (error) {
      console.error('Error loading visitors:', error)
      setError('Failed to load visitor paths. Please try again.')
    } finally {
      setLoading(false)
      setIsLoadingMore(false)
    }
  }

  const loadVisitorSessions = async (visitorId) => {
    setLoadingVisitorSessions(true)
    try {
      const response = await visitorsAPI.getAllSessions(projectId, visitorId)
      setSelectedVisitorSessions(response.data)
    } catch (error) {
      console.error('Error loading visitor sessions:', error)
    } finally {
      setLoadingVisitorSessions(false)
    }
  }

  const handleReferrerClick = (e, visitor) => {
    e.stopPropagation()
    setSelectedReferrer(visitor)
  }

  const closeModal = () => {
    setSelectedReferrer(null)
    setSelectedVisitorSessions(null)
  }

  const loadMore = () => {
    loadVisitors(true)
  }

  const handleDateFilterChange = (newFilter) => {
    console.log('VisitorPath - Date filter changing to:', newFilter)
    setDateFilter(newFilter)
    setShowDateDropdown(false)
    // Save filter to localStorage so it persists on page reload
    localStorage.setItem(`visitor-path-filter-${projectId}`, newFilter)
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
      'Russia': 'RU'
    }
    return codes[country] || 'XX'
  }

  const getCountryFlag = (country) => {
    const flags = {
      'United States': '🇺🇸',
      'India': '🇮🇳',
      'United Kingdom': '🇬🇧',
      'Canada': '🇨🇦',
      'Singapore': '🇸🇬',
      'China': '🇨🇳',
      'Bangladesh': '🇧🇩',
      'Pakistan': '🇵🇰',
      'Australia': '🇦🇺',
      'Germany': '🇩🇪',
      'France': '🇫🇷',
      'Japan': '🇯🇵',
      'Brazil': '🇧🇷',
      'Russia': '🇷🇺'
    }
    return flags[country] || '🌍'
  }

  const getDeviceIcon = (device) => {
    if (device?.toLowerCase().includes('mobile')) return '📱'
    if (device?.toLowerCase().includes('tablet')) return '📱'
    return '💻'
  }

  // Helper to format date to IST (India Standard Time)
  const formatToIST = (dateString, options = {}) => {
    if (!dateString) return ''

    // Ensure the date string is treated as UTC if it lacks timezone info
    let utcString = dateString
    if (typeof dateString === 'string' && !dateString.endsWith('Z') && !dateString.includes('+')) {
      utcString = dateString + 'Z'
    }

    const date = new Date(utcString)

    // Check if valid date
    if (isNaN(date.getTime())) return ''

    // Default to IST timezone
    const defaultOptions = {
      timeZone: 'Asia/Kolkata',
      ...options
    }

    return date.toLocaleString('en-IN', defaultOptions)
  }

  const formatDate = (date) => {
    return formatToIST(date, { day: '2-digit', month: 'short' })
  }

  const formatTime = (date) => {
    return formatToIST(date, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }) + ' (IST)'
  }

  // Date Filter Component
  const DateFilterComponent = () => (
    <div style={{ position: 'relative' }} data-date-dropdown>
      <div
        onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
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
          {dateFilter === '1' ? '1 Day' : dateFilter === '7' ? '7 Days' : dateFilter === '30' ? '30 Days' : 'All Time'}
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
          {['1', '7', '30', 'all'].map((filter) => (
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
                borderBottom: filter !== 'all' ? '1px solid #f3f4f6' : 'none',
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
              {filter === '1' ? '1 Day' : filter === '7' ? '7 Days' : filter === '30' ? '30 Days' : 'All Time'}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  if (loading) return (
    <>
      <div className="header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '98%' }}>
          <h1 style={{ margin: 0 }}>Visitor Paths</h1>
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
        <div className="chart-container">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{
              padding: '20px',
              borderBottom: i < 6 ? '1px solid #e2e8f0' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                animation: 'skeleton-loading 1.5s infinite',
                height: '40px',
                width: '40px',
                borderRadius: '50%'
              }} />
              <div style={{ flex: 1 }}>
                <div style={{
                  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'skeleton-loading 1.5s infinite',
                  height: '16px',
                  width: '120px',
                  borderRadius: '4px',
                  marginBottom: '4px'
                }} />
                <div style={{
                  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'skeleton-loading 1.5s infinite',
                  height: '12px',
                  width: '200px',
                  borderRadius: '4px'
                }} />
              </div>
              <div style={{
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                animation: 'skeleton-loading 1.5s infinite',
                height: '14px',
                width: '80px',
                borderRadius: '4px'
              }} />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  )

  if (error) {
    return (
      <>
        <div className="header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '98%' }}>
            <h1 style={{ margin: 0 }}>Visitor Paths</h1>
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

  // If visitor sessions are selected, show them on the page (not in popup)
  if (selectedVisitorSessions) {
    return (
      <>
        <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Visitor Journey</h1>
            <div style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>
              Session #{selectedVisitorSessions.sessions[0]?.session_id || 'N/A'}
            </div>
          </div>
          <button
            onClick={closeModal}
            style={{
              padding: '10px 20px',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e2e8f0'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f1f5f9'
            }}
          >
            ← Back
          </button>
        </div>

        <div className="content visitor-journey-content">
          {/* Simple Table Layout */}
          <div className="chart-container" style={{ padding: 0, overflowX: 'hidden' }}>
            {selectedVisitorSessions.sessions.map((session, sessionIdx) => (
              <div
                key={sessionIdx}
                className="chart-container journey-session-card"
                style={{
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  padding: '14px',
                  border: '2px solid #e2e8f0',
                  transition: 'all 0.3s',
                  overflowX: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(59, 130, 246, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {/* Session Header */}
                <div className="session-card-header" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                  paddingBottom: '16px',
                  borderBottom: '2px solid #e2e8f0'
                }}>
                  <div>
                    <div style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b', marginBottom: '6px' }}>
                      🔢 Session #{session.session_id}
                    </div>
                    <div style={{ fontSize: '14px', color: '#64748b', display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span>📅 {formatDate(session.visited_at)}</span>
                      <span>•</span>
                      <span>🕐 {formatTime(session.visited_at)}</span>
                    </div>
                  </div>
                  <div className="header-right" style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: '#3b82f6',
                      marginBottom: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      justifyContent: 'flex-end'
                    }}>
                      📄 {session.page_count} {session.page_count === 1 ? 'Page' : 'Pages'}
                    </div>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>
                      ⏱️ Duration: {session.session_duration ? `${Math.floor(session.session_duration / 60)}m ${session.session_duration % 60}s` : 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Session Details Grid */}
                <div className="entry-exit-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '16px',
                  marginBottom: '20px'
                }}>
                  {/* Entry Page */}
                  <div style={{
                    background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '2px solid #6ee7b7'
                  }}>
                    <div style={{ fontSize: '12px', color: '#065f46', fontWeight: '600', marginBottom: '8px' }}>
                      🚪 ENTRY PAGE
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#047857', wordBreak: 'break-all', overflowWrap: 'anywhere', lineHeight: '1.4' }}>
                      {session.entry_page || 'Unknown'}
                    </div>
                  </div>

                  {/* Exit Page */}
                  <div style={{
                    background: 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '2px solid #f87171'
                  }}>
                    <div style={{ fontSize: '12px', color: '#7f1d1d', fontWeight: '600', marginBottom: '8px' }}>
                      🚪 EXIT PAGE
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#991b1b', wordBreak: 'break-all', overflowWrap: 'anywhere', lineHeight: '1.4' }}>
                      {session.exit_page || 'Still browsing...'}
                    </div>
                  </div>
                </div>

                {/* Device & Browser Info */}
                <div className="device-stats-grid-container" style={{
                  background: 'white',
                  padding: '16px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  border: '2px solid #e2e8f0'
                }}>
                  <div className="device-stats-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '16px',
                    fontSize: '13px'
                  }}>
                    <div>
                      <div style={{ color: '#64748b', marginBottom: '4px', fontSize: '11px', fontWeight: '600' }}>DEVICE</div>
                      <div style={{ color: '#1e293b', fontWeight: '600' }}>
                        {getDeviceIcon(session.device)} {session.device || 'Unknown'}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: '#64748b', marginBottom: '4px', fontSize: '11px', fontWeight: '600' }}>BROWSER</div>
                      <div style={{ color: '#1e293b', fontWeight: '600' }}>
                        🌐 {session.browser || 'Unknown'}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: '#64748b', marginBottom: '4px', fontSize: '11px', fontWeight: '600' }}>LOCATION</div>
                      <div style={{ color: '#1e293b', fontWeight: '600' }}>
                        {getCountryFlag(session.country)} {session.city}, {session.country}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: '#64748b', marginBottom: '4px', fontSize: '11px', fontWeight: '600' }}>REFERRER</div>
                      <div style={{ color: '#1e293b', fontWeight: '600' }}>
                        {session.referrer && session.referrer !== 'direct' ? '🔗 ' + session.referrer.substring(0, 20) + '...' : '🔗 Direct'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Page Journey Timeline */}
                <div>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#1e293b',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    📍 Page Journey Timeline
                  </h4>

                  {session.page_journey && session.page_journey.length > 0 ? (
                    <div style={{ position: 'relative', paddingLeft: '32px' }}>
                      {/* Timeline vertical line */}
                      <div style={{
                        position: 'absolute',
                        left: '11px',
                        top: '20px',
                        bottom: '20px',
                        width: '3px',
                        background: 'linear-gradient(180deg, #3b82f6 0%, #8b5cf6 100%)',
                        borderRadius: '2px'
                      }} />

                      {session.page_journey.map((page, pageIdx) => (
                        <div
                          key={pageIdx}
                          style={{
                            position: 'relative',
                            marginBottom: '20px'
                          }}
                        >
                          {/* Timeline dot with number */}
                          <div style={{
                            position: 'absolute',
                            left: '-32px',
                            top: '14px',
                            width: '26px',
                            height: '26px',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                            borderRadius: '50%',
                            border: '4px solid white',
                            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: '700',
                            color: 'white',
                            zIndex: 1
                          }}>
                            {pageIdx + 1}
                          </div>

                          <div className="timeline-card" style={{
                            background: 'white',
                            padding: '16px',
                            borderRadius: '12px',
                            border: '2px solid #e2e8f0',
                            transition: 'all 0.2s'
                          }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = '#3b82f6'
                              e.currentTarget.style.transform = 'translateX(6px)'
                              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.2)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = '#e2e8f0'
                              e.currentTarget.style.transform = 'translateX(0)'
                              e.currentTarget.style.boxShadow = 'none'
                            }}>
                            <div className="timeline-card-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                              <div className="timeline-info-left" style={{ flex: 1 }}>
                                <div style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>
                                  📄 {page.title || 'Untitled Page'}
                                </div>
                                <a
                                  href={page.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    fontSize: '12px',
                                    color: '#3b82f6',
                                    textDecoration: 'none',
                                    wordBreak: 'break-all',
                                    overflowWrap: 'anywhere',
                                    display: 'block',
                                    lineHeight: '1.4',
                                    maxWidth: '100%'
                                  }}
                                >
                                  {page.url} <ExternalLink size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
                                </a>
                              </div>
                              <div className="timeline-info-right" style={{ textAlign: 'right', marginLeft: '16px', minWidth: '140px' }}>
                                {/* Actual Time - Primary */}
                                {page.viewed_at && (
                                  <>
                                    <div className="visit-time-badge" style={{
                                      fontSize: '20px',
                                      color: '#3b82f6',
                                      fontWeight: '700',
                                      background: '#eff6ff',
                                      padding: '8px 12px',
                                      borderRadius: '8px',
                                      border: '2px solid #bfdbfe',
                                      marginBottom: '6px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '6px'
                                    }}>
                                      🕐 {formatToIST(page.viewed_at, {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit',
                                        hour12: false
                                      })} (IST)
                                    </div>
                                    <div style={{
                                      fontSize: '11px',
                                      color: '#64748b',
                                      fontWeight: '600',
                                      marginBottom: '8px'
                                    }}>
                                      Visited at
                                    </div>
                                  </>
                                )}
                                {/* Time Spent - Secondary */}
                                <div style={{
                                  fontSize: '16px',
                                  fontWeight: '700',
                                  color: '#10b981',
                                  marginBottom: '4px'
                                }}>
                                  ⏱️ {page.time_spent || 0}s
                                </div>
                                <div style={{
                                  fontSize: '10px',
                                  color: '#94a3b8'
                                }}>
                                  Time Spent
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      padding: '40px',
                      textAlign: 'center',
                      color: '#94a3b8',
                      background: 'white',
                      borderRadius: '12px',
                      border: '2px dashed #e2e8f0'
                    }}>
                      <p style={{ fontSize: '14px' }}>No page views recorded for this session</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '98%' }}>
          <h1 style={{ margin: 0 }}>Visitor Path</h1>
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
            <Globe size={14} />
            <span>Viewing: {project.name}</span>
            
          </div>
        )}
      </div>

      {/* Referrer Details Modal */}
      {selectedReferrer && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '1000px',
              width: '95%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              animation: 'slideIn 0.3s ease'
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              position: 'sticky',
              top: 0,
              background: 'white',
              zIndex: 10,
              paddingBottom: '16px',
              borderBottom: '3px solid #e2e8f0'
            }}>
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px 0' }}>
                  👤 Complete Visitor History
                </h2>
                <div style={{ fontSize: '15px', color: '#64748b', display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <span>
                    Visitor ID: <span style={{ fontWeight: '600', color: '#3b82f6', fontFamily: 'monospace' }}>{selectedReferrer.visitor_id}</span>
                  </span>
                  <span style={{
                    padding: '4px 12px',
                    background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                    borderRadius: '12px',
                    fontWeight: '600',
                    color: '#065f46',
                    fontSize: '13px'
                  }}>
                    📊 {selectedReferrer.total_sessions || 1} {selectedReferrer.total_sessions === 1 ? 'Session' : 'Sessions'}
                  </span>
                </div>
              </div>
              <button
                onClick={closeModal}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '8px',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                  fontSize: '24px',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                  marginLeft: '16px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e2e8f0'
                  e.currentTarget.style.color = '#1e293b'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f1f5f9'
                  e.currentTarget.style.color = '#64748b'
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Sessions Timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {selectedReferrer.sessions?.map((session, sessionIdx) => (
                <div
                  key={sessionIdx}
                  style={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '3px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(59, 130, 246, 0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {/* Session Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                    paddingBottom: '12px',
                    borderBottom: '2px solid #e2e8f0'
                  }}>
                    <div>
                      <div style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b', marginBottom: '6px' }}>
                        🔢 Session #{session.session_id}
                      </div>
                      <div style={{ fontSize: '14px', color: '#64748b', display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span>📅 {formatDate(session.visited_at)}</span>
                        <span>•</span>
                        <span>🕐 {formatTime(session.visited_at)}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: '#3b82f6',
                        marginBottom: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        justifyContent: 'flex-end'
                      }}>
                        📄 {session.page_count} {session.page_count === 1 ? 'Page' : 'Pages'}
                      </div>
                      <div style={{ fontSize: '14px', color: '#64748b' }}>
                        ⏱️ Duration: {session.session_duration ? `${Math.floor(session.session_duration / 60)}m ${session.session_duration % 60}s` : 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Session Details Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '16px',
                    marginBottom: '20px'
                  }}>
                    {/* Entry Page */}
                    <div style={{
                      background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                      padding: '16px',
                      borderRadius: '12px',
                      border: '2px solid #6ee7b7'
                    }}>
                      <div style={{ fontSize: '12px', color: '#065f46', fontWeight: '600', marginBottom: '8px' }}>
                        🚪 ENTRY PAGE
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#047857', wordBreak: 'break-all', overflowWrap: 'anywhere', lineHeight: '1.4' }}>
                        {session.entry_page || 'Unknown'}
                      </div>
                    </div>

                    {/* Exit Page */}
                    <div style={{
                      background: 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)',
                      padding: '16px',
                      borderRadius: '12px',
                      border: '2px solid #f87171'
                    }}>
                      <div style={{ fontSize: '12px', color: '#7f1d1d', fontWeight: '600', marginBottom: '8px' }}>
                        🚪 EXIT PAGE
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#991b1b', wordBreak: 'break-all', overflowWrap: 'anywhere', lineHeight: '1.4' }}>
                        {session.exit_page || 'Still browsing...'}
                      </div>
                    </div>
                  </div>

                  {/* Device & Browser Info */}
                  <div style={{
                    background: 'white',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    border: '2px solid #e2e8f0'
                  }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '16px',
                      fontSize: '13px'
                    }}>
                      <div>
                        <div style={{ color: '#64748b', marginBottom: '4px', fontSize: '11px', fontWeight: '600' }}>DEVICE</div>
                        <div style={{ color: '#1e293b', fontWeight: '600' }}>
                          {getDeviceIcon(session.device)} {session.device || 'Unknown'}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: '#64748b', marginBottom: '4px', fontSize: '11px', fontWeight: '600' }}>BROWSER</div>
                        <div style={{ color: '#1e293b', fontWeight: '600' }}>
                          🌐 {session.browser || 'Unknown'}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: '#64748b', marginBottom: '4px', fontSize: '11px', fontWeight: '600' }}>LOCATION</div>
                        <div style={{ color: '#1e293b', fontWeight: '600' }}>
                          {getCountryFlag(session.country)} {session.city}, {session.country}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: '#64748b', marginBottom: '4px', fontSize: '11px', fontWeight: '600' }}>REFERRER</div>
                        <div style={{ color: '#1e293b', fontWeight: '600' }}>
                          {session.referrer && session.referrer !== 'direct' ? '🔗 ' + session.referrer.substring(0, 20) + '...' : '🔗 Direct'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Page Journey Timeline */}
                  <div>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#1e293b',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      📍 Page Journey Timeline
                    </h4>

                    {session.page_journey && session.page_journey.length > 0 ? (
                      <div style={{ position: 'relative', paddingLeft: '32px' }}>
                        {/* Timeline vertical line */}
                        <div style={{
                          position: 'absolute',
                          left: '11px',
                          top: '20px',
                          bottom: '20px',
                          width: '3px',
                          background: 'linear-gradient(180deg, #3b82f6 0%, #8b5cf6 100%)',
                          borderRadius: '2px'
                        }} />

                        {session.page_journey.map((page, pageIdx) => (
                          <div
                            key={pageIdx}
                            style={{
                              position: 'relative',
                              marginBottom: '12px'
                            }}
                          >
                            {/* Timeline dot with number */}
                            <div style={{
                              position: 'absolute',
                              left: '-32px',
                              top: '10px',
                              width: '24px',
                              height: '24px',
                              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                              borderRadius: '50%',
                              border: '3px solid white',
                              boxShadow: '0 2px 6px rgba(59, 130, 246, 0.3)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10px',
                              fontWeight: '700',
                              color: 'white',
                              zIndex: 1
                            }}>
                              {pageIdx + 1}
                            </div>

                            <div style={{
                              background: 'white',
                              padding: '10px',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              transition: 'all 0.2s'
                            }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#3b82f6'
                                e.currentTarget.style.transform = 'translateX(6px)'
                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.2)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#e2e8f0'
                                e.currentTarget.style.transform = 'translateX(0)'
                                e.currentTarget.style.boxShadow = 'none'
                              }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ width: '100%' }}>
                                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '3px', wordBreak: 'break-word' }}>
                                    📄 {page.title || 'Untitled Page'}
                                  </div>
                                  <a
                                    href={page.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      fontSize: '10px',
                                      color: '#3b82f6',
                                      textDecoration: 'none',
                                      wordBreak: 'break-all',
                                      overflowWrap: 'anywhere',
                                      lineHeight: '1.4',
                                      display: 'block',
                                      maxWidth: '100%',
                                      whiteSpace: 'normal'
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    title={page.url}
                                  >
                                    {formatUrl(page.url)}
                                  </a>
                                </div>
                                <div style={{ textAlign: 'right', marginLeft: '16px', minWidth: '140px' }}>
                                  <div style={{
                                    fontSize: '20px',
                                    fontWeight: '700',
                                    color: '#10b981',
                                    marginBottom: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end',
                                    gap: '6px'
                                  }}>
                                    ⏱️ {page.time_spent || 0}s
                                  </div>
                                  <div style={{
                                    fontSize: '12px',
                                    color: '#64748b',
                                    fontWeight: '600',
                                    marginBottom: '4px'
                                  }}>
                                    Time Spent
                                  </div>
                                  <div style={{
                                    fontSize: '13px',
                                    color: '#3b82f6',
                                    fontWeight: '600',
                                    background: '#eff6ff',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    border: '1px solid #dbeafe'
                                  }}>
                                    🕐 {new Date(page.viewed_at).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      second: '2-digit',
                                      hour12: true
                                    })}
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                                    Visited at
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{
                        padding: '40px',
                        textAlign: 'center',
                        color: '#94a3b8',
                        background: 'white',
                        borderRadius: '12px',
                        border: '2px dashed #e2e8f0'
                      }}>
                        <p style={{ fontSize: '14px' }}>No page views recorded for this session</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="content" style={{ overflowX: 'hidden' }}>
        {/* Filters and Export */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>

        </div>

        {/* Visitor List */}
        <div className="chart-container" style={{ padding: 0, overflowX: 'hidden', width: '100%', background: 'white' }}>
          {visitors.length > 0 ? (
            <div>
              {/* Table Header */}
              <div className="visitor-header" style={{
                display: 'grid',
                gridTemplateColumns: '90px 120px 250px 180px 1fr',
                gap: '20px',
                padding: '16px 20px',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                fontSize: '11px',
                fontWeight: '700',
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                <div>DATE</div>
                <div>TIME</div>
                <div>SYSTEM</div>
                <div>LOCATION</div>
                <div>PAGE DETAILS</div>
              </div>
              {visitors.map((visitor, idx) => (
                <div
                  key={idx}
                  className="visitor-row"
                  style={{
                    padding: '16px 20px',
                    borderBottom: idx < visitors.length - 1 ? '1px solid #e2e8f0' : 'none',
                    display: 'grid',
                    gridTemplateColumns: '90px 120px 250px 180px 1fr',
                    gap: '20px',
                    alignItems: 'start',
                    minWidth: 0,
                    maxWidth: '100%',
                    overflowX: 'hidden'
                  }}>

                  {/* DATE */}
                  <div className="visitor-col" data-label="DATE" style={{ fontSize: '13px', fontWeight: '500', color: '#1e293b' }}>
                    {formatDate(visitor.visited_at)}
                  </div>

                  {/* TIME */}
                  <div className="visitor-col" data-label="TIME" style={{ fontSize: '13px', color: '#64748b' }}>
                    {formatTime(visitor.visited_at)}
                  </div>

                  {/* SYSTEM */}
                  <div className="visitor-col" data-label="SYSTEM" style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                    <div style={{ padding: '4px', background: '#f1f5f9', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '18px', lineHeight: 1 }}>{getDeviceIcon(visitor.device)}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {visitor.browser || 'Unknown Browser'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {visitor.device || 'Unknown OS'}
                      </div>
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                        {visitor.screen_resolution || '1024×1024'}
                      </div>
                    </div>
                  </div>

                  {/* LOCATION */}
                  <div className="visitor-col" data-label="LOCATION" style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ color: '#94a3b8' }}>{getCountryCode(visitor.country).toLowerCase()}</span> {visitor.country || 'Unknown'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {visitor.city || 'Unknown City'}
                    </div>
                  </div>

                  {/* PAGE DETAILS */}
                  <div className="visitor-col" data-label="PAGE DETAILS" style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {visitor.entry_page ? (() => {
                        try {
                          return new URL(visitor.entry_page).hostname
                        } catch {
                          return 'Unknown Domain'
                        }
                      })() : 'Unknown Domain'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#10b981', marginBottom: '6px' }}>
                      {visitor.referrer && visitor.referrer !== 'direct' ? '(Referring link)' : '(No referring link)'}
                    </div>
                    <a
                      href={visitor.entry_page}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        fontSize: '11px',
                        color: '#3b82f6',
                        textDecoration: 'none',
                        wordBreak: 'break-all',
                        overflowWrap: 'anywhere',
                        lineHeight: '1.4',
                        display: 'block',
                        maxWidth: '200px'
                      }}
                      title={visitor.entry_page}
                    >
                      {formatUrl(visitor.entry_page)}
                    </a>
                  </div>
                </div>
              ))}

              {/* Load More Button */}
              {hasMore && visitors.length > 0 && (
                <div style={{
                  padding: '20px',
                  textAlign: 'center',
                  borderTop: '1px solid #e2e8f0'
                }}>
                  <button
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    style={{
                      padding: '10px 24px',
                      backgroundColor: isLoadingMore ? '#94a3b8' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: isLoadingMore ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      opacity: isLoadingMore ? 0.7 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoadingMore) e.currentTarget.style.backgroundColor = '#2563eb'
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoadingMore) e.currentTarget.style.backgroundColor = '#3b82f6'
                    }}
                  >
                    {isLoadingMore ? 'Loading...' : `Load More Visitors`}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
              <p style={{ fontSize: '16px', fontWeight: '500' }}>No visitor data yet</p>
              <p style={{ fontSize: '14px' }}>Start tracking visitors to see their paths</p>
            </div>
          )}
        </div>
      </div>
      <style>
        {`
          @media (max-width: 768px) {
            .header h1 {
              font-size: 20px !important;
            }
            .visitor-journey-content {
                padding: 10px !important;
            }
            .journey-session-card {
                padding: 12px !important;
                border: 1px solid #e2e8f0 !important;
                margin-bottom: 15px !important;
            }
            .session-card-header {
                flex-direction: column !important;
                align-items: flex-start !important;
                gap: 10px !important;
                padding-bottom: 12px !important;
            }
            .session-card-header .header-right {
                text-align: left !important;
                width: 100% !important;
            }
            .session-card-header .header-right > div {
                justify-content: flex-start !important;
            }
            .entry-exit-grid {
                grid-template-columns: 1fr !important;
                gap: 12px !important;
            }
            .device-stats-grid {
                grid-template-columns: 1fr 1fr !important;
                gap: 10px !important;
            }
            .timeline-card {
                padding: 12px !important;
            }
            .timeline-card-inner {
                flex-direction: column !important;
                gap: 12px !important;
            }
            .timeline-info-right {
                margin-left: 0 !important;
                text-align: left !important;
                width: 100% !important;
            }
            .visit-time-badge {
                justify-content: flex-start !important;
                font-size: 16px !important;
                padding: 6px 10px !important;
            }
            .timeline-info-right > div {
                justify-content: flex-start !important;
            }

            /* Visitor List Responsive */
            .visitor-header {
                display: none !important;
            }
            .visitor-row {
                display: block !important;
                background: white !important;
                border-radius: 12px !important;
                margin-bottom: 15px !important;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
                border: 1px solid #e2e8f0 !important;
                padding: 15px !important;
            }
            .visitor-col {
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                padding: 10px 0 !important;
                border-bottom: 1px solid #f1f5f9 !important;
                text-align: right !important;
            }
            .visitor-col:last-child {
                border-bottom: none !important;
            }
            .visitor-col:after {
                content: "";
                display: table;
                clear: both;
            }
            .visitor-col:before {
                content: attr(data-label);
                font-weight: 600;
                color: #64748b;
                font-size: 12px;
                text-align: left !important;
                margin-right: 15px !important;
                flex-shrink: 0;
            }
            .visitor-col > div, .visitor-col > a {
                max-width: 65% !important;
                text-align: right !important;
            }
            .referrer-label {
                display: none !important;
            }
            .device-info, .time-info {
                text-align: right !important;
            }
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideIn {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>
    </>
  )
}

export default VisitorPath
