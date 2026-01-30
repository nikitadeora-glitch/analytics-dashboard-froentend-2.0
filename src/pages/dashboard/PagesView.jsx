import { useState, useEffect } from 'react'
import { visitorsAPI, projectsAPI } from '../../api/api'
import api from '../../api/api'
import { Eye, ChevronDown, Calendar, Smartphone, Monitor, Globe } from 'lucide-react'
import { NotoGlobeShowingAsiaAustralia } from '../../components/NotoGlobeShowingAsiaAustralia'

function PagesView({ projectId }) {
  const [allVisitors, setAllVisitors] = useState([])
  const [displayedVisitors, setDisplayedVisitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [project, setProject] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const [period, setPeriod] = useState(() => {
    const savedPeriod = localStorage.getItem(`pagesview-period-${projectId}`)
    return savedPeriod || '7'  // Default to 7 days
  })
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false)

  useEffect(() => {
    console.log(' PagesView useEffect - projectId:', projectId, 'period:', period)
    if (projectId) {
      loadVisitors()
      loadProjectInfo()
    } else {
      console.log(' No projectId provided')
      setLoading(false)
    }
  }, [projectId, period])

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

  const getDateRange = (days) => {
    // Get current date in UTC (matching VisitorPath)
    const today = new Date()
    
    // For 1 day: today 00:00:00 to today 23:59:59 (UTC)
    // For 7 days: today + last 6 days = total 7 days including today (UTC)
    // For 30 days: today + last 29 days = total 30 days including today (UTC)
    
    const endDate = new Date(today)
    endDate.setUTCHours(23, 59, 59, 999) // End of today in UTC
    
    const startDate = new Date(today)
    if (days === '1') {
      // For 1 day, start from today 00:00:00 in UTC
      startDate.setUTCHours(0, 0, 0, 0)
    } else {
      // For multiple days, go back (days-1) days from today and start from 00:00:00 in UTC
      startDate.setUTCDate(today.getUTCDate() - (parseInt(days) - 1))
      startDate.setUTCHours(0, 0, 0, 0)
    }
    
    // Convert to ISO string for API (matching VisitorPath)
    const startUTC = startDate.toISOString()
    const endUTC = endDate.toISOString()
    
    console.log(`📅 PagesView Date Range for ${days} day(s):`)
    console.log(`  UTC Start: ${startUTC}`)
    console.log(`  UTC End: ${endUTC}`)
    
    return {
      startDate: startUTC,
      endDate: endUTC
    }
  }

  const loadProjectInfo = async () => {
    try {
      const response = await projectsAPI.getOne(projectId)
      setProject(response.data)
    } catch (error) {
      console.error('Error loading project info:', error)
    }
  }

  const loadVisitors = async () => {
    try {
      console.log('🔄 PagesView - Loading visitors for project:', projectId)
      const { startDate, endDate } = getDateRange(period)
      console.log('📅 PagesView - Using date range:', { startDate, endDate, period })
      
      // Set loading to true and clear previous data to prevent state leakage
      setLoading(true)
      
      // Use getActivityView API with date parameters - no limit to get all data in range
      console.log('🔄 PagesView - Making API call with date range:', { startDate, endDate })
      const response = await visitorsAPI.getActivityView(projectId, null, startDate, endDate)
      console.log('✅ PagesView - API Response received:')
      console.log('  Response data length:', response.data?.length)
      console.log('  Data type:', typeof response.data)
      console.log('  Is array:', Array.isArray(response.data))

      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        console.log('✅ PagesView - Setting visitor data:', response.data.length, 'visitors')
        setAllVisitors(response.data)
        
        // Reset pagination state with new data
        const initialChunk = response.data.slice(0, 10)
        setDisplayedVisitors(initialChunk)
        setCurrentIndex(10)
        setHasMore(response.data.length > 10)
        
        console.log('✅ PagesView - Visitors data loaded successfully')
        console.log(`📊 PagesView - Initial display: ${initialChunk.length} of ${response.data.length} visitors`) 
        console.log(`📊 PagesView - Load More count: ${response.data.length - 10} remaining`)
      } else {
        console.log('⚠️ PagesView - No visitors data received')
        console.log('  Response data:', response.data)
        console.log('  Response status:', response.status)
        
        // Clear all state when no data
        setAllVisitors([])
        setDisplayedVisitors([])
        setCurrentIndex(0)
        setHasMore(false)
      }
    } catch (error) {
      console.error('❌ PagesView - Error loading visitors:', error)
      console.error('  Error response:', error.response?.data)
      console.error('  Error status:', error.response?.status)
      
      // Clear all state on error
      setAllVisitors([])
      setDisplayedVisitors([])
      setCurrentIndex(0)
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  const handlePeriodChange = (newPeriod) => {
    console.log('📅 PagesView - Period changing from:', period, 'to:', newPeriod)
    
    // Reset pagination state immediately to prevent state leakage
    setDisplayedVisitors([])
    setCurrentIndex(0)
    setHasMore(false)
    setLoadingMore(false)
    
    // Update period and localStorage - useEffect will automatically trigger loadVisitors()
    setPeriod(newPeriod)
    localStorage.setItem(`pagesview-period-${projectId}`, newPeriod)
    setShowPeriodDropdown(false)
    
    // Log the new date range for debugging
    const { startDate, endDate } = getDateRange(newPeriod)
    console.log('📅 PagesView - New date range:', { startDate, endDate, period: newPeriod })
    console.log('🔄 PagesView - Period updated, useEffect will trigger data reload')
  }

  const loadMore = () => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)

    // Simulate loading delay for better UX
    setTimeout(() => {
      const nextChunkSize = Math.floor(Math.random() * 2) + 3 // Random between 3-4
      const nextChunk = allVisitors.slice(currentIndex, currentIndex + nextChunkSize)

      setDisplayedVisitors(prev => [...prev, ...nextChunk])
      setCurrentIndex(prev => prev + nextChunkSize)
      setHasMore(currentIndex + nextChunkSize < allVisitors.length)
      setLoadingMore(false)
    }, 500)
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
    if (device?.toLowerCase().includes('mobile')) return <Smartphone size={20} />
    if (device?.toLowerCase().includes('tablet')) return <Smartphone size={20} />
    return <Monitor size={20} />
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

  if (loading) return (
    <>
      <div className="header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '98%' }}>
                <h1 style={{ margin: 0 }}>Pages View </h1>
                
                {/* Date Filter - Yellow Highlighted Area */}
                <div style={{ position: 'relative' }} data-period-dropdown>
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
        <div className="chart-container">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} style={{
              padding: '16px 20px',
              borderBottom: i < 8 ? '1px solid #e2e8f0' : 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'skeleton-loading 1.5s infinite',
                  height: '16px',
                  width: '70%',
                  borderRadius: '4px',
                  marginBottom: '4px'
                }} />
                <div style={{
                  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'skeleton-loading 1.5s infinite',
                  height: '12px',
                  width: '85%',
                  borderRadius: '4px'
                }} />
              </div>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{
                  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'skeleton-loading 1.5s infinite',
                  height: '14px',
                  width: '40px',
                  borderRadius: '4px'
                }} />
                <div style={{
                  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'skeleton-loading 1.5s infinite',
                  height: '14px',
                  width: '60px',
                  borderRadius: '4px'
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )

  return (
    <>
      <div className="header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '98%' }}>
          <h1 style={{ margin: 0 }}>Pages View</h1>
          
          {/* Date Filter - Yellow Highlighted Area */}
          <div style={{ position: 'relative' }} data-period-dropdown>
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



        <div className="chart-container" style={{ padding: 0, overflowX: 'hidden' }}>
          {/* Table Header */}
          <div className="pages-table-header" style={{
            display: 'grid',
            gridTemplateColumns: '80px 100px 50px 200px 250px 1fr',
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            borderBottom: '2px solid #cbd5e1',
            fontSize: '11px',
            fontWeight: '700',
            color: '#475569',
            alignItems: 'center',
            gap: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            minWidth: 0,
            maxWidth: '100%'
          }}>
            <div> Date</div>
            <div> Time</div>
            <div></div>
            <div> System</div>
            <div>Location</div>
            <div> Page Details</div>
          </div>

          {/* Table Rows */}
          {displayedVisitors.length > 0 ? (
            displayedVisitors.map((visitor, idx) => {
              const visitDate = new Date(visitor.visited_at)
              const deviceIcon = getDeviceIcon(visitor.device)
              const referrerText = visitor.referrer && visitor.referrer !== 'direct'
                ? visitor.referrer
                : '(No referring link)'
              const referrerColor = visitor.referrer && visitor.referrer !== 'direct' ? '#3b82f6' : '#10b981'

              // Extract time from local_time_formatted
              const timeDisplay = (() => {
                if (visitor.local_time_formatted) {
                  const timePart = visitor.local_time_formatted.split(',').pop().trim()
                  return timePart
                }
                return visitDate.toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false
                })
              })()

              return (
                <div
                  key={idx}
                  className="pages-table-row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 100px 50px 200px 250px 1fr',
                    padding: '14px 16px',
                    borderBottom: idx < displayedVisitors.length - 1 ? '1px solid #f1f5f9' : 'none',
                    alignItems: 'start',
                    gap: '12px',
                    minWidth: 0,
                    maxWidth: '100%'
                  }}
                >
                  {/* Date */}
                  <div className="pages-col" data-label="Date" style={{
                    fontSize: '13px',
                    color: '#1e293b',
                    fontWeight: '500',
                    paddingTop: '2px'
                  }}>
                    {formatToIST(visitor.visited_at, { day: '2-digit', month: 'short' })}
                  </div>

                  {/* Time */}
                  <div className="pages-col" data-label="Time" style={{
                    fontSize: '13px',
                    color: '#64748b',
                    paddingTop: '2px'
                  }}>
                    {formatToIST(visitor.visited_at, {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false
                    })} (IST)
                  </div>

                  {/* Icon (Browser/Device) */}
                  <div className="pages-col pages-icon-col" style={{
                    fontSize: '20px',
                    textAlign: 'center',
                    paddingTop: '0px'
                  }}>
                    {deviceIcon}
                  </div>

                  {/* System (Browser + OS + Resolution) */}
                  <div className="pages-col" data-label="System" style={{ minWidth: 0 }}>
                    <div className="system-content">
                      <div style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#1e293b',
                        marginBottom: '2px'
                      }}>
                        {visitor.browser || 'Unknown Browser'}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: '#64748b'
                      }}>
                        {visitor.os || 'Unknown OS'}
                      </div>
                      <div style={{
                        fontSize: '10px',
                        color: '#94a3b8'
                      }}>
                        {visitor.screen_resolution || 'Unknown'}
                      </div>
                    </div>
                  </div>

                  {/* Location / Language */}
                  <div className="pages-col" data-label="Location" style={{ minWidth: 0 }}>
                    <div className="location-content">
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#1e293b',
                        marginBottom: '2px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        <Globe style={{ width: '16px', height: '16px', marginRight: '4px' }} /> {visitor.country || 'Unknown'},
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: '#64748b',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {visitor.city || 'Unknown'}
                      </div>
                    </div>
                  </div>

                  {/* Host Name/Web Page/Referrer */}
                  <div className="pages-col" data-label="Page Details" style={{ minWidth: 0, maxWidth: '100%' }}>
                    <div className="page-details-content">
                      <div style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#1e293b',
                        marginBottom: '2px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {(() => {
                        try {
                          return visitor.entry_page ? new URL(visitor.entry_page).hostname : 'Unknown'
                        } catch (error) {
                          console.warn('Invalid URL:', visitor.entry_page)
                          return 'Unknown'
                        }
                      })()}
                      </div>
                      <div style={{
                        fontSize: '10px',
                        color: referrerColor,
                        marginBottom: '2px',
                        wordBreak: 'break-all',
                        lineHeight: '1.4'
                      }}>
                        {referrerText}
                      </div>
                      <a
                        href={visitor.entry_page}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={visitor.entry_page}
                        style={{
                          fontSize: '11px',
                          color: '#3b82f6',
                          textDecoration: 'none',
                          display: 'inline-block',
                          wordBreak: 'break-all',
                          lineHeight: '1.4',
                          cursor: 'pointer',
                          whiteSpace: 'normal',
                          wordWrap: 'break-word',
                          maxWidth: '100%',
                          padding: '2px 0'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                      >
                        {visitor.entry_page} ↗
                      </a>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
              <Eye size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <p style={{ fontSize: '16px', fontWeight: '500' }}>No page data yet</p>
              <p style={{ fontSize: '14px' }}>Start tracking visitors to see page views</p>
            </div>
          )}

          {/* Load More Button */}
          {hasMore && (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              borderTop: '1px solid #f1f5f9'
            }}>
              <button
                onClick={loadMore}
                disabled={loadingMore}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  backgroundColor: loadingMore ? '#f1f5f9' : '#3b82f6',
                  color: loadingMore ? '#64748b' : 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: loadingMore ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: loadingMore ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!loadingMore) {
                    e.currentTarget.style.backgroundColor = '#2563eb'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loadingMore) {
                    e.currentTarget.style.backgroundColor = '#3b82f6'
                  }
                }}
              >
                {loadingMore ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #64748b',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Loading...
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    Load More ({Math.max(0, allVisitors.length - currentIndex)} remaining)
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
      <style>
        {`
          @media (max-width: 768px) {
            .header h1 {
              font-size: 22px !important;
            }
            .content {
              padding: 12px !important;
              overflow-x: hidden !important;
            }
            .pages-table-header {
              display: none !important;
            }
            .pages-table-row {
              display: block !important;
              background: white !important;
              border-radius: 12px !important;
              margin-bottom: 15px !important;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
              border: 1px solid #e2e8f0 !important;
              padding: 15px !important;
            }
            .pages-col {
              display: flex !important;
              justify-content: space-between !important;
              align-items: center !important;
              padding: 8px 0 !important;
              border-bottom: 1px solid #f1f5f9 !important;
              text-align: right !important;
            }
            .pages-col:last-child {
              border-bottom: none !important;
            }
            .pages-col:before {
              content: attr(data-label);
              font-weight: 600;
              color: #64748b;
              font-size: 12px;
              text-align: left !important;
              margin-right: 15px !important;
              flex-shrink: 0;
            }
            .pages-col > div, .pages-col > a {
                max-width: 65% !important;
                text-align: right !important;
                word-break: break-all !important;
            }
            .pages-icon-col {
              display: none !important; /* Hide icon col on mobile cards as it's repetitive */
            }
            .system-content, .location-content, .page-details-content {
                width: 100% !important;
            }
          }
        `}
      </style>
    </>
  )
}

export default PagesView
