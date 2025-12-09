import { useState, useEffect } from 'react'
import { trafficAPI } from '../../api/api'
import { Globe, Search, Link as LinkIcon, BarChart3 } from 'lucide-react'

function TrafficSources({ projectId }) {
  const [sources, setSources] = useState([])
  const [keywords, setKeywords] = useState([])
  const [referrers, setReferrers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSource, setSelectedSource] = useState(null)
  const [selectedReferrer, setSelectedReferrer] = useState(null)

  useEffect(() => {
    loadData()
  }, [projectId])

  const loadData = async () => {
    try {
      const [sourcesRes, keywordsRes, referrersRes] = await Promise.all([
        trafficAPI.getSources(projectId),
        trafficAPI.getKeywords(projectId),
        trafficAPI.getReferrers(projectId)
      ])
      setSources(sourcesRes.data)
      setKeywords(keywordsRes.data)
      setReferrers(referrersRes.data)
    } catch (error) {
      console.error('Error loading traffic data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSourceClick = (source) => {
    setSelectedSource(source)
  }

  const handleReferrerClick = (referrer) => {
    setSelectedReferrer(referrer)
  }

  const closeModal = () => {
    setSelectedSource(null)
    setSelectedReferrer(null)
  }

  const getSourceIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'organic': return '🔍'
      case 'direct': return '🌐'
      case 'social': return '📱'
      case 'referral': return '🔗'
      case 'email': return '📧'
      case 'paid': return '💰'
      default: return '📊'
    }
  }

  const getSourceColor = (type) => {
    switch(type?.toLowerCase()) {
      case 'organic': return { bg: '#dcfce7', border: '#bbf7d0', text: '#166534' }
      case 'direct': return { bg: '#dbeafe', border: '#bfdbfe', text: '#1e40af' }
      case 'social': return { bg: '#fce7f3', border: '#fbcfe8', text: '#9f1239' }
      case 'referral': return { bg: '#fef3c7', border: '#fde68a', text: '#92400e' }
      case 'email': return { bg: '#e0e7ff', border: '#c7d2fe', text: '#3730a3' }
      case 'paid': return { bg: '#fae8ff', border: '#f5d0fe', text: '#86198f' }
      default: return { bg: '#f1f5f9', border: '#cbd5e1', text: '#475569' }
    }
  }

  const getTotalVisits = () => {
    return sources.reduce((sum, s) => sum + (s.count || 0), 0)
  }

  // Group social media and paid sources into one
  const getGroupedSources = () => {
    const grouped = {}
    const socialSources = []
    const paidSources = []
    
    sources.forEach(source => {
      const type = source.source_type?.toLowerCase()
      
      if (type === 'social') {
        // Collect all social media sources
        socialSources.push(source)
      } else if (type === 'paid') {
        // Collect all paid sources
        paidSources.push(source)
      } else {
        // Group other sources by type
        if (!grouped[type]) {
          grouped[type] = {
            source_type: source.source_type,
            source_name: source.source_name,
            count: 0,
            percentage: 0,
            sources: []
          }
        }
        grouped[type].count += source.count || 0
        grouped[type].sources.push(source)
      }
    })
    
    // Combine all social media into one card
    if (socialSources.length > 0) {
      const totalSocialCount = socialSources.reduce((sum, s) => sum + (s.count || 0), 0)
      const totalVisits = getTotalVisits()
      
      grouped['social'] = {
        source_type: 'social',
        source_name: 'Social Media',
        count: totalSocialCount,
        percentage: totalVisits > 0 ? (totalSocialCount / totalVisits) * 100 : 0,
        sources: socialSources
      }
    }
    
    // Combine all paid sources into one card
    if (paidSources.length > 0) {
      const totalPaidCount = paidSources.reduce((sum, s) => sum + (s.count || 0), 0)
      const totalVisits = getTotalVisits()
      
      grouped['paid'] = {
        source_type: 'paid',
        source_name: 'Paid Advertising',
        count: totalPaidCount,
        percentage: totalVisits > 0 ? (totalPaidCount / totalVisits) * 100 : 0,
        sources: paidSources
      }
    }
    
    // Calculate percentages for other sources
    const totalVisits = getTotalVisits()
    Object.keys(grouped).forEach(key => {
      if (key !== 'social' && key !== 'paid') {
        grouped[key].percentage = totalVisits > 0 ? (grouped[key].count / totalVisits) * 100 : 0
      }
    })
    
    return Object.values(grouped).sort((a, b) => b.count - a.count)
  }

  if (loading) return <div className="loading">Loading traffic sources...</div>

  const totalVisits = getTotalVisits()
  const groupedSources = getGroupedSources()

  return (
    <>
      <div className="header">
        <h1>Traffic Sources</h1>
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
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: '0 0 12px 0' }}>
                  🔗 Referrer Details
                </h2>
                <a 
                  href={selectedReferrer.referrer} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    fontSize: '14px', 
                    color: '#3b82f6', 
                    textDecoration: 'none',
                    wordBreak: 'break-all',
                    display: 'block'
                  }}
                >
                  {selectedReferrer.referrer}
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

            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                padding: '24px',
                borderRadius: '12px',
                border: '2px solid #93c5fd'
              }}>
                <div style={{ fontSize: '14px', color: '#1e40af', fontWeight: '600', marginBottom: '8px' }}>
                  👥 Total Visits from this Referrer
                </div>
                <div style={{ fontSize: '48px', fontWeight: '700', color: '#1d4ed8' }}>
                  {selectedReferrer.count}
                </div>
              </div>

              <div style={{
                background: '#f8fafc',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #e2e8f0'
              }}>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '12px' }}>
                  📊 Referrer Information
                </div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '14px', color: '#64748b' }}>Type:</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>External Website</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '14px', color: '#64748b' }}>Traffic:</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{selectedReferrer.count} visits</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                    <span style={{ fontSize: '14px', color: '#64748b' }}>Status:</span>
                    <span style={{ 
                      fontSize: '12px', 
                      fontWeight: '600', 
                      color: '#10b981',
                      background: '#d1fae5',
                      padding: '4px 8px',
                      borderRadius: '4px'
                    }}>
                      Active
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
              <strong style={{ color: '#1e40af' }}>💡 Insight:</strong> This website is sending traffic to your site. Consider building a relationship or partnership with them.
            </div>

            <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
              <a
                href={selectedReferrer.referrer}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  textAlign: 'center',
                  textDecoration: 'none',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                🌐 Visit Referrer
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Source Details Modal */}
      {selectedSource && (
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
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              animation: 'slideIn 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                {getSourceIcon(selectedSource.source_type)} {selectedSource.source_name}
              </h2>
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
                  transition: 'all 0.2s'
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
                background: `linear-gradient(135deg, ${getSourceColor(selectedSource.source_type).bg} 0%, ${getSourceColor(selectedSource.source_type).bg} 100%)`,
                padding: '24px',
                borderRadius: '12px',
                border: `2px solid ${getSourceColor(selectedSource.source_type).border}`
              }}>
                <div style={{ fontSize: '14px', color: getSourceColor(selectedSource.source_type).text, fontWeight: '600', marginBottom: '8px' }}>
                  👥 Total Visits
                </div>
                <div style={{ fontSize: '48px', fontWeight: '700', color: getSourceColor(selectedSource.source_type).text }}>
                  {selectedSource.count}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{
                  background: '#f8fafc',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0'
                }}>
                  <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '8px' }}>
                    📊 Percentage
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b' }}>
                    {selectedSource.percentage?.toFixed(1)}%
                  </div>
                </div>

                <div style={{
                  background: '#f8fafc',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0'
                }}>
                  <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '8px' }}>
                    📈 Type
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', textTransform: 'capitalize' }}>
                    {selectedSource.source_type}
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media Breakdown */}
            {selectedSource.source_type === 'social' && selectedSource.sources && selectedSource.sources.length > 1 && (
              <div style={{
                marginTop: '24px',
                padding: '20px',
                background: '#fef2f2',
                borderRadius: '12px',
                border: '2px solid #fecaca'
              }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#991b1b', marginBottom: '16px' }}>
                  📱 Social Media Breakdown
                </div>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {selectedSource.sources.map((social, idx) => (
                    <div 
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        background: 'white',
                        borderRadius: '8px',
                        border: '1px solid #fecaca'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '20px' }}>📱</span>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                          {social.source_name}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: '#dc2626' }}>
                          {social.count}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {((social.count / selectedSource.count) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Paid Advertising Breakdown */}
            {selectedSource.source_type === 'paid' && selectedSource.sources && selectedSource.sources.length > 1 && (
              <div style={{
                marginTop: '24px',
                padding: '20px',
                background: '#faf5ff',
                borderRadius: '12px',
                border: '2px solid #e9d5ff'
              }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#6b21a8', marginBottom: '16px' }}>
                  💰 Paid Advertising Breakdown
                </div>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {selectedSource.sources.map((paid, idx) => (
                    <div 
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        background: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e9d5ff'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '20px' }}>💰</span>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                          {paid.source_name}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: '#7c3aed' }}>
                          {paid.count}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {((paid.count / selectedSource.count) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{
              marginTop: '24px',
              padding: '16px',
              background: '#f8fafc',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#64748b'
            }}>
              <strong style={{ color: '#1e293b' }}>💡 Insight:</strong> {
                selectedSource.source_type === 'organic' ? 'Visitors found you through search engines' :
                selectedSource.source_type === 'direct' ? 'Visitors typed your URL directly or used bookmarks' :
                selectedSource.source_type === 'social' ? `Visitors came from ${selectedSource.sources?.length || 1} social media platform${selectedSource.sources?.length > 1 ? 's' : ''}` :
                selectedSource.source_type === 'referral' ? 'Visitors came from other websites' :
                selectedSource.source_type === 'paid' ? `Paid advertising from ${selectedSource.sources?.length || 1} campaign${selectedSource.sources?.length > 1 ? 's' : ''}. Track ROI to optimize spending.` :
                'Traffic from this source'
              }
            </div>
          </div>
        </div>
      )}

      <div className="content">
        {/* Traffic Sources Overview */}
        <div className="chart-container" style={{ marginBottom: '24px' }}>
          <div style={{ padding: '24px', borderBottom: '2px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px 0' }}>
               Traffic Sources Overview
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
              Total Visits: <strong style={{ color: '#1e293b' }}>{totalVisits}</strong>
            </p>
          </div>

          {groupedSources.length > 0 ? (
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gap: '16px' }}>
                {groupedSources.map((source, idx) => {
                  const colors = getSourceColor(source.source_type)
                  const percentage = source.percentage || 0
                  
                  return (
                    <div 
                      key={idx}
                      onClick={() => handleSourceClick(source)}
                      style={{
                        background: 'white',
                        border: `2px solid ${colors.border}`,
                        borderRadius: '12px',
                        padding: '20px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)'
                        e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      {/* Background Progress Bar */}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: '100%',
                        width: `${percentage}%`,
                        background: `linear-gradient(90deg, ${colors.bg} 0%, transparent 100%)`,
                        opacity: 0.3,
                        transition: 'width 0.6s ease'
                      }} />

                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                          <div style={{
                            width: '56px',
                            height: '56px',
                            background: colors.bg,
                            border: `2px solid ${colors.border}`,
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '28px'
                          }}>
                            {getSourceIcon(source.source_type)}
                          </div>

                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
                              {source.source_name}
                            </div>
                            <div style={{ fontSize: '13px', color: '#64748b', textTransform: 'capitalize' }}>
                              {source.source_type} Traffic
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '32px', fontWeight: '700', color: colors.text }}>
                            {source.count}
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: colors.text }}>
                            {percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
              <BarChart3 size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <p style={{ fontSize: '16px', fontWeight: '500' }}>No traffic data yet</p>
              <p style={{ fontSize: '14px' }}>Start tracking visitors to see traffic sources</p>
            </div>
          )}
        </div>

        {/* Keywords and Referrers Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Search Keywords */}
          <div className="chart-container">
            <div style={{ padding: '20px', borderBottom: '2px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Search size={20} style={{ color: '#10b981' }} />
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                Search Keywords
              </h3>
            </div>
            {keywords.length > 0 ? (
              <div style={{ padding: '16px' }}>
                {keywords.map((kw, idx) => (
                  <div 
                    key={idx}
                    style={{
                      padding: '12px 16px',
                      borderBottom: idx < keywords.length - 1 ? '1px solid #f1f5f9' : 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}></span>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>
                        {kw.keyword}
                      </span>
                    </div>
                    <span style={{
                      padding: '4px 12px',
                      background: '#dcfce7',
                      color: '#166534',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}>
                      {kw.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
                <Search size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <p style={{ fontSize: '14px' }}>No keyword data yet</p>
              </div>
            )}
          </div>

          {/* Top Referrers */}
          <div className="chart-container">
            <div style={{ padding: '20px', borderBottom: '2px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <LinkIcon size={20} style={{ color: '#3b82f6' }} />
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                Top Referrers
              </h3>
            </div>
            {referrers.length > 0 ? (
              <div style={{ padding: '16px' }}>
                {referrers.map((ref, idx) => (
                  <div 
                    key={idx}
                    onClick={() => handleReferrerClick(ref)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: idx < referrers.length - 1 ? '1px solid #f1f5f9' : 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      borderRadius: '8px'
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '16px' }}>🔗</span>
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: '#1e293b',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {ref.referrer}
                      </span>
                    </div>
                    <span style={{
                      padding: '4px 12px',
                      background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                      color: '#1e40af',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: '600',
                      flexShrink: 0,
                      marginLeft: '8px',
                      border: '1px solid #93c5fd'
                    }}>
                      {ref.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
                <LinkIcon size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <p style={{ fontSize: '14px' }}>No referrer data yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default TrafficSources
