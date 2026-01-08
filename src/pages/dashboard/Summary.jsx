import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { analyticsAPI, projectsAPI } from '../../api/api'
import { Globe } from 'lucide-react'
import BarChart from '../../components/BarChart'
import { Skeleton, Box, Grid, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material'

// Add cache busting
const CACHE_BUSTER = Date.now()

function Summary({ projectId }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [data, setData] = useState(null)
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('daily')
  const [dateRange, setDateRange] = useState(30)
  const [currentPage, setCurrentPage] = useState(0)
  const [showPageViews, setShowPageViews] = useState(true)
  const [showUniqueVisits, setShowUniqueVisits] = useState(true)
  const [showReturningVisits, setShowReturningVisits] = useState(true)

  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false)
  const [showDateRangeDropdown, setShowDateRangeDropdown] = useState(false)
  const [expandedWeek, setExpandedWeek] = useState(null) // Track expanded week
  const [weeklyData, setWeeklyData] = useState({}) // Store weekly hourly data
  const [expandedMonth, setExpandedMonth] = useState(null) // Track expanded month
  const [monthlyData, setMonthlyData] = useState({}) // Store monthly hourly data

  useEffect(() => {
    if (location.state) {
      const { period: savedPeriod, dateRange: savedDateRange, currentPage: savedCurrentPage } = location.state
      if (savedPeriod) setPeriod(savedPeriod)
      if (savedDateRange) setDateRange(savedDateRange)
      if (savedCurrentPage !== undefined) setCurrentPage(savedCurrentPage)
      // Debug logging
      console.log('Summary - Restored state:', { period: savedPeriod, dateRange: savedDateRange, currentPage: savedCurrentPage })
    }
  }, [location.state])

  useEffect(() => {
    loadProjectInfo()
  }, [projectId])

  useEffect(() => {
    loadSummary()
  }, [projectId, dateRange, period])

  const loadProjectInfo = async () => {
    try {
      const response = await projectsAPI.getOne(projectId)
      setProject(response.data)
    } catch (error) {
      console.error('Error loading project info:', error)
    }
  }

  const loadSummary = async () => {
    try {
      setLoading(true)
      const response = await analyticsAPI.getSummaryView(projectId, dateRange)
      setData(response.data)
      // Only reset page if it's not a navigation back from hourly view
      // Check if we're coming back from hourly view by checking if location.state has currentPage
      if (!location.state || location.state.currentPage === undefined) {
        setCurrentPage(0)
      }
    } catch (error) {
      console.error('Error loading summary:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePeriodChange = (e) => {
    console.log(' Period changing to:', e.target.value)
    setPeriod(e.target.value)
    setCurrentPage(0)
    // Force browser to recognize changes
    window.location.hash = `period-${e.target.value}-${Date.now()}`
  }

  if (loading) {
    return (
      <>
        {/* Skeleton UI unchanged */}
      </>
    )
  }

  if (!data) return <div className="loading">No data available</div>

  // ===================== DATA FILTERING =====================

  let filteredData = []

  if (period === 'daily') {
    filteredData = data.daily_stats || []
  } 
  else if (period === 'weekly') {
    const weeks = []
    const stats = data.daily_stats || []

    for (let i = 0; i < stats.length; i += 7) {
      const weekData = stats.slice(i, i + 7)
      const weekNumber = Math.floor(i / 7) + 1
      const startDate = stats[i].date
      const endDate = stats[Math.min(i + 6, stats.length - 1)].date

      weeks.push({
        date: `Week ${weekNumber}`,
        dateRange: `${startDate} → ${endDate}`, // Keep date range for reference
        page_views: weekData.reduce((sum, d) => sum + d.page_views, 0),
        unique_visits: Math.max(...weekData.map(d => d.unique_visits || 0)),
        first_time_visits: weekData.reduce((sum, d) => sum + d.first_time_visits, 0),
        returning_visits: weekData.reduce((sum, d) => sum + d.returning_visits, 0)
      })
    }
    filteredData = weeks
  } 
  else if (period === 'monthly') {
    const months = {}

    ;(data.daily_stats || []).forEach(day => {
      const dateParts = day.date.split(' ')
      // Format is "Mon, 06 Jan 2025" -> ["Mon,", "06", "Jan", "2025"]
      const monthName = dateParts[2] // Get month name (e.g., "Jan", "Feb")
      const year = dateParts[3] // Get year
      const monthKey = `${monthName} ${year}`

      if (!months[monthKey]) {
        months[monthKey] = {
          date: monthKey, // Use month name as primary label
          page_views: 0,
          unique_visits: 0,
          first_time_visits: 0,
          returning_visits: 0
        }
      }

      months[monthKey].page_views += day.page_views
      months[monthKey].unique_visits = Math.max(
        months[monthKey].unique_visits,
        day.unique_visits
      )
      months[monthKey].first_time_visits += day.first_time_visits
      months[monthKey].returning_visits += day.returning_visits
    })

    filteredData = Object.values(months)
  }

  // ===================== PAGINATION =====================

  const itemsPerPage = period === 'monthly' ? 12 : 30
  const start = currentPage * itemsPerPage
  const end = start + itemsPerPage

  const displayData = filteredData.slice(start, end)
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage))

  const isFirstPage = currentPage === 0
  const isLastPage = currentPage >= totalPages - 1

  // ===================== AVERAGES CALCULATION =====================

  // Calculate averages based on filtered data
  const calculateAverages = () => {
    if (!filteredData.length) {
      return {
        page_views: 0,
        unique_visits: 0,
        first_time_visits: 0,
        returning_visits: 0
      }
    }

    const totalPageViews = filteredData.reduce((sum, d) => sum + (d.page_views || 0), 0)
    const totalUniqueVisits = filteredData.reduce((sum, d) => sum + (d.unique_visits || 0), 0)
    const totalFirstTimeVisits = filteredData.reduce((sum, d) => sum + (d.first_time_visits || 0), 0)
    const totalReturningVisits = filteredData.reduce((sum, d) => sum + (d.returning_visits || 0), 0)

    let divisor = filteredData.length

    // For weekly period, calculate daily averages by dividing by 7 (days in a week)
    if (period === 'weekly') {
      divisor = filteredData.length * 7
    }
    // For monthly period, use the actual number of days in each month
    else if (period === 'monthly') {
      // This is a simplified approach - ideally we'd use actual days in each month
      divisor = filteredData.length * 30 // Approximate days per month
    }

    return {
      page_views: divisor > 0 ? (totalPageViews / divisor).toFixed(1) : '0',
      unique_visits: divisor > 0 ? (totalUniqueVisits / divisor).toFixed(1) : '0',
      first_time_visits: divisor > 0 ? (totalFirstTimeVisits / divisor).toFixed(1) : '0',
      returning_visits: divisor > 0 ? (totalReturningVisits / divisor).toFixed(1) : '0'
    }
  }

  const periodAverages = calculateAverages()

  // ===================== CHART SCALE =====================

  const getChartMax = () => {
    if (!displayData.length) return 100
    const max = Math.max(
      ...displayData.map(d =>
        Math.max(d.page_views || 0, d.unique_visits || 0, d.returning_visits || 0)
      )
    )
    return max === 0 ? 100 : Math.ceil(max * 1.2 / 10) * 10
  }

  const chartMax = getChartMax()
  const chartStep = Math.ceil(chartMax / 5)

  // ===================== WEEKLY EXPANSION =====================

  const loadWeeklyData = async (weekData, idx) => {
    try {
      const [startDate, endDate] = weekData.dateRange.split(' → ')
      const response = await analyticsAPI.getHourlyDataRange(projectId, startDate, endDate)
      
      // Also get daily data for the week
      const stats = data.daily_stats || []
      const weekStartIndex = idx * 7
      const weekEndIndex = Math.min(weekStartIndex + 6, stats.length - 1)
      const weekDailyData = stats.slice(weekStartIndex, weekEndIndex + 1)
      
      console.log('Loading weekly data:', {
        idx,
        weekStartIndex,
        weekEndIndex,
        weekDailyData: weekDailyData.length,
        totalStats: stats.length
      })
      
      // Process hourly data for the week
      const processedData = {
        ...response.data,
        hourly_stats: response.data.hourly_stats
          .map((stat, index) => {
            let hour = '00';
            let hourNumber = 0;
            
            if (stat.hour) {
              if (stat.hour.includes(':')) {
                hour = stat.hour.split(':')[0];
              } else {
                hour = stat.hour;
              }
              hourNumber = parseInt(hour, 10);
            } else {
              hourNumber = index;
              hour = hourNumber.toString().padStart(2, '0');
            }

            return {
              ...stat,
              date: stat.hour || `${hour}:00`,
              timeRange: `${hour.padStart(2, '0')}:00-${hour.padStart(2, '0')}:59`,
              _hour: hourNumber
            };
          })
          .sort((a, b) => a._hour - b._hour)
          .map(({ _hour, ...rest }) => rest),
        daily_data: weekDailyData // Add daily data for the week
      };

      setWeeklyData(prev => ({
        ...prev,
        [idx]: processedData
      }))
    } catch (error) {
      console.error('Error loading weekly data:', error)
    }
  }

  const handleWeekClick = (weekData, idx) => {
    console.log('Week clicked:', { weekData, idx, expandedWeek })
    
    if (expandedWeek === idx) {
      console.log('Collapsing week:', idx)
      setExpandedWeek(null) // Collapse if already expanded
    } else {
      console.log('Expanding week:', idx)
      setExpandedWeek(idx) // Expand new week
      if (!weeklyData[idx]) {
        console.log('Loading data for week:', idx)
        loadWeeklyData(weekData, idx) // Load data if not already loaded
      } else {
        console.log('Data already loaded for week:', idx)
      }
    }
  }

  // ===================== MONTHLY EXPANSION =====================

  const loadMonthlyData = async (monthData, idx) => {
    try {
      // Get the month name and year from the monthData.date
      const monthKey = monthData.date // e.g., "Jan 2025"
      
      // Find all daily stats that belong to this month
      const stats = data.daily_stats || []
      const monthDailyData = stats.filter(day => {
        const dateParts = day.date.split(' ')
        // Format is "Mon, 06 Jan 2025" -> ["Mon,", "06", "Jan", "2025"]
        const dayMonth = `${dateParts[2]} ${dateParts[3]}` // "Jan 2025"
        return dayMonth === monthKey
      })
      
      // Get date range for the month
      const startDate = monthDailyData[0]?.date
      const endDate = monthDailyData[monthDailyData.length - 1]?.date
      
      if (!startDate || !endDate) {
        console.error('Could not determine date range for month:', monthKey)
        return
      }
      
      const response = await analyticsAPI.getHourlyDataRange(projectId, startDate, endDate)
      
      console.log('Loading monthly data:', {
        idx,
        monthKey,
        startDate,
        endDate,
        monthDailyData: monthDailyData.length,
        totalStats: stats.length
      })
      
      // Process hourly data for the month
      const processedData = {
        ...response.data,
        hourly_stats: response.data.hourly_stats
          .map((stat, index) => {
            let hour = '00';
            let hourNumber = 0;
            
            if (stat.hour) {
              if (stat.hour.includes(':')) {
                hour = stat.hour.split(':')[0];
              } else {
                hour = stat.hour;
              }
              hourNumber = parseInt(hour, 10);
            } else {
              hourNumber = index;
              hour = hourNumber.toString().padStart(2, '0');
            }

            return {
              ...stat,
              date: stat.hour || `${hour}:00`,
              timeRange: `${hour.padStart(2, '0')}:00-${hour.padStart(2, '0')}:59`,
              _hour: hourNumber
            };
          })
          .sort((a, b) => a._hour - b._hour)
          .map(({ _hour, ...rest }) => rest),
        daily_data: monthDailyData // Add daily data for the month
      };

      setMonthlyData(prev => ({
        ...prev,
        [idx]: processedData
      }))
    } catch (error) {
      console.error('Error loading monthly data:', error)
    }
  }

  const handleMonthClick = (monthData, idx) => {
    console.log('Month clicked:', { monthData, idx, expandedMonth })
    
    if (expandedMonth === idx) {
      console.log('Collapsing month:', idx)
      setExpandedMonth(null) // Collapse if already expanded
    } else {
      console.log('Expanding month:', idx)
      setExpandedMonth(idx) // Expand new month
      if (!monthlyData[idx]) {
        console.log('Loading data for month:', idx)
        loadMonthlyData(monthData, idx) // Load data if not already loaded
      } else {
        console.log('Data already loaded for month:', idx)
      }
    }
  }

  // ===================== NAVIGATION =====================

  const handleDateClick = (day, index) => {
    let dateParam = day.date
    let navigationState = {}

    if (period === 'weekly') {
      // For weekly view, expand instead of navigate
      handleWeekClick(day, index)
      return
    } else if (period === 'monthly') {
      // For monthly view, expand instead of navigate
      handleMonthClick(day, index)
      return
    } else {
      navigationState = { period, dateRange, currentPage }
    }

    navigate(
      `/dashboard/project/${projectId}/hourly/${encodeURIComponent(dateParam)}`,
      { state: navigationState }
    )
  }

  return (
    <>
      <div className="header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
        <h1 style={{ margin: 0 }}>Summary</h1>
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
        <div className="chart-container" style={{ marginBottom: '30px' }}>
          <div className="controls-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '10px 20px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <select
                value={period}
                onChange={(e) => {
                  console.log(' Period changing to:', e.target.value)
                  setPeriod(e.target.value)
                  setShowPeriodDropdown(false)
                  setCurrentPage(0)
                }}
                style={{
                  padding: '8px 40px 8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#1e40af',
                  color: 'white',
                  fontWeight: '500',
                  fontSize: '13px',
                  minWidth: '120px',
                  cursor: 'pointer',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none'
                }}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setCurrentPage(0)
                  }}
                  disabled={isFirstPage}
                  style={{
                    padding: '8px 12px',
                    background: isFirstPage ? '#64748b' : '#1e40af',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isFirstPage ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    opacity: isFirstPage ? 0.6 : 1,
                    transition: 'all 0.2s ease',
                    userSelect: 'none',
                    outline: 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isFirstPage) {
                      e.currentTarget.style.background = '#1d4ed8'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isFirstPage) {
                      e.currentTarget.style.background = '#1e40af'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }
                  }}
                  title="First page"
                >«</button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (!isFirstPage) setCurrentPage(currentPage - 1)
                  }}
                  disabled={isFirstPage}
                  style={{
                    padding: '8px 12px',
                    background: isFirstPage ? '#64748b' : '#1e40af',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isFirstPage ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    opacity: isFirstPage ? 0.6 : 1,
                    transition: 'all 0.2s ease',
                    userSelect: 'none',
                    outline: 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isFirstPage) {
                      e.currentTarget.style.background = '#1d4ed8'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isFirstPage) {
                      e.currentTarget.style.background = '#1e40af'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }
                  }}
                  title="Previous"
                >‹</button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (!isLastPage) setCurrentPage(currentPage + 1)
                  }}
                  disabled={isLastPage}
                  style={{
                    padding: '8px 12px',
                    background: isLastPage ? '#64748b' : '#1e40af',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isLastPage ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    opacity: isLastPage ? 0.6 : 1,
                    transition: 'all 0.2s ease',
                    userSelect: 'none',
                    outline: 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLastPage) {
                      e.currentTarget.style.background = '#1d4ed8'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLastPage) {
                      e.currentTarget.style.background = '#1e40af'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }
                  }}
                  title="Next"
                >›</button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (!isLastPage) setCurrentPage(totalPages - 1)
                  }}
                  disabled={isLastPage}
                  style={{
                    padding: '8px 12px',
                    background: isLastPage ? '#64748b' : '#1e40af',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isLastPage ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    opacity: isLastPage ? 0.6 : 1,
                    transition: 'all 0.2s ease',
                    userSelect: 'none',
                    outline: 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLastPage) {
                      e.currentTarget.style.background = '#1d4ed8'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLastPage) {
                      e.currentTarget.style.background = '#1e40af'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }
                  }}
                  title="Last page"
                >»</button>
              </div>
              <div className="date-range-dropdown" style={{ position: 'relative', display: 'inline-block' }}>
                <div
                  onClick={() => setShowDateRangeDropdown(!showDateRangeDropdown)}
                  style={{
                    padding: '8px 40px 8px 16px',
                    background: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '500',
                    minWidth: '160px',
                    position: 'relative',
                    userSelect: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Last {dateRange} Days
                </div>
                <div
                  style={{
                    position: 'absolute',
                    right: '0',
                    top: '0',
                    bottom: '0',
                    width: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#475569',
                    fontSize: '12px',
                    borderRadius: '0 6px 6px 0',
                    transition: 'background 0.2s',
                    pointerEvents: 'none'
                  }}
                >
                  ▼
                </div>
                {showDateRangeDropdown && (
                  <>
                    <div
                      onClick={() => setShowDateRangeDropdown(false)}
                      style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 999
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      marginTop: '4px',
                      background: 'white',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      minWidth: '160px',
                      zIndex: 1000,
                      overflow: 'hidden'
                    }}>
                      {[30].map((days) => (
                        <div
                          key={days}
                          onClick={() => {
                            setDateRange(days)
                            setShowDateRangeDropdown(false)
                          }}
                          style={{
                            padding: '10px 16px',
                            cursor: 'pointer',
                            background: dateRange === days ? '#eff6ff' : 'white',
                            color: dateRange === days ? '#1e40af' : '#1e293b',
                            fontWeight: dateRange === days ? '600' : '500',
                            fontSize: '13px',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (dateRange !== days) e.currentTarget.style.background = '#f8fafc'
                          }}
                          onMouseLeave={(e) => {
                            if (dateRange !== days) e.currentTarget.style.background = 'white'
                          }}
                        >
                          Last {days} Days
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '15px', fontSize: '13px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showPageViews}
                  onChange={(e) => setShowPageViews(e.target.checked)}
                  style={{ accentColor: '#10b981', cursor: 'pointer' }}
                />
                <span style={{ color: '#475569' }}>Page Views</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showUniqueVisits}
                  onChange={(e) => setShowUniqueVisits(e.target.checked)}
                  style={{ accentColor: '#3b82f6', cursor: 'pointer' }}
                />
                <span style={{ color: '#475569' }}>Unique Visits</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showReturningVisits}
                  onChange={(e) => setShowReturningVisits(e.target.checked)}
                  style={{ accentColor: '#f59e0b', cursor: 'pointer' }}
                />
                <span style={{ color: '#475569' }}>Returning Visits</span>
              </label>
            </div>
          </div>

          <div style={{ position: 'relative', padding: '20px 0' }} key={`page-${currentPage}-period-${period}`}>
            <div style={{
              borderBottom: '2px solid #e2e8f0',
              paddingBottom: '20px',
              marginBottom: '8px'
            }}>
              <BarChart
                displayData={period === 'daily' ? displayData.map(day => {
                  // Convert "Wed, 10 Dec 2025" to "10-12-2025" for chart only
                  const dateParts = day.date.split(' ')
                  // Format is "Wed, 06 Jan 2025" -> ["Wed,", "06", "Jan", "2025"]
                  const dayNum = dateParts[1].replace(',', '') // Get day number
                  const monthName = dateParts[2] // Get month name
                  const year = dateParts[3] // Get year
                  
                  // Convert month name to number
                  const monthMap = {
                    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
                    'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
                    'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
                  }
                  const monthNum = monthMap[monthName] || '01'
                  
                  // Format as DD-MM-YYYY
                  const formattedDate = `${dayNum}-${monthNum}-${year}`
                  
                  return {
                    ...day,
                    date: formattedDate
                  }
                }) : period === 'weekly' ? displayData : displayData}
                showPageViews={showPageViews}
                showUniqueVisits={showUniqueVisits}
                showReturningVisits={showReturningVisits}
                period={period}
                maxValue={chartMax}
                stepSize={chartStep}
                onDateClick={handleDateClick}
              />
            </div>
            <div className="pagination-container" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '16px'
            }}>
              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>
                {displayData[0]?.date.split(',')[0]}
              </span>

              <span style={{
                padding: '6px 16px',
                fontSize: '12px',
                color: '#64748b',
                fontWeight: '600',
              }}>
                Page {currentPage + 1} of {totalPages}
              </span>

              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>
                {displayData[displayData.length - 1]?.date.split(',')[0]}
              </span>
            </div>
          </div>
        </div>

        <div className="stats-summary-grid">
          <div className="stat-card">
            <h3>Average {period === 'daily' ? 'Daily' : period === 'weekly' ? 'Weekly' : 'Monthly'} Page Views</h3>
            <div className="value">{periodAverages.page_views}</div>
          </div>
          <div className="stat-card">
            <h3>Average {period === 'daily' ? 'Daily' : period === 'weekly' ? 'Weekly' : 'Monthly'} Unique Visits</h3>
            <div className="value">{periodAverages.unique_visits}</div>
          </div>
          <div className="stat-card">
            <h3>Average {period === 'daily' ? 'Daily' : period === 'weekly' ? 'Weekly' : 'Monthly'} First Time Visits</h3>
            <div className="value">{periodAverages.first_time_visits}</div>
          </div>
          <div className="stat-card">
            <h3>Average {period === 'daily' ? 'Daily' : period === 'weekly' ? 'Weekly' : 'Monthly'} Returning Visits</h3>
            <div className="value">{periodAverages.returning_visits}</div>
          </div>
        </div>

        <div className="chart-container">
          <table style={{ width: '100%' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#475569', fontWeight: '600' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'center', color: '#475569', fontWeight: '600' }}>Page Views</th>
                <th style={{ padding: '12px', textAlign: 'center', color: '#475569', fontWeight: '600' }}>Unique Visits</th>
                <th style={{ padding: '12px', textAlign: 'center', color: '#475569', fontWeight: '600' }}>First Time Visits</th>
                <th style={{ padding: '12px', textAlign: 'center', color: '#475569', fontWeight: '600' }}>Returning Visits</th>
              </tr>
            </thead>
            <tbody>
              {period === 'daily' ? [...displayData].reverse().map((day, idx) => (
                <React.Fragment key={`${day.date}-${idx}`}>
                  <tr
                    style={{
                      borderBottom: '1px solid #e2e8f0',
                      transition: 'all 0.2s ease',
                      background: (period === 'weekly' && expandedWeek === idx) || (period === 'monthly' && expandedMonth === idx) ? '#f8fafc' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!((period === 'weekly' && expandedWeek === idx) || (period === 'monthly' && expandedMonth === idx))) {
                        e.currentTarget.style.background = '#f8fafc'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!((period === 'weekly' && expandedWeek === idx) || (period === 'monthly' && expandedMonth === idx))) {
                        e.currentTarget.style.background = 'transparent'
                      }
                    }}
                  >
                    <td data-label="Date"
                      onClick={(e) => {
                        console.log('Date clicked:', { day, idx, period })
                        handleDateClick(day, displayData.length - 1 - idx) // Adjust index for reversed data
                      }}
                      style={{
                        padding: '12px',
                        color: '#1e40af',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        userSelect: 'none',
                        pointerEvents: 'auto',
                        zIndex: 10,
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        if (!((period === 'weekly' && expandedWeek === idx) || (period === 'monthly' && expandedMonth === idx))) {
                          
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!((period === 'weekly' && expandedWeek === idx) || (period === 'monthly' && expandedMonth === idx))) {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.transform = 'scale(1)'
                        }
                      }}
                    >
                      {(period === 'weekly' || period === 'monthly') && (
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                          {(period === 'weekly' ? expandedWeek : expandedMonth) === idx ? '▼' : '▶'}
                        </span>
                      )}
                      {day.date}
                    </td>
                    <td data-label="Page Views" style={{ padding: '12px', textAlign: 'center' }}>{day.page_views}</td>
                    <td data-label="Unique Visits" style={{ padding: '12px', textAlign: 'center' }}>{day.unique_visits}</td>
                    <td data-label="First Time Visits" style={{ padding: '12px', textAlign: 'center' }}>{day.first_time_visits}</td>
                    <td data-label="Returning Visits" style={{ padding: '12px', textAlign: 'center' }}>{day.returning_visits}</td>
                  </tr>
                  
                  {/* Weekly Expansion Row */}
                  {period === 'weekly' && expandedWeek === idx && weeklyData[idx] && (
                    <tr>
                      <td colSpan="5" style={{ padding: '0', background: '#f8fafc' }}>
                        <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', margin: '10px', background: 'white' }}>
                          
                          
                          
                          {/* Daily Data for the Week */}
                          <div style={{ margin: '0 0 0 0' }}>
                            <h5 style={{ margin: '0 0 10px 0', color: '#374151', fontSize: '13px', fontWeight: '600' }}>
                             Daily Data for This Week
                            </h5>
                            <table style={{ width: '100%', fontSize: '12px', border: '1px solid #f1f5f9', borderRadius: '6px' }}>
                              <thead>
                                <tr style={{ background: '#f8fafc' }}>
                                  <th style={{ padding: '8px', textAlign: 'left', color: '#475569', fontWeight: '600' }}>Date</th>
                                  <th style={{ padding: '8px', textAlign: 'center', color: '#475569', fontWeight: '600' }}>Page Views</th>
                                  <th style={{ padding: '8px', textAlign: 'center', color: '#475569', fontWeight: '600' }}>Unique Visits</th>
                                  <th style={{ padding: '8px', textAlign: 'center', color: '#475569', fontWeight: '600' }}>First Time Visits</th>
                                  <th style={{ padding: '8px', textAlign: 'center', color: '#475569', fontWeight: '600' }}>Returning Visits</th>
                                </tr>
                              </thead>
                              <tbody>
                                {weeklyData[idx].daily_data.map((dailyData, dailyIdx) => (
                                  <tr key={dailyIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ 
                                      padding: '8px', 
                                      color: '#1e40af', 
                                      fontWeight: '500',
                                      cursor: 'pointer',
                                      
                                      transition: 'all 0.2s ease'
                                    }}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        console.log('Individual date clicked:', dailyData.date, dailyIdx)
                                        
                                        // Navigate to HourlyView with individual date data
                                        const navigationState = {
                                          period: period, // Send current period, not always daily
                                          dateRange: dateRange,
                                          currentPage: currentPage,
                                          selectedDate: dailyData.date,
                                          selectedDateData: {
                                            page_views: dailyData.page_views,
                                            unique_visits: dailyData.unique_visits,
                                            first_time_visits: dailyData.first_time_visits,
                                            returning_visits: dailyData.returning_visits
                                          }
                                        }
                                        
                                        navigate(
                                          `/dashboard/project/${projectId}/hourly/${encodeURIComponent(dailyData.date)}`,
                                          { state: navigationState }
                                        )
                                      }}
                                      onMouseEnter={(e) => {
                                       
                                        
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent'
                                        e.currentTarget.style.transform = 'scale(1)'
                                      }}
                                    >
                                      {dailyData.date}
                                    </td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>{dailyData.page_views}</td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>{dailyData.unique_visits}</td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>{dailyData.first_time_visits}</td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>{dailyData.returning_visits}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  
                  {/* Monthly Expansion Row */}
                  {period === 'monthly' && expandedMonth === idx && monthlyData[idx] && (
                    <tr>
                      <td colSpan="5" style={{ padding: '0', background: '#f8fafc' }}>
                        <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', margin: '10px', background: 'white' }}>
                          
                          
                          
                          {/* Daily Data for the Month */}
                          <div style={{ margin: '0 0 0 0' }}>
                            <h5 style={{ margin: '0 0 10px 0', color: '#374151', fontSize: '13px', fontWeight: '600' }}>
                             Daily Data for This Month
                            </h5>
                            <table style={{ width: '100%', fontSize: '12px', border: '1px solid #f1f5f9', borderRadius: '6px' }}>
                              <thead>
                                <tr style={{ background: '#f8fafc' }}>
                                  <th style={{ padding: '8px', textAlign: 'left', color: '#475569', fontWeight: '600' }}>Date</th>
                                  <th style={{ padding: '8px', textAlign: 'center', color: '#475569', fontWeight: '600' }}>Page Views</th>
                                  <th style={{ padding: '8px', textAlign: 'center', color: '#475569', fontWeight: '600' }}>Unique Visits</th>
                                  <th style={{ padding: '8px', textAlign: 'center', color: '#475569', fontWeight: '600' }}>First Time Visits</th>
                                  <th style={{ padding: '8px', textAlign: 'center', color: '#475569', fontWeight: '600' }}>Returning Visits</th>
                                </tr>
                              </thead>
                              <tbody>
                                {monthlyData[idx].daily_data.map((dailyData, dailyIdx) => (
                                  <tr key={dailyIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ 
                                      padding: '8px', 
                                      color: '#1e40af', 
                                      fontWeight: '500',
                                      cursor: 'pointer',
                                      
                                      transition: 'all 0.2s ease'
                                    }}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        console.log('Individual date clicked:', dailyData.date, dailyIdx)
                                        
                                        // Navigate to HourlyView with individual date data
                                        const navigationState = {
                                          period: period, // Send current period, not always daily
                                          dateRange: dateRange,
                                          currentPage: currentPage,
                                          selectedDate: dailyData.date,
                                          selectedDateData: {
                                            page_views: dailyData.page_views,
                                            unique_visits: dailyData.unique_visits,
                                            first_time_visits: dailyData.first_time_visits,
                                            returning_visits: dailyData.returning_visits
                                          }
                                        }
                                        
                                        navigate(
                                          `/dashboard/project/${projectId}/hourly/${encodeURIComponent(dailyData.date)}`,
                                          { state: navigationState }
                                        )
                                      }}
                                      onMouseEnter={(e) => {
                                       
                                        
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent'
                                        e.currentTarget.style.transform = 'scale(1)'
                                      }}
                                    >
                                      {dailyData.date}
                                    </td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>{dailyData.page_views}</td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>{dailyData.unique_visits}</td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>{dailyData.first_time_visits}</td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>{dailyData.returning_visits}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )) : displayData.map((day, idx) => (
                <React.Fragment key={`${day.date}-${idx}`}>
                  <tr
                    style={{
                      borderBottom: '1px solid #e2e8f0',
                      transition: 'all 0.2s ease',
                      background: (period === 'weekly' && expandedWeek === idx) || (period === 'monthly' && expandedMonth === idx) ? '#f8fafc' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!((period === 'weekly' && expandedWeek === idx) || (period === 'monthly' && expandedMonth === idx))) {
                        e.currentTarget.style.background = '#f8fafc'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!((period === 'weekly' && expandedWeek === idx) || (period === 'monthly' && expandedMonth === idx))) {
                        e.currentTarget.style.background = 'transparent'
                      }
                    }}
                  >
                    <td data-label="Date"
                      onClick={(e) => {
                        console.log('Date clicked:', { day, idx, period })
                        handleDateClick(day, idx)
                      }}
                      style={{
                        padding: '12px',
                        color: '#1e40af',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        userSelect: 'none',
                        pointerEvents: 'auto',
                        zIndex: 10,
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        if (!((period === 'weekly' && expandedWeek === idx) || (period === 'monthly' && expandedMonth === idx))) {
                          
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!((period === 'weekly' && expandedWeek === idx) || (period === 'monthly' && expandedMonth === idx))) {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.transform = 'scale(1)'
                        }
                      }}
                    >
                      {(period === 'weekly' || period === 'monthly') && (
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                          {(period === 'weekly' ? expandedWeek : expandedMonth) === idx ? '▼' : '▶'}
                        </span>
                      )}
                      {day.date}
                    </td>
                    <td data-label="Page Views" style={{ padding: '12px', textAlign: 'center' }}>{day.page_views}</td>
                    <td data-label="Unique Visits" style={{ padding: '12px', textAlign: 'center' }}>{day.unique_visits}</td>
                    <td data-label="First Time Visits" style={{ padding: '12px', textAlign: 'center' }}>{day.first_time_visits}</td>
                    <td data-label="Returning Visits" style={{ padding: '12px', textAlign: 'center' }}>{day.returning_visits}</td>
                  </tr>
                  
                  {/* Weekly Expansion Row */}
                  {period === 'weekly' && expandedWeek === idx && weeklyData[idx] && (
                    <tr>
                      <td colSpan="5" style={{ padding: '0', background: '#f8fafc' }}>
                        <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', margin: '10px', background: 'white' }}>
                          
                          
                          
                          {/* Daily Data for the Week */}
                          <div style={{ margin: '0 0 0 0' }}>
                            <h5 style={{ margin: '0 0 10px 0', color: '#374151', fontSize: '13px', fontWeight: '600' }}>
                             Daily Data for This Week
                            </h5>
                            <table style={{ width: '100%', fontSize: '12px', border: '1px solid #f1f5f9', borderRadius: '6px' }}>
                              <thead>
                                <tr style={{ background: '#f8fafc' }}>
                                  <th style={{ padding: '8px', textAlign: 'left', color: '#475569', fontWeight: '600' }}>Date</th>
                                  <th style={{ padding: '8px', textAlign: 'center', color: '#475569', fontWeight: '600' }}>Page Views</th>
                                  <th style={{ padding: '8px', textAlign: 'center', color: '#475569', fontWeight: '600' }}>Unique Visits</th>
                                  <th style={{ padding: '8px', textAlign: 'center', color: '#475569', fontWeight: '600' }}>First Time Visits</th>
                                  <th style={{ padding: '8px', textAlign: 'center', color: '#475569', fontWeight: '600' }}>Returning Visits</th>
                                </tr>
                              </thead>
                              <tbody>
                                {weeklyData[idx].daily_data.map((dailyData, dailyIdx) => (
                                  <tr key={dailyIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ 
                                      padding: '8px', 
                                      color: '#1e40af', 
                                      fontWeight: '500',
                                      cursor: 'pointer',
                                      
                                      transition: 'all 0.2s ease'
                                    }}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        console.log('Individual date clicked:', dailyData.date, dailyIdx)
                                        
                                        // Navigate to HourlyView with individual date data
                                        const navigationState = {
                                          period: period, // Send current period, not always daily
                                          dateRange: dateRange,
                                          currentPage: currentPage,
                                          selectedDate: dailyData.date,
                                          selectedDateData: {
                                            page_views: dailyData.page_views,
                                            unique_visits: dailyData.unique_visits,
                                            first_time_visits: dailyData.first_time_visits,
                                            returning_visits: dailyData.returning_visits
                                          }
                                        }
                                        
                                        navigate(
                                          `/dashboard/project/${projectId}/hourly/${encodeURIComponent(dailyData.date)}`,
                                          { state: navigationState }
                                        )
                                      }}
                                      onMouseEnter={(e) => {
                                       
                                        
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent'
                                        e.currentTarget.style.transform = 'scale(1)'
                                      }}
                                    >
                                      {dailyData.date}
                                    </td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>{dailyData.page_views}</td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>{dailyData.unique_visits}</td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>{dailyData.first_time_visits}</td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>{dailyData.returning_visits}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  
                  {/* Monthly Expansion Row */}
                  {period === 'monthly' && expandedMonth === idx && monthlyData[idx] && (
                    <tr>
                      <td colSpan="5" style={{ padding: '0', background: '#f8fafc' }}>
                        <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', margin: '10px', background: 'white' }}>
                          
                          
                          
                          {/* Daily Data for the Month */}
                          <div style={{ margin: '0 0 0 0' }}>
                            <h5 style={{ margin: '0 0 10px 0', color: '#374151', fontSize: '13px', fontWeight: '600' }}>
                             Daily Data for This Month
                            </h5>
                            <table style={{ width: '100%', fontSize: '12px', border: '1px solid #f1f5f9', borderRadius: '6px' }}>
                              <thead>
                                <tr style={{ background: '#f8fafc' }}>
                                  <th style={{ padding: '8px', textAlign: 'left', color: '#475569', fontWeight: '600' }}>Date</th>
                                  <th style={{ padding: '8px', textAlign: 'center', color: '#475569', fontWeight: '600' }}>Page Views</th>
                                  <th style={{ padding: '8px', textAlign: 'center', color: '#475569', fontWeight: '600' }}>Unique Visits</th>
                                  <th style={{ padding: '8px', textAlign: 'center', color: '#475569', fontWeight: '600' }}>First Time Visits</th>
                                  <th style={{ padding: '8px', textAlign: 'center', color: '#475569', fontWeight: '600' }}>Returning Visits</th>
                                </tr>
                              </thead>
                              <tbody>
                                {monthlyData[idx].daily_data.map((dailyData, dailyIdx) => (
                                  <tr key={dailyIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ 
                                      padding: '8px', 
                                      color: '#1e40af', 
                                      fontWeight: '500',
                                      cursor: 'pointer',
                                      
                                      transition: 'all 0.2s ease'
                                    }}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        console.log('Individual date clicked:', dailyData.date, dailyIdx)
                                        
                                        // Navigate to HourlyView with individual date data
                                        const navigationState = {
                                          period: period, // Send current period, not always daily
                                          dateRange: dateRange,
                                          currentPage: currentPage,
                                          selectedDate: dailyData.date,
                                          selectedDateData: {
                                            page_views: dailyData.page_views,
                                            unique_visits: dailyData.unique_visits,
                                            first_time_visits: dailyData.first_time_visits,
                                            returning_visits: dailyData.returning_visits
                                          }
                                        }
                                        
                                        navigate(
                                          `/dashboard/project/${projectId}/hourly/${encodeURIComponent(dailyData.date)}`,
                                          { state: navigationState }
                                        )
                                      }}
                                      onMouseEnter={(e) => {
                                       
                                        
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent'
                                        e.currentTarget.style.transform = 'scale(1)'
                                      }}
                                    >
                                      {dailyData.date}
                                    </td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>{dailyData.page_views}</td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>{dailyData.unique_visits}</td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>{dailyData.first_time_visits}</td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>{dailyData.returning_visits}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <style>
        {`
          .stats-summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }
          .stat-card {
            background: white;
            padding: 24px;
            border-radius: 12px !important;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            transition: all 0.2s ease;
            border: 1px solid #e2e8f0;
          }
          .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          .stat-card h3 {
             margin: 0 0 12px 0 !important;
             font-size: 14px !important;
             color: #64748b !important;
             font-weight: 600 !important;
          }
          .stat-card .value {
             font-size: 32px !important;
             font-weight: 700 !important;
             color: #1e40af !important;
          }

          @media (max-width: 768px) {
            .stats-summary-grid {
              display: grid !important;
              grid-template-columns: 1fr 1fr !important;
              gap: 12px !important;
              margin-bottom: 20px !important;
            }
            .stat-card {
              padding: 16px !important;
              text-align: center !important;
            }
            .stat-card .value {
              font-size: 22px !important;
              margin-top: 4px !important;
            }
            .stat-card h3 {
              font-size: 11px !important;
              min-height: 32px !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              line-height: 1.2 !important;
            }
            .chart-container {
              overflow-x: hidden !important;
              padding: 0 !important;
              background: transparent !important;
              box-shadow: none !important;
              margin-bottom: 20px !important;
              width: 100% !important;
              margin: 0 !important;
            }
            .chart-container > div:last-child {
                height: 280px !important; /* Adjust BarChart height for mobile */
                padding: 10px !important;
            }
            table, thead, tbody, th, td, tr {
                display: block !important;
                width: 100% !important;
            }
            thead tr {
                display: none !important;
            }
            tr {
                margin-bottom: 15px !important;
                background: white !important;
                border-radius: 12px !important;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
                padding: 8px !important;
                border: 1px solid #e2e8f0 !important;
            }
            td {
                text-align: right !important;
                padding: 12px 15px !important;
                position: relative !important;
                border-bottom: 1px solid #f1f5f9 !important;
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                font-size: 13px !important;
            }
            td:last-child {
                border-bottom: none !important;
            }
            td:before {
                content: attr(data-label);
                font-weight: 600;
                color: #64748b;
                font-size: 12px;
                text-align: left !important;
                margin-right: 15px !important;
            }
            .content {
               padding: 12px !important;
               overflow-x: hidden !important;
            }
            .header {
              padding: 20px 15px 10px 15px !important;
            }
            .header h1 {
              font-size: 22px !important;
              margin: 0 !important;
            }
            .controls-wrapper {
              display: flex !important;
              flex-direction: column !important;
              align-items: stretch !important;
              gap: 15px !important;
              padding: 15px !important;
              background: #ffffff !important;
              border-bottom: 1px solid #e2e8f0 !important;
              border-radius: 12px !important;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
              margin-bottom: 20px !important;
            }
            .controls-wrapper > div:first-child {
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                order: 2 !important;
                gap: 15px !important;
                width: 100% !important;
            }
            .controls-wrapper > div:first-child > div {
                width: 100% !important;
                display: flex !important;
                justify-content: center !important;
                margin: 0 !important;
                gap: 5px !important;
            }
            .controls-wrapper .period-dropdown, 
            .controls-wrapper .date-range-dropdown {
                width: 100% !important;
                max-width:166px !important;
            }
            .controls-wrapper .period-dropdown > div,
            .controls-wrapper .date-range-dropdown > div {
              
                text-align: center !important;
                padding: 12px !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
            }
            .controls-wrapper > div:last-child {
                display: flex !important;
                flex-wrap: wrap !important;
                justify-content: center !important;
                gap: 12px !important;
                order: 1 !important;
                padding-bottom: 12px !important;
                border-bottom: 1px dashed #e2e8f0 !important;
            }
            .chart-container > div:last-child {
                height: 350px !important;
                padding: 15px 0 !important;
            }
            .pagination-container {
               margin-top: 20px !important;
               justify-content: center !important;
               gap: 15px !important;
            }
          }
          @media (max-width: 480px) {
            .stats-summary-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </>
  )
}

export default Summary