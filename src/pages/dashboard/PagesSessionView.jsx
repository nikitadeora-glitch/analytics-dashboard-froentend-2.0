import { useState, useEffect } from 'react'
import { visitorsAPI } from '../../api/api'

function PagesSessionView({ projectId, selectedPageSessions, pageType, onBack }) {
  const [sessionDetails, setSessionDetails] = useState([])
  const [loading, setLoading] = useState(true)
  const isExitPage = pageType === 'exit'

  useEffect(() => {
    loadSessionDetails()
  }, [selectedPageSessions])

  const loadSessionDetails = async () => {
    if (!selectedPageSessions?.visits || selectedPageSessions.visits.length === 0) {
      console.log('No visits data:', selectedPageSessions)
      setLoading(false)
      return
    }

    console.log('Loading session details for:', selectedPageSessions.visits)

    try {
      const allVisitors = await visitorsAPI.getActivity(projectId, 200)
      console.log('All visitors:', allVisitors.data)
      
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
          const sessionData = sessions.find(s => s.session_number === visit.session_id)
          console.log('Session data found:', sessionData)
          
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

  if (loading) return <div className="loading">Loading session details...</div>

  return (
    <>
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '40px' }}>
          <div>
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
          <div style={{
            padding: '16px 24px',
            background: isExitPage 
              ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
              : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: isExitPage 
              ? '0 4px 12px rgba(239, 68, 68, 0.3)' 
              : '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}>
            <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>
              Total Sessions
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700' }}>
              {sessionDetails.length}
            </div>
          </div>
        </div>
        
        {/* Page URL Banner */}
        <div style={{
          marginTop: '16px',
          padding: '16px 20px',
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          borderRadius: '12px',
          border: '2px solid #93c5fd'
        }}>
          <div style={{ fontSize: '11px', color: '#1e40af', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            📄 {isExitPage ? 'Exit Page' : pageType === 'entry' ? 'Entry Page' : 'Analyzed Page'}
          </div>
          <a 
            href={selectedPageSessions.url || selectedPageSessions.page}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '15px',
              color: '#1e40af',
              textDecoration: 'none',
              fontWeight: '600',
              wordBreak: 'break-all',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {selectedPageSessions.url || selectedPageSessions.page}
            <span style={{ fontSize: '14px' }}>🔗</span>
          </a>
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
            
            return (
              <div 
                key={idx}
                style={{
                  padding: '24px',
                  borderBottom: idx < sessionDetails.length - 1 ? '2px solid #e2e8f0' : 'none'
                }}
              >
                {/* Session Header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 100px 250px 200px 100px 1fr',
                  gap: '16px',
                  alignItems: 'center',
                  marginBottom: '20px',
                  padding: '16px',
                  background: '#f8fafc',
                  borderRadius: '8px'
                }}>
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

                  {/* Session Badge */}
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      padding: '6px 14px',
                      background: '#eff6ff',
                      color: '#3b82f6',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      border: '1px solid #bfdbfe'
                    }}>
                      Session #{session.session_id?.substring(0, 8)}
                    </span>
                  </div>
                </div>

                {/* Page URL Info */}
                <div style={{
                  marginBottom: '20px',
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                  borderRadius: '8px',
                  border: '2px solid #93c5fd'
                }}>
                  <div style={{ fontSize: '11px', color: '#1e40af', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase' }}>
                    📄 {isExitPage ? 'Exit Page' : pageType === 'entry' ? 'Entry Page' : 'Visited Page'}
                  </div>
                  <a 
                    href={selectedPageSessions.url || selectedPageSessions.page}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '14px',
                      color: '#1e40af',
                      textDecoration: 'none',
                      fontWeight: '600',
                      wordBreak: 'break-all',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {selectedPageSessions.url || selectedPageSessions.page}
                    <span style={{ fontSize: '12px' }}>🔗</span>
                  </a>
                </div>

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
            )
          })
          }
        </div>
      </div>
    </>
  )
}

export default PagesSessionView
