import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { pagesAPI } from '../../api/api'
import PagesSessionView from './PagesSessionView'
import VisitorPathSimple from './VisitorPathSimple'
import { Skeleton, Box, Tabs, Tab } from '@mui/material'

function Pages({ projectId }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('entry')
  const [mostVisited, setMostVisited] = useState([])
  const [entryPages, setEntryPages] = useState([])
  const [exitPages, setExitPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedPage, setSelectedPage] = useState(null)
  const [selectedVisitorId, setSelectedVisitorId] = useState(null)
  const [showAllSessions, setShowAllSessions] = useState(false)
  const [selectedPageSessions, setSelectedPageSessions] = useState(null)

  // Pagination states
  const [pagination, setPagination] = useState({
    entry: { limit: 10, hasMore: true, loadCount: 0 },
    top: { limit: 10, hasMore: true, loadCount: 0 },
    exit: { limit: 10, hasMore: true, loadCount: 0 }
  })

  useEffect(() => {
    loadInitialData()
  }, [projectId])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      // Use the new single API call for the Pages route
      const response = await pagesAPI.getPagesOverview(projectId, 10)

      const { most_visited, entry_pages, exit_pages } = response.data

      console.log(' Pages Overview API Response:')
      console.log('  Most Visited:', most_visited.length)
      console.log('  Entry Pages:', entry_pages.length)
      console.log('  Exit Pages:', exit_pages.length)

      setMostVisited(most_visited)
      setEntryPages(entry_pages)
      setExitPages(exit_pages)

      // Update hasMore based on returned data
      setPagination({
        entry: { limit: 10, hasMore: entry_pages.length === 10, loadCount: 0 },
        top: { limit: 10, hasMore: most_visited.length === 10, loadCount: 0 },
        exit: { limit: 10, hasMore: exit_pages.length === 10, loadCount: 0 }
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
      // Calculate increment: 3-4 items per load
      const increment = currentPagination.loadCount % 2 === 0 ? 3 : 4
      const newLimit = currentPagination.limit + increment

      console.log(`📥 Loading more ${activeTab} pages: ${currentPagination.limit} → ${newLimit}`)

      let response
      if (activeTab === 'entry') {
        response = await pagesAPI.getEntryPages(projectId, newLimit)
      } else if (activeTab === 'top') {
        response = await pagesAPI.getMostVisited(projectId, newLimit)
      } else {
        response = await pagesAPI.getExitPages(projectId, newLimit)
      }

      const newData = Array.isArray(response.data) ? response.data : response

      // Update the appropriate state
      if (activeTab === 'entry') {
        setEntryPages(newData)
      } else if (activeTab === 'top') {
        setMostVisited(newData)
      } else {
        setExitPages(newData)
      }

      // Update pagination
      setPagination(prev => ({
        ...prev,
        [tabKey]: {
          limit: newLimit,
          hasMore: newData.length === newLimit,
          loadCount: prev[tabKey].loadCount + 1
        }
      }))

      console.log(`✅ Loaded ${newData.length} ${activeTab} pages`)
    } catch (error) {
      console.error('Error loading more pages:', error)
    } finally {
      setLoadingMore(false)
    }
  }



  if (loading) return (
    <>
      {/* Header */}
      <div className="header">
        <h1>Pages</h1>
        <Box sx={{
          display: 'flex',
          gap: 1,
          paddingRight: '40px',
          alignItems: 'center'
        }}>
        </Box>
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

    // Show all sessions for this page with complete journey
    if (page.visits && page.visits.length > 0) {
      setSelectedPageSessions(page)
      setShowAllSessions(true)
    } else {
      alert('No session data available for this page')
    }
  }

  const closeModal = () => {
    setSelectedPage(null)
  }

  const formatDate = (date) => {
    if (!date) return ''

    const d = new Date(date)

    if (isNaN(d.getTime())) return date

    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatTime = (date) => {
    if (!date) return ''

    const d = new Date(date)

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
        onBack={() => setSelectedVisitorId(null)}
      />
    )
  }

  return (
    <>
      <div className="header">
        <h1>Pages</h1>
        <div style={{
          display: 'flex',
          gap: '8px',
          paddingRight: '40px',
          alignItems: 'center'
        }}>
        </div>
      </div>

      {/* Page Details Modal */}
      {selectedPage && (
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
      )}

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
                            {page.title || page.page || 'Untitled'}
                          </div>
                          <a
                            href={page.url || page.page || '/'}
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
                            {page.url || page.page || '/'}
                          </a>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexShrink: 0 }}>
                          {/* Sessions Number - Clickable */}
                          <div
                            onClick={(e) => handleSessionsClick(e, page)}
                            style={{
                              textAlign: 'center',
                              cursor: page.visits && page.visits.length > 0 ? 'pointer' : 'not-allowed',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              minWidth: '70px',
                              userSelect: 'none',
                              backgroundColor: page.visits && page.visits.length > 0 ? '#f0f9ff' : '#f8fafc',
                              border: page.visits && page.visits.length > 0 ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              if (page.visits && page.visits.length > 0) {
                                e.currentTarget.style.backgroundColor = '#dbeafe'
                                e.currentTarget.style.transform = 'scale(1.05)'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (page.visits && page.visits.length > 0) {
                                e.currentTarget.style.backgroundColor = '#f0f9ff'
                                e.currentTarget.style.transform = 'scale(1)'
                              }
                            }}
                          >
                            <div style={{ fontSize: '9px', color: '#64748b', fontWeight: '600', marginBottom: '1px' }}>
                              {activeTab === 'entry' ? 'Sessions' : activeTab === 'top' ? 'Views' : 'Exits'}
                            </div>
                            <div style={{ fontSize: '16px', fontWeight: '700', color: '#3b82f6' }}>
                              {page.total_page_views || page.total_views || page.sessions || page.exits || 0}
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
