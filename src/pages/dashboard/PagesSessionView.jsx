import { useState, useEffect } from 'react'
import { visitorsAPI } from '../../api/api'

function PagesSessionView({ projectId, selectedPageSessions, pageType, onBack }) {
  const [sessionDetails, setSessionDetails] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedSession, setExpandedSession] = useState(null)
  const isExitPage = pageType === 'exit'

  useEffect(() => {
    loadSessionDetails()
  }, [selectedPageSessions])

  const loadSessionDetails = async () => {
    console.log('=== PagesSessionView loadSessionDetails ===')
    console.log('selectedPageSessions:', selectedPageSessions)
    console.log('visits:', selectedPageSessions?.visits)
    
    if (!selectedPageSessions?.visits || selectedPageSessions.visits.length === 0) {
      console.error('No visits data available')
      setLoading(false)
      return
    }

    try {
      console.log('Loading session details for', selectedPageSessions.visits.length, 'visits')
      
      // Get all visitors first
      const allVisitors = await visitorsAPI.getActivity(projectId, 1000)
      
      // For each session, get complete path
      const detailsPromises = selectedPageSessions.visits.map(async (visit) => {
        console.log('Processing visit:', visit)
        const visitorData = allVisitors.data.find(v => v.visitor_id === visit.visitor_id)
        
        // Get visitor's complete path for this session
        try {
          const pathResponse = await visitorsAPI.getAllSessions(projectId, visit.visitor_id)
          console.log('Path response for', visit.visitor_id, ':', pathResponse.data)
          
          // Backend returns { sessions: [...] }, find matching session
          const sessions = pathResponse.data.sessions || []
          console.log('All sessions for visitor:', sessions)
          console.log('Looking for session_id:', visit.session_id)
          const sessionData = sessions.find(s => s.session_number === visit.session_id)
          console.log('Session data found:', sessionData)
          console.log('Page journey:', sessionData?.page_journey)
          
          return {
            ...visitorData,
            ...visit,
            visited_at: visit.visited_at,
            path: sessionData?.page_journey || [],
            entry_page: sessionData?.entry_page,
            exit_page: sessionData?.exit_page,
            total_time: sessionData?.session_duration || visit.time_spent || 0
          }
        } catch (error) {
          console.error('Error loading path for visitor:', visit.visitor_id, error)
          return {
            ...visitorData,
            ...visit,
            visited_at: visit.visited_at,
            path: []
          }
        }
      })
      
      const details = await Promise.all(detailsPromises)
      console.log('Final session details:', details)
      
      setSessionDetails(details)
    } catch (error) {
      console.error('Error loading session details:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeSpent = (seconds) => {
    if (!seconds) return '0s'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  const getCountryFlag = (country) => {
    const flags = {
      'United States': '🇺🇸', 'India': '🇮🇳', 'United Kingdom': '🇬🇧',
      'Canada': '🇨🇦', 'Singapore': '🇸🇬', 'China': '🇨🇳'
    }
    return flags[country] || '🌍'
  }

  const handleSessionClick = (session) => {
    // Toggle expanded session
    if (expandedSession === session.session_id) {
      setExpandedSession(null)
    } else {
      setExpandedSession(session.session_id)
    }
  }

  if (loading) return <div className="loading">Loading session details...</div>

  return (
    <>
      <div className="header">
        <div style={{ paddingRight: '40px' }}>
          <button
            onClick={onBack}
            style={{
              padding: '10px 20px',
              background: 'white',
              color: '#3b82f6',
              border: '2px solid #3b82f6',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#3b82f6'
              e.currentTarget.style.color = 'white'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white'
              e.currentTarget.style.color = '#3b82f6'
            }}
          >
            ← Back to Pages
          </button>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: '8px 0' }}>
            {isExitPage ? '🚶 Exit Sessions' : '🛤️ Session Journey'}
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            {isExitPage 
              ? 'Showing exit time and duration spent on this page before leaving'
              : 'Complete visitor journey for each session'
            }
          </p>
        </div>
      </div>

      <div className="content">
        <div className="chart-container" style={{ padding: 0 }}>
          {sessionDetails.length === 0 ? (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center',
              color: '#94a3b8'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛤️</div>
              <p style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>No Journey Data Available</p>
              <p style={{ fontSize: '14px' }}>Sessions without page journey are not displayed</p>
            </div>
          ) : sessionDetails.map((session, idx) => {
            const visitDate = new Date(session.visited_at)
            const isExpanded = expandedSession === session.session_id
            
            return (
              <div 
                key={idx}
                style={{
                  padding: '24px',
                  borderBottom: idx < sessionDetails.length - 1 ? '2px solid #e2e8f0' : 'none'
                }}
              >
                {/* Session Header - Clickable */}
                <div 
                  onClick={() => handleSessionClick(session)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 100px 250px 200px 100px 1fr',
                    gap: '16px',
                    alignItems: 'center',
                    marginBottom: isExpanded ? '20px' : '0',
                    padding: '16px',
                    background: isExpanded ? '#eff6ff' : '#f8fafc',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: isExpanded ? '2px solid #3b82f6' : '2px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isExpanded) {
                      e.currentTarget.style.background = '#f1f5f9'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isExpanded) {
                      e.currentTarget.style.background = '#f8fafc'
                    }
                  }}
                >
                  {/* Date */}
                  <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: '500' }}>
                    {visitDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </div>

                  {/* Time */}
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    {session.local_time_formatted 
                      ? session.local_time_formatted.split(',').pop().trim()
                      : visitDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
                    }
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

                  {/* Total Time */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#10b981' }}>
                      {formatTimeSpent(session.total_time || session.time_spent || 0)}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      Total Time
                    </div>
                  </div>

                  {/* Session Badge with Expand Indicator */}
                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                    <span style={{
                      padding: '6px 14px',
                      background: isExpanded ? '#3b82f6' : '#eff6ff',
                      color: isExpanded ? 'white' : '#3b82f6',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      border: isExpanded ? 'none' : '1px solid #bfdbfe',
                      transition: 'all 0.2s'
                    }}>
                      Session #{String(session.session_id || '').substring(0, 8) || 'N/A'}
                    </span>
                    <span style={{ 
                      fontSize: '18px', 
                      color: '#3b82f6',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s'
                    }}>
                      ▼
                    </span>
                  </div>
                </div>

                {/* Expanded Journey - Show only when clicked */}
                {isExpanded && (
                  <div style={{ marginTop: '20px' }}>
                    {/* Exit Page Info - Show only for exit pages */}
                    {isExitPage ? (
                      <div style={{
                        marginLeft: '40px',
                        padding: '20px',
                        background: '#fef2f2',
                        borderRadius: '12px',
                        border: '2px solid #fca5a5'
                      }}>
                        <div style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#dc2626',
                          marginBottom: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          🚶 Exit Information
                        </div>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '16px'
                        }}>
                          <div>
                            <div style={{ fontSize: '11px', color: '#991b1b', marginBottom: '4px', fontWeight: '600' }}>
                              EXIT PAGE
                            </div>
                            <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: '500', wordBreak: 'break-all' }}>
                              {selectedPageSessions.url || selectedPageSessions.page}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '11px', color: '#991b1b', marginBottom: '4px', fontWeight: '600' }}>
                              TIME SPENT ON THIS PAGE
                            </div>
                            <div style={{ fontSize: '20px', color: '#dc2626', fontWeight: '700' }}>
                              {formatTimeSpent(session.time_spent || 0)}
                            </div>
                          </div>
                        </div>
                        <div style={{
                          marginTop: '16px',
                          padding: '12px',
                          background: 'white',
                          borderRadius: '8px',
                          fontSize: '12px',
                          color: '#64748b'
                        }}>
                          💡 <strong>Note:</strong> Visitor exited from this page at the time shown above
                        </div>
                      </div>
                    ) : (
                      /* Visitor Journey Path - Only show if data exists and not exit page */
                      session.path && session.path.length > 0 && (
                        <div style={{
                          marginLeft: '40px',
                          paddingLeft: '20px',
                          borderLeft: '3px solid #e2e8f0'
                        }}>
                          <div style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#64748b',
                            marginBottom: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            🛤️ Visitor Journey ({session.path.length} pages)
                          </div>
                        
                          {session.path.map((page, pidx) => (
                            <div 
                              key={pidx}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                                marginBottom: '12px',
                                padding: '12px',
                                background: pidx === 0 ? '#f0fdf4' : pidx === session.path.length - 1 ? '#fef2f2' : '#f8fafc',
                                borderRadius: '8px',
                                border: pidx === 0 ? '2px solid #86efac' : pidx === session.path.length - 1 ? '2px solid #fca5a5' : '1px solid #e2e8f0',
                                position: 'relative'
                              }}
                            >
                              {/* Step Number */}
                              <div style={{
                                minWidth: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: pidx === 0 ? '#10b981' : pidx === session.path.length - 1 ? '#ef4444' : '#3b82f6',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '13px',
                                fontWeight: '700',
                                flexShrink: 0
                              }}>
                                {pidx === 0 ? '🚪' : pidx === session.path.length - 1 ? '🚶' : pidx + 1}
                              </div>

                              {/* Page Info */}
                              <div style={{ flex: 1 }}>
                                <div style={{
                                  fontSize: '11px',
                                  color: pidx === 0 ? '#059669' : pidx === session.path.length - 1 ? '#dc2626' : '#64748b',
                                  fontWeight: '600',
                                  marginBottom: '4px',
                                  textTransform: 'uppercase'
                                }}>
                                  {pidx === 0 ? '🟢 Entry Page' : pidx === session.path.length - 1 ? '🔴 Exit Page' : `Page ${pidx + 1}`}
                                </div>
                                <div style={{
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  color: '#1e293b',
                                  marginBottom: '4px',
                                  wordBreak: 'break-all'
                                }}>
                                  {page.title || 'Untitled Page'}
                                </div>
                                <a 
                                  href={page.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    fontSize: '12px',
                                    color: '#3b82f6',
                                    textDecoration: 'none',
                                    wordBreak: 'break-all'
                                  }}
                                >
                                  {page.url}
                                </a>
                              </div>

                              {/* Time Spent */}
                              <div style={{
                                minWidth: '80px',
                                textAlign: 'right',
                                flexShrink: 0
                              }}>
                                <div style={{
                                  fontSize: '16px',
                                  fontWeight: '700',
                                  color: '#10b981',
                                  marginBottom: '2px'
                                }}>
                                  {formatTimeSpent(page.time_spent || 0)}
                                </div>
                                <div style={{
                                  fontSize: '10px',
                                  color: '#64748b'
                                }}>
                                  Time Spent
                                </div>
                              </div>

                              {/* Arrow to next page */}
                              {pidx < session.path.length - 1 && (
                                <div style={{
                                  position: 'absolute',
                                  left: '28px',
                                  bottom: '-18px',
                                  fontSize: '20px',
                                  color: '#94a3b8'
                                }}>
                                  ↓
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default PagesSessionView
