import { useState, useEffect } from 'react'
import { visitorsAPI, projectsAPI } from '../../api/api'
import { ExternalLink, Search, ChevronDown, Globe, Calendar, X } from 'lucide-react'
import { Skeleton, Box, List, ListItem } from '@mui/material'
import { formatUrl } from '../../utils/urlUtils'

function CameFrom({ projectId }) {
  const [allVisitors, setAllVisitors] = useState([])
  const [displayedVisitors, setDisplayedVisitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [selectedReferrer, setSelectedReferrer] = useState(null)
  const [project, setProject] = useState(null)
  const [dateFilter, setDateFilter] = useState(() => {
    // Get saved filter from localStorage, default to '7' (7 days)
    const savedFilter = localStorage.getItem(`camefrom-filter-${projectId}`)
    return savedFilter || '7'
  })
  const [showDateDropdown, setShowDateDropdown] = useState(false)
  const [error, setError] = useState(null)

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
    
    console.log(`📅 CameFrom Date Range for ${days} day(s):`)
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
      
      console.log('🔄 CameFrom - Loading data with filter:', dateFilter)
      
      let response
      
      if (dateFilter === 'all') {
        // Load all data without date filtering and without limit
        console.log('📅 CameFrom - Loading all time data')
        response = await visitorsAPI.getActivityView(projectId, null, null, null)
      } else {
        // Load data with date filtering and without limit
        const { startDate, endDate } = getDateRange(dateFilter)
        console.log('📅 CameFrom - Using date range:', { startDate, endDate, filter: dateFilter })
        response = await visitorsAPI.getActivityView(projectId, null, startDate, endDate)
        console.log('📊 CameFrom - API response received:', response.data.length, 'visitors')
      }
      
      // Filter to show only referral traffic (exclude direct traffic)
      const referralVisitors = response.data.filter(visitor =>
        visitor.referrer && visitor.referrer !== 'direct' && visitor.referrer.trim() !== ''
      )

      setAllVisitors(referralVisitors)
      // Initially show first 20 items for better UX
      const initialChunk = referralVisitors.slice(0, 20)
      setDisplayedVisitors(initialChunk)
      setCurrentIndex(20)
      setHasMore(referralVisitors.length > 20)
      
      console.log(`✅ Loaded ${referralVisitors.length} referral visitors for ${dateFilter === 'all' ? 'all time' : dateFilter + ' days'}`)
    } catch (error) {
      console.error('Error loading visitors:', error)
      setError('Failed to load visitor referrer data. Please try again.')
      setAllVisitors([])
      setDisplayedVisitors([])
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)

    // Load next chunk of 20 items for consistent performance
    setTimeout(() => {
      const nextChunkSize = 20
      const nextChunk = allVisitors.slice(currentIndex, currentIndex + nextChunkSize)

      setDisplayedVisitors(prev => [...prev, ...nextChunk])
      setCurrentIndex(prev => prev + nextChunkSize)
      setHasMore(currentIndex + nextChunkSize < allVisitors.length)
      setLoadingMore(false)
    }, 300) // Reduced delay for better UX
  }

  const handleDateFilterChange = (newFilter) => {
    console.log('📅 CameFrom - Date filter changing from:', dateFilter, 'to:', newFilter)
    setDateFilter(newFilter)
    setShowDateDropdown(false)
    // Save filter to localStorage so it persists on page reload
    localStorage.setItem(`camefrom-filter-${projectId}`, newFilter)
    
    // Log the new date range for debugging
    if (newFilter !== 'all') {
      const { startDate, endDate } = getDateRange(newFilter)
      console.log('📅 CameFrom - New date range:', { startDate, endDate, filter: newFilter })
    } else {
      console.log('📅 CameFrom - Loading all time data')
    }
  }

  const closeModal = () => {
    setSelectedReferrer(null)
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

  const formatDate = (date) => {
    return formatToIST(date, { day: 'numeric', month: 'short' })
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
          <h1 style={{ margin: 0 }}>Came From</h1>
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
        <Box className="chart-container">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <Box key={i} sx={{
              padding: '16px 20px',
              borderBottom: i < 8 ? '1px solid #e2e8f0' : 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width={200} height={16} animation="wave" sx={{ marginBottom: 0.5 }} />
                <Skeleton variant="text" width={150} height={12} animation="wave" />
              </Box>
              <Skeleton variant="text" width={80} height={14} animation="wave" />
            </Box>
          ))}
        </Box>
      </div>
    </>
  )

  if (error) {
    return (
      <>
        <div className="header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '98%' }}>
            <h1 style={{ margin: 0 }}>Came From</h1>
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
          <h1 style={{ margin: 0 }}>Came From</h1>
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
              maxWidth: '600px',
              width: '90%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              animation: 'slideIn 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px 0' }}>
                  Referrer Details
                </h2>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  {formatDate(selectedReferrer.visited_at)} at {formatTime(selectedReferrer.visited_at)}
                </div>
              </div>
              <button
                onClick={closeModal}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '8px',
                  width: '36px',
                  height: '36px',
                  cursor: 'pointer',
                  fontSize: '20px',
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
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #93c5fd'
              }}>
                <div style={{ fontSize: '13px', color: '#1e40af', fontWeight: '600', marginBottom: '8px' }}>
                  🌐 Referrer Source
                </div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#1d4ed8', marginBottom: '8px', wordBreak: 'break-all' }}>
                  {selectedReferrer.referrer && selectedReferrer.referrer !== 'direct'
                    ? selectedReferrer.referrer
                    : 'Direct Traffic (No Referrer)'}
                </div>
                {selectedReferrer.referrer && selectedReferrer.referrer !== 'direct' && (
                  <a
                    href={selectedReferrer.referrer}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '13px',
                      color: '#3b82f6',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    Visit Referrer <ExternalLink size={12} />
                  </a>
                )}
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #6ee7b7'
              }}>
                <div style={{ fontSize: '13px', color: '#065f46', fontWeight: '600', marginBottom: '8px' }}>
                  🚪 Entry Page
                </div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#047857', marginBottom: '8px', wordBreak: 'break-all' }}>
                  {selectedReferrer.entry_page || 'Unknown'}
                </div>
                {selectedReferrer.entry_page && (
                  <a
                    href={selectedReferrer.entry_page}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '13px',
                      color: '#10b981',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    Visit Page <ExternalLink size={12} />
                  </a>
                )}
              </div>

              <div style={{
                background: '#f8fafc',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #e2e8f0'
              }}>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '12px' }}>
                  📊 Visitor Information
                </div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '14px', color: '#64748b' }}>Location:</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                      {selectedReferrer.city}, {selectedReferrer.country}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '14px', color: '#64748b' }}>Device:</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                      {selectedReferrer.device || 'Unknown'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                    <span style={{ fontSize: '14px', color: '#64748b' }}>Browser:</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                      {selectedReferrer.browser || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="content">


        {/* Referrer Table */}
        <div className="chart-container" style={{ padding: 0, overflowX: 'hidden' }}>
          {displayedVisitors.length > 0 ? (
            <div>
              {/* Table Header */}
              <div className="camefrom-table-header" style={{
                display: 'grid',
                gridTemplateColumns: '100px 120px 1fr 1fr',
                padding: '16px 24px',
                background: '#fdfdfdff',
                borderBottom: '2px solid #e2e8f0',
                fontWeight: '600',
                fontSize: '13px',
                color: '#0e0e0eff',
                alignItems: 'center',
                gap: '12px',
                minWidth: 0,
                maxWidth: '100%'
              }}>
                <div>Date</div>
                <div>Time</div>
                <div>Referrer</div>
                <div>Entry Page</div>
              </div>

              {/* Table Rows */}
              {displayedVisitors.map((visitor, idx) => (
                <div
                  key={idx}
                  className="camefrom-table-row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 120px 1fr 1fr',
                    padding: '16px 24px',
                    borderBottom: idx < displayedVisitors.length - 1 ? '1px solid #e2e8f0' : 'none',
                    alignItems: 'start',
                    gap: '12px',
                    minWidth: 0,
                    maxWidth: '100%'
                  }}
                >
                  {/* Date */}
                  <div className="camefrom-col" data-label="Date" style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '2px' }}>

                    {formatDate(visitor.visited_at)}
                  </div>

                  {/* Time */}
                  <div className="camefrom-col" data-label="Time" style={{ fontSize: '14px', color: '#64748b', paddingTop: '2px' }}>
                    {formatTime(visitor.visited_at)}
                  </div>

                  {/* Referrer - Non-clickable */}
                  <div className="camefrom-col" data-label="Referrer" style={{ minWidth: 0, maxWidth: '100%' }}>
                    <div
                      style={{
                        fontSize: '14px',
                        color: '#30ad51d1',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        wordBreak: 'break-all',
                        lineHeight: '1.4'
                      }}
                    >
                      {formatUrl(visitor.referrer)}
                    </div>
                  </div>

                  {/* Entry Page */}
                  <div className="camefrom-col" data-label="Entry Page" style={{ minWidth: 0, maxWidth: '100%' }}>
                    <a
                      href={visitor.entry_page}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '14px',
                        color: '#3b82f6',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        wordBreak: 'break-all',
                        lineHeight: '1.4',
                        cursor: 'pointer'
                      }}

                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                      {formatUrl(visitor.entry_page)}
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
              <Search size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <p style={{ fontSize: '16px', fontWeight: '500' }}>No referral traffic yet</p>
              <p style={{ fontSize: '14px' }}>Only visitors from external referrers are shown here</p>
            </div>
          )}

          {/* Load More Button */}
          {hasMore && (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              borderTop: '1px solid #e2e8f0'
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
                    Load More ({allVisitors.length - currentIndex} remaining)
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .header h1 {
            font-size: 22px !important;
          }
          .content {
            padding: 12px !important;
            overflow-x: hidden !important;
          }
          .camefrom-table-header {
            display: none !important;
          }
          .camefrom-table-row {
            display: block !important;
            background: white !important;
            border-radius: 12px !important;
            margin-bottom: 15px !important;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
            border: 1px solid #e2e8f0 !important;
            padding: 15px !important;
          }
          .camefrom-col {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            padding: 10px 0 !important;
            border-bottom: 1px solid #f1f5f9 !important;
            text-align: right !important;
            min-height: 40px !important;
          }
          .camefrom-col:last-child {
            border-bottom: none !important;
          }
          .camefrom-col:before {
            content: attr(data-label);
            font-weight: 600;
            color: #64748b;
            font-size: 12px;
            text-align: left !important;
            margin-right: 15px !important;
            flex-shrink: 0;
          }
          .camefrom-col > div, .camefrom-col > a {
              max-width: 65% !important;
              text-align: right !important;
              word-break: break-all !important;
              padding-top: 0 !important;
          }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}

export default CameFrom
