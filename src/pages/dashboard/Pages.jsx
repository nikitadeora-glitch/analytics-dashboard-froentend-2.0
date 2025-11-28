import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { pagesAPI, visitorsAPI } from '../../api/api'
import { TrendingUp, Clock, ExternalLink } from 'lucide-react'
import VisitorPathSimple from './VisitorPathSimple'
import VisitorActivity from './VisitorActivity'

function Pages({ projectId }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('entry')
  const [mostVisited, setMostVisited] = useState([])
  const [entryPages, setEntryPages] = useState([])
  const [exitPages, setExitPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPage, setSelectedPage] = useState(null)
  const [selectedVisitorId, setSelectedVisitorId] = useState(null)
  const [showAllSessions, setShowAllSessions] = useState(false)
  const [selectedPageSessions, setSelectedPageSessions] = useState(null)
  const [sessionDetails, setSessionDetails] = useState([])

  useEffect(() => {
    loadData()
  }, [projectId])

  const loadData = async () => {
    try {
      const [visited, entry, exit] = await Promise.all([
        pagesAPI.getMostVisited(projectId),
        pagesAPI.getEntryPages(projectId),
        pagesAPI.getExitPages(projectId)
      ])
      setMostVisited(visited.data)
      setEntryPages(entry.data)
      setExitPages(exit.data)
    } catch (error) {
      console.error('Error loading pages:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadVisitorDetails = async (visitorId) => {
    try {
      const response = await visitorsAPI.getActivity(projectId, 100)
      const visitor = response.data.find(v => v.visitor_id === visitorId)
      return visitor
    } catch (error) {
      console.error('Error loading visitor details:', error)
      return null
    }
  }

  if (loading) return <div className="loading">Loading pages...</div>

  const getCurrentData = () => {
    switch(activeTab) {
      case 'entry': return entryPages
      case 'top': return mostVisited
      case 'exit': return exitPages
      default: return []
    }
  }

  const handlePageClick = (page) => {
    setSelectedPage(page)
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
    // Show all sessions for this page
    if (page.visits && page.visits.length > 0) {
      setSelectedPageSessions(page)
      setShowAllSessions(true)
      
      // Load visitor details for all sessions
      try {
        const allVisitors = await visitorsAPI.getActivity(projectId, 200)
        const details = page.visits.map(visit => {
          const visitorData = allVisitors.data.find(v => v.visitor_id === visit.visitor_id)
          // Preserve original visit timestamp, merge other data
          return {
            ...visitorData,
            ...visit,  // visit data should come last to preserve session-specific data
            visited_at: visit.visited_at  // Explicitly preserve the session's timestamp
          }
        })
        setSessionDetails(details)
      } catch (error) {
        console.error('Error loading session details:', error)
        setSessionDetails(page.visits)
      }
    }
  }

  const closeModal = () => {
    setSelectedPage(null)
  }

  const formatDate = (date) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const formatTime = (date) => {
    const d = new Date(date)
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  }

  const currentData = getCurrentData()

  // Show all sessions view - Image format layout
  if (showAllSessions && selectedPageSessions) {
    return (
      <>
        <div className="header">
          <button
            onClick={() => {
              setShowAllSessions(false)
              setSelectedPageSessions(null)
            }}
            style={{
              padding: '10px 20px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
          >
            ← Back to Pages
          </button>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: '16px 0' }}>
            Sessions for: {selectedPageSessions.url || selectedPageSessions.page}
          </h2>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '8px' }}>
           
          </p>
        </div>

        <div className="content">
          <div className="chart-container" style={{ padding: 0 }}>
            {sessionDetails.map((session, idx) => {
              // Parse the date properly
              const visitDate = new Date(session.visited_at)
              
              const getCountryFlag = (country) => {
                const flags = {
                  'United States': '🇺🇸', 'India': '🇮🇳', 'United Kingdom': '🇬🇧',
                  'Canada': '🇨🇦', 'Singapore': '🇸🇬', 'China': '🇨🇳'
                }
                return flags[country] || '🌍'
              }
              
              return (
                <div 
                  key={idx}
                  onClick={() => handleVisitorClick(null, session.visitor_id)}
                  style={{
                    padding: '16px 24px',
                    borderBottom: idx < sessionDetails.length - 1 ? '1px solid #e2e8f0' : 'none',
                    transition: 'background 0.2s',
                    cursor: 'pointer',
                    display: 'grid',
                    gridTemplateColumns: '80px 100px 250px 200px 100px 120px 1fr',
                    gap: '16px',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Date */}
                  <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: '500' }}>
                    {visitDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </div>

                  {/* Time - User's local time (only time, no date) */}
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    {(() => {
                      // If local_time_formatted has date, extract only time part
                      if (session.local_time_formatted) {
                        const timePart = session.local_time_formatted.split(',').pop().trim()
                        return timePart
                      }
                      // Otherwise format from timestamp
                      return visitDate.toLocaleTimeString('en-GB', { 
                        hour: '2-digit', 
                        minute: '2-digit', 
                        second: '2-digit', 
                        hour12: false
                      })
                    })()}
                  </div>

                  {/* Location */}
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#1e293b', marginBottom: '2px' }}>
                      {getCountryFlag(session.country)} {session.country || 'Unknown'}, {session.city || 'Unknown'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {session.ip_address || 'No IP'}
                    </div>
                  </div>

                  {/* System */}
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#1e293b', marginBottom: '2px' }}>
                      {session.browser || 'Unknown Browser'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {session.os || 'Unknown OS'}
                    </div>
                  </div>

                  {/* Time Spent */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#10b981' }}>
                      {session.time_spent ? `${Math.floor(session.time_spent / 60)}m ${session.time_spent % 60}s` : '-'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      Time
                    </div>
                  </div>

                  {/* Session Badge */}
                  <div>
                    <span style={{
                      padding: '4px 12px',
                      background: '#eff6ff',
                      color: '#3b82f6',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      border: '1px solid #bfdbfe'
                    }}>
                      Session #{session.session_id}
                    </span>
                  </div>

                  {/* Page URL */}
                  <div>
                    <a 
                      href={selectedPageSessions.url || selectedPageSessions.page}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{ 
                        fontSize: '13px', 
                        color: '#3b82f6',
                        textDecoration: 'none',
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {selectedPageSessions.url || selectedPageSessions.page}
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </>
    )
  }

  // Show visitor path if selected
  if (selectedVisitorId) {
    return <VisitorPathSimple 
      projectId={projectId} 
      visitorId={selectedVisitorId}
      onBack={() => setSelectedVisitorId(null)}
    />
  }

  return (
    <>
      <div className="header">
        <h1>Pages</h1>
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
                        🕒 {formatDate(visit.visited_at)}<br/>
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
        <div className="chart-container" style={{ padding: 0 }}>
          <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0' }}>
            <button
              onClick={() => setActiveTab('entry')}
              style={{
                padding: '16px 24px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'entry' ? '3px solid #1e40af' : '3px solid transparent',
                color: activeTab === 'entry' ? '#1e40af' : '#64748b',
                fontWeight: activeTab === 'entry' ? '600' : '500',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Entry Pages
            </button>
            <button
              onClick={() => setActiveTab('top')}
              style={{
                padding: '16px 24px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'top' ? '3px solid #1e40af' : '3px solid transparent',
                color: activeTab === 'top' ? '#1e40af' : '#64748b',
                fontWeight: activeTab === 'top' ? '600' : '500',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Top Pages
            </button>
            <button
              onClick={() => setActiveTab('exit')}
              style={{
                padding: '16px 24px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'exit' ? '3px solid #1e40af' : '3px solid transparent',
                color: activeTab === 'exit' ? '#1e40af' : '#64748b',
                fontWeight: activeTab === 'exit' ? '600' : '500',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Exit Pages
            </button>
          </div>

          <div style={{ padding: '20px' }}>

            {currentData.length > 0 ? (
              <div>
                {currentData.map((page, idx) => (
                  <div 
                    key={idx}
                    style={{
                      borderBottom: idx < currentData.length - 1 ? '1px solid #e2e8f0' : 'none',
                      padding: '20px',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Page Info */}
                    <div 
                      style={{
                        marginBottom: '12px',
                        padding: '12px',
                        borderRadius: '8px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                            📄 {page.title || page.page || 'Untitled'}
                          </div>
                          <div style={{ fontSize: '13px', color: '#64748b' }}>
                            {page.url || page.page || '/'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                          {/* Sessions Number - Clickable */}
                          <div 
                            onClick={(e) => handleSessionsClick(e, page)}
                            style={{ 
                              textAlign: 'center',
                              cursor: page.visits && page.visits.length > 0 ? 'pointer' : 'default',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              transition: 'all 0.2s',
                              minWidth: '100px'
                            }}
                            onMouseEnter={(e) => {
                              if (page.visits && page.visits.length > 0) {
                                e.currentTarget.style.background = '#eff6ff'
                                e.currentTarget.style.transform = 'scale(1.05)'
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent'
                              e.currentTarget.style.transform = 'scale(1)'
                            }}
                          >
                            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>
                              {activeTab === 'entry' ? 'Sessions' : activeTab === 'top' ? 'Views' : 'Exits'}
                            </div>
                            <div style={{ fontSize: '20px', fontWeight: '700', color: '#3b82f6' }}>
                              {page.total_page_views || page.total_views || page.sessions || page.exits || 0}
                            </div>
                          </div>
                          <div style={{ textAlign: 'center', minWidth: '100px' }}>
                            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>
                              Bounce %
                            </div>
                            <div style={{ fontSize: '20px', fontWeight: '700', color: page.bounce_rate > 70 ? '#ef4444' : '#10b981' }}>
                              {page.bounce_rate ? `${page.bounce_rate.toFixed(1)}%` : '0.0%'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                ))}
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
