import { useState, useEffect } from 'react'
import { visitorsAPI } from '../../api/api'
import { Eye } from 'lucide-react'

function PagesView({ projectId }) {
  const [visitors, setVisitors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVisitors()
  }, [projectId])

  const loadVisitors = async () => {
    try {
      const response = await visitorsAPI.getActivity(projectId, 100)
      setVisitors(response.data)
    } catch (error) {
      console.error('Error loading visitors:', error)
    } finally {
      setLoading(false)
    }
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

  if (loading) return <div className="loading">Loading pages...</div>

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
          {visitors.length > 0 ? (
            visitors.map((visitor, idx) => {
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
                    borderBottom: idx < visitors.length - 1 ? '1px solid #f1f5f9' : 'none',
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
                    {visitDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </div>

                  {/* Time */}
                  <div style={{ 
                    fontSize: '13px', 
                    color: '#64748b',
                    paddingTop: '2px'
                  }}>
                    {timeDisplay}
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
        </div>
      </div>
    </>
  )
}

export default PagesView
