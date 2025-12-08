import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { pagesAPI, visitorsAPI } from '../../api/api'
import { FileText, LogIn, LogOut, Eye } from 'lucide-react'
import VisitorPathSimple from './VisitorPathSimple'
import PagesSessionView from './PagesSessionView'

function Pages({ projectId }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('entry')
  const [mostVisited, setMostVisited] = useState([])
  const [entryPages, setEntryPages] = useState([])
  const [exitPages, setExitPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPage, setSelectedPage] = useState(null)
  const [selectedVisitorId, setSelectedVisitorId] = useState(null)
  const [showAllSessions, setShowAllSessions] = useState(false)
  const [selectedPageSessions, setSelectedPageSessions] = useState(null)

  useEffect(() => {
    loadData()
  }, [projectId])

  const loadData = async () => {
    try {
      const [visited, entry, exit] = await Promise.all([
        pagesAPI.getMostVisited(projectId),
        pagesAPI.getEntryPages(projectId),
        pagesAPI.getExitPages(projectId)
      ])
      // Backend returns array directly, not wrapped in {data: []}
      const visitedData = Array.isArray(visited.data) ? visited.data : visited
      const entryData = Array.isArray(entry.data) ? entry.data : entry
      const exitData = Array.isArray(exit.data) ? exit.data : exit
      
      console.log('📊 Pages API Response:')
      console.log('  Most Visited:', visitedData.length, 'pages')
      console.log('  Entry Pages:', entryData.length, 'pages')
      console.log('  Exit Pages:', exitData.length, 'pages')
      
      setMostVisited(visitedData)
      setEntryPages(entryData)
      setExitPages(exitData)
    } catch (error) {
      console.error('Error loading pages:', error)
    } finally {
      setLoading(false)
    }
  }



  if (loading) return <div className="loading">Loading pages...</div>

  const getCurrentData = () => {
    switch(activeTab) {
      case 'entry': return entryPages
      case 'top': return mostVisited
      case 'exit': return exitPages
      default: return []
    }
  }



  const handleVisitorClick = async (e, visitorId) => {
    e.stopPropagation()
    // Navigate to Visitor Path with visitor_id as state
    navigate(`/project/${projectId}/visitor-path`, { 
      state: { selectedVisitorId: visitorId } 
    })
  }

  const handleSessionsClick = async (e, page) => {
    e.stopPropagation()
    // Show all sessions for this page with complete journey
    if (page.visits && page.visits.length > 0) {
      setSelectedPageSessions(page)
      setShowAllSessions(true)
    }
  }

  const closeModal = () => {
    setSelectedPage(null)
  }

  const formatDate = (date) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const formatTime = (date) => {
    const d = new Date(date)
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  }

  const currentData = getCurrentData()

  // Show all sessions view with complete journey
  if (showAllSessions && selectedPageSessions) {
    return (
      <PagesSessionView 
        projectId={projectId}
        selectedPageSessions={selectedPageSessions}
        pageType={activeTab}
        onBack={() => {
          setShowAllSessions(false)
          setSelectedPageSessions(null)
        }}
      />
    )
  }

  // Show visitor path if selected
  if (selectedVisitorId) {
    return <VisitorPathSimple 
      projectId={projectId} 
      visitorId={selectedVisitorId}
      onBack={() => setSelectedVisitorId(null)}
    />
  }

  return (
    <>
      <div className="header">
        <h1>Pages</h1>
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          paddingRight: '40px',
          alignItems: 'center'
        }}>
          <div style={{
            padding: '8px 16px',
            background: 'white',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#64748b',
            border: '1px solid #e2e8f0'
          }}>
            <Eye size={14} style={{ display: 'inline', marginRight: '6px' }} />
            {currentData.length} Pages
          </div>
        </div>
      </div>

      {/* Page Details Modal */}
      {selectedPage && (
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
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              animation: 'slideIn 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px 0' }}>
                  {selectedPage.title || 'Untitled Page'}
                </h2>
                <a 
                  href={selectedPage.url || selectedPage.page} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    fontSize: '14px', 
                    color: '#3b82f6', 
                    textDecoration: 'none',
                    wordBreak: 'break-all'
                  }}
                >
                  🔗 {selectedPage.url || selectedPage.page}
                </a>
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

            {/* Sessions List */}
            {selectedPage.visits && selectedPage.visits.length > 0 ? (
              <div>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#64748b', 
                  marginBottom: '16px',
                  padding: '12px 16px',
                  background: '#f8fafc',
                  borderRadius: '8px'
                }}>
                  📊 All Sessions ({selectedPage.visits.length})
                </div>
                <div style={{ display: 'grid', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                  {selectedPage.visits.map((visit, vidx) => (
                    <div
                      key={vidx}
                      onClick={(e) => handleVisitorClick(e, visit.visitor_id)}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '120px 1fr 160px',
                        padding: '16px',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: '2px solid #e2e8f0',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#eff6ff'
                        e.currentTarget.style.borderColor = '#3b82f6'
                        e.currentTarget.style.transform = 'translateX(4px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f8fafc'
                        e.currentTarget.style.borderColor = '#e2e8f0'
                        e.currentTarget.style.transform = 'translateX(0)'
                      }}
                    >
                      <div style={{ 
                        fontSize: '14px', 
                        color: '#3b82f6', 
                        fontWeight: '700',
                        background: 'white',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        textAlign: 'center'
                      }}>
                        Session #{visit.session_id}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: '600', marginBottom: '4px' }}>
                          👤 Visitor ID: {visit.visitor_id}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          Click to view visitor journey
                        </div>
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'right' }}>
                        🕒 {formatDate(visit.visited_at)}<br/>
                        {formatTime(visit.visited_at)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{
                background: '#f8fafc',
                padding: '40px',
                borderRadius: '8px',
                textAlign: 'center',
                color: '#94a3b8'
              }}>
                <p style={{ fontSize: '14px' }}>No session data available for this page</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="content">
        {/* Tab Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div
            onClick={() => setActiveTab('entry')}
            style={{
              padding: '20px',
              background: activeTab === 'entry' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'white',
              color: activeTab === 'entry' ? 'white' : '#64748b',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: activeTab === 'entry' ? '0 8px 20px rgba(16, 185, 129, 0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
              border: activeTab === 'entry' ? 'none' : '2px solid #e2e8f0',
              transform: activeTab === 'entry' ? 'translateY(-4px)' : 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <LogIn size={24} />
              <span style={{ fontSize: '16px', fontWeight: '600' }}>Entry Pages</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>
              {entryPages.length}
            </div>
            <div style={{ fontSize: '13px', opacity: 0.9 }}>
              Where visitors start
            </div>
          </div>

          <div
            onClick={() => setActiveTab('top')}
            style={{
              padding: '20px',
              background: activeTab === 'top' ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'white',
              color: activeTab === 'top' ? 'white' : '#64748b',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: activeTab === 'top' ? '0 8px 20px rgba(59, 130, 246, 0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
              border: activeTab === 'top' ? 'none' : '2px solid #e2e8f0',
              transform: activeTab === 'top' ? 'translateY(-4px)' : 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <FileText size={24} />
              <span style={{ fontSize: '16px', fontWeight: '600' }}>Top Pages</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>
              {mostVisited.length}
            </div>
            <div style={{ fontSize: '13px', opacity: 0.9 }}>
              Most viewed pages
            </div>
          </div>

          <div
            onClick={() => setActiveTab('exit')}
            style={{
              padding: '20px',
              background: activeTab === 'exit' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'white',
              color: activeTab === 'exit' ? 'white' : '#64748b',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: activeTab === 'exit' ? '0 8px 20px rgba(239, 68, 68, 0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
              border: activeTab === 'exit' ? 'none' : '2px solid #e2e8f0',
              transform: activeTab === 'exit' ? 'translateY(-4px)' : 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <LogOut size={24} />
              <span style={{ fontSize: '16px', fontWeight: '600' }}>Exit Pages</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>
              {exitPages.length}
            </div>
            <div style={{ fontSize: '13px', opacity: 0.9 }}>
              Where visitors leave
            </div>
          </div>
        </div>

        <div className="chart-container" style={{ padding: 0, maxHeight: 'none', overflow: 'visible' }}>

          <div style={{ padding: '20px' }}>

            {currentData.length > 0 ? (
              <div style={{ maxHeight: 'none', overflow: 'visible' }}>
                {console.log(`🔍 Rendering ${currentData.length} pages in ${activeTab} tab`)}
                {currentData.map((page, idx) => (
                  <div 
                    key={idx}
                    style={{
                      borderBottom: idx < currentData.length - 1 ? '1px solid #e2e8f0' : 'none',
                      padding: '20px',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Page Info */}
                    <div 
                      style={{
                        marginBottom: '12px',
                        padding: '12px',
                        borderRadius: '8px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                            📄 {page.title || page.page || 'Untitled'}
                          </div>
                          <div style={{ fontSize: '13px', color: '#64748b' }}>
                            {page.url || page.page || '/'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                          {/* Sessions Number - Clickable */}
                          <div 
                            onClick={(e) => handleSessionsClick(e, page)}
                            style={{ 
                              textAlign: 'center',
                              cursor: page.visits && page.visits.length > 0 ? 'pointer' : 'default',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              transition: 'all 0.2s',
                              minWidth: '100px'
                            }}
                            onMouseEnter={(e) => {
                              if (page.visits && page.visits.length > 0) {
                                e.currentTarget.style.background = '#eff6ff'
                                e.currentTarget.style.transform = 'scale(1.05)'
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent'
                              e.currentTarget.style.transform = 'scale(1)'
                            }}
                          >
                            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>
                              {activeTab === 'entry' ? 'Sessions' : activeTab === 'top' ? 'Views' : 'Exits'}
                            </div>
                            <div style={{ fontSize: '20px', fontWeight: '700', color: '#3b82f6' }}>
                              {page.total_page_views || page.total_views || page.sessions || page.exits || 0}
                            </div>
                          </div>
                          <div style={{ textAlign: 'center', minWidth: '100px' }}>
                            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>
                              Bounce %
                            </div>
                            <div style={{ fontSize: '20px', fontWeight: '700', color: page.bounce_rate > 70 ? '#ef4444' : '#10b981' }}>
                              {page.bounce_rate ? `${page.bounce_rate.toFixed(1)}%` : '0.0%'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <p style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No data available</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Pages
