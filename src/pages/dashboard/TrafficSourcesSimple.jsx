import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { trafficAPI, projectsAPI } from '../../api/api'
import { TrendingUp, Globe, Calendar, ChevronDown } from 'lucide-react'
import { Skeleton, Box, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material'

function TrafficSourcesSimple({ projectId }) {
  const navigate = useNavigate()
  const [sources, setSources] = useState([])
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState(() => {
    const savedPeriod = localStorage.getItem(`traffic-sources-period-${projectId}`)
    return savedPeriod || '1'  // Changed from '30' to '1'
  })
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false)

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
    loadProjectInfo()
  }, [projectId, period])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPeriodDropdown && !event.target.closest('[data-period-dropdown]')) {
        setShowPeriodDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showPeriodDropdown])

  const loadProjectInfo = async () => {
    try {
      const response = await projectsAPI.getOne(projectId)
      setProject(response.data)
    } catch (error) {
      console.error('Error loading project info:', error)
    }
  }

  const createISTDateRange = (days) => {
    // Get current time in IST - EXACTLY SAME AS REPORTS.JSX
    const now = new Date()
    const istNow = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}))
    
    // Calculate start date (days ago from IST midnight)
    const startOfDayIST = new Date(istNow)
    startOfDayIST.setHours(0, 0, 0, 0)
    const startDate = new Date(startOfDayIST.getTime() - (days - 1) * 24 * 60 * 60 * 1000)
    
    // End date is current IST time
    const endDate = istNow
    
    // Convert to UTC for API calls
    const startDateUTC = new Date(startDate.getTime() - (startDate.getTimezoneOffset() * 60000))
    const endDateUTC = new Date(endDate.getTime() - (endDate.getTimezoneOffset() * 60000))
    
    return {
      startDate: startDateUTC.toISOString(),
      endDate: endDateUTC.toISOString()
    }
  }

  const getDateRange = (days) => {
    // Use EXACTLY the same function as Reports.jsx
    return createISTDateRange(parseInt(days))
  }

  const loadData = async () => {
    try {
      console.log('🔄 TrafficSources - Loading data with period:', period)
      const { startDate, endDate } = getDateRange(period)
      console.log('📅 TrafficSources - IST Date range (SAME AS REPORTS.JSX):', { startDate, endDate, period })
      
      // Use the same API call format as Reports.jsx
      console.log('🌐 TrafficSources - Calling trafficAPI.getSources with exact same params as Reports.jsx')
      
      const sourcesRes = await trafficAPI.getSources(projectId, startDate, endDate)
      console.log('✅ Traffic Sources API Response Status:', sourcesRes.status)
      console.log('📊 Traffic Sources API Response Data:', sourcesRes.data)
      console.log('📈 Number of sources received:', sourcesRes.data?.length || 0)
      
      // Log each source for debugging - SAME FORMAT AS REPORTS.JSX
      if (sourcesRes.data && sourcesRes.data.length > 0) {
        const totalVisits = sourcesRes.data.reduce((sum, source) => sum + (source.count || 0), 0)
        console.log('🎯 TRAFFIC SOURCES PAGE - Total visits from all sources:', totalVisits)
        console.log('🎯 TRAFFIC SOURCES PAGE - This should MATCH Reports.jsx total visits')
        
        sourcesRes.data.forEach((source, idx) => {
          console.log(`🎯 Source ${idx + 1}:`, {
            type: source.source_type,
            name: source.source_name,
            count: source.count,
            percentage: source.percentage,
            bounce_rate: source.bounce_rate
          })
        })
      } else {
        console.log('⚠️ No traffic sources data received from API')
      }
      
      setSources(sourcesRes.data || [])
    } catch (error) {
      console.error('❌ Error loading traffic data:', error)
      console.error('❌ Error details:', error.response?.data || error.message)
      setSources([]) // Set empty array on error
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

    console.log(`🔍 Source type "${type}":`, {
      matchingSources: matchingSources.length,
      totalCount,
      avgBounceRate: Math.round(avgBounceRate)
    })

    return {
      count: totalCount,
      bounceRate: Math.round(avgBounceRate)
    }
  }

  const calculatePercentage = (count) => {
    const total = getTotalSessions()
    return total > 0 ? ((count / total) * 100).toFixed(1) : '0.0'
  }

  const handleSourceClick = (stdSource, data) => {
    console.log('🖱️ Clicked source:', stdSource.name, 'Data:', data)

    if (data.count === 0) {
      console.log('❌ No data for this source, not navigating')
      return // Don't navigate if no data
    }

    const { startDate, endDate } = getDateRange(period)
    
    const sourceInfo = {
      name: stdSource.name,
      type: stdSource.type,
      icon: stdSource.icon,
      count: data.count,
      bounceRate: data.bounceRate,
      period: period,
      startDate: startDate,
      endDate: endDate,
      projectId: projectId
    }

    console.log('✅ Navigating to detail with sourceInfo:', sourceInfo)
    console.log('📅 Period being passed:', period)
    console.log('📅 Date range being passed:', { startDate, endDate })

    navigate('detail', {
      state: { sourceInfo }
    })
  }

  const handlePeriodChange = (newPeriod) => {
    console.log('TrafficSources - Period changing to:', newPeriod)
    setPeriod(newPeriod)
    localStorage.setItem(`traffic-sources-period-${projectId}`, newPeriod)
    setShowPeriodDropdown(false)
  }

  if (loading) return (
    <>
      <div className="header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '98%' }}>
          <h1 style={{ margin: 0 }}>Traffic Sources</h1>
          
          {/* Date Filter - Yellow Highlighted Area */}
          <div style={{ position: 'relative' }} data-period-dropdown>
            <div
              onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: '#3b82f6', // Yellow background 
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                color: '#eeedebff',
                transition: 'all 0.2s',
                userSelect: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#2563eb'
                e.currentTarget.style.borderColor = '#2563eb'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#3b82f6'
                e.currentTarget.style.borderColor = '#3b82f6'
              }}
            >
              <Calendar size={16} />
              <span>
                {period === '1' ? '1 Day' : period === '7' ? '7 Days' : '30 Days'}
              </span>
              <ChevronDown size={16} style={{
                transform: showPeriodDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }} />
            </div>

            {/* Dropdown */}
            {showPeriodDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '4px',
                background: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                zIndex: 1000,
                minWidth: '120px',
                overflow: 'hidden'
              }}>
                {['1', '7', '30'].map((p) => (
                  <div
                    key={p}
                    onClick={() => handlePeriodChange(p)}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: period === p ? '#1e40af' : '#374151',
                      background: period === p ? '#eff6ff' : 'white',
                      borderBottom: p !== '30' ? '1px solid #f3f4f6' : 'none',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (period !== p) {
                        e.currentTarget.style.background = '#f9fafb'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (period !== p) {
                        e.currentTarget.style.background = 'white'
                      }
                    }}
                  >
                    {p === '1' ? '1 Day' : p === '7' ? '7 Days' : '30 Days'}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {project && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#64748b',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            <span>Project: {project.name}</span>
          </div>
        )}
      </div>

      <div className="content">
        <Box className="chart-container">
          {/* Header Row */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: '2fr 120px 120px 200px 120px',
            padding: '16px 24px',
            borderBottom: '2px solid #e2e8f0',
            background: '#f8fafc',
            alignItems: 'center'
          }}>
            <Skeleton variant="text" width={100} height={13} animation="wave" />
            <Skeleton variant="text" width={60} height={13} animation="wave" />
            <Skeleton variant="text" width={60} height={13} animation="wave" />
            <Skeleton variant="text" width={140} height={13} animation="wave" />
          </Box>

          {/* Table Rows */}
          <Box>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(idx => (
              <Box key={idx} sx={{
                display: 'grid',
                gridTemplateColumns: '2fr 120px 120px 200px 120px',
                padding: '20px 24px',
                borderBottom: idx < 7 ? '1px solid #f1f5f9' : 'none',
                alignItems: 'center'
              }}>
                {/* Traffic Source Name */}
                <Box>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    marginBottom: 0.5
                  }}>
                    <Box sx={{
                      width: '4px',
                      height: '20px',
                      background: '#3b82f6',
                      borderRadius: '2px'
                    }} />
                    <Skeleton variant="text" width={120} height={15} animation="wave" />
                  </Box>
                  <Box sx={{ marginLeft: 1.5 }}>
                    <Skeleton variant="text" width={40} height={12} animation="wave" />
                  </Box>
                </Box>

                {/* Sessions */}
                <Box sx={{ textAlign: 'center' }}>
                  <Skeleton variant="text" width={30} height={16} animation="wave" />
                </Box>

                {/* Bounce % */}
                <Box sx={{ textAlign: 'center' }}>
                  <Skeleton variant="text" width={40} height={16} animation="wave" />
                </Box>

                {/* Entire Log Sessions */}
                <Box sx={{ textAlign: 'center' }}>
                  <Skeleton variant="text" width={50} height={16} animation="wave" />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </div>
    </>
  )

  const totalSessions = getTotalSessions()

  return (
    <>
      <div className="header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '98%' }}>
          <h1 style={{ margin: 0 }}>Traffic Sources</h1>
          
          {/* Date Filter - Yellow Highlighted Area */}
          <div style={{ position: 'relative' }} data-period-dropdown>
            <div
              onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: '#3b82f6', // Yellow background
                
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                color: '#eeedebff',
                transition: 'all 0.2s',
                userSelect: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#2563eb'
                e.currentTarget.style.borderColor = '#2563eb'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#3b82f6'
                e.currentTarget.style.borderColor = '#3b82f6'
              }}
            >
              <Calendar size={16} />
              <span>
                {period === '1' ? '1 Day' : period === '7' ? '7 Days' : '30 Days'}
              </span>
              <ChevronDown size={16} style={{
                transform: showPeriodDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }} />
            </div>

            {/* Dropdown */}
            {showPeriodDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '4px',
                background: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                zIndex: 1000,
                minWidth: '120px',
                overflow: 'hidden'
              }}>
                {['1', '7', '30'].map((p) => (
                  <div
                    key={p}
                    onClick={() => handlePeriodChange(p)}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: period === p ? '#1e40af' : '#374151',
                      background: period === p ? '#eff6ff' : 'white',
                      borderBottom: p !== '30' ? '1px solid #f3f4f6' : 'none',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (period !== p) {
                        e.currentTarget.style.background = '#f9fafb'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (period !== p) {
                        e.currentTarget.style.background = 'white'
                      }
                    }}
                  >
                    {p === '1' ? '1 Day' : p === '7' ? '7 Days' : '30 Days'}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {project && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#64748b',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            <span>Project: {project.name}</span>
          </div>
        )}
      </div>

      <div className="content">
        <div className="chart-container" style={{ padding: 0 }}>
          {/* Table Header */}
          <div className="traffic-header" style={{
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
            <div style={{ textAlign: 'center' }}>Entire Log ({period === '1' ? '1 day' : period === '7' ? '7 days' : '30 days'}) Sessions</div>
          </div>

          {/* Table Rows - Show all standard sources */}
          <div>
            {console.log('🎯 Rendering traffic sources with total sessions:', totalSessions)}
            {console.log('🎯 Available sources from API:', sources)}
            
            {sources.length > 0 ? (
              // Show data from API
              standardSources.map((stdSource, idx) => {
                const data = getSourceData(stdSource.type)
                const percentage = calculatePercentage(data.count)
                const bounceRate = data.bounceRate || (data.count > 0 ? 88 : 0)
                const hasData = data.count > 0
                
                return (
                  <div
                    key={idx}
                    className="traffic-row"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 120px 120px 200px 120px',
                      padding: '20px 24px',
                      borderBottom: idx < standardSources.length - 1 ? '1px solid #f1f5f9' : 'none',
                      alignItems: 'center',
                      transition: 'all 0.2s',
                      opacity: hasData ? 1 : 0.6,
                      cursor: hasData ? 'pointer' : 'default'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f8fafc'
                      if (hasData) {
                        e.currentTarget.style.transform = 'translateY(-1px)'
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                    onClick={() => hasData && handleSourceClick(stdSource, data)}
                  >
                    {/* Traffic Source Name */}
                    <div className="traffic-col" data-label="Traffic Source">
                      <div style={{
                        fontSize: '15px',
                        fontWeight: '600',
                        color: hasData ? '#1e293b' : '#94a3b8',
                        marginBottom: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <div style={{
                          width: '4px',
                          height: '20px',
                          background: hasData ? '#3b82f6' : '#cbd5e1',
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
                    <div className="traffic-col" data-label="Sessions" style={{
                      textAlign: 'center',
                      fontSize: '16px',
                      fontWeight: '700',
                      color: hasData ? '#1e293b' : '#cbd5e1'
                    }}>
                      {data.count}
                    </div>

                    {/* Bounce % */}
                    <div className="traffic-col" data-label="Bounce %" style={{
                      textAlign: 'center',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: !hasData ? '#cbd5e1' : (bounceRate > 80 ? '#ef4444' : '#10b981')
                    }}>
                      {hasData ? `${bounceRate}%` : 'n/a'}
                    </div>

                    {/* Session Log Bar */}
                    <div className="traffic-col" data-label="Sessions Trend" style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '40px',
                      gap: '10px'
                    }}>
                      {hasData ? (
                        <>
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
                              width: `${Math.min((data.count / Math.max(totalSessions, 1)) * 100, 100)}%`,
                              background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
                              borderRadius: '10px',
                              transition: 'width 0.3s ease',
                              boxShadow: '0 0 8px rgba(59, 130, 246, 0.3)'
                            }} />
                          </div>
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
                          <div style={{
                            flex: 1,
                            height: '8px',
                            background: '#f8fafc',
                            borderRadius: '10px',
                            border: '1px dashed #e2e8f0'
                          }} />
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
              })
            ) : (
              // Show "No data" message
              <div style={{
                padding: '60px 40px',
                textAlign: 'center',
                color: '#64748b',
                background: '#f8fafc',
                borderRadius: '12px',
                margin: '20px'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                <h3 style={{ margin: '0 0 8px 0', color: '#374151' }}>No Traffic Data Available</h3>
                <p style={{ margin: 0, fontSize: '14px' }}>
                  No traffic sources found for the selected {period === '1' ? 'day' : period === '7' ? '7 days' : '30 days'} period.
                  <br />Try selecting a different date range or check if your tracking is working properly.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>
        {`
          @media (max-width: 768px) {
            .header h1 {
              font-size: 22px !important;
            }
            .content {
              padding: 12px !important;
              overflow-x: hidden !important;
            }
            .chart-container {
               background: transparent !important;
               box-shadow: none !important;
               border: none !important;
            }
            .traffic-header {
              display: none !important;
            }
            .traffic-row {
              display: block !important;
              background: white !important;
              border-radius: 12px !important;
              margin-bottom: 15px !important;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
              border: 1px solid #e2e8f0 !important;
              padding: 15px !important;
              opacity: 1 !important; /* Ensure visibility on mobile */
            }
            .traffic-col {
              display: flex !important;
              justify-content: space-between !important;
              align-items: center !important;
              padding: 10px 0 !important;
              border-bottom: 1px solid #f1f5f9 !important;
              text-align: right !important;
            }
            .traffic-col:last-child {
              border-bottom: none !important;
            }
            .traffic-col:before {
              content: attr(data-label);
              font-weight: 600;
              color: #64748b;
              font-size: 12px;
              text-align: left !important;
              margin-right: 15px !important;
            }
            .traffic-col > div {
                max-width: 65% !important;
                text-align: right !important;
            }
          }
        `}
      </style>
    </>
  )
}

export default TrafficSourcesSimple