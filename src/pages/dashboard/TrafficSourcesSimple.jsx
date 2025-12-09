import { useState, useEffect } from 'react'
import { trafficAPI } from '../../api/api'
import { TrendingUp } from 'lucide-react'

function TrafficSourcesSimple({ projectId }) {
  const [sources, setSources] = useState([])
  const [loading, setLoading] = useState(true)

  // Define all standard traffic source categories
  const standardSources = [
    { name: 'Direct Traffic', type: 'direct', icon: '🌐' },
    { name: 'Organic Search', type: 'organic', icon: '🔍' },
    { name: 'AI Chatbot', type: 'ai', icon: '🤖' },
    { name: 'Website Referrals', type: 'referral', icon: '🔗' },
    { name: 'Organic Social', type: 'social', icon: '📱' },
    { name: 'Paid Traffic', type: 'paid', icon: '💰' },
    { name: 'Email', type: 'email', icon: '📧' },
    { name: 'UTM Campaigns', type: 'utm', icon: '📊' }
  ]

  useEffect(() => {
    loadData()
  }, [projectId])

  const loadData = async () => {
    try {
      const sourcesRes = await trafficAPI.getSources(projectId)
      setSources(sourcesRes.data)
    } catch (error) {
      console.error('Error loading traffic data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTotalSessions = () => {
    return sources.reduce((sum, s) => sum + (s.count || 0), 0)
  }

  const getSourceData = (type) => {
    // Sum up all sources of this type (e.g., all "organic" sources)
    const matchingSources = sources.filter(s => s.source_type?.toLowerCase() === type.toLowerCase())
    const totalCount = matchingSources.reduce((sum, s) => sum + (s.count || 0), 0)
    const avgBounceRate = matchingSources.length > 0 
      ? matchingSources.reduce((sum, s) => sum + (s.bounce_rate || 0), 0) / matchingSources.length
      : 0
    
    return {
      count: totalCount,
      bounceRate: Math.round(avgBounceRate)
    }
  }

  const calculatePercentage = (count) => {
    const total = getTotalSessions()
    return total > 0 ? ((count / total) * 100).toFixed(1) : '0.0'
  }

  if (loading) return <div className="loading">Loading traffic sources...</div>

  const totalSessions = getTotalSessions()

  return (
    <>
      <div className="header">
        <h1>Traffic Sources</h1>
      </div>

      <div className="content">
        <div className="chart-container" style={{ padding: 0 }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 120px 120px 200px 120px',
            padding: '16px 24px',
            background: '#f8fafc',
            borderBottom: '2px solid #e2e8f0',
            fontWeight: '600',
            fontSize: '13px',
            color: '#64748b',
            alignItems: 'center'
          }}>
            <div>Traffic Source</div>
            <div style={{ textAlign: 'center' }}>Sessions</div>
            <div style={{ textAlign: 'center' }}>Bounce %</div>
            <div style={{ textAlign: 'center' }}>Entire Log (2 weeks) Sessions</div>
          </div>

          {/* Table Rows - Show all standard sources */}
          <div>
            {standardSources.map((stdSource, idx) => {
              const data = getSourceData(stdSource.type)
              const percentage = calculatePercentage(data.count)
              const bounceRate = data.bounceRate || (data.count > 0 ? 88 : 0) // Default bounce rate if data exists
              
              return (
                <div 
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 120px 120px 200px 120px',
                    padding: '20px 24px',
                    borderBottom: idx < standardSources.length - 1 ? '1px solid #f1f5f9' : 'none',
                    alignItems: 'center',
                    transition: 'background 0.2s',
                    opacity: data.count === 0 ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Traffic Source Name */}
                  <div>
                    <div style={{ 
                      fontSize: '15px', 
                      fontWeight: '600', 
                      color: data.count > 0 ? '#1e293b' : '#94a3b8',
                      marginBottom: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <div style={{
                        width: '4px',
                        height: '20px',
                        background: data.count > 0 ? '#3b82f6' : '#cbd5e1',
                        borderRadius: '2px'
                      }} />
                      {stdSource.name}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#64748b',
                      marginLeft: '12px'
                    }}>
                      {percentage}%
                    </div>
                  </div>

                  {/* Sessions */}
                  <div style={{ 
                    textAlign: 'center',
                    fontSize: '16px',
                    fontWeight: '700',
                    color: data.count > 0 ? '#1e293b' : '#cbd5e1'
                  }}>
                    {data.count}
                  </div>

                  {/* Bounce % */}
                  <div style={{ 
                    textAlign: 'center',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: data.count === 0 ? '#cbd5e1' : (bounceRate > 80 ? '#ef4444' : '#10b981')
                  }}>
                    {data.count > 0 ? `${bounceRate}%` : 'n/a'}
                  </div>

                  {/* Session Log Bar - Thin & Elegant */}
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '40px',
                    gap: '10px'
                  }}>
                    {data.count > 0 ? (
                      <>
                        {/* Thin bar chart showing sessions */}
                        <div style={{
                          flex: 1,
                          height: '8px',
                          background: '#e2e8f0',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          position: 'relative'
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${Math.min((data.count / totalSessions) * 100, 100)}%`,
                            background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
                            borderRadius: '10px',
                            transition: 'width 0.3s ease',
                            boxShadow: '0 0 8px rgba(59, 130, 246, 0.3)'
                          }} />
                        </div>
                        {/* Session count */}
                        <div style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#64748b',
                          minWidth: '35px',
                          textAlign: 'right'
                        }}>
                          {data.count}
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Empty thin bar */}
                        <div style={{
                          flex: 1,
                          height: '8px',
                          background: '#f8fafc',
                          borderRadius: '10px',
                          border: '1px dashed #e2e8f0'
                        }} />
                        {/* Zero count */}
                        <div style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#cbd5e1',
                          minWidth: '35px',
                          textAlign: 'right'
                        }}>
                          0
                        </div>
                      </>
                    )}
                  </div>

              
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

export default TrafficSourcesSimple
