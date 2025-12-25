import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { visitorsAPI } from '../../api/api'
import { Filter, Download, ExternalLink, ChevronRight, X } from 'lucide-react'

function VisitorPath({ projectId }) {
  const location = useLocation()
  const [visitors, setVisitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReferrer, setSelectedReferrer] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedVisitorSessions, setSelectedVisitorSessions] = useState(null)
  const [loadingVisitorSessions, setLoadingVisitorSessions] = useState(false)
  const [displayCount, setDisplayCount] = useState(10)

  useEffect(() => {
    loadVisitors()

    // Check if we received a visitor_id from navigation state
    if (location.state?.selectedVisitorId) {
      loadVisitorSessions(location.state.selectedVisitorId)
    }
  }, [projectId, location.state])

  const loadVisitors = async () => {
    try {
      const response = await visitorsAPI.getActivity(projectId, 50)
      setVisitors(response.data)
    } catch (error) {
      console.error('Error loading visitors:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadVisitorSessions = async (visitorId) => {
    setLoadingVisitorSessions(true)
    try {
      const response = await visitorsAPI.getAllSessions(projectId, visitorId)
      setSelectedVisitorSessions(response.data)
    } catch (error) {
      console.error('Error loading visitor sessions:', error)
    } finally {
      setLoadingVisitorSessions(false)
    }
  }

  const handleReferrerClick = (e, visitor) => {
    e.stopPropagation()
    setSelectedReferrer(visitor)
  }

  const closeModal = () => {
    setSelectedReferrer(null)
    setSelectedVisitorSessions(null)
  }

  const loadMore = () => {
    setDisplayCount(prev => prev + 4)
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
      'Russia': 'RU'
    }
    return codes[country] || 'XX'
  }

  const getCountryFlag = (country) => {
    const flags = {
      'United States': '🇺🇸',
      'India': '🇮🇳',
      'United Kingdom': '🇬🇧',
      'Canada': '🇨🇦',
      'Singapore': '🇸🇬',
      'China': '🇨🇳',
      'Bangladesh': '🇧🇩',
      'Pakistan': '🇵🇰',
      'Australia': '🇦🇺',
      'Germany': '🇩🇪',
      'France': '🇫🇷',
      'Japan': '🇯🇵',
      'Brazil': '🇧🇷',
      'Russia': '🇷🇺'
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

  const formatDate = (date) => {
    return formatToIST(date, { day: '2-digit', month: 'short' })
  }

  const formatTime = (date) => {
    return formatToIST(date, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }) + ' (IST)'
  }

  if (loading) return (
    <>
      <div className="header">
        <h1>Visitor Paths</h1>
      </div>

      <div className="content">
        <div className="chart-container">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{
              padding: '20px',
              borderBottom: i < 6 ? '1px solid #e2e8f0' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                animation: 'skeleton-loading 1.5s infinite',
                height: '40px',
                width: '40px',
                borderRadius: '50%'
              }} />
              <div style={{ flex: 1 }}>
                <div style={{
                  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'skeleton-loading 1.5s infinite',
                  height: '16px',
                  width: '120px',
                  borderRadius: '4px',
                  marginBottom: '4px'
                }} />
                <div style={{
                  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'skeleton-loading 1.5s infinite',
                  height: '12px',
                  width: '200px',
                  borderRadius: '4px'
                }} />
              </div>
              <div style={{
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                animation: 'skeleton-loading 1.5s infinite',
                height: '14px',
                width: '80px',
                borderRadius: '4px'
              }} />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  )

  // If visitor sessions are selected, show them on the page (not in popup)
  if (selectedVisitorSessions) {
    return (
      <>
        <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Visitor Journey</h1>
            <div style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>
              Session #{selectedVisitorSessions.sessions[0]?.session_id || 'N/A'}
            </div>
          </div>
          <button
            onClick={closeModal}
            style={{
              padding: '10px 20px',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e2e8f0'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f1f5f9'
            }}
          >
            ← Back
          </button>
        </div>

        <div className="content visitor-journey-content">
          {/* Simple Table Layout */}
          <div className="chart-container" style={{ padding: 0, overflowX: 'hidden' }}>
            {selectedVisitorSessions.sessions.map((session, sessionIdx) => (
              <div
                key={sessionIdx}
                className="chart-container journey-session-card"
                style={{
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  padding: '14px',
                  border: '2px solid #e2e8f0',
                  transition: 'all 0.3s',
                  overflowX: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(59, 130, 246, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {/* Session Header */}
                <div className="session-card-header" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                  paddingBottom: '16px',
                  borderBottom: '2px solid #e2e8f0'
                }}>
                  <div>
                    <div style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b', marginBottom: '6px' }}>
                      🔢 Session #{session.session_id}
                    </div>
                    <div style={{ fontSize: '14px', color: '#64748b', display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span>📅 {formatDate(session.visited_at)}</span>
                      <span>•</span>
                      <span>🕐 {formatTime(session.visited_at)}</span>
                    </div>
                  </div>
                  <div className="header-right" style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: '#3b82f6',
                      marginBottom: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      justifyContent: 'flex-end'
                    }}>
                      📄 {session.page_count} {session.page_count === 1 ? 'Page' : 'Pages'}
                    </div>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>
                      ⏱️ Duration: {session.session_duration ? `${Math.floor(session.session_duration / 60)}m ${session.session_duration % 60}s` : 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Session Details Grid */}
                <div className="entry-exit-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '16px',
                  marginBottom: '20px'
                }}>
                  {/* Entry Page */}
                  <div style={{
                    background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '2px solid #6ee7b7'
                  }}>
                    <div style={{ fontSize: '12px', color: '#065f46', fontWeight: '600', marginBottom: '8px' }}>
                      🚪 ENTRY PAGE
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#047857', wordBreak: 'break-all', overflowWrap: 'anywhere', lineHeight: '1.4' }}>
                      {session.entry_page || 'Unknown'}
                    </div>
                  </div>

                  {/* Exit Page */}
                  <div style={{
                    background: 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '2px solid #f87171'
                  }}>
                    <div style={{ fontSize: '12px', color: '#7f1d1d', fontWeight: '600', marginBottom: '8px' }}>
                      🚪 EXIT PAGE
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#991b1b', wordBreak: 'break-all', overflowWrap: 'anywhere', lineHeight: '1.4' }}>
                      {session.exit_page || 'Still browsing...'}
                    </div>
                  </div>
                </div>

                {/* Device & Browser Info */}
                <div className="device-stats-grid-container" style={{
                  background: 'white',
                  padding: '16px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  border: '2px solid #e2e8f0'
                }}>
                  <div className="device-stats-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '16px',
                    fontSize: '13px'
                  }}>
                    <div>
                      <div style={{ color: '#64748b', marginBottom: '4px', fontSize: '11px', fontWeight: '600' }}>DEVICE</div>
                      <div style={{ color: '#1e293b', fontWeight: '600' }}>
                        {getDeviceIcon(session.device)} {session.device || 'Unknown'}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: '#64748b', marginBottom: '4px', fontSize: '11px', fontWeight: '600' }}>BROWSER</div>
                      <div style={{ color: '#1e293b', fontWeight: '600' }}>
                        🌐 {session.browser || 'Unknown'}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: '#64748b', marginBottom: '4px', fontSize: '11px', fontWeight: '600' }}>LOCATION</div>
                      <div style={{ color: '#1e293b', fontWeight: '600' }}>
                        {getCountryFlag(session.country)} {session.city}, {session.country}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: '#64748b', marginBottom: '4px', fontSize: '11px', fontWeight: '600' }}>REFERRER</div>
                      <div style={{ color: '#1e293b', fontWeight: '600' }}>
                        {session.referrer && session.referrer !== 'direct' ? '🔗 ' + session.referrer.substring(0, 20) + '...' : '🔗 Direct'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Page Journey Timeline */}
                <div>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#1e293b',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    📍 Page Journey Timeline
                  </h4>

                  {session.page_journey && session.page_journey.length > 0 ? (
                    <div style={{ position: 'relative', paddingLeft: '32px' }}>
                      {/* Timeline vertical line */}
                      <div style={{
                        position: 'absolute',
                        left: '11px',
                        top: '20px',
                        bottom: '20px',
                        width: '3px',
                        background: 'linear-gradient(180deg, #3b82f6 0%, #8b5cf6 100%)',
                        borderRadius: '2px'
                      }} />

                      {session.page_journey.map((page, pageIdx) => (
                        <div
                          key={pageIdx}
                          style={{
                            position: 'relative',
                            marginBottom: '20px'
                          }}
                        >
                          {/* Timeline dot with number */}
                          <div style={{
                            position: 'absolute',
                            left: '-32px',
                            top: '14px',
                            width: '26px',
                            height: '26px',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                            borderRadius: '50%',
                            border: '4px solid white',
                            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: '700',
                            color: 'white',
                            zIndex: 1
                          }}>
                            {pageIdx + 1}
                          </div>

                          <div className="timeline-card" style={{
                            background: 'white',
                            padding: '16px',
                            borderRadius: '12px',
                            border: '2px solid #e2e8f0',
                            transition: 'all 0.2s'
                          }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = '#3b82f6'
                              e.currentTarget.style.transform = 'translateX(6px)'
                              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.2)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = '#e2e8f0'
                              e.currentTarget.style.transform = 'translateX(0)'
                              e.currentTarget.style.boxShadow = 'none'
                            }}>
                            <div className="timeline-card-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                              <div className="timeline-info-left" style={{ flex: 1 }}>
                                <div style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>
                                  📄 {page.title || 'Untitled Page'}
                                </div>
                                <a
                                  href={page.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    fontSize: '12px',
                                    color: '#3b82f6',
                                    textDecoration: 'none',
                                    wordBreak: 'break-all',
                                    overflowWrap: 'anywhere',
                                    display: 'block',
                                    lineHeight: '1.4',
                                    maxWidth: '100%'
                                  }}
                                >
                                  {page.url} <ExternalLink size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
                                </a>
                              </div>
                              <div className="timeline-info-right" style={{ textAlign: 'right', marginLeft: '16px', minWidth: '140px' }}>
                                {/* Actual Time - Primary */}
                                {page.viewed_at && (
                                  <>
                                    <div className="visit-time-badge" style={{
                                      fontSize: '20px',
                                      color: '#3b82f6',
                                      fontWeight: '700',
                                      background: '#eff6ff',
                                      padding: '8px 12px',
                                      borderRadius: '8px',
                                      border: '2px solid #bfdbfe',
                                      marginBottom: '6px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '6px'
                                    }}>
                                      🕐 {formatToIST(page.viewed_at, {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit',
                                        hour12: false
                                      })} (IST)
                                    </div>
                                    <div style={{
                                      fontSize: '11px',
                                      color: '#64748b',
                                      fontWeight: '600',
                                      marginBottom: '8px'
                                    }}>
                                      Visited at
                                    </div>
                                  </>
                                )}
                                {/* Time Spent - Secondary */}
                                <div style={{
                                  fontSize: '16px',
                                  fontWeight: '700',
                                  color: '#10b981',
                                  marginBottom: '4px'
                                }}>
                                  ⏱️ {page.time_spent || 0}s
                                </div>
                                <div style={{
                                  fontSize: '10px',
                                  color: '#94a3b8'
                                }}>
                                  Time Spent
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      padding: '40px',
                      textAlign: 'center',
                      color: '#94a3b8',
                      background: 'white',
                      borderRadius: '12px',
                      border: '2px dashed #e2e8f0'
                    }}>
                      <p style={{ fontSize: '14px' }}>No page views recorded for this session</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="header">
        <h1>Visitor Path</h1>
      </div>

      {/* Referrer Details Modal - Keep this as popup */}
      {selectedReferrer && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '1000px',
              width: '95%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              animation: 'slideIn 0.3s ease'
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              position: 'sticky',
              top: 0,
              background: 'white',
              zIndex: 10,
              paddingBottom: '16px',
              borderBottom: '3px solid #e2e8f0'
            }}>
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px 0' }}>
                  👤 Complete Visitor History
                </h2>
                <div style={{ fontSize: '15px', color: '#64748b', display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <span>
                    Visitor ID: <span style={{ fontWeight: '600', color: '#3b82f6', fontFamily: 'monospace' }}>{selectedVisitorSessions.visitor_id}</span>
                  </span>
                  <span style={{
                    padding: '4px 12px',
                    background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                    borderRadius: '12px',
                    fontWeight: '600',
                    color: '#065f46',
                    fontSize: '13px'
                  }}>
                    📊 {selectedVisitorSessions.total_sessions} {selectedVisitorSessions.total_sessions === 1 ? 'Session' : 'Sessions'}
                  </span>
                </div>
              </div>
              <button
                onClick={closeModal}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '8px',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                  fontSize: '24px',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                  marginLeft: '16px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e2e8f0'
                  e.currentTarget.style.color = '#1e293b'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f1f5f9'
                  e.currentTarget.style.color = '#64748b'
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Sessions Timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {selectedVisitorSessions.sessions.map((session, sessionIdx) => (
                <div
                  key={sessionIdx}
                  style={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '3px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(59, 130, 246, 0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {/* Session Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                    paddingBottom: '12px',
                    borderBottom: '2px solid #e2e8f0'
                  }}>
                    <div>
                      <div style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b', marginBottom: '6px' }}>
                        🔢 Session #{session.session_id}
                      </div>
                      <div style={{ fontSize: '14px', color: '#64748b', display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span>📅 {formatDate(session.visited_at)}</span>
                        <span>•</span>
                        <span>🕐 {formatTime(session.visited_at)}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: '#3b82f6',
                        marginBottom: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        justifyContent: 'flex-end'
                      }}>
                        📄 {session.page_count} {session.page_count === 1 ? 'Page' : 'Pages'}
                      </div>
                      <div style={{ fontSize: '14px', color: '#64748b' }}>
                        ⏱️ Duration: {session.session_duration ? `${Math.floor(session.session_duration / 60)}m ${session.session_duration % 60}s` : 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Session Details Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '16px',
                    marginBottom: '20px'
                  }}>
                    {/* Entry Page */}
                    <div style={{
                      background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                      padding: '16px',
                      borderRadius: '12px',
                      border: '2px solid #6ee7b7'
                    }}>
                      <div style={{ fontSize: '12px', color: '#065f46', fontWeight: '600', marginBottom: '8px' }}>
                        🚪 ENTRY PAGE
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#047857', wordBreak: 'break-all', overflowWrap: 'anywhere', lineHeight: '1.4' }}>
                        {session.entry_page || 'Unknown'}
                      </div>
                    </div>

                    {/* Exit Page */}
                    <div style={{
                      background: 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)',
                      padding: '16px',
                      borderRadius: '12px',
                      border: '2px solid #f87171'
                    }}>
                      <div style={{ fontSize: '12px', color: '#7f1d1d', fontWeight: '600', marginBottom: '8px' }}>
                        🚪 EXIT PAGE
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#991b1b', wordBreak: 'break-all', overflowWrap: 'anywhere', lineHeight: '1.4' }}>
                        {session.exit_page || 'Still browsing...'}
                      </div>
                    </div>
                  </div>

                  {/* Device & Browser Info */}
                  <div style={{
                    background: 'white',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    border: '2px solid #e2e8f0'
                  }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '16px',
                      fontSize: '13px'
                    }}>
                      <div>
                        <div style={{ color: '#64748b', marginBottom: '4px', fontSize: '11px', fontWeight: '600' }}>DEVICE</div>
                        <div style={{ color: '#1e293b', fontWeight: '600' }}>
                          {getDeviceIcon(session.device)} {session.device || 'Unknown'}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: '#64748b', marginBottom: '4px', fontSize: '11px', fontWeight: '600' }}>BROWSER</div>
                        <div style={{ color: '#1e293b', fontWeight: '600' }}>
                          🌐 {session.browser || 'Unknown'}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: '#64748b', marginBottom: '4px', fontSize: '11px', fontWeight: '600' }}>LOCATION</div>
                        <div style={{ color: '#1e293b', fontWeight: '600' }}>
                          {getCountryFlag(session.country)} {session.city}, {session.country}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: '#64748b', marginBottom: '4px', fontSize: '11px', fontWeight: '600' }}>REFERRER</div>
                        <div style={{ color: '#1e293b', fontWeight: '600' }}>
                          {session.referrer && session.referrer !== 'direct' ? '🔗 ' + session.referrer.substring(0, 20) + '...' : '🔗 Direct'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Page Journey Timeline */}
                  <div>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#1e293b',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      📍 Page Journey Timeline
                    </h4>

                    {session.page_journey && session.page_journey.length > 0 ? (
                      <div style={{ position: 'relative', paddingLeft: '32px' }}>
                        {/* Timeline vertical line */}
                        <div style={{
                          position: 'absolute',
                          left: '11px',
                          top: '20px',
                          bottom: '20px',
                          width: '3px',
                          background: 'linear-gradient(180deg, #3b82f6 0%, #8b5cf6 100%)',
                          borderRadius: '2px'
                        }} />

                        {session.page_journey.map((page, pageIdx) => (
                          <div
                            key={pageIdx}
                            style={{
                              position: 'relative',
                              marginBottom: '12px'
                            }}
                          >
                            {/* Timeline dot with number */}
                            <div style={{
                              position: 'absolute',
                              left: '-32px',
                              top: '10px',
                              width: '24px',
                              height: '24px',
                              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                              borderRadius: '50%',
                              border: '3px solid white',
                              boxShadow: '0 2px 6px rgba(59, 130, 246, 0.3)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10px',
                              fontWeight: '700',
                              color: 'white',
                              zIndex: 1
                            }}>
                              {pageIdx + 1}
                            </div>

                            <div style={{
                              background: 'white',
                              padding: '10px',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              transition: 'all 0.2s'
                            }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#3b82f6'
                                e.currentTarget.style.transform = 'translateX(6px)'
                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.2)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#e2e8f0'
                                e.currentTarget.style.transform = 'translateX(0)'
                                e.currentTarget.style.boxShadow = 'none'
                              }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ width: '100%' }}>
                                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '3px', wordBreak: 'break-word' }}>
                                    📄 {page.title || 'Untitled Page'}
                                  </div>
                                  <a
                                    href={page.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      fontSize: '10px',
                                      color: '#3b82f6',
                                      textDecoration: 'none',
                                      wordBreak: 'break-all',
                                      overflowWrap: 'anywhere',
                                      display: 'block',
                                      lineHeight: '1.4',
                                      maxWidth: '100%',
                                      whiteSpace: 'normal'
                                    }}
                                  >
                                    {page.url}
                                  </a>
                                </div>
                                <div style={{ textAlign: 'right', marginLeft: '16px', minWidth: '140px' }}>
                                  <div style={{
                                    fontSize: '20px',
                                    fontWeight: '700',
                                    color: '#10b981',
                                    marginBottom: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end',
                                    gap: '6px'
                                  }}>
                                    ⏱️ {page.time_spent || 0}s
                                  </div>
                                  <div style={{
                                    fontSize: '12px',
                                    color: '#64748b',
                                    fontWeight: '600',
                                    marginBottom: '4px'
                                  }}>
                                    Time Spent
                                  </div>
                                  <div style={{
                                    fontSize: '13px',
                                    color: '#3b82f6',
                                    fontWeight: '600',
                                    background: '#eff6ff',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    border: '1px solid #dbeafe'
                                  }}>
                                    🕐 {new Date(page.viewed_at).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      second: '2-digit',
                                      hour12: true
                                    })}
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                                    Visited at
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{
                        padding: '40px',
                        textAlign: 'center',
                        color: '#94a3b8',
                        background: 'white',
                        borderRadius: '12px',
                        border: '2px dashed #e2e8f0'
                      }}>
                        <p style={{ fontSize: '14px' }}>No page views recorded for this session</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Referrer Details Modal */}
      {selectedReferrer && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '600px',
              width: '90%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              animation: 'slideIn 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px 0' }}>
                  🔗 Came From Details
                </h2>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  Session #{selectedReferrer.id}
                </div>
              </div>
              <button
                onClick={closeModal}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '8px',
                  width: '36px',
                  height: '36px',
                  cursor: 'pointer',
                  fontSize: '20px',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                  marginLeft: '16px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e2e8f0'
                  e.currentTarget.style.color = '#1e293b'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f1f5f9'
                  e.currentTarget.style.color = '#64748b'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
              {/* Referrer */}
              <div style={{
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #93c5fd'
              }}>
                <div style={{ fontSize: '13px', color: '#1e40af', fontWeight: '600', marginBottom: '8px' }}>
                  🌐 Referrer Source
                </div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#1d4ed8', marginBottom: '8px' }}>
                  {selectedReferrer.referrer && selectedReferrer.referrer !== 'direct'
                    ? selectedReferrer.referrer
                    : 'Direct Traffic'}
                </div>
                {selectedReferrer.referrer && selectedReferrer.referrer !== 'direct' && (
                  <a
                    href={selectedReferrer.referrer}
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
                    Visit Referrer <ExternalLink size={12} />
                  </a>
                )}
              </div>

              {/* Entry Page */}
              <div style={{
                background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #6ee7b7'
              }}>
                <div style={{ fontSize: '13px', color: '#065f46', fontWeight: '600', marginBottom: '8px' }}>
                  🚪 Entry Page
                </div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#047857', marginBottom: '8px', wordBreak: 'break-all', overflowWrap: 'anywhere', lineHeight: '1.4' }}>
                  {selectedReferrer.entry_page || 'Unknown'}
                </div>
                {selectedReferrer.entry_page && (
                  <a
                    href={selectedReferrer.entry_page}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '13px',
                      color: '#10b981',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    Visit Page <ExternalLink size={12} />
                  </a>
                )}
              </div>

              {/* Additional Info */}
              <div style={{
                background: '#f8fafc',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #e2e8f0'
              }}>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '12px' }}>
                  📊 Session Information
                </div>
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '14px', color: '#64748b' }}>Location:</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                      {getCountryFlag(selectedReferrer.country)} {selectedReferrer.city}, {selectedReferrer.country}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '14px', color: '#64748b' }}>Device:</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                      {getDeviceIcon(selectedReferrer.device)} {selectedReferrer.device || 'Unknown'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '14px', color: '#64748b' }}>Browser:</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                      {selectedReferrer.browser || 'Unknown'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                    <span style={{ fontSize: '14px', color: '#64748b' }}>Visit Time:</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                      {formatDate(selectedReferrer.visited_at)} {formatTime(selectedReferrer.visited_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              marginTop: '24px',
              padding: '16px',
              background: '#eff6ff',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#1e40af',
              border: '1px solid #bfdbfe'
            }}>
              <strong style={{ color: '#1e40af' }}>💡 Insight:</strong> {
                selectedReferrer.referrer && selectedReferrer.referrer !== 'direct'
                  ? 'This visitor came from an external source. Consider tracking this referrer for partnership opportunities.'
                  : 'This visitor came directly to your site (typed URL, bookmark, or no referrer data).'
              }
            </div>
          </div>
        </div>
      )}

      <div className="content" style={{ overflowX: 'hidden' }}>
        {/* Filters and Export */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>

        </div>

        {/* Visitor List */}
        <div className="chart-container" style={{ padding: 0, overflowX: 'hidden', width: '100%' }}>
          {visitors.length > 0 ? (
            <div>
              {visitors.slice(0, displayCount).map((visitor, idx) => (
                <div
                  key={idx}
                  className="visitor-row"
                  style={{
                    padding: '16px 20px',
                    borderBottom: idx < visitors.length - 1 ? '1px solid #e2e8f0' : 'none',
                    display: 'grid',
                    gridTemplateColumns: '140px 110px 1fr 190px',
                    gap: '20px',
                    alignItems: 'start',
                    minWidth: 0,
                    maxWidth: '100%',
                    overflowX: 'hidden'
                  }}>

                  {/* Location */}
                  <div className="visitor-col" data-label="Location" style={{ minWidth: 0, maxWidth: '100%', paddingTop: '2px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {getCountryCode(visitor.country)} {visitor.country || 'Unknown'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {visitor.city || 'Unknown City'}
                    </div>
                  </div>

                  {/* Session */}
                  <div className="visitor-col" data-label="Session" style={{ minWidth: 0, maxWidth: '100%', paddingTop: '2px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#3b82f6', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      Session #{visitor.id}
                    </div>
                    <div style={{ fontSize: '10px', color: '#0c0c0cff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {visitor.referrer && visitor.referrer !== 'direct' ? 'Referring link:' : 'No referring link:'}
                    </div>
                  </div>

                  {/* Entry Page - Clickable Link Only */}
                  <div className="visitor-col" data-label="Entry Page" style={{ minWidth: 0, maxWidth: '100%' }}>
                    <div className="referrer-label" style={{ fontSize: '11px', color: 'rgba(1, 6, 13, 0.89)', marginBottom: '4px' }}>
                      {visitor.referrer && visitor.referrer !== 'direct' ? 'Referring' : 'Direct'}
                    </div>
                    <a
                      href={visitor.entry_page}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        fontSize: '11px',
                        color: '#3b82f6',
                        fontWeight: '500',
                        textDecoration: 'none',
                        wordBreak: 'break-all',
                        overflowWrap: 'anywhere',
                        lineHeight: '1.4',
                        cursor: 'pointer',
                        display: 'block',
                        maxWidth: '100%',
                        whiteSpace: 'normal'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                      {visitor.entry_page || 'Unknown'}
                    </a>
                  </div>

                  {/* Device & Time */}
                  <div className="visitor-col" data-label="Device & Time" style={{ display: 'flex', gap: '8px', alignItems: 'start', minWidth: 0, maxWidth: '100%' }}>
                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0, paddingTop: '2px' }}>
                      <span style={{ fontSize: '18px', lineHeight: 1 }}>{getDeviceIcon(visitor.device)}</span>
                      <span style={{ fontSize: '18px', lineHeight: 1 }}>🌐</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0, maxWidth: '100%' }}>
                      <div className="device-info" style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {visitor.device || 'Unknown'}, {visitor.browser || 'Unknown'}
                      </div>
                      <div className="time-info" style={{ fontSize: '10px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {formatDate(visitor.visited_at)} {formatTime(visitor.visited_at)}
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
              <p style={{ fontSize: '16px', fontWeight: '500' }}>No visitor data yet</p>
              <p style={{ fontSize: '14px' }}>Start tracking visitors to see their paths</p>
            </div>
          )}
        </div>
      </div>
      <style>
        {`
          @media (max-width: 768px) {
            .header h1 {
              font-size: 20px !important;
            }
            .visitor-journey-content {
                padding: 10px !important;
            }
            .journey-session-card {
                padding: 12px !important;
                border: 1px solid #e2e8f0 !important;
                margin-bottom: 15px !important;
            }
            .session-card-header {
                flex-direction: column !important;
                align-items: flex-start !important;
                gap: 10px !important;
                padding-bottom: 12px !important;
            }
            .session-card-header .header-right {
                text-align: left !important;
                width: 100% !important;
            }
            .session-card-header .header-right > div {
                justify-content: flex-start !important;
            }
            .entry-exit-grid {
                grid-template-columns: 1fr !important;
                gap: 12px !important;
            }
            .device-stats-grid {
                grid-template-columns: 1fr 1fr !important;
                gap: 10px !important;
            }
            .timeline-card {
                padding: 12px !important;
            }
            .timeline-card-inner {
                flex-direction: column !important;
                gap: 12px !important;
            }
            .timeline-info-right {
                margin-left: 0 !important;
                text-align: left !important;
                width: 100% !important;
            }
            .visit-time-badge {
                justify-content: flex-start !important;
                font-size: 16px !important;
                padding: 6px 10px !important;
            }
            .timeline-info-right > div {
                justify-content: flex-start !important;
            }

            /* Visitor List Responsive */
            .visitor-row {
                display: block !important;
                background: white !important;
                border-radius: 12px !important;
                margin-bottom: 15px !important;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
                border: 1px solid #e2e8f0 !important;
                padding: 15px !important;
            }
            .visitor-col {
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                padding: 10px 0 !important;
                border-bottom: 1px solid #f1f5f9 !important;
                text-align: right !important;
            }
            .visitor-col:last-child {
                border-bottom: none !important;
            }
            .visitor-col:after {
                content: "";
                display: table;
                clear: both;
            }
            .visitor-col:before {
                content: attr(data-label);
                font-weight: 600;
                color: #64748b;
                font-size: 12px;
                text-align: left !important;
                margin-right: 15px !important;
                flex-shrink: 0;
            }
            .visitor-col > div, .visitor-col > a {
                max-width: 65% !important;
                text-align: right !important;
            }
            .referrer-label {
                display: none !important;
            }
            .device-info, .time-info {
                text-align: right !important;
            }
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideIn {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>
    </>
  )
}

export default VisitorPath
