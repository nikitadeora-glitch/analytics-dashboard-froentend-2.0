import { useState, useEffect } from 'react'
import { visitorsAPI } from '../../api/api'
import { ArrowLeft, Clock, Eye, MapPin, Monitor, Globe } from 'lucide-react'

function VisitorPathSimple({ projectId, visitorId, onBack }) {
  const [visitorData, setVisitorData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadVisitorPath()
  }, [projectId, visitorId])

  const loadVisitorPath = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get visitor's complete session data
      const response = await visitorsAPI.getAllSessions(projectId, visitorId)
      setVisitorData(response.data)
    } catch (error) {
      console.error('Error loading visitor path:', error)
      setError(error.message || 'Failed to load visitor data')
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return '0s'
    
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    
    if (mins > 0) {
      return `${mins}m ${secs}s`
    }
    return `${secs}s`
  }

  const getCountryFlag = (country) => {
    const flags = {
      'United States': '🇺🇸',
      'India': '🇮🇳',
      'United Kingdom': '🇬🇧',
      'Canada': '🇨🇦',
      'Singapore': '🇸🇬',
      'China': '🇨🇳',
      'Germany': '🇩🇪',
      'France': '🇫🇷',
      'Japan': '🇯🇵',
      'Australia': '🇦🇺'
    }
    return flags[country] || '🌍'
  }

  const getDeviceIcon = (device) => {
    if (device?.toLowerCase().includes('mobile')) return '📱'
    if (device?.toLowerCase().includes('tablet')) return '📱'
    return '💻'
  }

  if (loading) {
    return (
      <div>
        <div className="header" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              color: '#475569',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <ArrowLeft size={16} />
            Back to Pages
          </button>
          <h1>Loading Visitor Path...</h1>
        </div>

        <div className="content">
          <div className="chart-container">
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '16px', color: '#64748b' }}>
                Loading visitor journey for {visitorId}...
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <div className="header" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              color: '#475569',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <ArrowLeft size={16} />
            Back to Pages
          </button>
          <h1>Error Loading Visitor</h1>
        </div>

        <div className="content">
          <div className="chart-container">
            <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                Failed to load visitor data
              </div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>
                {error}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!visitorData || !visitorData.sessions || visitorData.sessions.length === 0) {
    return (
      <div>
        <div className="header" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              color: '#475569',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <ArrowLeft size={16} />
            Back to Pages
          </button>
          <h1>Visitor: {visitorId}</h1>
        </div>

        <div className="content">
          <div className="chart-container">
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
              <Eye size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
                No session data available
              </div>
              <div style={{ fontSize: '14px' }}>
                This visitor doesn't have any recorded sessions.
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const firstSession = visitorData.sessions[0]

  return (
    <div>
      <div className="header" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            color: '#475569',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#e2e8f0'
            e.currentTarget.style.borderColor = '#94a3b8'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#f1f5f9'
            e.currentTarget.style.borderColor = '#cbd5e1'
          }}
        >
          <ArrowLeft size={16} />
          Back to Pages
        </button>
        <h1>Visitor Journey: {visitorId}</h1>
      </div>

      <div className="content">
        {/* Visitor Summary */}
        <div className="chart-container" style={{ marginBottom: '20px' }}>
          <div style={{ 
            padding: '20px', 
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc'
          }}>
            <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '24px' }}>
                  {getDeviceIcon(firstSession.device)}
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                    {visitorData.visitor_id}
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} />
                      {getCountryFlag(firstSession.country)} {firstSession.country}, {firstSession.city}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Monitor size={14} />
                      {firstSession.browser} on {firstSession.os}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>
                  {visitorData.total_sessions}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  Total Sessions
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="chart-container">
          <div style={{ padding: '20px 0' }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#1e293b',
              marginBottom: '20px',
              paddingLeft: '20px'
            }}>
              Session History ({visitorData.sessions.length})
            </h3>
            
            {visitorData.sessions.map((session, sessionIdx) => (
              <div 
                key={session.session_id || sessionIdx}
                style={{
                  borderBottom: sessionIdx < visitorData.sessions.length - 1 ? '1px solid #f1f5f9' : 'none',
                  padding: '20px'
                }}
              >
                {/* Session Header */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <div>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: '#1e293b',
                      marginBottom: '4px'
                    }}>
                      Session #{session.session_number || sessionIdx + 1}
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#64748b',
                      display: 'flex',
                      gap: '16px',
                      alignItems: 'center'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} />
                        {new Date(session.visited_at).toLocaleString()}
                      </span>
                      <span>
                        Duration: {formatDuration(session.session_duration)}
                      </span>
                      <span>
                        {session.page_count} pages
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#10b981' }}>
                        {session.entry_page ? new URL(session.entry_page).pathname : 'Unknown'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        Entry Page
                      </div>
                    </div>
                    <div style={{ fontSize: '20px', color: '#64748b' }}>→</div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#ef4444' }}>
                        {session.exit_page ? new URL(session.exit_page).pathname : 'Unknown'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        Exit Page
                      </div>
                    </div>
                  </div>
                </div>

                {/* Page Journey */}
                {session.page_journey && session.page_journey.length > 0 && (
                  <div>
                    <h4 style={{ 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#1e293b',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Eye size={16} />
                      Page Journey
                    </h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {session.page_journey.map((page, pageIdx) => (
                        <div 
                          key={pageIdx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px',
                            background: '#f8fafc',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0'
                          }}
                        >
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: '#3b82f6',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: '600',
                            flexShrink: 0
                          }}>
                            {pageIdx + 1}
                          </div>
                          
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ 
                              fontSize: '13px', 
                              fontWeight: '500', 
                              color: '#1e293b',
                              marginBottom: '2px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {page.url || 'Unknown Page'}
                            </div>
                            <div style={{ 
                              fontSize: '11px', 
                              color: '#64748b'
                            }}>
                              {page.title || 'No title'}
                            </div>
                          </div>
                          
                          <div style={{ 
                            fontSize: '12px', 
                            fontWeight: '600',
                            color: '#10b981',
                            textAlign: 'right',
                            flexShrink: 0
                          }}>
                            {formatDuration(page.time_spent)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VisitorPathSimple