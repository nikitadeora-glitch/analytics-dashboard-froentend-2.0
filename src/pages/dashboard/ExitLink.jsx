import { useState, useEffect } from 'react'
import { trafficAPI, pagesAPI } from '../../api/api'
import { Filter, Download, ExternalLink, LogOut, Search } from 'lucide-react'
import { Skeleton, Box } from '@mui/material'

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
      // Sort by date descending (newest first)
      const sortedLinks = linksResponse.data.sort((a, b) =>
        new Date(b.clicked_at) - new Date(a.clicked_at)
      )
      setExitLinks(sortedLinks)

      // Get internal exit pages (pages where users left the site)
      const pagesResponse = await pagesAPI.getExitPages(projectId)
      // Sort by date descending (newest first)
      const sortedPages = pagesResponse.data.sort((a, b) => {
        const dateA = a.visits && a.visits[0] ? new Date(a.visits[0].visited_at) : new Date(0)
        const dateB = b.visits && b.visits[0] ? new Date(b.visits[0].visited_at) : new Date(0)
        return dateB - dateA
      })
      setExitPages(sortedPages)
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
    return formatToIST(date, { day: 'numeric', month: 'short' })
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
        <h1>Exit Links</h1>
      </div>

      <div className="content">
        <Box className="chart-container">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <Box key={i} sx={{
              padding: '16px 20px',
              borderBottom: i < 8 ? '1px solid #e2e8f0' : 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width={250} height={16} animation="wave" sx={{ marginBottom: 0.5 }} />
                <Skeleton variant="text" width={180} height={12} animation="wave" />
              </Box>
              <Skeleton variant="text" width={60} height={14} animation="wave" />
            </Box>
          ))}
        </Box>
      </div>
    </>
  )

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
        <div className="chart-container exit-tabs-container" style={{ padding: 0, marginBottom: '20px' }}>
          <div className="exit-tabs" style={{ display: 'flex', borderBottom: '2px solid #e2e8f0' }}>
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
        <div className="chart-container" style={{ padding: 0, overflowX: 'hidden' }}>
          <div>
            {/* Table Header */}
            <div className="exit-table-header" style={{
              display: 'grid',
              gridTemplateColumns: activeTab === 'external' ? '100px 120px 1fr 1fr' : '100px 120px 1fr 120px',
              padding: '16px 24px',
              background: '#f8fafc',
              borderBottom: '2px solid #e2e8f0',
              fontWeight: '600',
              fontSize: '13px',
              color: '#475569',
              alignItems: 'center',
              gap: '12px',
              minWidth: 0,
              maxWidth: '100%'
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
                  className="exit-table-row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 120px 1fr 1fr',
                    padding: '16px 24px',
                    borderBottom: idx < exitLinks.length - 1 ? '1px solid #e2e8f0' : 'none',
                    alignItems: 'start',
                    gap: '12px',
                    minWidth: 0,
                    maxWidth: '100%'
                  }}
                >
                  {/* Date */}
                  <div className="exit-col" data-label="Date" style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '2px' }}>
                    <LogOut size={14} style={{ color: '#dc2626' }} />
                    {exit.clicked_at ? formatDate(exit.clicked_at) : 'Unknown'}
                  </div>

                  {/* Time */}
                  <div className="exit-col" data-label="Time" style={{ fontSize: '14px', color: '#64748b', fontWeight: '500', paddingTop: '2px' }}>
                    {exit.clicked_at ? formatTime(exit.clicked_at) : '--:--:--'}
                  </div>

                  {/* Exit Link - Clickable */}
                  <div className="exit-col" data-label="Exit Link Clicked" style={{
                    minWidth: 0,
                    maxWidth: '100%'
                  }}>
                    <a
                      href={exit.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        fontSize: '14px',
                        color: '#dc2626',
                        fontWeight: '500',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        textDecoration: 'none',
                        wordBreak: 'break-all',
                        lineHeight: '1.4',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                      <ExternalLink size={14} style={{ flexShrink: 0 }} />
                      {exit.url || 'Unknown'}
                    </a>
                  </div>

                  {/* From Page - Clickable */}
                  <div className="exit-col" data-label="From Page" style={{
                    minWidth: 0,
                    maxWidth: '100%'
                  }}>
                    <a
                      href={exit.from_page}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        fontSize: '14px',
                        color: '#3b82f6',
                        fontWeight: '500',
                        textDecoration: 'none',
                        display: 'inline-block',
                        wordBreak: 'break-all',
                        lineHeight: '1.4',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                      {exit.from_page || 'Unknown'}
                    </a>
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
                  className="exit-table-row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 120px 1fr 120px',
                    padding: '16px 24px',
                    borderBottom: idx < exitPages.length - 1 ? '1px solid #e2e8f0' : 'none',
                    alignItems: 'start',
                    gap: '12px',
                    minWidth: 0,
                    maxWidth: '100%'
                  }}
                >
                  {/* Date - Using first visit date */}
                  <div className="exit-col" data-label="Date" style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '2px' }}>
                    <LogOut size={14} style={{ color: '#dc2626' }} />
                    {page.visits && page.visits[0] ? formatDate(page.visits[0].visited_at) : 'Unknown'}
                  </div>

                  {/* Time */}
                  <div className="exit-col" data-label="Time" style={{ fontSize: '14px', color: '#64748b', fontWeight: '500', paddingTop: '2px' }}>
                    {page.visits && page.visits[0] ? formatTime(page.visits[0].visited_at) : '--:--:--'}
                  </div>

                  {/* Exit Page URL - Clickable Link */}
                  <div className="exit-col" data-label="Exit Page URL" style={{
                    minWidth: 0,
                    maxWidth: '100%'
                  }}>
                    <a
                      href={page.page}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '14px',
                        color: '#dc2626',
                        fontWeight: '500',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        textDecoration: 'none',
                        wordBreak: 'break-all',
                        lineHeight: '1.4',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                      <ExternalLink size={14} style={{ flexShrink: 0 }} />
                      {page.page || 'Unknown'}
                    </a>
                  </div>

                  {/* Exit Count */}
                  <div className="exit-col" data-label="Exits" style={{ textAlign: 'center', paddingTop: '2px' }}>
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
      <style>{`
        @media (max-width: 768px) {
          .header h1 {
            font-size: 22px !important;
          }
          .content {
            padding: 12px !important;
            overflow-x: hidden !important;
          }
          .exit-tabs-container {
             background: transparent !important;
             box-shadow: none !important;
             border: none !important;
             margin-bottom: 12px !important;
          }
          .exit-tabs {
             background: white !important;
             border-radius: 12px !important;
             border: 1px solid #e2e8f0 !important;
             padding: 5px !important;
             justify-content: center !important;
          }
          .exit-tabs button {
             padding: 12px 10px !important;
             flex: 1 !important;
             text-align: center !important;
             font-size: 12px !important;
          }
          .exit-table-header {
            display: none !important;
          }
          .exit-table-row {
            display: block !important;
            background: white !important;
            border-radius: 12px !important;
            margin-bottom: 15px !important;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
            border: 1px solid #e2e8f0 !important;
            padding: 15px !important;
          }
          .exit-col {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            padding: 10px 0 !important;
            border-bottom: 1px solid #f1f5f9 !important;
            text-align: right !important;
            min-height: 40px !important;
          }
          .exit-col:last-child {
            border-bottom: none !important;
          }
          .exit-col:before {
            content: attr(data-label);
            font-weight: 600;
            color: #64748b;
            font-size: 11px;
            text-align: left !important;
            margin-right: 15px !important;
            flex-shrink: 0;
          }
          .exit-col > div, .exit-col > a, .exit-col > span {
              max-width: 65% !important;
              text-align: right !important;
              word-break: break-all !important;
              padding-top: 0 !important;
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
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}

export default ExitLink