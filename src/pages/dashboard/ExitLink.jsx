import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { trafficAPI, pagesAPI, projectsAPI } from '../../api/api'
import { Filter, Download, ExternalLink, LogOut, Search, Globe, Calendar, ChevronDown } from 'lucide-react'
import { Skeleton, Box } from '@mui/material'
import AddFilterButton from '../../components/AddFilterButton'
import ActiveFilters from '../../components/ActiveFilters'
import { useFilters } from '../../contexts/FilterContext'

function ExitLink({ projectId }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const { filters, addFilter, removeFilter, clearAllFilters, getFilterParams } = useFilters()
  const [exitLinks, setExitLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedExit, setSelectedExit] = useState(null)
  const [project, setProject] = useState(null)
  const [dateFilter, setDateFilter] = useState(() => {
    // Read from URL parameters first, then fallback to localStorage
    const urlFilter = searchParams.get('period')
    if (urlFilter) {
      return urlFilter
    }
    // Get saved filter from localStorage, default to '7' (7 days)
    const savedFilter = localStorage.getItem(`exitlink-filter-${projectId}`)
    return savedFilter || '7'
  })
  const [showDateDropdown, setShowDateDropdown] = useState(false)

  useEffect(() => {
    console.log(' ExitLink useEffect - projectId:', projectId, 'dateFilter:', dateFilter, 'filters:', filters)
    if (projectId) {
      loadExitData()
      loadProjectInfo()
    } else {
      console.log(' No projectId provided')
      setLoading(false)
    }
  }, [projectId, dateFilter, filters])

  // Update state when URL parameters change
  useEffect(() => {
    const urlFilter = searchParams.get('period')
    if (urlFilter && urlFilter !== dateFilter) {
      setDateFilter(urlFilter)
    }
  }, [searchParams, dateFilter])

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

  const getDateRange = (days) => {
    // Get current date in UTC
    const today = new Date()
    
    // For 1 day: today 00:00:00 to today 23:59:59 (UTC)
    // For 7 days: 6 days ago 00:00:00 to today 23:59:59 (UTC)  
    // For 30 days: 29 days ago 00:00:00 to today 23:59:59 (UTC)
    
    const endDate = new Date(today)
    endDate.setUTCHours(23, 59, 59, 999) // End of today (UTC)
    
    const startDate = new Date(today)
    if (days === '1') {
      // For 1 day, start from today 00:00:00 (UTC)
      startDate.setUTCHours(0, 0, 0, 0)
    } else {
      // For multiple days, go back (days-1) from today and start from 00:00:00
      startDate.setUTCDate(today.getUTCDate() - (parseInt(days) - 1))
      startDate.setUTCHours(0, 0, 0, 0)
    }
    
    // Convert to UTC for API
    const startUTC = startDate.toISOString()
    const endUTC = endDate.toISOString()
    
    console.log(`📅 ExitLink Date Range for ${days} day(s):`)
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

  const loadExitData = async () => {
    try {
      console.log('🔄 ExitLink - Loading exit data for project:', projectId)
      
      let response
      
      if (dateFilter === 'all') {
        // This case should not happen as 'all' option is removed
        console.log('📅 ExitLink - Unexpected all filter, defaulting to 7 days')
        const { startDate, endDate } = getDateRange('7')
        response = await trafficAPI.getExitLinks(projectId, startDate, endDate)
      } else {
        // Load data with date filtering
        const { startDate, endDate } = getDateRange(dateFilter)
        console.log('📅 ExitLink - Using date range:', { startDate, endDate, filter: dateFilter })
        
        // Get filter parameters
        const filterParams = getFilterParams()
        console.log('🔍 ExitLink - Filter context state:', filters)
        console.log('🔍 ExitLink - Using filters:', filterParams)
        
        response = await trafficAPI.getExitLinks(projectId, startDate, endDate, filterParams)
      }
      
      console.log('✅ ExitLink - External links response:', response.data)
      console.log('📊 ExitLink - Total links received:', response.data.length)
      // Sort by date descending (newest first)
      const sortedLinks = response.data.sort((a, b) =>
        new Date(b.clicked_at) - new Date(a.clicked_at)
      )
      setExitLinks(sortedLinks)
      
      console.log('✅ ExitLink - Exit data loaded successfully')
    } catch (error) {
      console.error('❌ ExitLink - Error loading exit data:', error)
      console.error('  Error response:', error.response?.data)
      console.error('  Error status:', error.response?.status)
    } finally {
      setLoading(false)
    }
  }

  const handleDateFilterChange = (newFilter) => {
    console.log('📅 ExitLink - Date filter changing from:', dateFilter, 'to:', newFilter)
    setDateFilter(newFilter)
    setShowDateDropdown(false)
    
    // Update URL parameters
    setSearchParams({ period: newFilter })
    
    // Save filter to localStorage so it persists on page reload
    localStorage.setItem(`exitlink-filter-${projectId}`, newFilter)
    
    // Log the new date range for debugging
    const { startDate, endDate } = getDateRange(newFilter)
    console.log('📅 ExitLink - New date range:', { startDate, endDate, filter: newFilter })
  }

  const handleExitClick = (e, exit) => {
    e.stopPropagation()
    setSelectedExit(exit)
  }

  const closeModal = () => {
    setSelectedExit(null)
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
                background: '#3b82f6', // Blue background
                
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
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
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

  if (loading) return (
    <>
      <div className="header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '98%' }}>
          <h1 style={{ margin: 0 }}>Exit Links</h1>
          
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
                <Skeleton variant="text" width={250} height={16} animation="wave" sx={{ marginBottom: 0.5 }} />
                <Skeleton variant="text" width={180} height={12} animation="wave" />
              </Box>
              <Skeleton variant="text" width={60} height={14} animation="wave" />
            </Box>
          ))}
        </Box>
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
          <h1 style={{ margin: 0 }}>Exit Links</h1>
          
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
      {/* Add Filter Button */}
      <AddFilterButton 
        onFilterSelect={addFilter}
        style={{ marginLeft: '35px',
          marginTop:'10px'
        }}
      />

      {/* Active Filters */}
      {filters.length > 0 && (
        <ActiveFilters 
          filters={filters}
          onRemoveFilter={removeFilter}
          onClearAll={clearAllFilters}
          style={{ marginLeft: '35px', marginTop: '10px' }}
        />
      )}

      {/* Exit Link Details Modal */}
      {selectedExit && (
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
                  🚪 Exit Link Details
                </h2>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  Clicked {selectedExit.click_count || 0} times
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
                background: 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #f87171'
              }}>
                <div style={{ fontSize: '13px', color: '#7f1d1d', fontWeight: '600', marginBottom: '8px' }}>
                  🔗 Exit Link Clicked
                </div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#991b1b', marginBottom: '8px', wordBreak: 'break-all' }}>
                  {selectedExit.url || 'Unknown'}
                </div>
                {selectedExit.url && (
                  <a
                    href={selectedExit.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '13px',
                      color: '#dc2626',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    Visit Link <ExternalLink size={12} />
                  </a>
                )}
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #93c5fd'
              }}>
                <div style={{ fontSize: '13px', color: '#1e40af', fontWeight: '600', marginBottom: '8px' }}>
                  📄 Exit Page
                </div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#1d4ed8', marginBottom: '8px', wordBreak: 'break-all' }}>
                  {selectedExit.from_page || 'Unknown'}
                </div>
                {selectedExit.from_page && (
                  <a
                    href={selectedExit.from_page}
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
                  📊 Click Details
                </div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '14px', color: '#64748b' }}>Clicked At:</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                      {selectedExit.clicked_at ? `${formatDate(selectedExit.clicked_at)} ${formatTime(selectedExit.clicked_at)}` : 'Unknown'}
                    </span>
                  </div>
                  {selectedExit.visitor_id && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '14px', color: '#64748b' }}>Visitor ID:</span>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b', fontFamily: 'monospace' }}>
                        {selectedExit.visitor_id.substring(0, 16)}...
                      </span>
                    </div>
                  )}
                  {selectedExit.session_id && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                      <span style={{ fontSize: '14px', color: '#64748b' }}>Session ID:</span>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b', fontFamily: 'monospace' }}>
                        {selectedExit.session_id.substring(0, 16)}...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{
              marginTop: '24px',
              padding: '16px',
              background: '#fef2f2',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#991b1b',
              border: '1px solid #fecaca'
            }}>
              <strong style={{ color: '#991b1b' }}>💡 Insight:</strong> This is where visitors left your site. Consider adding related content or CTAs to keep them engaged.
            </div>
          </div>
        </div>
      )}

      <div className="content">
        {/* Exit Links Table */}
        <div className="chart-container" style={{ padding: 0, overflowX: 'hidden' }}>
          <div>
            {/* Table Header */}
            <div className="exit-table-header" style={{
              display: 'grid',
              gridTemplateColumns: '100px 120px 1fr 1fr',
              padding: '8px 24px',
              background: '#f8fafc',
              borderBottom: '2px solid #e2e8f0',
              fontWeight: '600',
              fontSize: '13px',
              color: '#475569',
              alignItems: 'center',
              gap: '12px',
              minWidth: 0,
              maxWidth: '100%'
            }}>
              <div>Date</div>
              <div>Time</div>
              <div>Exit Link Clicked</div>
              <div>From Page</div>
            </div>

            {/* Table Rows - External Links */}
            {exitLinks.length > 0 ? (
              exitLinks.map((exit, idx) => (
                <div
                  key={idx}
                  className="exit-table-row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 120px 1fr 1fr',
                    padding: '16px 24px',
                    borderBottom: idx < exitLinks.length - 1 ? '1px solid #e2e8f0' : 'none',
                    alignItems: 'start',
                    gap: '12px',
                    minWidth: 0,
                    maxWidth: '100%'
                  }}
                >
                  {/* Date */}
                  <div className="exit-col" data-label="Date" style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '2px' }}>
                    <LogOut size={14} style={{ color: '#dc2626' }} />
                    {exit.clicked_at ? formatDate(exit.clicked_at) : 'Unknown'}
                  </div>

                  {/* Time */}
                  <div className="exit-col" data-label="Time" style={{ fontSize: '14px', color: '#64748b', fontWeight: '500', paddingTop: '2px' }}>
                    {exit.clicked_at ? formatTime(exit.clicked_at) : '--:--:--'}
                  </div>

                  {/* Exit Link - Clickable */}
                  <div className="exit-col" data-label="Exit Link Clicked" style={{
                    minWidth: 0,
                    maxWidth: '100%'
                  }}>
                    <a
                      href={exit.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        fontSize: '14px',
                        color: '#dc2626',
                        fontWeight: '500',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        textDecoration: 'none',
                        wordBreak: 'break-all',
                        lineHeight: '1.4',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                      <ExternalLink size={14} style={{ flexShrink: 0 }} />
                      {exit.url || 'Unknown'}
                    </a>
                  </div>

                  {/* From Page - Clickable */}
                  <div className="exit-col" data-label="From Page" style={{
                    minWidth: 0,
                    maxWidth: '100%'
                  }}>
                    <a
                      href={exit.from_page}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        fontSize: '14px',
                        color: '#3b82f6',
                        fontWeight: '500',
                        textDecoration: 'none',
                        display: 'inline-block',
                        wordBreak: 'break-all',
                        lineHeight: '1.4',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                      {exit.from_page || 'Unknown'}
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
                <LogOut size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                <p style={{ fontSize: '16px', fontWeight: '500' }}>No external exit links yet</p>
                <p style={{ fontSize: '14px' }}>External link clicks will appear here</p>
              </div>
            )}
          </div>
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
          .exit-tabs-container {
             background: transparent !important;
             box-shadow: none !important;
             border: none !important;
             margin-bottom: 12px !important;
          }
          .exit-tabs {
             background: white !important;
             border-radius: 12px !important;
             border: 1px solid #e2e8f0 !important;
             padding: 5px !important;
             justify-content: center !important;
          }
          .exit-tabs button {
             padding: 12px 10px !important;
             flex: 1 !important;
             text-align: center !important;
             font-size: 12px !important;
          }
          .exit-table-header {
            display: none !important;
          }
          .exit-table-row {
            display: block !important;
            background: white !important;
            border-radius: 12px !important;
            margin-bottom: 15px !important;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
            border: 1px solid #e2e8f0 !important;
            padding: 15px !important;
          }
          .exit-col {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            padding: 10px 0 !important;
            border-bottom: 1px solid #f1f5f9 !important;
            text-align: right !important;
            min-height: 40px !important;
          }
          .exit-col:last-child {
            border-bottom: none !important;
          }
          .exit-col:before {
            content: attr(data-label);
            font-weight: 600;
            color: #64748b;
            font-size: 11px;
            text-align: left !important;
            margin-right: 15px !important;
            flex-shrink: 0;
          }
          .exit-col > div, .exit-col > a, .exit-col > span {
              max-width: 65% !important;
              text-align: right !important;
              word-break: break-all !important;
              padding-top: 0 !important;
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
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}

export default ExitLink