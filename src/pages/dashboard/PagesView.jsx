import { useState, useEffect } from 'react'
import { visitorsAPI } from '../../api/api'
import { Eye, ChevronDown } from 'lucide-react'

function PagesView({ projectId }) {
  const [allVisitors, setAllVisitors] = useState([])
  const [displayedVisitors, setDisplayedVisitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    console.log('🎯 PagesView useEffect - projectId:', projectId)
    if (projectId) {
      loadVisitors()
    } else {
      console.log('❌ No projectId provided')
      setLoading(false)
    }
  }, [projectId])

  const loadVisitors = async () => {
    try {
      console.log('🔄 Loading visitors for project:', projectId)
      const response = await visitorsAPI.getActivity(projectId, 100)
      console.log('✅ API Response:', response.data)
      console.log('📊 Data length:', response.data?.length)

      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setAllVisitors(response.data)
        // Initially show first 10 items
        const initialChunk = response.data.slice(0, 10)
        setDisplayedVisitors(initialChunk)
        setCurrentIndex(10)
        setHasMore(response.data.length > 10)
        console.log('✅ Visitors data loaded successfully')
      } else {
        console.log('⚠️ No visitors data received')
        setAllVisitors([])
        setDisplayedVisitors([])
        setHasMore(false)
      }
    } catch (error) {
      console.error('❌ Error loading visitors:', error)
      setAllVisitors([])
      setDisplayedVisitors([])
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)

    // Simulate loading delay for better UX
    setTimeout(() => {
      const nextChunkSize = Math.floor(Math.random() * 2) + 3 // Random between 3-4
      const nextChunk = allVisitors.slice(currentIndex, currentIndex + nextChunkSize)

      setDisplayedVisitors(prev => [...prev, ...nextChunk])
      setCurrentIndex(prev => prev + nextChunkSize)
      setHasMore(currentIndex + nextChunkSize < allVisitors.length)
      setLoadingMore(false)
    }, 500)
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

  // Helper to format date to IST (India Standard Time)
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

  if (loading) return (
    <>
      <div className="header">
        <h1>Pages View</h1>
      </div>

      <div className="content">
        <div className="chart-container">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} style={{
              padding: '16px 20px',
              borderBottom: i < 8 ? '1px solid #e2e8f0' : 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'skeleton-loading 1.5s infinite',
                  height: '16px',
                  width: '70%',
                  borderRadius: '4px',
                  marginBottom: '4px'
                }} />
                <div style={{
                  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'skeleton-loading 1.5s infinite',
                  height: '12px',
                  width: '85%',
                  borderRadius: '4px'
                }} />
              </div>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{
                  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'skeleton-loading 1.5s infinite',
                  height: '14px',
                  width: '40px',
                  borderRadius: '4px'
                }} />
                <div style={{
                  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'skeleton-loading 1.5s infinite',
                  height: '14px',
                  width: '60px',
                  borderRadius: '4px'
                }} />
              </div>
            </div>
          ))}
        </div>
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
      <div className="header">
        <h1>Pages View</h1>
        <div style={{
          display: 'flex',
          gap: '12px',
          paddingRight: '40px',
          alignItems: 'center'
        }}>

        </div>
      </div>

      <div className="content">



        <div className="chart-container" style={{ padding: 0, overflowX: 'hidden' }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '80px 100px 50px 200px 250px 1fr',
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            borderBottom: '2px solid #cbd5e1',
            fontSize: '11px',
            fontWeight: '700',
            color: '#475569',
            alignItems: 'center',
            gap: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            minWidth: 0,
            maxWidth: '100%'
          }}>
            <div> Date</div>
            <div> Time</div>
            <div></div>
            <div> System</div>
            <div>Location</div>
            <div> Page Details</div>
          </div>

          {/* Table Rows */}
          {displayedVisitors.length > 0 ? (
            displayedVisitors.map((visitor, idx) => {
              const visitDate = new Date(visitor.visited_at)
              const deviceIcon = getDeviceIcon(visitor.device)
              const referrerText = visitor.referrer && visitor.referrer !== 'direct'
                ? visitor.referrer
                : '(No referring link)'
              const referrerColor = visitor.referrer && visitor.referrer !== 'direct' ? '#3b82f6' : '#10b981'

              // Extract time from local_time_formatted
              const timeDisplay = (() => {
                if (visitor.local_time_formatted) {
                  const timePart = visitor.local_time_formatted.split(',').pop().trim()
                  return timePart
                }
                return visitDate.toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false
                })
              })()

              return (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 100px 50px 200px 250px 1fr',
                    padding: '14px 16px',
                    borderBottom: idx < displayedVisitors.length - 1 ? '1px solid #f1f5f9' : 'none',
                    alignItems: 'start',
                    gap: '12px',
                    minWidth: 0,
                    maxWidth: '100%'
                  }}
                >
                  {/* Date */}
                  <div style={{
                    fontSize: '13px',
                    color: '#1e293b',
                    fontWeight: '500',
                    paddingTop: '2px'
                  }}>
                    {formatToIST(visitor.visited_at, { day: '2-digit', month: 'short' })}
                  </div>

                  {/* Time */}
                  <div style={{
                    fontSize: '13px',
                    color: '#64748b',
                    paddingTop: '2px'
                  }}>
                    {formatToIST(visitor.visited_at, {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false
                    })} (IST)
                  </div>

                  {/* Icon (Browser/Device) */}
                  <div style={{
                    fontSize: '20px',
                    textAlign: 'center',
                    paddingTop: '0px'
                  }}>
                    {deviceIcon}
                  </div>

                  {/* System (Browser + OS + Resolution) */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#1e293b',
                      marginBottom: '2px'
                    }}>
                      {visitor.browser || 'Unknown Browser'}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#64748b'
                    }}>
                      {visitor.os || 'Unknown OS'}
                    </div>
                    <div style={{
                      fontSize: '10px',
                      color: '#94a3b8'
                    }}>
                      {visitor.screen_resolution || 'Unknown'}
                    </div>
                  </div>

                  {/* Location / Language */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#1e293b',
                      marginBottom: '2px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {getCountryFlag(visitor.country)} {visitor.country || 'Unknown'},
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#64748b',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {visitor.city || 'Unknown'}
                    </div>
                  </div>

                  {/* Host Name/Web Page/Referrer */}
                  <div style={{ minWidth: 0, maxWidth: '100%' }}>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#1e293b',
                      marginBottom: '2px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {visitor.entry_page ? new URL(visitor.entry_page).hostname : 'Unknown'}
                    </div>
                    <div style={{
                      fontSize: '10px',
                      color: referrerColor,
                      marginBottom: '2px',
                      wordBreak: 'break-all',
                      lineHeight: '1.4'
                    }}>
                      {referrerText}
                    </div>
                    <a
                      href={visitor.entry_page}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '11px',
                        color: '#3b82f6',
                        textDecoration: 'none',
                        display: 'inline-block',
                        wordBreak: 'break-all',
                        lineHeight: '1.4',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                      {visitor.entry_page} ↗
                    </a>
                  </div>
                </div>
              )
            })
          ) : (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
              <Eye size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <p style={{ fontSize: '16px', fontWeight: '500' }}>No page data yet</p>
              <p style={{ fontSize: '14px' }}>Start tracking visitors to see page views</p>
            </div>
          )}

          {/* Load More Button */}
          {hasMore && (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              borderTop: '1px solid #f1f5f9'
            }}>
              <button
                onClick={loadMore}
                disabled={loadingMore}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  backgroundColor: loadingMore ? '#f1f5f9' : '#3b82f6',
                  color: loadingMore ? '#64748b' : 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: loadingMore ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: loadingMore ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!loadingMore) {
                    e.currentTarget.style.backgroundColor = '#2563eb'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loadingMore) {
                    e.currentTarget.style.backgroundColor = '#3b82f6'
                  }
                }}
              >
                {loadingMore ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #64748b',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Loading...
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    Load More ({allVisitors.length - currentIndex} remaining)
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default PagesView
