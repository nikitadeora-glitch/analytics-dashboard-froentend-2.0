import { useState, useEffect } from 'react'
import { trafficAPI } from '../../api/api'
import { Filter, Download, ExternalLink, LogOut, Search } from 'lucide-react'

function ExitLink({ projectId }) {
  const [exitLinks, setExitLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedExit, setSelectedExit] = useState(null)

  useEffect(() => {
    loadExitLinks()
  }, [projectId])

  const loadExitLinks = async () => {
    try {
      const response = await trafficAPI.getExitLinks(projectId)
      setExitLinks(response.data)
    } catch (error) {
      console.error('Error loading exit links:', error)
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
                  📊 Statistics
                </div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '14px', color: '#64748b' }}>Total Clicks:</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                      {selectedExit.click_count || 0}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                    <span style={{ fontSize: '14px', color: '#64748b' }}>Last Clicked:</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                      {selectedExit.last_clicked ? formatDate(selectedExit.last_clicked) : 'Unknown'}
                    </span>
                  </div>
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
        {/* Filters and Export */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <button 
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

        {/* Exit Links Table */}
        <div className="chart-container" style={{ padding: 0 }}>
          <div>
            {/* Table Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '100px 120px 1fr 1fr',
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
              <div>Exit Link Clicked</div>
              <div>Exit Page</div>
            </div>

            {/* Table Rows */}
            {exitLinks.length > 0 ? (
              exitLinks.map((exit, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 120px 1fr 1fr',
                    padding: '16px 24px',
                    borderBottom: idx < exitLinks.length - 1 ? '1px solid #e2e8f0' : 'none',
                    alignItems: 'center',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Date */}
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Search size={14} style={{ color: '#3b82f6' }} />
                    {exit.last_clicked ? formatDate(exit.last_clicked) : 'Unknown'}
                  </div>

                  {/* Time */}
                  <div style={{ fontSize: '14px', color: '#64748b' }}>
                    {exit.last_clicked ? formatTime(exit.last_clicked) : '--:--:--'}
                  </div>

                  {/* Exit Link - Clickable */}
                  <div 
                    onClick={(e) => handleExitClick(e, exit)}
                    style={{
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '6px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#fef2f2'
                      e.currentTarget.style.transform = 'translateX(2px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.transform = 'translateX(0)'
                    }}
                  >
                    <a 
                      href={exit.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{ 
                        fontSize: '14px', 
                        color: '#dc2626',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {exit.url || 'Unknown'}
                      <ExternalLink size={12} />
                    </a>
                  </div>

                  {/* Exit Page */}
                  <div>
                    <a 
                      href={exit.from_page}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{ 
                        fontSize: '14px', 
                        color: '#3b82f6',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {exit.from_page || 'Unknown'}
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
                <LogOut size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                <p style={{ fontSize: '16px', fontWeight: '500' }}>No exit link data yet</p>
                <p style={{ fontSize: '14px' }}>Start tracking visitors to see where they exit</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default ExitLink
