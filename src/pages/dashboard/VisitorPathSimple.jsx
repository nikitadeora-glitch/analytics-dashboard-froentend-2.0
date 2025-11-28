import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { visitorsAPI } from '../../api/api'
import { ExternalLink, MapPin, Monitor, Globe } from 'lucide-react'

function VisitorPathSimple({ projectId, visitorId, onBack }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [sessionData, setSessionData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const vidToLoad = visitorId || location.state?.selectedVisitorId
    if (vidToLoad) {
      loadVisitorSession(vidToLoad)
    }
  }, [projectId, visitorId, location.state])

  const loadVisitorSession = async (vid) => {
    setLoading(true)
    try {
      const response = await visitorsAPI.getAllSessions(projectId, vid)
      setSessionData(response.data)
    } catch (error) {
      console.error('Error loading visitor session:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })
  }

  const formatTime = (date) => {
    const d = new Date(date)
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
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

  if (loading) return <div className="loading">Loading...</div>

  if (!sessionData || !sessionData.sessions || sessionData.sessions.length === 0) {
    return <div className="loading">No session data found</div>
  }

  const session = sessionData.sessions[0]

  return (
    <>
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Entry Page</h1>
          <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
            {session.entry_page || '/'}
          </div>
        </div>
        <button 
          onClick={() => onBack ? onBack() : navigate(-1)}
          style={{
            padding: '8px 16px',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#64748b',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
        >
          ← Back
        </button>
      </div>

      <div className="content">
        <div className="chart-container" style={{ padding: 0 }}>
          {/* Table Layout */}
          {session.page_journey && session.page_journey.length > 0 ? (
            <div>
              {session.page_journey.map((page, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 200px 1fr 150px 200px',
                    alignItems: 'center',
                    padding: '16px 24px',
                    borderBottom: idx < session.page_journey.length - 1 ? '1px solid #f1f5f9' : 'none',
                    transition: 'background 0.2s',
                    gap: '16px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Play Icon */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      background: '#eff6ff',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #bfdbfe'
                    }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#3b82f6' }}>▶</span>
                    </div>
                  </div>

                  {/* Location & Session Info */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '18px' }}>{getCountryFlag(session.country)}</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                        {session.country || 'Unknown'}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {session.city || 'Unknown City'}, {session.country || 'Unknown'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#10b981', marginTop: '2px' }}>
                      {session.referrer && session.referrer !== 'direct' ? '(referring link)' : '(No referring link)'}
                    </div>
                  </div>

                  {/* Page URL */}
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                      {formatDate(page.viewed_at)} {formatTime(page.viewed_at)}
                    </div>
                    <a 
                      href={page.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ 
                        fontSize: '13px', 
                        color: '#3b82f6', 
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {page.url} <ExternalLink size={12} />
                    </a>
                  </div>

                  {/* Session Number */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      background: '#eff6ff',
                      borderRadius: '6px',
                      border: '1px solid #bfdbfe'
                    }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#3b82f6' }}>
                        Session #{session.session_id}
                      </span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>🔍</span>
                    </div>
                  </div>

                  {/* Device & Browser */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                      {session.device || 'Win7'}, {session.browser || 'Chrome'} {session.browser_version || '126.0'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {session.screen_resolution || '1280x1200'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
              <p>No page views recorded</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default VisitorPathSimple
