import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { pagesAPI, projectsAPI } from '../../api/api'
import { Calendar, ChevronDown } from 'lucide-react'
import PagesSessionView from './PagesSessionView'
import VisitorPathSimple from './VisitorPathSimple'
import { Skeleton, Box, Tabs, Tab } from '@mui/material'

function Pages({ projectId }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('entry')
  const [mostVisited, setMostVisited] = useState([])
  const [entryPages, setEntryPages] = useState([])
  const [exitPages, setExitPages] = useState([])
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedPage, setSelectedPage] = useState(null)
  const [selectedVisitorId, setSelectedVisitorId] = useState(null)
  const [showAllSessions, setShowAllSessions] = useState(false)
  const [selectedPageSessions, setSelectedPageSessions] = useState(null)
  const [period, setPeriod] = useState(() => {
    const savedPeriod = localStorage.getItem(`pages-period-${projectId}`)
    return savedPeriod || '1'  // Default to 1 day instead of 30
  })
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false)

  // Pagination states - simplified
  const [pagination, setPagination] = useState({
    entry: { offset: 0, hasMore: true },
    top: { offset: 0, hasMore: true },
    exit: { offset: 0, hasMore: true }
  })

  // Function to sanitize and clean text data - preserves foreign languages but removes problematic characters
  const sanitizeText = (text) => {
    if (!text) return text;
    // Remove only truly problematic characters that cause display issues, but keep foreign language characters
    return text.toString()
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '') // Remove control characters
      .replace(/[\uFFF0-\uFFFF]/g, '') // Remove special Unicode characters that cause issues
      .trim();
  };
  
  // Convert URL/slug to readable English title
const slugToEnglishTitle = (value) => {
  if (!value) return 'Untitled Page'

  try {
    const lastPart = value.split('/').filter(Boolean).pop() || ''
    return lastPart
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase())
      .trim()
  } catch {
    return 'Untitled Page'
  }
}

// ✅ FINAL: Always return English title
const getFinalEnglishTitle = (title, page) => {
  const cleanTitle = sanitizeText(title)

  // 1️⃣ If English exists in title → use it
  const englishMatch = cleanTitle?.match(/[A-Za-z0-9][A-Za-z0-9\s\-:,.'&()]{2,}/g)
  if (englishMatch && englishMatch.length > 0) {
    return englishMatch.join(' ').trim()
  }

  // 2️⃣ Else → generate English from URL/page
  return slugToEnglishTitle(page)
}




  useEffect(() => {
    loadInitialData()
    loadProjectInfo()
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

  const loadProjectInfo = async () => {
    try {
      const response = await projectsAPI.getOne(projectId)
      setProject(response.data)
    } catch (error) {
      console.error('Error loading project info:', error)
    }
  }

  const getDateRange = (days) => {
    // Get current date in IST
    const nowIST = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
    )
    
    // For end date, use today (current date)
    const endDate = new Date(nowIST)
    
    // For start date, go back by (days - 1) to include today
    // Example: 7 days = today + last 6 days = 7 total days
    const startDate = new Date(nowIST)
    
    // Fix: Use days-1 for proper calculation
    const daysToSubtract = parseInt(days) - 1
    startDate.setDate(endDate.getDate() - daysToSubtract)
    
    console.log(`📅 Date Range Calculation for ${days} days:`)
    console.log(`  Days to subtract: ${daysToSubtract}`)
    console.log(`  Start Date: ${startDate.toISOString().split('T')[0]}`)
    console.log(`  End Date: ${endDate.toISOString().split('T')[0]}`)
    console.log(`  Total days: ${Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1}`)
    
    const format = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

    return {
      startDate: format(startDate),
      endDate: format(endDate)
    }
  }



  const loadInitialData = async () => {
    setLoading(true)
    try {
      console.log('Pages - Loading initial data with period:', period)
      const { startDate, endDate } = getDateRange(period)
      console.log('Pages - Using date range:', { startDate, endDate })
      
      // Load first chunk (10 items each) with offset 0
      const [mostVisitedRes, entryPagesRes, exitPagesRes] = await Promise.all([
        pagesAPI.getMostVisited(projectId, 10, startDate, endDate),
        pagesAPI.getEntryPages(projectId, 10, startDate, endDate),
        pagesAPI.getExitPages(projectId, 10, startDate, endDate)
      ])

      // Handle new response format with data wrapper
      const most_visited = mostVisitedRes.data.data || mostVisitedRes.data
      const entry_pages = entryPagesRes.data.data || entryPagesRes.data  
      const exit_pages = exitPagesRes.data.data || exitPagesRes.data

      console.log('📊 Pages Initial Load:')
      console.log('  Most Visited:', most_visited.length)
      console.log('  Entry Pages:', entry_pages.length)
      console.log('  Exit Pages:', exit_pages.length)

      setMostVisited(most_visited)
      setEntryPages(entry_pages)
      setExitPages(exit_pages)

      // Update pagination based on response
      setPagination({
        entry: { 
          offset: entry_pages.length, 
          hasMore: entryPagesRes.data.has_more || false 
        },
        top: { 
          offset: most_visited.length, 
          hasMore: mostVisitedRes.data.has_more || false 
        },
        exit: { 
          offset: exit_pages.length, 
          hasMore: exitPagesRes.data.has_more || false 
        }
      })
    } catch (error) {
      console.error('Error loading pages:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMoreData = async () => {
    const tabKey = activeTab === 'top' ? 'top' : activeTab
    const currentPagination = pagination[tabKey]

    if (!currentPagination.hasMore || loadingMore) return

    setLoadingMore(true)
    try {
      const { startDate, endDate } = getDateRange(period)
      const currentOffset = currentPagination.offset

      console.log(`📥 Loading more ${activeTab} pages from offset: ${currentOffset}`)

      let response
      if (activeTab === 'entry') {
        response = await pagesAPI.getEntryPages(projectId, 10, startDate, endDate)
      } else if (activeTab === 'top') {
        response = await pagesAPI.getMostVisited(projectId, 10, startDate, endDate)
      } else {
        response = await pagesAPI.getExitPages(projectId, 10, startDate, endDate)
      }

      const newData = response.data.data || response.data

      // Append new data to existing data
      if (activeTab === 'entry') {
        setEntryPages(prev => [...prev, ...newData])
      } else if (activeTab === 'top') {
        setMostVisited(prev => [...prev, ...newData])
      } else {
        setExitPages(prev => [...prev, ...newData])
      }

      // Update pagination
      setPagination(prev => ({
        ...prev,
        [tabKey]: {
          offset: currentOffset + newData.length,
          hasMore: response.data.has_more || false
        }
      }))

      console.log(`✅ Loaded ${newData.length} more ${activeTab} pages`)
    } catch (error) {
      console.error('Error loading more pages:', error)
    } finally {
      setLoadingMore(false)
    }
  }

  const handlePeriodChange = (newPeriod) => {
    console.log('📅 Pages - Period changing from:', period, 'to:', newPeriod)
    setPeriod(newPeriod)
    localStorage.setItem(`pages-period-${projectId}`, newPeriod)
    setShowPeriodDropdown(false)
    
    // Reset pagination when period changes
    setPagination({
      entry: { offset: 0, hasMore: true },
      top: { offset: 0, hasMore: true },
      exit: { offset: 0, hasMore: true }
    })
    
    // Clear existing data
    setMostVisited([])
    setEntryPages([])
    setExitPages([])
    
    // Log the new date range for debugging
    const { startDate, endDate } = getDateRange(newPeriod)
    console.log('📅 Pages - New date range:', { startDate, endDate, period: newPeriod })
  }

  if (loading) return (
    <>
      {/* Header */}
      <div className="header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '98%' }}>
          <h1 style={{ margin: 0 }}>Pages</h1>
          
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
                {period === '1' ? '1 Day' : period === '7' ? '7 Days' : '30 Days'}
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
                {['1', '7', '30'].map((p) => (
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
                      borderBottom: p !== '30' ? '1px solid #f3f4f6' : 'none',
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
                    {p === '1' ? '1 Day' : p === '7' ? '7 Days' : '30 Days'}
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
        {/* Tabs - Material-UI */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: 3 }}>
          <Tabs value={0}>
            <Tab label={<Skeleton variant="text" width={90} height={15} animation="wave" />} />
            <Tab label={<Skeleton variant="text" width={80} height={15} animation="wave" />} />
            <Tab label={<Skeleton variant="text" width={85} height={15} animation="wave" />} />
          </Tabs>
        </Box>

        {/* Chart Container */}
        <Box className="chart-container" sx={{ padding: 0, maxHeight: 'none', overflow: 'hidden' }}>
          <Box sx={{ padding: '10px' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(idx => (
              <Box key={idx} sx={{
                borderBottom: idx < 7 ? '1px solid #e2e8f0' : 'none',
                padding: '8px 20px'
              }}>
                {/* Page Info Skeleton */}
                <Box sx={{ marginBottom: 0.5, padding: 0.5 }}>
                  <Skeleton variant="text" width="70%" height={16} animation="wave" sx={{ marginBottom: 0.5 }} />
                  <Skeleton variant="text" width="85%" height={12} animation="wave" />
                </Box>

                {/* Stats Row Skeleton */}
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 4px'
                }}>
                  <Box sx={{ display: 'flex', gap: 2.5 }}>
                    <Box>
                      <Skeleton variant="text" width={40} height={10} animation="wave" sx={{ marginBottom: 0.25 }} />
                      <Skeleton variant="text" width={30} height={14} animation="wave" />
                    </Box>

                    <Box>
                      <Skeleton variant="text" width={50} height={10} animation="wave" sx={{ marginBottom: 0.25 }} />
                      <Skeleton variant="text" width={25} height={14} animation="wave" />
                    </Box>
                  </Box>

                  <Skeleton variant="rounded" width={100} height={24} animation="wave" />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </div>
    </>
  )

  const getCurrentData = () => {
    switch (activeTab) {
      case 'entry': return entryPages
      case 'top': return mostVisited
      case 'exit': return exitPages
      default: return []
    }
  }



  const handleVisitorClick = async (e, visitorId) => {
    e.stopPropagation()
    // Navigate to Visitor Path with visitor_id as state
    navigate(`/project/${projectId}/visitor-path`, {
      state: { selectedVisitorId: visitorId }
    })
  }

  const handleSessionsClick = async (e, page) => {
    e.stopPropagation()

    console.log('🔍 Sessions clicked for page:', page)
    console.log('📊 Page visits count:', page.visits?.length || 0)
    console.log('📊 Current Pages.jsx period:', period)

    // Pass the current period from Pages.jsx to PagesSessionView
    const pageWithPeriod = {
      ...page,
      currentPeriod: period  // Pass current period
    }

    // Show all sessions for this page - pass ALL data from Pages.jsx
    if (page.visits && page.visits.length > 0) {
      console.log('✅ Found visits data, opening PagesSessionView with period:', period)
      setSelectedPageSessions(pageWithPeriod)
      setShowAllSessions(true)
    } else {
      console.log('⚠️ No session data available for this page')
      setSelectedPageSessions(pageWithPeriod)
      setShowAllSessions(true)
    }
  }

  const closeModal = () => {
    setSelectedPage(null)
  }

  const formatDate = (date) => {
    if (!date) return ''

    // Ensure the date string is treated as UTC if it lacks timezone info
    let utcString = date
    if (typeof date === 'string' && !date.endsWith('Z') && !date.includes('+')) {
      utcString = date + 'Z'
    }

    const d = new Date(utcString)

    if (isNaN(d.getTime())) return date

    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatTime = (date) => {
    if (!date) return ''

    // Ensure the date string is treated as UTC if it lacks timezone info
    let utcString = date
    if (typeof date === 'string' && !date.endsWith('Z') && !date.includes('+')) {
      utcString = date + 'Z'
    }

    const d = new Date(utcString)

    if (isNaN(d.getTime())) return date

    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  }

  const currentData = getCurrentData()

  // Show all sessions view with complete journey
  if (showAllSessions && selectedPageSessions) {
    return (
      <PagesSessionView
        projectId={projectId}
        selectedPageSessions={selectedPageSessions}
        pageType={activeTab}
        project={project}
        onBack={() => {
          setShowAllSessions(false)
          setSelectedPageSessions(null)
        }}
      />
    )
  }

  // Show visitor path if selected
  if (selectedVisitorId) {
    return (
      <VisitorPathSimple
        projectId={projectId}
        visitorId={selectedVisitorId}
        project={project}
        onBack={() => setSelectedVisitorId(null)}
      />
    )
  }

  return (
    <>
      <div className="header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '98%' }}>
          <h1 style={{ margin: 0 }}>Pages</h1>
          
          {/* Date Filter - Yellow Highlighted Area */}
          <div style={{ position: 'relative' }} data-period-dropdown>
            <div
              onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: '#2563eb', // Yellow background
                
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
                {period === '1' ? '1 Day' : period === '7' ? '7 Days' : '30 Days'}
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
                {['1', '7', '30'].map((p) => (
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
                      borderBottom: p !== '30' ? '1px solid #f3f4f6' : 'none',
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
                    {p === '1' ? '1 Day' : p === '7' ? '7 Days' : '30 Days'}
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

      {/* Page Details Modal */}
      {
        selectedPage && (
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
                maxHeight: '80vh',
                overflow: 'auto',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                animation: 'slideIn 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px 0' }}>
                    {selectedPage.title || 'Untitled Page'}
                  </h2>
                  <a
                    href={selectedPage.url || selectedPage.page}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '14px',
                      color: '#3b82f6',
                      textDecoration: 'none',
                      wordBreak: 'break-all'
                    }}
                  >
                    🔗 {selectedPage.url || selectedPage.page}
                  </a>
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

              {/* Sessions List */}
              {selectedPage.visits && selectedPage.visits.length > 0 ? (
                <div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#64748b',
                    marginBottom: '16px',
                    padding: '12px 16px',
                    background: '#f8fafc',
                    borderRadius: '8px'
                  }}>
                    📊 All Sessions ({selectedPage.visits.length})
                  </div>
                  <div style={{ display: 'grid', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                    {selectedPage.visits.map((visit, vidx) => (
                      <div
                        key={vidx}
                        onClick={(e) => handleVisitorClick(e, visit.visitor_id)}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '120px 1fr 160px',
                          padding: '16px',
                          background: '#f8fafc',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          border: '2px solid #e2e8f0',
                          alignItems: 'center',
                          gap: '12px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#eff6ff'
                          e.currentTarget.style.borderColor = '#3b82f6'
                          e.currentTarget.style.transform = 'translateX(4px)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#f8fafc'
                          e.currentTarget.style.borderColor = '#e2e8f0'
                          e.currentTarget.style.transform = 'translateX(0)'
                        }}
                      >
                        <div style={{
                          fontSize: '14px',
                          color: '#3b82f6',
                          fontWeight: '700',
                          background: 'white',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          textAlign: 'center'
                        }}>
                          Session #{visit.session_id}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: '600', marginBottom: '4px' }}>
                            👤 Visitor ID: {visit.visitor_id}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            Click to view visitor journey
                          </div>
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'right' }}>
                          🕒 {formatDate(visit.visited_at)}<br />
                          {formatTime(visit.visited_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{
                  background: '#f8fafc',
                  padding: '40px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  color: '#94a3b8'
                }}>
                  <p style={{ fontSize: '14px' }}>No session data available for this page</p>
                </div>
              )}
            </div>
          </div>
        )
      }

      <div className="content">
        {/* Simple Tabs */}
        <div style={{
          display: 'flex',
          gap: '0',
          marginBottom: '24px',
          borderBottom: '2px solid #e2e8f0'
        }}>
          <div
            onClick={() => setActiveTab('entry')}
            style={{
              padding: '16px 32px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              color: activeTab === 'entry' ? '#1e40af' : '#64748b',
              borderBottom: activeTab === 'entry' ? '3px solid #1e40af' : '3px solid transparent',
              marginBottom: '-2px',
              transition: 'all 0.2s',
              background: activeTab === 'entry' ? '#f8fafc' : 'transparent'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'entry') e.currentTarget.style.background = '#f8fafc'
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'entry') e.currentTarget.style.background = 'transparent'
            }}
          >
            Entry Pages
          </div>

          <div
            onClick={() => setActiveTab('top')}
            style={{
              padding: '16px 32px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              color: activeTab === 'top' ? '#1e40af' : '#64748b',
              borderBottom: activeTab === 'top' ? '3px solid #1e40af' : '3px solid transparent',
              marginBottom: '-2px',
              transition: 'all 0.2s',
              background: activeTab === 'top' ? '#f8fafc' : 'transparent'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'top') e.currentTarget.style.background = '#f8fafc'
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'top') e.currentTarget.style.background = 'transparent'
            }}
          >
            Top Pages
          </div>

          <div
            onClick={() => setActiveTab('exit')}
            style={{
              padding: '16px 32px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              color: activeTab === 'exit' ? '#1e40af' : '#64748b',
              borderBottom: activeTab === 'exit' ? '3px solid #1e40af' : '3px solid transparent',
              marginBottom: '-2px',
              transition: 'all 0.2s',
              background: activeTab === 'exit' ? '#f8fafc' : 'transparent'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'exit') e.currentTarget.style.background = '#f8fafc'
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'exit') e.currentTarget.style.background = 'transparent'
            }}
          >
            Exit Pages
          </div>
        </div>

        <div className="chart-container" style={{ padding: 0, maxHeight: 'none', overflow: 'hidden' }}>

          <div style={{ padding: '10px' }}>

            {currentData.length > 0 ? (
              <div>
                {console.log(`🔍 Rendering ${currentData.length} pages in ${activeTab} tab`)}
                {currentData.map((page, idx) => (
                  <div
                    key={idx}
                    style={{
                      borderBottom: idx < currentData.length - 1 ? '1px solid #e2e8f0' : 'none',
                      padding: '8px 20px'
                    }}>

                    {/* Page Info */}
                    <div
                      style={{
                        marginBottom: '4px',
                        padding: '4px',
                        borderRadius: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '2px', wordBreak: 'break-word' }}>
                            {getFinalEnglishTitle(page.title, page.page)}
                          </div>

                          <a
                            href={sanitizeText(page.url || page.page) || '/'}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: '11px',
                              color: '#3b82f6',
                              textDecoration: 'none',
                              wordBreak: 'break-all',
                              lineHeight: '1.3',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                          >
                            {sanitizeText(page.url || page.page) || '/'}
                          </a>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexShrink: 0 }}>
                          {/* Sessions Number - Clickable */}
                          <div
                            onClick={(e) => handleSessionsClick(e, page)}
                            style={{
                              textAlign: 'center',
                              cursor: 'pointer',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              minWidth: '80px',
                              userSelect: 'none',
                              backgroundColor: '#f0f9ff',
                              border: '2px solid #3b82f6',
                              transition: 'all 0.2s',
                              boxShadow: '0 2px 4px rgba(59, 130, 246, 0.1)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#dbeafe'
                              e.currentTarget.style.transform = 'scale(1.05)'
                              e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.2)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#f0f9ff'
                              e.currentTarget.style.transform = 'scale(1)'
                              e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.1)'
                            }}
                          >
                            <div style={{ fontSize: '9px', color: '#64748b', fontWeight: '600', marginBottom: '2px' }}>
                              {activeTab === 'entry' ? 'Sessions' : activeTab === 'top' ? 'Views' : 'Exits'}
                            </div>
                            <div style={{ fontSize: '16px', fontWeight: '700', color: '#3b82f6' }}>
                              {page.total_page_views || page.total_views || page.sessions || page.exits || 0}
                            </div>
                            <div style={{ fontSize: '8px', color: '#10b981', fontWeight: '600', marginTop: '1px' }}>
                              Click to view
                            </div>
                          </div>
                          <div style={{ textAlign: 'center', minWidth: '70px' }}>
                            <div style={{ fontSize: '9px', color: '#64748b', fontWeight: '600', marginBottom: '1px' }}>
                              Bounce %
                            </div>
                            <div style={{ fontSize: '16px', fontWeight: '700', color: page.bounce_rate > 70 ? '#ef4444' : '#10b981' }}>
                              {page.bounce_rate ? `${page.bounce_rate.toFixed(1)}%` : '0.0%'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                ))}

                {/* Load More Button */}
                {pagination[activeTab === 'top' ? 'top' : activeTab]?.hasMore && (
                  <div style={{ padding: '20px', textAlign: 'center' }}>
                    <button
                      onClick={loadMoreData}
                      disabled={loadingMore}
                      style={{
                        background: loadingMore ? '#f1f5f9' : '#3b82f6',
                        color: loadingMore ? '#64748b' : 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px 24px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: loadingMore ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        minWidth: '120px'
                      }}
                      onMouseEnter={(e) => {
                        if (!loadingMore) {
                          e.currentTarget.style.background = '#2563eb'
                          e.currentTarget.style.transform = 'translateY(-1px)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!loadingMore) {
                          e.currentTarget.style.background = '#3b82f6'
                          e.currentTarget.style.transform = 'translateY(0)'
                        }
                      }}
                    >
                      {loadingMore ? ' Loading...' : 'load more'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No data available</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Pages