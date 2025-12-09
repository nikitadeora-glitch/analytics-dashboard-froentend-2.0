import { useState, useEffect } from 'react'
import { visitorsAPI } from '../../api/api'
import { Filter, Download } from 'lucide-react'

function VisitorActivity({ projectId }) {
  const [visitors, setVisitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadVisitors()
    const interval = setInterval(loadVisitors, 30000)
    return () => clearInterval(interval)
  }, [projectId])

  const loadVisitors = async () => {
    try {
      const response = await visitorsAPI.getActivity(projectId)
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

  if (loading) return <div className="loading">Loading visitor activity...</div>

  return (
    <>
      <div className="header">
        <h1>Visitor Activity</h1>
      </div>

      <div className="content">
        

        {/* Visitor List */}
        <div className="chart-container" style={{ padding: 0 }}>
          {visitors.length > 0 ? (
            <div>
              {visitors.map((visitor, idx) => (
                <div 
                  key={idx}
                  style={{
                    padding: '12px 20px',
                    borderBottom: idx < visitors.length - 1 ? '1px solid #e2e8f0' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Two Column Layout */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    
                    {/* Left Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      
                      {/* Page Views */}
                      <div>
                        <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                          Page Views:
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>
                          {visitor.page_views || 'N/A'}
                        </div>
                      </div>

                      {/* Local Time (Visitor's Timezone) */}
                      <div>
                        <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                          Visit Time {visitor.local_time_formatted ? '(Local)' : '(Server)'}:
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: visitor.local_time_formatted ? '#10b981' : '#f59e0b' }}>
                          {visitor.local_time_formatted || (visitor.visited_at ? new Date(visitor.visited_at).toLocaleString('en-US', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false
                          }) : 'N/A')}
                          {visitor.timezone_offset && (
                            <span style={{ fontSize: '9px', color: '#64748b', marginLeft: '4px' }}>
                              (UTC{visitor.timezone_offset})
                            </span>
                          )}
                        </div>
                        {visitor.timezone && (
                          <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px' }}>
                            🌍 {visitor.timezone}
                          </div>
                        )}
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      
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
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>
                          {visitor.isp || 'Unknown'} ({visitor.ip_address || 'N/A'})
                        </div>
                      </div>

                      {/* Referring URL */}
                      <div>
                        <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                          Referring URL:
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: visitor.referrer && visitor.referrer !== 'direct' ? '#10b981' : '#64748b' }}>
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
                              display: 'inline-block'
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
            </div>
          ) : (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
              <p style={{ fontSize: '16px', fontWeight: '500' }}>No visitor activity yet</p>
              <p style={{ fontSize: '14px' }}>Start tracking visitors to see their activity</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default VisitorActivity
