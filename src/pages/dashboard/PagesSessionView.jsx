import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchSessionDetails, clearSessionDetails, fetchMoreSessionDetails } from '../../store/slices/sessionSlice'
import { Skeleton, Box } from '@mui/material'

function PagesSessionView({ projectId, selectedPageSessions, pageType, onBack }) {
  const dispatch = useDispatch()
  const { sessionDetails, loading, loadingMore, error, hasMore, currentLimit } = useSelector(state => state.session)
  
  // Local state for pagination
  const [loadCount, setLoadCount] = useState(0)

  useEffect(() => {
    if (selectedPageSessions) {
      // Reset load count and fetch initial data (3 sessions for fastest loading)
      setLoadCount(0)
      dispatch(fetchSessionDetails({ projectId, selectedPageSessions, limit: 3 }))
    }
    
    // Cleanup on unmount
    return () => {
      dispatch(clearSessionDetails())
    }
  }, [dispatch, projectId, selectedPageSessions])

  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return
    
    // Calculate increment: 3-4 items per load
    const increment = loadCount % 2 === 0 ? 3 : 4
    const newLimit = currentLimit + increment
    
    console.log(`📥 Loading more sessions: ${currentLimit} → ${newLimit}`)
    
    dispatch(fetchMoreSessionDetails({ 
      projectId, 
      selectedPageSessions, 
      limit: newLimit 
    }))
    
    setLoadCount(prev => prev + 1)
  }

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
    <>
      {/* Header */}
      <div className="header">
        <div>
          <h1>{pageType === 'entry' ? 'Entry Page' : pageType === 'top' ? 'Top Page' : 'Exit Page'}</h1>
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
              transition: 'all 0.2s',
              marginTop: '8px'
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
          {/* Optimized Material UI Skeleton Loader */}
          {[1].map((idx) => (
            <Box 
              key={idx}
              sx={{
                padding: '10px 20px',
                borderBottom: 'none',
                transition: 'background 0.2s'
              }}
            >
              {/* Main Row Skeleton - Exact Grid Layout */}
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr 200px 140px 240px',
                alignItems: 'start',
                gap: '20px'
              }}>
                {/* Date Only Skeleton - First Column */}
                <Box>
                  <Skeleton variant="text" width="100%" height={16} animation="wave" />
                </Box>

                {/* Time & URLs Skeleton - Second Column */}
                <Box>
                  <Skeleton variant="text" width="90%" height={15} animation="wave" sx={{ marginBottom: '4px' }} />
                  <Skeleton variant="text" width="100%" height={14} animation="wave" sx={{ marginBottom: '4px' }} />
                  <Skeleton variant="text" width="85%" height={12} animation="wave" />
                </Box>

                {/* Location & IP Skeleton - Third Column */}
                <Box>
                  <Skeleton variant="text" width="80%" height={16} animation="wave" sx={{ marginBottom: '4px' }} />
                  <Skeleton variant="text" width="60%" height={14} animation="wave" sx={{ marginBottom: '4px' }} />
                  <Skeleton variant="text" width="70%" height={12} animation="wave" />
                </Box>

                {/* Session Number & Total Time Skeleton - Fourth Column */}
                <Box sx={{ textAlign: 'center' }}>
                  <Skeleton variant="text" width="100%" height={18} animation="wave" sx={{ marginBottom: '6px' }} />
                  <Skeleton variant="rounded" width="80%" height={24} animation="wave" sx={{ margin: '0 auto' }} />
                </Box>

                {/* Device & Browser Skeleton - Fifth Column */}
                <Box sx={{ textAlign: 'right' }}>
                  <Skeleton variant="text" width="90%" height={16} animation="wave" sx={{ marginBottom: '4px', marginLeft: 'auto' }} />
                  <Skeleton variant="text" width="100%" height={15} animation="wave" sx={{ marginBottom: '4px' }} />
                  <Skeleton variant="text" width="75%" height={12} animation="wave" sx={{ marginLeft: 'auto' }} />
                </Box>
              </Box>

              {/* Session Stats Skeleton */}
              <Box sx={{
                marginTop: '12px',
                padding: '8px 16px',
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '20px'
              }}>
                <Skeleton variant="text" width={120} height={14} animation="wave" />
                <Skeleton variant="text" width={140} height={14} animation="wave" />
                <Skeleton variant="text" width={100} height={14} animation="wave" />
              </Box>

              {/* User Journey Skeleton - Only for entry and top pages */}
              {pageType !== 'exit' && (
                <Box sx={{ 
                  marginTop: '16px',
                  paddingLeft: '20px'
                }}>
                  <Skeleton variant="text" width={150} height={14} animation="wave" sx={{ marginBottom: '12px' }} />
                  
                  {[1, 2].map((pidx) => (
                    <Box 
                      key={pidx}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '40px 1fr 120px',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '8px',
                        padding: '8px 5px'
                      }}
                    >
                      {/* Step Number Skeleton */}
                      <Skeleton variant="circular" width={25} height={25} animation="wave" />

                      {/* Page Info Skeleton */}
                      <Box sx={{ minWidth: 0 }}>
                        <Skeleton variant="text" width={60} height={12} animation="wave" sx={{ marginBottom: '4px' }} />
                        <Skeleton variant="text" width="90%" height={14} animation="wave" sx={{ marginBottom: '4px' }} />
                        <Skeleton variant="text" width="100%" height={12} animation="wave" />
                      </Box>

                      {/* Time Spent Skeleton */}
                      <Box sx={{ textAlign: 'right' }}>
                        <Skeleton variant="text" width={60} height={18} animation="wave" sx={{ marginBottom: '4px', marginLeft: 'auto' }} />
                        <Skeleton variant="text" width={80} height={12} animation="wave" sx={{ marginLeft: 'auto' }} />
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          ))}
        </div>
      </div>
    </>
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
                  gridTemplateColumns: '260px 300px 260px 260px 400px',
                  alignItems: 'start',
                  gap: '20px'
                }}>
                  {/* Date Only - First Column */}
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                      {session.local_time_formatted ? (
                        <>
                          {new Date(session.local_time_formatted).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </>
                      ) : (
                        <>
                          {visitDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Time + URLs - Second Column */}
                  <div>
                    {/* Time */}
                    <div>
                      {/* Time */}
                      <div style={{ fontSize: '11px', fontWeight: '500', color: '#475569', marginBottom: '2px' }}>
                        {session.local_time_formatted ? (
                          <>
                            {session.local_time_formatted.split(',').pop().trim()}
                            <span style={{ marginLeft: '4px', fontSize: '9px', color: '#64748b' }}>
                              ({session.timezone || session.timezone_offset || 'Local'})
                            </span>
                          </>
                        ) : (
                          <>
                            {visitDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
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
                  </div>

                  {/* Location & IP - Third Column */}
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

                  {/* Session Number & Total Time - Fourth Column */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                    
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      
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

                  {/* Device & Browser - Fifth Column */}
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
                          minWidth: '25px',
                          height: '35px',
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
          
          {/* Load More Button */}
          {hasMore && sessionDetails.length > 0 && (
            <div style={{ padding: '20px', textAlign: 'center', borderTop: '1px solid #e2e8f0' }}>
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                style={{
                 
                  color:  'black',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: loadingMore ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  minWidth: '140px'
                }}
                onMouseEnter={(e) => {
                  if (!loadingMore) {
                   
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loadingMore) {
                   
                    e.currentTarget.style.transform = 'translateY(0)'
                  }
                }}
              >
                {loadingMore ? ' Loading...' : 'Load More Sessions'}
              </button>
              <div style={{ 
                fontSize: '12px', 
                color: '#64748b', 
                marginTop: '8px' 
              }}>
                Showing {sessionDetails.length} of {selectedPageSessions?.visits?.length || 0} sessions
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default PagesSessionView