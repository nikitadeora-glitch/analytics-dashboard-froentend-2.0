import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchSessionDetails, clearSessionDetails } from '../../store/slices/sessionSlice'

function PagesSessionView({ projectId, selectedPageSessions, pageType, onBack }) {
  const dispatch = useDispatch()
  const { sessionDetails, loading, error } = useSelector(state => state.session)

  useEffect(() => {
    if (selectedPageSessions) {
      dispatch(fetchSessionDetails({ projectId, selectedPageSessions }))
    }
    
    // Cleanup on unmount
    return () => {
      dispatch(clearSessionDetails())
    }
  }, [dispatch, projectId, selectedPageSessions])

  // Optimized time formatting
  const formatTimeSpent = (seconds) => {
    // Handle null, undefined, or invalid values
    if (seconds === null || seconds === undefined || seconds === '' || isNaN(seconds)) {
      return '0s'
    }
    
    const totalSeconds = Math.floor(Number(seconds))
    
    if (totalSeconds <= 0) return '0s'
    
    const hours = Math.floor(totalSeconds / 3600)
    const mins = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    
    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`
    } else if (mins > 0) {
      return `${mins}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  // Calculate total session time
  const calculateSessionTime = (path) => {
    if (!path || path.length === 0) return 0
    return path.reduce((total, page) => {
      const timeSpent = Number(page.time_spent) || 0
      return total + timeSpent
    }, 0)
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

  if (loading) return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '300px',
      fontSize: '16px',
      color: '#64748b'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #f3f4f6',
        borderTop: '4px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '16px'
      }}></div>
      <div>Loading session details...</div>
      <div style={{ fontSize: '12px', marginTop: '8px', color: '#94a3b8' }}>
        Processing visitor journeys and calculating time spent
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
  
  if (error) {
    console.error('Session loading error:', error)
    return <div className="loading">Error loading session details: {error}</div>
  }

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
            
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛤️</div>
              <p style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>No Journey Data Available</p>
              <p style={{ fontSize: '14px' }}>Sessions without page journey are not displayed</p>
            </div>
          ) : sessionDetails.map((session, idx) => {
            const visitDate = new Date(session.visited_at)
            const totalSessionTime = calculateSessionTime(session.path)
            
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

                  {/* Session Number & Total Time */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      display: 'inline-flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                    }}>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: 'black'}}>
                        Session #{String(session.session_id).substring(0, 8)}
                      </span>
                      {totalSessionTime > 0 && (
                        <div style={{
                          fontSize: '11px',
                          fontWeight: '600',
                          color: '#10b981',
                          background: '#f0fdf4',
                          padding: '2px 6px',
                          borderRadius: '10px',
                          border: '1px solid #bbf7d0'
                        }}>
                          Total: {formatTimeSpent(totalSessionTime)}
                        </div>
                      )}
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

                {/* Session Stats - Only show if there's meaningful time data */}
                {session.path && session.path.length > 0 && totalSessionTime > 0 && (
                  <div style={{
                    marginTop: '12px',
                    padding: '8px 16px',
               
                    borderRadius: '6px',
                    fontSize: '10px',
               
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>
                      <strong>{session.path.length}</strong> pages visited
                    </span>
                    <span>
                      Avg: <strong style={{ color: '#10b981' }}>
                        {formatTimeSpent(totalSessionTime / session.path.length)}
                      </strong> per page
                    </span>
                    <span>
                      Longest: <strong style={{ color: '#3b82f6' }}>
                        {formatTimeSpent(Math.max(...session.path.map(p => Number(p.time_spent) || 0)))}
                      </strong>
                    </span>
                  </div>
                )}

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
                      User Journey ({session.path.length} pages)
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
                          background: pidx === 0 ? '#059669' : pidx === session.path.length - 1 ? '#dc2626' : '#3b82f6',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: '700',
                          flexShrink: 0
                        }}>
                          {pidx + 1}
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

                        {/* Time Spent - Enhanced Display */}
                        <div style={{
                          textAlign: 'right',
                          flexShrink: 0
                        }}>
                          {/* Optimized - removed excessive logging */}
                          
                          <div style={{
                            fontSize: '16px',
                            fontWeight: '700',
                            color: page.time_spent && Number(page.time_spent) > 0 ? '#10b981' : '#94a3b8',
                            marginBottom: '2px'
                          }}>
                            {formatTimeSpent(page.time_spent)}
                            {page.time_spent_calculated && (
                              <span style={{
                                fontSize: '8px',
                                color: '#f59e0b',
                                marginLeft: '4px',
                                fontWeight: '500'
                              }}>
                                *
                              </span>
                            )}
                          </div>
                          <div style={{
                            fontSize: '9px',
                            color: '#64748b'
                          }}>
                            Time Spent
                          </div>
                          
                          {/* Raw time_spent value for debugging */}
                          <div style={{
                            fontSize: '7px',
                            color: '#94a3b8',
                            marginTop: '1px'
                          }}>
                            {page.time_spent_calculated ? 'Calc' : 'Raw'}: {page.time_spent}s
                            {page.time_spent_original !== undefined && page.time_spent_calculated && (
                              <span style={{ marginLeft: '4px' }}>
                                (Orig: {page.time_spent_original})
                              </span>
                            )}
                          </div>
                          
                          {/* Percentage of session */}
                          {page.time_spent && Number(page.time_spent) > 0 && totalSessionTime > 0 && (
                            <div style={{
                              fontSize: '8px',
                              color: '#10b981',
                              marginTop: '2px',
                              fontWeight: '500'
                            }}>
                              {((Number(page.time_spent) / totalSessionTime) * 100).toFixed(1)}% of session
                            </div>
                          )}
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
