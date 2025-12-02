import { useState, useEffect } from 'react'
import { trafficAPI, pagesAPI } from '../../api/api'
import { Filter, Download, ExternalLink, LogOut, Search } from 'lucide-react'

function ExitLink({ projectId }) {
  const [activeTab, setActiveTab] = useState('external')
  const [exitLinks, setExitLinks] = useState([])
  const [exitPages, setExitPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedExit, setSelectedExit] = useState(null)

  useEffect(() => {
    loadExitData()
  }, [projectId])

  const loadExitData = async () => {
    try {
      // Get external exit links (clicks to external URLs)
      const linksResponse = await trafficAPI.getExitLinks(projectId)
      setExitLinks(linksResponse.data)
      
      // Get internal exit pages (pages where users left the site)
      const pagesResponse = await pagesAPI.getExitPages(projectId)
      setExitPages(pagesResponse.data)
    } catch (error) {
      console.error('Error loading exit data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExitClick = (e, exit) => {
    e.stopPropagation()
    setSelectedExit(exit)
  }

  const closeModal = () => {
    setSelectedExit(null)
  }

  const formatDate = (date) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
  }

  const formatTime = (date) => {
    const d = new Date(date)
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  }

  if (loading) return <div className="loading">Loading exit links...</div>

  return (
    <>
      <div className="header">
        <h1>Exit Link</h1>
      </div>

      {/* Exit Link Details Modal */}
      {selectedExit && (
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
                  🚪 Exit Link Details
                </h2>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  Clicked {selectedExit.click_count || 0} times
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
              <div style={{
                background: 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #f87171'
              }}>
                <div style={{ fontSize: '13px', color: '#7f1d1d', fontWeight: '600', marginBottom: '8px' }}>
                  🔗 Exit Link Clicked
                </div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#991b1b', marginBottom: '8px', wordBreak: 'break-all' }}>
                  {selectedExit.url || 'Unknown'}
                </div>
                {selectedExit.url && (
                  <a 
                    href={selectedExit.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      fontSize: '13px', 
                      color: '#dc2626', 
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    Visit Link <ExternalLink size={12} />
                  </a>
                )}
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #93c5fd'
              }}>
                <div style={{ fontSize: '13px', color: '#1e40af', fontWeight: '600', marginBottom: '8px' }}>
                  📄 Exit Page
                </div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#1d4ed8', marginBottom: '8px', wordBreak: 'break-all' }}>
                  {selectedExit.from_page || 'Unknown'}
                </div>
                {selectedExit.from_page && (
                  <a 
                    href={selectedExit.from_page} 
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
                    Visit Page <ExternalLink size={12} />
                  </a>
                )}
              </div>

              <div style={{
                background: '#f8fafc',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #e2e8f0'
              }}>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '12px' }}>
                  📊 Click Details
                </div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '14px', color: '#64748b' }}>Clicked At:</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                      {selectedExit.clicked_at ? `${formatDate(selectedExit.clicked_at)} ${formatTime(selectedExit.clicked_at)}` : 'Unknown'}
                    </span>
                  </div>
                  {selectedExit.visitor_id && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '14px', color: '#64748b' }}>Visitor ID:</span>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b', fontFamily: 'monospace' }}>
                        {selectedExit.visitor_id.substring(0, 16)}...
                      </span>
                    </div>
                  )}
                  {selectedExit.session_id && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                      <span style={{ fontSize: '14px', color: '#64748b' }}>Session ID:</span>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b', fontFamily: 'monospace' }}>
                        {selectedExit.session_id.substring(0, 16)}...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{
              marginTop: '24px',
              padding: '16px',
              background: '#fef2f2',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#991b1b',
              border: '1px solid #fecaca'
            }}>
              <strong style={{ color: '#991b1b' }}>💡 Insight:</strong> This is where visitors left your site. Consider adding related content or CTAs to keep them engaged.
            </div>
          </div>
        </div>
      )}

      <div className="content">
        {/* Tabs */}
        <div className="chart-container" style={{ padding: 0, marginBottom: '20px' }}>
          <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0' }}>
            <button
              onClick={() => setActiveTab('external')}
              style={{
                padding: '16px 24px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'external' ? '3px solid #dc2626' : '3px solid transparent',
                color: activeTab === 'external' ? '#dc2626' : '#64748b',
                fontWeight: activeTab === 'external' ? '600' : '500',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              🔗 External Links ({exitLinks.length})
            </button>
            <button
              onClick={() => setActiveTab('pages')}
              style={{
                padding: '16px 24px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'pages' ? '3px solid #dc2626' : '3px solid transparent',
                color: activeTab === 'pages' ? '#dc2626' : '#64748b',
                fontWeight: activeTab === 'pages' ? '600' : '500',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              📄 Exit Pages ({exitPages.length})
            </button>
          </div>
        </div>

        {/* Exit Links/Pages Table */}
        <div className="chart-container" style={{ padding: 0 }}>
          <div>
            {/* Table Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: activeTab === 'external' ? '100px 120px 1fr 1fr' : '100px 120px 1fr 120px',
              padding: '16px 24px',
              background: '#f8fafc',
              borderBottom: '2px solid #e2e8f0',
              fontWeight: '600',
              fontSize: '13px',
              color: '#475569',
              alignItems: 'center'
            }}>
              <div>Date</div>
              <div>Time</div>
              <div>{activeTab === 'external' ? 'Exit Link Clicked' : 'Exit Page URL'}</div>
              <div>{activeTab === 'external' ? 'From Page' : 'Exits'}</div>
            </div>

            {/* Table Rows - External Links */}
            {activeTab === 'external' && exitLinks.length > 0 ? (
              exitLinks.map((exit, idx) => (
                <div 
                  key={idx}
                  onClick={(e) => handleExitClick(e, exit)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 120px 1fr 1fr',
                    padding: '16px 24px',
                    borderBottom: idx < exitLinks.length - 1 ? '1px solid #e2e8f0' : 'none',
                    alignItems: 'center',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f8fafc'
                    e.currentTarget.style.transform = 'translateX(4px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.transform = 'translateX(0)'
                  }}
                >
                  {/* Date */}
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <LogOut size={14} style={{ color: '#dc2626' }} />
                    {exit.clicked_at ? formatDate(exit.clicked_at) : 'Unknown'}
                  </div>

                  {/* Time */}
                  <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
                    {exit.clicked_at ? formatTime(exit.clicked_at) : '--:--:--'}
                  </div>

                  {/* Exit Link */}
                  <div style={{
                    fontSize: '14px',
                    color: '#dc2626',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    overflow: 'hidden'
                  }}>
                    <ExternalLink size={14} style={{ flexShrink: 0 }} />
                    <span style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {exit.url || 'Unknown'}
                    </span>
                  </div>

                  {/* Exit Page */}
                  <div style={{
                    fontSize: '14px',
                    color: '#3b82f6',
                    fontWeight: '500',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {exit.from_page || 'Unknown'}
                  </div>
                </div>
              ))
            ) : activeTab === 'external' ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
                <LogOut size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                <p style={{ fontSize: '16px', fontWeight: '500' }}>No external exit links yet</p>
                <p style={{ fontSize: '14px' }}>External link clicks will appear here</p>
              </div>
            ) : null}

            {/* Table Rows - Exit Pages */}
            {activeTab === 'pages' && exitPages.length > 0 ? (
              exitPages.map((page, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 120px 1fr 120px',
                    padding: '16px 24px',
                    borderBottom: idx < exitPages.length - 1 ? '1px solid #e2e8f0' : 'none',
                    alignItems: 'center',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f8fafc'
                    e.currentTarget.style.transform = 'translateX(4px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.transform = 'translateX(0)'
                  }}
                >
                  {/* Date - Using first visit date */}
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <LogOut size={14} style={{ color: '#dc2626' }} />
                    {page.visits && page.visits[0] ? formatDate(page.visits[0].visited_at) : 'Unknown'}
                  </div>

                  {/* Time */}
                  <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
                    {page.visits && page.visits[0] ? formatTime(page.visits[0].visited_at) : '--:--:--'}
                  </div>

                  {/* Exit Page URL */}
                  <div style={{
                    fontSize: '14px',
                    color: '#dc2626',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    overflow: 'hidden'
                  }}>
                    <ExternalLink size={14} style={{ flexShrink: 0 }} />
                    <span style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {page.page || 'Unknown'}
                    </span>
                  </div>

                  {/* Exit Count */}
                  <div style={{ textAlign: 'center' }}>
                    <span style={{
                      background: '#fef2f2',
                      color: '#dc2626',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: '700',
                      border: '1px solid #fecaca'
                    }}>
                      {page.exits || 0} exits
                    </span>
                  </div>
                </div>
              ))
            ) : activeTab === 'pages' ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
                <LogOut size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                <p style={{ fontSize: '16px', fontWeight: '500' }}>No exit pages yet</p>
                <p style={{ fontSize: '14px' }}>Pages where visitors leave will appear here</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  )
}

export default ExitLink
