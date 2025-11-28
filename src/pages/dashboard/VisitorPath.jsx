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

  const formatDate = (date) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })
  }

  const formatTime = (date) => {
    const d = new Date(date)
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  }

  if (loading) return <div className="loading">Loading visitor paths...</div>

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

        <div className="content">
          {/* Simple Table Layout */}
          <div className="chart-container" style={{ padding: 0 }}>
            {selectedVisitorSessions.sessions.map((session, sessionIdx) => (
              <div 
                key={sessionIdx}
                className="chart-container"
                style={{
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  padding: '24px',
                  border: '3px solid #e2e8f0',
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
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {/* Session Header */}
                <div style={{ 
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
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#047857', wordBreak: 'break-all' }}>
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
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#991b1b', wordBreak: 'break-all' }}>
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

                          <div style={{
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                              <div style={{ flex: 1 }}>
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
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  {page.url} <ExternalLink size={12} />
                                </a>
                              </div>
                              <div style={{ textAlign: 'right', marginLeft: '16px' }}>
                                <div style={{ 
                                  fontSize: '18px', 
                                  fontWeight: '700', 
                                  color: '#10b981',
                                  marginBottom: '4px'
                                }}>
                                  ⏱️ {page.time_spent || 0}s
                                </div>
                                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                                  {new Date(page.viewed_at).toLocaleTimeString()}
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
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#047857', wordBreak: 'break-all' }}>
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
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#991b1b', wordBreak: 'break-all' }}>
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

                            <div style={{
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
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div style={{ flex: 1 }}>
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
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    {page.url} <ExternalLink size={12} />
                                  </a>
                                </div>
                                <div style={{ textAlign: 'right', marginLeft: '16px' }}>
                                  <div style={{ 
                                    fontSize: '18px', 
                                    fontWeight: '700', 
                                    color: '#10b981',
                                    marginBottom: '4px'
                                  }}>
                                    ⏱️ {page.time_spent || 0}s
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                                    {new Date(page.viewed_at).toLocaleTimeString()}
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
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#047857', marginBottom: '8px', wordBreak: 'break-all' }}>
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
                    padding: '20px 24px',
                    borderBottom: idx < visitors.length - 1 ? '1px solid #e2e8f0' : 'none',
                    transition: 'all 0.2s ease',
                    display: 'grid',
                    gridTemplateColumns: '40px 200px 150px 1fr 200px',
                    alignItems: 'center',
                    gap: '16px'
                  }}
                >
                  {/* Expand Icon */}
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
                      <ChevronRight size={16} style={{ color: '#3b82f6' }} />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '20px' }}>{getCountryFlag(visitor.country)}</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                        {visitor.country || 'Unknown'}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {visitor.city || 'Unknown City'}
                    </div>
                  </div>

                  {/* Session */}
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#3b82f6', marginBottom: '4px' }}>
                      Session #{visitor.id}
                    </div>
                    <div style={{ fontSize: '11px', color: '#10b981' }}>
                      {visitor.referrer && visitor.referrer !== 'direct' ? '(referring link)' : '(No referring link)'}
                    </div>
                  </div>

                  {/* Entry Page - Clickable */}
                  <div 
                    onClick={(e) => handleReferrerClick(e, visitor)}
                    style={{
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '8px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#eff6ff'
                      e.currentTarget.style.transform = 'scale(1.02)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.transform = 'scale(1)'
                    }}
                  >
                    <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      🔗 {visitor.referrer && visitor.referrer !== 'direct' ? visitor.referrer : 'Direct'}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#3b82f6', 
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: '500'
                    }}>
                      {visitor.entry_page || 'Unknown'}
                      <ExternalLink size={12} />
                    </div>
                  </div>

                  {/* Device & Time */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '20px' }}>{getDeviceIcon(visitor.device)}</span>
                      <span style={{ fontSize: '20px' }}>🌐</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>
                        {visitor.device || 'Unknown'}, {visitor.browser || 'Unknown'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {formatDate(visitor.visited_at)} {formatTime(visitor.visited_at)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
              <p style={{ fontSize: '16px', fontWeight: '500' }}>No visitor data yet</p>
              <p style={{ fontSize: '14px' }}>Start tracking visitors to see their paths</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default VisitorPath
