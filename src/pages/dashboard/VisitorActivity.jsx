import { useState, useEffect } from 'react'
import { visitorsAPI } from '../../api/api'
import { Skeleton, Box, Grid } from '@mui/material'

function VisitorActivity({ projectId }) {
  const [visitors, setVisitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [displayCount, setDisplayCount] = useState(10)

  useEffect(() => {
    loadVisitors()
    const interval = setInterval(loadVisitors, 30000)
    return () => clearInterval(interval)
  }, [projectId])

  const loadVisitors = async () => {
    try {
      setError(null)
      const response = await visitorsAPI.getActivityView(projectId, 10000) // Increased limit to fetch all (10k)
      setVisitors(response.data)
    } catch (error) {
      console.error('Error loading visitors:', error)
      setError('Failed to load visitor activity. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    setDisplayCount(prev => prev + 4)
  }

  const getCountryFlag = (country) => {
    const flags = {
      'United States': '🇺🇸',
      'India': '🇮🇳',
      'United Kingdom': '🇬🇧',
      'Canada': '🇨🇦',
      'Singapore': '🇸🇬',
      'China': '🇨🇳'
    }
    return flags[country] || '🌍'
  }

  const getDeviceIcon = (device) => {
    if (device?.toLowerCase().includes('mobile')) return '📱'
    if (device?.toLowerCase().includes('tablet')) return '📱'
    return '💻'
  }

  // Helper to format date – showing it exactly as provided by the backend (already in IST)
  const formatToIST = (dateString, options = {}) => {
    if (!dateString) return ''

    const date = new Date(dateString)

    // Check if valid date
    if (isNaN(date.getTime())) return dateString

    // Just use the browser's default locale to format the date that came from the backend
    return date.toLocaleString('en-IN', options)
  }

  if (loading) {
    return (
      <>
        <div className="header">
          <h1>Visitor Activity</h1>
        </div>
        <div className="content">
          {/* Visitor List - Material-UI */}
          <Box className="chart-container" sx={{
            padding: 0,
            overflowX: 'hidden',
            width: '100%'
          }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <Box key={i} sx={{
                padding: '12px 20px',
                borderBottom: i < 8 ? '1px solid #e2e8f0' : 'none'
              }}>
                {/* Two Column Layout */}
                <Grid container spacing={2} sx={{ overflow: 'hidden', width: '100%' }}>

                  {/* Left Column */}
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>

                      {/* Page Views */}
                      <Box>
                        <Skeleton variant="text" width={70} height={10} animation="wave" sx={{ marginBottom: 0.25 }} />
                        <Skeleton variant="text" width={40} height={12} animation="wave" />
                      </Box>

                      {/* Visit Time */}
                      <Box>
                        <Skeleton variant="text" width={100} height={10} animation="wave" sx={{ marginBottom: 0.25 }} />
                        <Skeleton variant="text" width={150} height={12} animation="wave" />
                      </Box>

                      {/* Location */}
                      <Box>
                        <Skeleton variant="text" width={60} height={10} animation="wave" sx={{ marginBottom: 0.25 }} />
                        <Skeleton variant="text" width={120} height={12} animation="wave" />
                      </Box>

                      {/* Entry Page */}
                      <Box>
                        <Skeleton variant="text" width={80} height={10} animation="wave" sx={{ marginBottom: 0.25 }} />
                        <Skeleton variant="text" width={200} height={12} animation="wave" />
                      </Box>
                    </Box>
                  </Grid>

                  {/* Right Column */}
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>

                      {/* Session Duration */}
                      <Box>
                        <Skeleton variant="text" width={90} height={10} animation="wave" sx={{ marginBottom: 0.25 }} />
                        <Skeleton variant="text" width={60} height={12} animation="wave" />
                      </Box>

                      {/* Device Info */}
                      <Box>
                        <Skeleton variant="text" width={50} height={10} animation="wave" sx={{ marginBottom: 0.25 }} />
                        <Skeleton variant="text" width={140} height={12} animation="wave" />
                      </Box>

                      {/* Browser */}
                      <Box>
                        <Skeleton variant="text" width={50} height={10} animation="wave" sx={{ marginBottom: 0.25 }} />
                        <Skeleton variant="text" width={100} height={12} animation="wave" />
                      </Box>

                      {/* Referrer */}
                      <Box>
                        <Skeleton variant="text" width={60} height={10} animation="wave" sx={{ marginBottom: 0.25 }} />
                        <Skeleton variant="text" width={180} height={12} animation="wave" />
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Box>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <div className="header">
          <h1>Visitor Activity</h1>
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
      <div className="header">
        <h1>Visitor Activity</h1>
      </div>

      <div className="content">
        {/* Visitor List */}
        <div className="chart-container" style={{
          padding: 0,
          overflowX: 'hidden',
          width: '100%'
        }}>
          {visitors.length > 0 ? (
            <div>
              {visitors.slice(0, displayCount).map((visitor, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '12px 20px',
                    borderBottom: idx < visitors.length - 1 ? '1px solid #e2e8f0' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {/* Two Column Layout */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: window.innerWidth > 768 ? 'minmax(0, 1fr) minmax(0, 1fr)' : '1fr',
                    gap: '16px',
                    overflow: 'hidden',
                    width: '100%'
                  }}>

                    {/* Left Column */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      minWidth: 0,
                      overflow: 'hidden'
                    }}>

                      {/* Page Views */}
                      <div>
                        <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                          Page Views:
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>
                          {visitor.page_views || 'N/A'}
                        </div>
                      </div>

                      {/* Local Time (Converted to IST) */}
                      <div>
                        <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                          Visit Time:
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#10b981' }}>
                          {formatToIST(visitor.visited_at, {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}<br />
                          {formatToIST(visitor.visited_at, {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false
                          })} (IST)
                        </div>
                      </div>

                      {/* Resolution */}
                      <div>
                        <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                          Resolution:
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>
                          {visitor.screen_resolution || 'Unknown'}
                        </div>
                      </div>

                      {/* System */}
                      <div>
                        <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                          System:
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '16px' }}>{getDeviceIcon(visitor.device)}</span>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>
                            {visitor.os || 'Unknown'}
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Right Column */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      minWidth: 0,
                      overflow: 'hidden'
                    }}>

                      {/* Total Sessions */}
                      <div>
                        <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                          Total Sessions:
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#3b82f6' }}>
                          {visitor.total_sessions || 'N/A'}
                        </div>
                      </div>

                      {/* Location */}
                      <div>
                        <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                          Location:
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '16px' }}>{getCountryFlag(visitor.country)}</span>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>
                            {[visitor.city, visitor.state, visitor.country].filter(Boolean).join(', ') || 'Unknown'}
                          </span>
                        </div>
                      </div>

                      {/* ISP / IP Address */}
                      <div>
                        <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                          ISP / IP Address:
                        </div>
                        <div style={{
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#1e293b',
                          wordBreak: 'break-word',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {visitor.isp || 'Unknown'} ({visitor.ip_address || 'N/A'})
                        </div>
                      </div>

                      {/* Referring URL */}
                      <div>
                        <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                          Referring URL:
                        </div>
                        <div style={{
                          fontSize: '12px',
                          fontWeight: '600',
                          color: visitor.referrer && visitor.referrer !== 'direct' ? '#10b981' : '#64748b',
                          wordBreak: 'break-word',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {visitor.referrer && visitor.referrer !== 'direct' ? visitor.referrer : '(No referring link)'}
                        </div>
                      </div>

                      {/* Visit Page - Clickable */}
                      <div>
                        <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                          Visit Page:
                        </div>
                        {visitor.entry_page ? (
                          <a
                            href={`/project/${projectId}/visitor-path`}
                            onClick={(e) => {
                              e.preventDefault()
                              // Navigate to visitor path with visitor_id
                              window.location.href = `/project/${projectId}/visitor-path?visitor_id=${visitor.visitor_id}`
                            }}
                            style={{
                              fontSize: '12px',
                              fontWeight: '600',
                              color: '#3b82f6',
                              textDecoration: 'none',
                              cursor: 'pointer',
                              display: 'block',
                              wordBreak: 'break-word',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                          >
                            {visitor.entry_page} →
                          </a>
                        ) : (
                          <div style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#64748b',
                            fontStyle: 'italic'
                          }}>
                            Unknown
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              ))}

              {/* Load More Button */}
              {displayCount < visitors.length && (
                <div style={{
                  padding: '20px',
                  textAlign: 'center',
                  borderTop: '1px solid #e2e8f0'
                }}>
                  <button
                    onClick={loadMore}
                    style={{
                      padding: '10px 24px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                  >
                    Load More ({visitors.length - displayCount} remaining)
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
              <p style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>No visitor activity yet</p>
              <p style={{ fontSize: '14px', color: '#64748b' }}>Start tracking visitors to see their activity here</p>
              <button
                onClick={loadVisitors}
                style={{
                  marginTop: '16px',
                  padding: '8px 16px',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Refresh
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default VisitorActivity