import React, { useState, useEffect } from 'react'
import { Skeleton } from '@mui/material'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { analyticsAPI, projectsAPI } from '../../api/api'
import BarChart from '../../components/BarChart'
import { Globe } from 'lucide-react'

function HourlyView({ projectId }) {
  const { date } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPageViews, setShowPageViews] = useState(true)
  const [showUniqueVisits, setShowUniqueVisits] = useState(true)
  const [showReturningVisits, setShowReturningVisits] = useState(true)
  const [project, setProject] = useState(null)

  // Get navigation state from Summary component
  const navigationState = location.state || {}
  const { period, dateRange, weekData, actualStartDate, actualEndDate, isMonthlyRange, monthData } = navigationState

  useEffect(() => {
    loadHourlyData()
    if (projectId) {
      loadProjectInfo()
    }
  }, [projectId, date, actualStartDate, actualEndDate])

  const loadProjectInfo = async () => {
    try {
      const response = await projectsAPI.getOne(projectId)
      setProject(response.data)
    } catch (error) {
      console.error('Error loading project info:', error)
    }
  }

  const loadHourlyData = async () => {
    try {
      setLoading(true)

      let response
      
      // Use actual date range if available (for weekly/monthly summaries)
      if (actualStartDate && actualEndDate) {
        // For weekly/monthly data, use new date range API endpoint
        console.log('Loading hourly data for date range:', actualStartDate, 'to', actualEndDate)
        response = await analyticsAPI.getHourlyDataRange(projectId, actualStartDate, actualEndDate)
      } else {
        // For single day data
        console.log('Loading hourly data for single date:', date)
        response = await analyticsAPI.getHourlyData(projectId, date)
      }

      // Add caching key for consistency
      const cacheKey = `${projectId}-${date}-${actualStartDate || ''}-${actualEndDate || ''}`
      
      // Always fetch fresh data (remove caching to fix inconsistency)
      sessionStorage.removeItem(`hourly_${cacheKey}`)
      
      console.log('=== API CALL DEBUG ===')
      console.log('Date:', date)
      console.log('Response:', response.data)
      console.log('======================')
      
      // Use API response directly - no processing
      const processedData = response.data

      setData(processedData)

      // Debugging: Verify totals match hourly stats
      if (processedData && processedData.hourly_stats && processedData.totals) {
        const sumPageViews = processedData.hourly_stats.reduce((sum, hour) => sum + hour.page_views, 0);
        const sumUniqueVisits = processedData.hourly_stats.reduce((sum, hour) => sum + hour.unique_visits, 0);
        const sumFirstTimeVisits = processedData.hourly_stats.reduce((sum, hour) => sum + hour.first_time_visits, 0);
        const sumReturningVisits = processedData.hourly_stats.reduce((sum, hour) => sum + hour.returning_visits, 0);

        console.log("--- Hourly Data Verification ---");
        console.log("API Totals:", processedData.totals);
        console.log("Sum of hourly_stats Page Views:", sumPageViews);
        console.log("Sum of hourly_stats Unique Visits:", sumUniqueVisits);
        console.log("Sum of hourly_stats First Time Visits:", sumFirstTimeVisits);
        console.log("Sum of hourly_stats Returning Visits:", sumReturningVisits);
        console.log("--------------------------------");
      }
    } catch (error) {
      console.error('Error loading hourly data:', error)

      // Fallback to sample data if API fails
      const hourlyData = generateSampleHourlyData(actualStartDate && actualEndDate ? `${actualStartDate} - ${actualEndDate}` : date)
      setData(hourlyData)
    } finally {
      setLoading(false)
    }
  }

  // Handle back navigation with filter state
  const handleBackToSummary = () => {
    console.log('Back button clicked, navigation state:', navigationState)
    
    // Preserve filter state when going back - use original currentPage from navigation state
    const originalCurrentPage = navigationState.currentPage || 0
    const state = period && dateRange ? { period, dateRange, currentPage: originalCurrentPage } : { currentPage: originalCurrentPage }
    
    console.log('Navigating back to summary with state:', state)
    
    navigate(`/dashboard/project/${projectId}/summary`, { state })
  }

  // Date navigation functions
  const parseDate = (dateString) => {
    // Handle different date formats
    const formats = [
      "%a, %d %b %Y",  // "Mon, 08 Dec 2024"
      "%Y-%m-%d",      // "2024-12-16"
      "%d %b %Y",      // "16 Dec 2024"
      "%d/%m/%Y",      // "16/12/2024"
      "%B %d, %Y",     // "December 16, 2024"
      "%b %d, %Y"      // "Dec 16, 2024"
    ]
    
    for (const fmt of formats) {
      try {
        // Note: JavaScript Date parsing is different from Python
        // We'll use a more flexible approach
        if (dateString.includes(',')) {
          // Format like "Mon, 08 Dec 2024"
          const parts = dateString.split(' ')
          if (parts.length === 4) {
            const day = parseInt(parts[1].replace(',', ''))
            const month = parts[2]
            const year = parseInt(parts[3])
            const monthMap = {
              'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
              'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
            }
            return new Date(year, monthMap[month] || 0, day)
          }
        } else if (dateString.includes('-')) {
          // Format like "2024-12-16"
          const parts = dateString.split('-')
          if (parts.length === 3) {
            return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
          }
        } else if (dateString.includes('/')) {
          // Format like "16/12/2024"
          const parts = dateString.split('/')
          if (parts.length === 3) {
            return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))
          }
        }
      } catch (error) {
        continue
      }
    }
    
    // Fallback - try to parse as is
    return new Date(dateString)
  }

  const formatDateForURL = (dateObj) => {
    // Format as "Mon, 08 Dec 2024" to match URL pattern
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    const dayName = days[dateObj.getDay()]
    const day = dateObj.getDate().toString().padStart(2, '0')
    const month = months[dateObj.getMonth()]
    const year = dateObj.getFullYear()
    
    return `${dayName}, ${day} ${month} ${year}`
  }

  const handlePreviousDate = () => {
    if (actualStartDate && actualEndDate) {
      // Handle date range navigation (weekly/monthly)
      const startDate = parseDate(actualStartDate)
      const endDate = parseDate(actualEndDate)
      
      // Calculate duration and shift back
      const durationMs = endDate - startDate
      const newStartDate = new Date(startDate.getTime() - durationMs)
      const newEndDate = new Date(endDate.getTime() - durationMs)
      
      const newStartDateStr = formatDateForURL(newStartDate)
      const newEndDateStr = formatDateForURL(newEndDate)
      
      navigate(`/dashboard/project/${projectId}/hourly/${encodeURIComponent(newStartDateStr + ' - ' + newEndDateStr)}`, {
        state: {
          ...navigationState,
          actualStartDate: newStartDateStr,
          actualEndDate: newEndDateStr
        }
      })
    } else {
      // Handle single date navigation
      const currentDate = parseDate(date)
      const previousDate = new Date(currentDate)
      previousDate.setDate(previousDate.getDate() - 1)
      
      const previousDateStr = formatDateForURL(previousDate)
      navigate(`/dashboard/project/${projectId}/hourly/${encodeURIComponent(previousDateStr)}`, {
        state: navigationState
      })
    }
  }

  const handleNextDate = () => {
    if (actualStartDate && actualEndDate) {
      // Handle date range navigation (weekly/monthly)
      const startDate = parseDate(actualStartDate)
      const endDate = parseDate(actualEndDate)
      
      // Calculate duration and shift forward
      const durationMs = endDate - startDate
      const newStartDate = new Date(startDate.getTime() + durationMs)
      const newEndDate = new Date(endDate.getTime() + durationMs)
      
      // Don't navigate to future dates
      const today = new Date()
      if (newStartDate > today) return
      
      const newStartDateStr = formatDateForURL(newStartDate)
      const newEndDateStr = formatDateForURL(newEndDate)
      
      navigate(`/dashboard/project/${projectId}/hourly/${encodeURIComponent(newStartDateStr + ' - ' + newEndDateStr)}`, {
        state: {
          ...navigationState,
          actualStartDate: newStartDateStr,
          actualEndDate: newEndDateStr
        }
      })
    } else {
      // Handle single date navigation
      const currentDate = parseDate(date)
      const nextDate = new Date(currentDate)
      nextDate.setDate(nextDate.getDate() + 1)
      
      // Don't navigate to future dates
      const today = new Date()
      if (nextDate > today) return
      
      const nextDateStr = formatDateForURL(nextDate)
      navigate(`/dashboard/project/${projectId}/hourly/${encodeURIComponent(nextDateStr)}`, {
        state: navigationState
      })
    }
  }

  const generateSampleHourlyData = (selectedDate) => {
    const hours = []
    // Generate data for all 24 hours
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, '0')
      const timeRange = `${hour}:00-${hour}:59`

      // Generate realistic sample data based on time of day
      let pageViews = 0
      let uniqueVisits = 0
      let firstTimeVisits = 0
      let returningVisits = 0

      // Distribute traffic throughout day
      if (i >= 0 && i < 5) { // Late night (12am-5am)
        pageViews = Math.floor(Math.random() * 5) + 1
      } else if (i >= 5 && i < 9) { // Early morning (5am-9am)
        pageViews = Math.floor(Math.random() * 15) + 5
      } else if (i >= 9 && i <= 17) { // Business hours (9am-5pm)
        pageViews = Math.floor(Math.random() * 30) + 10
      } else if (i > 17 && i <= 22) { // Evening (6pm-10pm)
        pageViews = Math.floor(Math.random() * 20) + 5
      } else { // Late evening (11pm)
        pageViews = Math.floor(Math.random() * 10) + 2
      }

      // Calculate other metrics based on page views
      uniqueVisits = Math.floor(pageViews * (0.5 + Math.random() * 0.3)) // 50-80% of page views
      firstTimeVisits = Math.floor(uniqueVisits * (0.6 + Math.random() * 0.3)) // 60-90% of unique visits
      returningVisits = uniqueVisits - firstTimeVisits

      // Ensure we always have at least some minimal activity
      if (pageViews > 0 && uniqueVisits === 0) uniqueVisits = 1
      if (uniqueVisits > 0 && firstTimeVisits === 0) firstTimeVisits = 1

      hours.push({
        date: `${hour}:00`,
        timeRange: `${hour}:00-${hour}:59`,
        page_views: pageViews,
        unique_visits: uniqueVisits,
        first_time_visits: firstTimeVisits,
        returning_visits: Math.max(0, returningVisits) // Ensure non-negative
      })
    }

    const totals = hours.reduce((acc, hour) => ({
      page_views: acc.page_views + hour.page_views,
      unique_visits: acc.unique_visits + hour.unique_visits,
      first_time_visits: acc.first_time_visits + hour.first_time_visits,
      returning_visits: acc.returning_visits + hour.returning_visits
    }), { page_views: 0, unique_visits: 0, first_time_visits: 0, returning_visits: 0 })

    return {
      date: selectedDate,
      hourly_stats: hours,
      totals,
      averages: {
        page_views: Math.round(totals.page_views / 24),
        unique_visits: Math.round(totals.unique_visits / 24),
        first_time_visits: Math.round(totals.first_time_visits / 24),
        returning_visits: Math.round(totals.returning_visits / 24)
      }
    }
  }

  if (loading) {
    return (
      <>
        <div className="header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', marginBottom: '24px' }}>
          <Skeleton variant="rectangular" width={140} height={40} sx={{ borderRadius: '6px' }} />
        </div>

        <div className="content">
          {/* Summary Cards Skeleton */}
          <div className="stats-summary-grid" style={{ marginBottom: '30px' }}>
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="stat-card">
                <Skeleton variant="text" width={100} height={20} sx={{ marginBottom: '8px' }} />
                <Skeleton variant="rectangular" width={60} height={40} />
              </div>
            ))}
          </div>

          {/* Hourly Chart Skeleton */}
          <div className="chart-container" style={{ marginBottom: '30px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              padding: '10px 20px',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <Skeleton variant="text" width={150} height={30} />
              <div style={{ display: 'flex', gap: '15px' }}>
                <Skeleton variant="text" width={80} height={20} />
                <Skeleton variant="text" width={80} height={20} />
                <Skeleton variant="text" width={80} height={20} />
              </div>
            </div>
            <div style={{ padding: '20px' }}>
              <Skeleton variant="rectangular" width="100%" height={300} />
            </div>
          </div>

          {/* Hourly Data Table Skeleton */}
          <div className="chart-container">
            <div style={{ padding: '10px 20px', borderBottom: '1px solid #e2e8f0', height: '50px' }}></div>
            <table style={{ width: '100%' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <th key={i} style={{ padding: '12px' }}>
                      <Skeleton variant="text" width="80%" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((row) => (
                  <tr key={row} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    {[1, 2, 3, 4, 5].map((col) => (
                      <td key={col} style={{ padding: '12px' }}>
                        <Skeleton variant="text" width="60%" sx={{ mx: 'auto' }} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    )
  }

  if (!data) {
    return (
      <div className="content">
        <div className="header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', marginBottom: '24px' }}>
          <button
            onClick={() => navigate(`/dashboard/project/${projectId}/summary`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              color: '#475569',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <ArrowLeft size={16} />
            Back to Summary
          </button>
          <h1>No Data Available</h1>
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
      </div>
    )
  }

  return (
    <>
      <div className="header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', marginBottom: '24px' }}>
        <button
          onClick={handleBackToSummary}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            color: '#475569',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#e2e8f0'
            e.currentTarget.style.borderColor = '#94a3b8'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#f1f5f9'
            e.currentTarget.style.borderColor = '#cbd5e1'
          }}
        >
          <ArrowLeft size={16} />
          Back to Summary
        </button>
        {project && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#64748b',
            fontSize: '14px',
            fontWeight: '500',
            marginTop: '8px'
          }}>
            <span>Project: {project.name}</span>
          </div>
        )}
        
        {/* Date Range Display with Navigation */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginTop: '8px'
        }}>
          {/* Previous Date Button */}
          <button
            onClick={handlePreviousDate}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 12px',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              color: '#475569',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s',
              minWidth: '40px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e2e8f0'
              e.currentTarget.style.borderColor = '#94a3b8'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f1f5f9'
              e.currentTarget.style.borderColor = '#cbd5e1'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
            title="Previous Date"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Date Display */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#1e40af',
            fontSize: '16px',
            fontWeight: '600',
            padding: '8px 16px',
            background: '#eff6ff',
            borderRadius: '6px',
            border: '1px solid #bfdbfe',
            flex: 1,
            justifyContent: 'center',
            minWidth: '200px'
          }}>
            {actualStartDate && actualEndDate ? (
              <>
                <span>Date Range:</span>
                <span>{actualStartDate} - {actualEndDate}</span>
              </>
            ) : (
              <>
                <span>Date:</span>
                <span>{date}</span>
              </>
            )}
          </div>

          {/* Next Date Button */}
          <button
            onClick={handleNextDate}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 12px',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              color: '#475569',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s',
              minWidth: '40px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e2e8f0'
              e.currentTarget.style.borderColor = '#94a3b8'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f1f5f9'
              e.currentTarget.style.borderColor = '#cbd5e1'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
            title="Next Date"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="content">
        {/* Summary Cards - Hourly Data Only */}
        <div className="stats-summary-grid">
          <div className="stat-card">
            <h3>Total Page Loads (Hourly)</h3>
            <div className="value">{data?.hourly_stats?.reduce((sum, hour) => sum + hour.page_views, 0) || 0}</div>
          </div>
          <div className="stat-card">
            <h3>Unique Visits (Hourly)</h3>
            <div className="value">{data?.hourly_stats?.reduce((sum, hour) => sum + hour.unique_visits, 0) || 0}</div>
          </div>
          <div className="stat-card">
            <h3>First Time Visits (Hourly)</h3>
            <div className="value">{data?.hourly_stats?.reduce((sum, hour) => sum + hour.first_time_visits, 0) || 0}</div>
          </div>
          <div className="stat-card">
            <h3>Returning Visits (Hourly)</h3>
            <div className="value">{data?.hourly_stats?.reduce((sum, hour) => sum + hour.returning_visits, 0) || 0}</div>
          </div>
        </div>

        {/* Hourly Chart */}
        <div className="chart-container" style={{ marginBottom: '30px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            padding: '10px 20px',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
              Hourly Breakdown
            </h2>
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

          <div style={{ position: 'relative', padding: '20px 0' }}>
            <BarChart
              displayData={data.hourly_stats}
              showPageViews={showPageViews}
              showUniqueVisits={showUniqueVisits}
              showReturningVisits={showReturningVisits}
              period="hourly"
              stepSize={5}
              maxValue={100}
            />
          </div>
        </div>

        {/* Hourly Data Table */}
        <div className="chart-container">
          <div style={{
            padding: '10px 20px',
            borderBottom: '1px solid #e2e8f0',
            marginBottom: '0'
          }}>
          </div>
          <table style={{ width: '100%' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#475569', fontWeight: '600' }}>Time</th>
                <th style={{ padding: '12px', textAlign: 'center', color: '#475569', fontWeight: '600' }}>Page Loads</th>
                <th style={{ padding: '12px', textAlign: 'center', color: '#475569', fontWeight: '600' }}>Unique Visits</th>
                <th style={{ padding: '12px', textAlign: 'center', color: '#475569', fontWeight: '600' }}>First Time Visits</th>
                <th style={{ padding: '12px', textAlign: 'center', color: '#475569', fontWeight: '600' }}>Returning Visits</th>
              </tr>
            </thead>
            <tbody>
              {data.hourly_stats.map((hour, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: '1px solid #e2e8f0',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f8fafc'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <td data-label="Time" style={{ padding: '12px', color: '#1e40af', fontWeight: '600' }}>
                    {hour.timeRange || `${hour.date}-${hour.date.replace(':00', ':59')}`}
                  </td>
                  <td data-label="Page Loads" style={{ padding: '12px', textAlign: 'center', fontWeight: '500' }}>{hour.page_views}</td>
                  <td data-label="Unique Visits" style={{ padding: '12px', textAlign: 'center', fontWeight: '500' }}>{hour.unique_visits}</td>
                  <td data-label="First Time Visits" style={{ padding: '12px', textAlign: 'center', fontWeight: '500' }}>{hour.first_time_visits}</td>
                  <td data-label="Returning Visits" style={{ padding: '12px', textAlign: 'center', fontWeight: '500' }}>{hour.returning_visits}</td>
                </tr>
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
              gap: 10px !important;
            }
            .stat-card .value {
              font-size: 24px !important;
            }
            .chart-container {
              overflow-x: hidden !important;
              padding: 0px !important;
              background: transparent !important;
              box-shadow: none !important;
            }
            table,thead, tbody, th, td, tr {
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
                padding: 10px !important;
                border: 1px solid #e2e8f0 !important;
            }
            td {
                text-align: right !important;
                padding: 10px 15px !important;
                position: relative !important;
                border-bottom: 1px solid #f1f5f9 !important;
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
            }
            td:last-child {
                border-bottom: none !important;
            }
            td:before {
                content: attr(data-label);
                font-weight: 600;
                color: #64748b;
                font-size: 13px;
                text-align: left !important;
            }
            .chart-container h2 {
              font-size: 16px !important;
              padding: 10px !important;
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

export default HourlyView
