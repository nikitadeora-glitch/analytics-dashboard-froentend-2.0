import { useState, useEffect } from 'react'
import { visitorsAPI } from '../../api/api'
import { ExternalLink, Search, ChevronDown } from 'lucide-react'
import { Skeleton, Box, List, ListItem } from '@mui/material'

function CameFrom({ projectId }) {
  const [allVisitors, setAllVisitors] = useState([])
  const [displayedVisitors, setDisplayedVisitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hasMore, setHasMore] = useState(false)
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

      setAllVisitors(referralVisitors)
      // Initially show first 10 items
      const initialChunk = referralVisitors.slice(0, 10)
      setDisplayedVisitors(initialChunk)
      setCurrentIndex(10)
      setHasMore(referralVisitors.length > 10)
    } catch (error) {
      console.error('Error loading visitors:', error)
      setAllVisitors([])
      setDisplayedVisitors([])
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)

    // Simulate loading delay for better UX
    setTimeout(() => {
      const nextChunkSize = Math.floor(Math.random() * 2) + 3 // Random between 3-4
      const nextChunk = allVisitors.slice(currentIndex, currentIndex + nextChunkSize)

      setDisplayedVisitors(prev => [...prev, ...nextChunk])
      setCurrentIndex(prev => prev + nextChunkSize)
      setHasMore(currentIndex + nextChunkSize < allVisitors.length)
      setLoadingMore(false)
    }, 500)
  }



  const closeModal = () => {
    setSelectedReferrer(null)
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
        <h1>Came From</h1>
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
                <Skeleton variant="text" width={200} height={16} animation="wave" sx={{ marginBottom: 0.5 }} />
                <Skeleton variant="text" width={150} height={12} animation="wave" />
              </Box>
              <Skeleton variant="text" width={80} height={14} animation="wave" />
            </Box>
          ))}
        </Box>
      </div>
    </>
  )

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
          {displayedVisitors.length > 0 ? (
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
              {displayedVisitors.map((visitor, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 120px 1fr 1fr',
                    padding: '16px 24px',
                    borderBottom: idx < displayedVisitors.length - 1 ? '1px solid #e2e8f0' : 'none',
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

          {/* Load More Button */}
          {hasMore && (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              borderTop: '1px solid #e2e8f0'
            }}>
              <button
                onClick={loadMore}
                disabled={loadingMore}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  backgroundColor: loadingMore ? '#f1f5f9' : '#3b82f6',
                  color: loadingMore ? '#64748b' : 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: loadingMore ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: loadingMore ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!loadingMore) {
                    e.currentTarget.style.backgroundColor = '#2563eb'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loadingMore) {
                    e.currentTarget.style.backgroundColor = '#3b82f6'
                  }
                }}
              >
                {loadingMore ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #64748b',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Loading...
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    Load More ({allVisitors.length - currentIndex} remaining)
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}

export default CameFrom