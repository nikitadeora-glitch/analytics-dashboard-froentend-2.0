import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { trafficAPI, projectsAPI } from '../../api/api'
import { Skeleton } from '@mui/material'
import { Calendar, ChevronDown } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

function TrafficSourceDetailView({ projectId }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState([])
  const [sourceInfo, setSourceInfo] = useState(null)
  const [project, setProject] = useState(null)
  const [period, setPeriod] = useState('1')
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false)

  // Get traffic source info from location state
  useEffect(() => {
    if (location.state?.sourceInfo) {
      const info = location.state.sourceInfo
      console.log('🔄 Received sourceInfo:', info)
      setSourceInfo(info)
      const receivedPeriod = info.period || '30'
      setPeriod(receivedPeriod)
      console.log('📅 Setting period to:', receivedPeriod)
      loadChartData(info, receivedPeriod)
    } else {
      // If no source info, redirect back
      navigate(-1)
    }
  }, [location.state, navigate])

  useEffect(() => {
    if (projectId) {
      loadProjectInfo()
    }
  }, [projectId])

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

  const loadChartData = async (source, currentPeriod = null) => {
    try {
      setLoading(true)
      const usePeriod = currentPeriod || period || source.period || '30'
      console.log('🔄 Loading chart data for source:', source)
      console.log('📅 Current period state:', period)
      console.log('📅 Passed currentPeriod:', currentPeriod)
      console.log('📅 Source period:', source.period)
      console.log('📅 Final usePeriod:', usePeriod)

      const { startDate, endDate } = getDateRange(usePeriod)
      console.log('📅 Calculated date range:', { startDate, endDate })

      // Use dates from source if available, otherwise calculate from period
      const finalStartDate = source.startDate || startDate
      const finalEndDate = source.endDate || endDate
      console.log('📅 Final date range:', { finalStartDate, finalEndDate })

      // Get real data from API
      const response = await trafficAPI.getSourceDetail(
        source.projectId || projectId, 
        source.type, 
        finalStartDate, 
        finalEndDate
      )

      console.log('📊 Source detail API response:', response)
      console.log('📊 Source detail API data:', response.data)

      const apiData = response.data
      if (!apiData) {
        console.log('⚠️ No data received from API')
        setChartData([])
        return
      }

      const dailyData = apiData.daily_data || []
      console.log('📈 Daily data from API:', dailyData)

      // Format data for charts
      const formattedData = dailyData.map(day => ({
        date: new Date(day.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        fullDate: day.date,
        sessions: day.sessions || 0,
        bounceRate: day.bounce_rate || 0
      }))

      console.log('📈 Formatted chart data:', formattedData)
      setChartData(formattedData)

      // Update source info with real totals
      setSourceInfo(prev => ({
        ...prev,
        count: apiData.total_sessions || 0,
        realData: true
      }))

    } catch (error) {
      console.error('❌ Error loading chart data:', error)
      console.error('❌ Error response:', error.response?.data)
      setChartData([])
    } finally {
      setLoading(false)
    }
  }

  const handlePeriodChange = (newPeriod) => {
    console.log('📅 Period changing to:', newPeriod)
    setPeriod(newPeriod)
    setShowPeriodDropdown(false)
    
    if (sourceInfo) {
      const updatedSource = { ...sourceInfo, period: newPeriod }
      setSourceInfo(updatedSource)
      loadChartData(updatedSource, newPeriod)
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  if (loading) {
    return (
      <>
        <div className="header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '98%' }}>
            <div>
              <h1 style={{ margin: 0 }}>Traffic Source Details</h1>
              <button
                onClick={handleBack}
                style={{
                  padding: '8px 16px',
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#010812ff',
                  transition: 'all 0.2s',
                  marginTop: '8px'
                }}
              >
                ← Back
              </button>
            </div>

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
                <ChevronDown size={16} />
              </div>
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
          <div className="chart-container">
            <Skeleton variant="rectangular" width="100%" height={400} animation="wave" />
          </div>
        </div>
      </>
    )
  }

  if (!sourceInfo) {
    return (
      <>
        <div className="header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
          <div>
            <h1 style={{ margin: 0 }}>Traffic Source Details</h1>
            <button
              onClick={handleBack}
              style={{
                padding: '8px 16px',
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#010812ff',
                transition: 'all 0.2s',
                marginTop: '8px'
              }}
            >
              ← Back
            </button>
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
          <div className="chart-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
            <p style={{ fontSize: '16px', color: '#64748b' }}>No traffic source data available</p>
          </div>
        </div>
      </>
    )
  }

  const totalSessions = sourceInfo.count || 0
  const avgBounceRate = sourceInfo.bounceRate || 0

  return (
    <>
      <div className="header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '98%' }}>
          <div>
            <h1 style={{ margin: 0 }}>{sourceInfo.name} - Analytics</h1>
            <button
              onClick={handleBack}
              style={{
                padding: '8px 16px',
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#010812ff',
                transition: 'all 0.2s',
                marginTop: '8px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
              ← Back
            </button>
          </div>

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
        {/* Summary Stats */}
        <div className="stats-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div className="chart-container stat-card" style={{ padding: '20px', textAlign: 'center' }}>
            <div className="value" style={{ fontSize: '32px', fontWeight: '700', color: totalSessions > 0 ? '#3b82f6' : '#94a3b8', marginBottom: '8px' }}>
              {totalSessions}
            </div>
            <div className="label" style={{ fontSize: '14px', color: '#64748b' }}>Total Sessions</div>
          </div>

          <div className="chart-container stat-card" style={{ padding: '20px', textAlign: 'center' }}>
            <div className="value" style={{ fontSize: '32px', fontWeight: '700', color: totalSessions === 0 ? '#94a3b8' : (avgBounceRate > 70 ? '#ef4444' : '#10b981'), marginBottom: '8px' }}>
              {totalSessions === 0 ? 'N/A' : `${avgBounceRate}%`}
            </div>
            <div className="label" style={{ fontSize: '14px', color: '#64748b' }}>Avg Bounce Rate</div>
          </div>

          <div className="chart-container stat-card" style={{ padding: '20px', textAlign: 'center' }}>
            <div className="value" style={{ fontSize: '32px', fontWeight: '700', color: totalSessions > 0 ? '#8b5cf6' : '#94a3b8', marginBottom: '8px' }}>
              {totalSessions === 0 ? '0' : Math.max(1, Math.round(totalSessions / parseInt(period)))}
            </div>
            <div className="label" style={{ fontSize: '14px', color: '#64748b' }}>Daily Average</div>
          </div>
        </div>

        {/* Sessions Line Chart */}
        <div className="chart-container" style={{ marginBottom: '30px' }}>
          <div style={{ padding: '20px 20px 0 20px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
              Sessions Over Time
            </h3>
          </div>
          {totalSessions === 0 ? (
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>📊</div>
              <p style={{ fontSize: '16px', color: '#64748b', margin: 0 }}>No session data available</p>
              <p style={{ fontSize: '14px', color: '#94a3b8', margin: '4px 0 0 0' }}>This traffic source has no recorded sessions</p>
            </div>
          ) : (
            <div style={{ height: '300px', padding: '0 20px 20px 20px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dx={-10}
                  />
                  <Tooltip
                    cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '3 3' }}
                    contentStyle={{
                      background: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      padding: '12px'
                    }}
                    formatter={(value, name) => [value, name === 'sessions' ? 'Sessions' : name]}
                  />
                  <Area
                    type="monotone"
                    dataKey="sessions"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorSessions)"
                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 0, fill: '#3b82f6' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Bounce Rate Bar Chart */}
        <div className="chart-container">
          <div style={{ padding: '20px 20px 0 20px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
              Bounce Rate Trends
            </h3>
          </div>
          {totalSessions === 0 ? (
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>📈</div>
              <p style={{ fontSize: '16px', color: '#64748b', margin: 0 }}>No bounce rate data available</p>
              <p style={{ fontSize: '14px', color: '#94a3b8', margin: '4px 0 0 0' }}>This traffic source has no recorded bounce data</p>
            </div>
          ) : (
            <div style={{ height: '300px', padding: '0 20px 20px 20px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    domain={[0, 100]}
                    tickLine={false}
                    axisLine={false}
                    dx={-10}
                  />
                  <Tooltip
                    cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '3 3' }}
                    contentStyle={{
                      background: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      padding: '12px'
                    }}
                    formatter={(value) => [`${value}%`, 'Bounce Rate']}
                  />
                  <Line
                    type="monotone"
                    dataKey="bounceRate"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
      <style>
        {`
          @media (max-width: 768px) {
            .header h1 {
              font-size: 20px !important;
              margin-bottom: 5px !important;
            }
            .content {
              padding: 12px !important;
              overflow-x: hidden !important;
            }
            .stats-grid {
              grid-template-columns: repeat(3, 1fr) !important;
              gap: 8px !important;
              margin-bottom: 20px !important;
            }
            .stats-grid .stat-card {
                padding: 10px 5px !important;
                min-height: auto !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: center !important;
                align-items: center !important;
            }
            .stats-grid .stat-card:last-child {
                grid-column: span 1 !important;
            }
            .stat-card .value {
                font-size: 18px !important;
                margin-bottom: 2px !important;
            }
            .stat-card .label {
                font-size: 9px !important;
                white-space: nowrap !important;
                color: #94a3b8 !important;
            }
            .chart-container {
               padding: 12px !important;
            }
            .chart-container > div:last-child {
               
                padding: 0 !important;
            }
          }
        `}
      </style>
    </>
  )
}

export default TrafficSourceDetailView