import { useState, useEffect } from 'react'
import { visitorsAPI } from '../../api/api'
import { ExternalLink, Search } from 'lucide-react'

function CameFrom({ projectId }) {
  const [visitors, setVisitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReferrer, setSelectedReferrer] = useState(null)

  useEffect(() => {
    loadVisitors()
  }, [projectId])

  const loadVisitors = async () => {
    try {
      const response = await visitorsAPI.getActivity(projectId, 100)
      // Filter to show only referral traffic (exclude direct traffic)
      const referralVisitors = response.data.filter(visitor => 
        visitor.referrer && visitor.referrer !== 'direct' && visitor.referrer.trim() !== ''
      )
      setVisitors(referralVisitors)
    } catch (error) {
      console.error('Error loading visitors:', error)
    } finally {
      setLoading(false)
    }
  }



  const closeModal = () => {
    setSelectedReferrer(null)
  }

  const formatDate = (date) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
  }

  const formatTime = (date) => {
    const d = new Date(date)
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  }

  if (loading) return <div className="loading">Loading referrer data...</div>

  return (
    <>
      <div className="header">
        <h1>Came From </h1>
      </div>

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
                  Referrer Details
                </h2>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  {formatDate(selectedReferrer.visited_at)} at {formatTime(selectedReferrer.visited_at)}
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
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #93c5fd'
              }}>
                <div style={{ fontSize: '13px', color: '#1e40af', fontWeight: '600', marginBottom: '8px' }}>
                  🌐 Referrer Source
                </div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#1d4ed8', marginBottom: '8px', wordBreak: 'break-all' }}>
                  {selectedReferrer.referrer && selectedReferrer.referrer !== 'direct' 
                    ? selectedReferrer.referrer 
                    : 'Direct Traffic (No Referrer)'}
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

              <div style={{
                background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #6ee7b7'
              }}>
                <div style={{ fontSize: '13px', color: '#065f46', fontWeight: '600', marginBottom: '8px' }}>
                  🚪 Entry Page
                </div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#047857', marginBottom: '8px', wordBreak: 'break-all' }}>
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

              <div style={{
                background: '#f8fafc',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #e2e8f0'
              }}>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '12px' }}>
                  📊 Visitor Information
                </div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '14px', color: '#64748b' }}>Location:</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                      {selectedReferrer.city}, {selectedReferrer.country}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '14px', color: '#64748b' }}>Device:</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                      {selectedReferrer.device || 'Unknown'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                    <span style={{ fontSize: '14px', color: '#64748b' }}>Browser:</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                      {selectedReferrer.browser || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="content">
        

        {/* Referrer Table */}
        <div className="chart-container" style={{ padding: 0, overflowX: 'hidden' }}>
          {visitors.length > 0 ? (
            <div>
              {/* Table Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '100px 120px 1fr 1fr',
                padding: '16px 24px',
                background: '#fdfdfdff',
                borderBottom: '2px solid #e2e8f0',
                fontWeight: '600',
                fontSize: '13px',
                color: '#0e0e0eff',
                alignItems: 'center',
                gap: '12px',
                minWidth: 0,
                maxWidth: '100%'
              }}>
                <div>Date</div>
                <div>Time</div>
                <div>Referrer</div>
                <div>Entry Page</div>
              </div>

              {/* Table Rows */}
              {visitors.map((visitor, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 120px 1fr 1fr',
                    padding: '16px 24px',
                    borderBottom: idx < visitors.length - 1 ? '1px solid #e2e8f0' : 'none',
                    alignItems: 'start',
                    gap: '12px',
                    minWidth: 0,
                    maxWidth: '100%'
                  }}
                >
                  {/* Date */}
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '2px' }}>
                    
                    {formatDate(visitor.visited_at)}
                  </div>

                  {/* Time */}
                  <div style={{ fontSize: '14px', color: '#64748b', paddingTop: '2px' }}>
                    {formatTime(visitor.visited_at)}
                  </div>

                  {/* Referrer - Non-clickable */}
                  <div style={{ minWidth: 0, maxWidth: '100%' }}>
                    <div
                      style={{ 
                        fontSize: '14px', 
                        color: '#30ad51d1',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        wordBreak: 'break-all',
                        lineHeight: '1.4'
                      }}
                    >
                      {visitor.referrer}
                    </div>
                  </div>

                  {/* Entry Page */}
                  <div style={{ minWidth: 0, maxWidth: '100%' }}>
                    <a 
                      href={visitor.entry_page}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ 
                        fontSize: '14px', 
                        color: '#3b82f6',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        wordBreak: 'break-all',
                        lineHeight: '1.4',
                        cursor: 'pointer'
                      }}
                     
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                      {visitor.entry_page || 'Unknown'}
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
              <Search size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <p style={{ fontSize: '16px', fontWeight: '500' }}>No referral traffic yet</p>
              <p style={{ fontSize: '14px' }}>Only visitors from external referrers are shown here</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default CameFrom
