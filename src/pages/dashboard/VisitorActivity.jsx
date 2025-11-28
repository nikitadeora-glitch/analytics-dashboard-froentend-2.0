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
        {/* Filters and Export */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: '10px 16px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
          >
            <Filter size={16} />
            Add Filter
          </button>

          <button 
            style={{
              padding: '10px 16px',
              background: 'white',
              color: '#3b82f6',
              border: '2px solid #3b82f6',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
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
            <Download size={16} />
            Export
          </button>
        </div>

        {/* Visitor List */}
        <div className="chart-container" style={{ padding: 0 }}>
          {visitors.length > 0 ? (
            <div>
              {visitors.map((visitor, idx) => (
                <div 
                  key={idx}
                  style={{
                    padding: '24px',
                    borderBottom: idx < visitors.length - 1 ? '1px solid #e2e8f0' : 'none',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f8fafc'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  {/* Two Column Layout */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    
                    {/* Left Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      
                      {/* Page Views */}
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                          Page Views:
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                          {visitor.page_views || 'N/A'}
                        </div>
                      </div>

                      {/* Local Time (Visitor's Timezone) */}
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                          Visit Time {visitor.local_time_formatted ? '(Local)' : '(Server)'}:
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: visitor.local_time_formatted ? '#10b981' : '#f59e0b' }}>
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
                            <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '8px' }}>
                              (UTC{visitor.timezone_offset})
                            </span>
                          )}
                          {!visitor.local_time_formatted && visitor.visited_at && (
                            <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '8px' }}>
                              (UTC)
                            </span>
                          )}
                        </div>
                        {visitor.timezone && (
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                            🌍 {visitor.timezone}
                          </div>
                        )}
                      </div>

                      {/* Resolution */}
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                          Resolution:
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                          {visitor.screen_resolution || 'Unknown'}
                        </div>
                      </div>

                      {/* System */}
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                          System:
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '20px' }}>{getDeviceIcon(visitor.device)}</span>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                            {visitor.os || 'Unknown'}
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Right Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      
                      {/* Total Sessions */}
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                          Total Sessions:
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#3b82f6' }}>
                          {visitor.total_sessions || 'N/A'}
                        </div>
                      </div>

                      {/* Location */}
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                          Location:
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '20px' }}>{getCountryFlag(visitor.country)}</span>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                            {[visitor.city, visitor.state, visitor.country].filter(Boolean).join(', ') || 'Unknown'}
                          </span>
                        </div>
                      </div>

                      {/* ISP / IP Address */}
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                          ISP / IP Address:
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                          {visitor.isp || 'Unknown'} ({visitor.ip_address || 'N/A'})
                        </div>
                      </div>

                      {/* Referring URL */}
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                          Referring URL:
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: visitor.referrer && visitor.referrer !== 'direct' ? '#10b981' : '#64748b' }}>
                          {visitor.referrer && visitor.referrer !== 'direct' ? visitor.referrer : '(No referring link)'}
                        </div>
                      </div>

                      {/* Visit Page */}
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                          Visit Page:
                        </div>
                        <div style={{ 
                          fontSize: '14px', 
                          fontWeight: '600', 
                          color: '#1e293b',
                          fontStyle: visitor.entry_page ? 'normal' : 'italic'
                        }}>
                          {visitor.entry_page || 'Unknown'}
                        </div>
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
