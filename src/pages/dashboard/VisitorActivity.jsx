import { useState, useEffect } from 'react'
import { visitorsAPI, projectsAPI } from '../../api/api'
import { Skeleton, Box, Grid } from '@mui/material'
import { Calendar, ChevronDown } from 'lucide-react'
import { formatUrl } from '../../utils/urlUtils'

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
    return flags[country] || '🌍'
  }

  const getDeviceIcon = (device) => {
    if (device?.toLowerCase().includes('mobile')) return '📱'
    if (device?.toLowerCase().includes('tablet')) return '📱'
    return '💻'
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
                          <span style={{ fontSize: '16px' }}>{getDeviceIcon(visitor.device)}</span>
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
                          <span style={{ fontSize: '16px' }}>{getCountryFlag(visitor.country)}</span>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>
                            {[visitor.city, visitor.state, visitor.country].filter(Boolean).join(', ') || 'Unknown'}
                          </span>
                        </div>
                      </div>

                      {/* ISP / IP Address */}
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
                          textOverflow: 'ellipsis'
                        }}>
                          {visitor.isp || 'Unknown'} ({visitor.ip_address || 'N/A'})
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
    </>
  )
}

export default VisitorActivity