import { useState, useEffect } from 'react'
import { visitorsAPI } from '../../api/api'

function PagesSessionView({ projectId, selectedPageSessions, pageType, onBack }) {
  const [sessionDetails, setSessionDetails] = useState([])
  const [loading, setLoading] = useState(true)

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
      'Russia': 'RU',
      'South Korea': 'KR',
      'Mexico': 'MX',
      'Italy': 'IT',
      'Spain': 'ES',
      'Netherlands': 'NL',
      'Switzerland': 'CH'
    }
    return codes[country] || 'XX'
  }

  if (loading) return <div className="loading">Loading session details...</div>

  return (
    <>
      <div className="header">
        <div>
          <h1>{pageType === 'entry' ? 'Entry Page' : pageType === 'top' ? 'Top Page' : 'Exit Page'}</h1>
          <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px', marginBottom: '12px' }}>
          
          </div>
          <button 
            onClick={onBack}
            style={{
              padding: '8px 16px',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#010812ff',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
          >
            ← Back
          </button>
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
                  padding: '10px 20px',
                  borderBottom: idx < sessionDetails.length - 1 ? '1px solid #e2e8f0' : 'none',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {/* Main Row */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '280px 1fr 140px 240px',
                  alignItems: 'start',
                  gap: '20px'
                }}>
                  {/* Location & IP */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>
                        {getCountryCode(session.country)} {session.city || 'Unknown'}, {session.country || 'Unknown'}
                      </span>
                      {session.referrer_source && (
                        <span style={{ 
                          fontSize: '9px', 
                          fontWeight: '600',
                          color: '#dc2626',
                          background: '#fee2e2',
                          padding: '1px 4px',
                          borderRadius: '3px'
                        }}>
                          {session.referrer_source}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                      {session.ip_address || 'Unknown IP'}
                    </div>
                    <div style={{ fontSize: '9px', color: '#10b981', fontWeight: '500' }}>
                      {session.referrer && session.referrer !== 'direct' ? '(referring link)' : '(No referring link)'}
                    </div>
                  </div>

                  {/* Date, Time & URLs */}
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '500', color: '#1e293b', marginBottom: '2px' }}>
                      {session.local_time_formatted ? (
                        <>
                          {new Date(session.local_time_formatted).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          <span style={{ marginLeft: '8px' }}>
                            {session.local_time_formatted.split(',').pop().trim()}
                          </span>
                          <span style={{ marginLeft: '4px', fontSize: '9px', color: '#64748b' }}>
                            ({session.timezone || session.timezone_offset || 'Local'})
                          </span>
                        </>
                      ) : (
                        <>
                          {visitDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          <span style={{ marginLeft: '8px' }}>
                            {visitDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                          </span>
                        </>
                      )}
                    </div>
                    <a 
                      href={selectedPageSessions.url || selectedPageSessions.page}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ 
                        fontSize: '10px', 
                        color: '#3b82f6', 
                        textDecoration: 'none',
                        display: 'block',
                        marginBottom: '2px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                      {selectedPageSessions.url || selectedPageSessions.page} 
                    </a>
                    {session.referrer && session.referrer !== 'direct' ? (
                      <a 
                        href={session.referrer}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ 
                          fontSize: '10px', 
                          color: '#10b981', 
                          textDecoration: 'none',
                          display: 'block'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                      >
                        {session.referrer}
                      </a>
                    ) : (
                      <div style={{ fontSize: '10px', color: '#94a3b8', fontStyle: 'italic' }}>
                        Direct visit
                      </div>
                    )}
                  </div>

                  {/* Session Number */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                     
                    }}>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: 'black'}}>
                        Session #{String(session.session_id).substring(0, 8)}
                      </span>
                      
                    </div>
                  </div>

                  {/* Device & Browser */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginBottom: '3px' }}>
                      <span style={{ fontSize: '14px' }}>💻</span>
                      <span style={{ fontSize: '14px' }}>🌐</span>
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#1e293b', marginBottom: '2px' }}>
                      {session.os || 'Unknown OS'}, {session.browser || 'Unknown'} {session.browser_version || ''}
                    </div>
                    <div style={{ fontSize: '9px', color: '#64748b' }}>
                      {session.screen_resolution || 'Unknown Resolution'}
                    </div>
                  </div>
                </div>

                {/* Visitor Journey - Show only for entry and top pages, not for exit pages */}
                {pageType !== 'exit' && session.path && session.path.length > 0 && (
                  <div style={{ 
                    marginTop: '16px',
                    paddingLeft: '20px',
                    
                  }}>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      color: '#64748b',
                      marginBottom: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                     
                    </div>
                    
                    {session.path.map((page, pidx) => (
                      <div 
                        key={pidx}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '40px 1fr 120px',
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '8px',
                          padding: '8px 5px',
                          
                          position: 'relative'
                        }}
                      >
                        {/* Step Number */}
                        <div style={{
                          minWidth: '28px',
                          height: '28px',
                          borderRadius: '50%',
    
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: '700',
                          flexShrink: 0
                        }}>
                         
                        </div>

                        {/* Page Info */}
                        <div style={{ minWidth: 0 }}>
                          <div style={{
                            fontSize: '10px',
                            color: pidx === 0 ? '#059669' : pidx === session.path.length - 1 ? '#dc2626' : '#64748b',
                            fontWeight: '600',
                            marginBottom: '2px',
                            textTransform: 'uppercase'
                          }}>
                            {pidx === 0 ? ' Entry' : pidx === session.path.length - 1 ? ' Exit' : `Step ${pidx + 1}`}
                          </div>
                          <div style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            color: '#1e293b',
                            marginBottom: '2px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {page.title || 'Untitled Page'}
                          </div>
                          <a 
                            href={page.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: '10px',
                              color: '#3b82f6',
                              textDecoration: 'none',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              display: 'block'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                          >
                            {page.url}
                          </a>
                        </div>

                        {/* Time Spent */}
                        <div style={{
                          textAlign: 'right',
                          flexShrink: 0
                        }}>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: '700',
                            color: (page.time_spent || page.timeSpent || page.duration) ? '#10b981' : '#94a3b8',
                            marginBottom: '2px'
                          }}>
                             {(page.time_spent || page.timeSpent || page.duration) ? formatTimeSpent(page.time_spent || page.timeSpent || page.duration) : 'N/A'}
                          </div>
                          <div style={{
                            fontSize: '9px',
                            color: '#64748b'
                          }}>
                            Time Spent
                          </div>
                        </div>

                       
                      </div>
                    ))}
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
