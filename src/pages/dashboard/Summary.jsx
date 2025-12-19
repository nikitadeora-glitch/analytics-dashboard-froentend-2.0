import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { analyticsAPI } from '../../api/api'
import BarChart from '../../components/BarChart'
import { Skeleton, Box, Grid, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material'

function Summary({ projectId }) {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('daily')
  const [dateRange, setDateRange] = useState(7)
  const [currentPage, setCurrentPage] = useState(0)
  const [showPageViews, setShowPageViews] = useState(true)
  const [showUniqueVisits, setShowUniqueVisits] = useState(true)
  const [showReturningVisits, setShowReturningVisits] = useState(true)

  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false)
  const [showDateRangeDropdown, setShowDateRangeDropdown] = useState(false)

  useEffect(() => {
    loadSummary()
    // Remove auto-refresh to improve performance
    // const interval = setInterval(loadSummary, 30000)
    // return () => clearInterval(interval)
  }, [projectId, dateRange])

  // Removed excessive logging for better performance

  const loadSummary = async () => {
    try {
      const response = await analyticsAPI.getSummaryView(projectId, dateRange)
      setData(response.data)
      setCurrentPage(0)
    } catch (error) {
      console.error('Error loading summary:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePeriodChange = (e) => {
    setPeriod(e.target.value)
    setCurrentPage(0) // Reset to first page when period changes
  }







  if (loading) return (
    <>
      {/* Header */}
      <div className="header">
        <h1>Summary</h1>
      </div>

      <div className="content">
        {/* Summary Cards - Material-UI Grid */}
        <Grid container spacing={0} sx={{ marginBottom: 3 }}>
          {[1, 2, 3, 4].map(i => (
            <Grid item xs={3} key={i}>
              <Box className="stat-card" sx={{ padding: 2 }}>
                <Skeleton variant="text" width="80%" height={13} animation="wave" sx={{ marginBottom: 1 }} />
                <Skeleton variant="text" width={60} height={32} animation="wave" />
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Chart Container */}
        <Box className="chart-container">
          {/* Controls Bar */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 2.5,
            padding: '10px 20px',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center' }}>
              <Skeleton variant="rounded" width={120} height={36} animation="wave" />
              <Skeleton variant="rounded" width={100} height={36} animation="wave" />
            </Box>

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Skeleton variant="text" width={80} height={14} animation="wave" />
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} variant="rounded" width={32} height={32} animation="wave" />
                ))}
              </Box>
            </Box>
          </Box>

          {/* Data Table */}
          <Table>
            <TableHead sx={{ background: '#f8fafc' }}>
              <TableRow>
                <TableCell><Skeleton variant="text" width={40} height={16} animation="wave" /></TableCell>
                <TableCell align="center"><Skeleton variant="text" width={80} height={16} animation="wave" /></TableCell>
                <TableCell align="center"><Skeleton variant="text" width={90} height={16} animation="wave" /></TableCell>
                <TableCell align="center"><Skeleton variant="text" width={100} height={16} animation="wave" /></TableCell>
                <TableCell align="center"><Skeleton variant="text" width={100} height={16} animation="wave" /></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[1, 2, 3, 4, 5, 6, 7].map(i => (
                <TableRow key={i} sx={{ borderBottom: '1px solid #e2e8f0' }}>
                  <TableCell><Skeleton variant="text" width={80} height={16} animation="wave" /></TableCell>
                  <TableCell align="center"><Skeleton variant="text" width={40} height={16} animation="wave" /></TableCell>
                  <TableCell align="center"><Skeleton variant="text" width={30} height={16} animation="wave" /></TableCell>
                  <TableCell align="center"><Skeleton variant="text" width={25} height={16} animation="wave" /></TableCell>
                  <TableCell align="center"><Skeleton variant="text" width={25} height={16} animation="wave" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </div>
    </>
  )
  if (!data) return <div className="loading">No data available</div>

  // Get filtered data based on period
  let filteredData = []
  if (period === 'daily') {
    filteredData = data.daily_stats || []
  } else if (period === 'weekly') {
    const weeks = []
    const stats = data.daily_stats || []
    for (let i = 0; i < stats.length; i += 7) {
      const weekData = stats.slice(i, i + 7)
      weeks.push({
        date: `Week ${Math.floor(i / 7) + 1}`,
        page_views: weekData.reduce((sum, d) => sum + d.page_views, 0),
        unique_visits: weekData.reduce((sum, d) => sum + d.unique_visits, 0),
        first_time_visits: weekData.reduce((sum, d) => sum + d.first_time_visits, 0),
        returning_visits: weekData.reduce((sum, d) => sum + d.returning_visits, 0)
      })
    }
    filteredData = weeks
  } else if (period === 'monthly') {
    const months = {}
      ; (data.daily_stats || []).forEach(day => {
        const monthKey = day.date.split(' ').slice(0, 2).join(' ')
        if (!months[monthKey]) {
          months[monthKey] = {
            date: monthKey,
            page_views: 0,
            unique_visits: 0,
            first_time_visits: 0,
            returning_visits: 0
          }
        }
        months[monthKey].page_views += day.page_views
        months[monthKey].unique_visits += day.unique_visits
        months[monthKey].first_time_visits += day.first_time_visits
        months[monthKey].returning_visits += day.returning_visits
      })
    filteredData = Object.values(months)
  }

  // Pagination
  const itemsPerPage = 7
  const start = currentPage * itemsPerPage
  const end = start + itemsPerPage

  const displayData = filteredData.slice(start, end)
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage))
  const isLastPage = currentPage >= totalPages - 1
  const isFirstPage = currentPage === 0

  // Chart.js handles scaling automatically

  const handleDateClick = (day) => {
    // Navigate to hourly view for the selected date
    const encodedDate = encodeURIComponent(day.date)
    navigate(`/dashboard/project/${projectId}/hourly/${encodedDate}`)
  }



  return (
    <>
      <div className="header">
        <h1>Summary</h1>
      </div>



      <div className="content">
        <div className="chart-container" style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '10px 20px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <div
                  onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                  style={{
                    padding: '8px 40px 8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#1e40af',
                    color: 'white',
                    fontWeight: '500',
                    fontSize: '13px',
                    minWidth: '120px',
                    position: 'relative',
                    userSelect: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {period === 'daily' ? 'Daily' : period === 'weekly' ? 'Weekly' : 'Monthly'}
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
                    color: 'white',
                    fontSize: '12px',
                    borderRadius: '0 6px 6px 0',
                    transition: 'background 0.2s',
                    pointerEvents: 'none'
                  }}
                >
                  ▼
                </div>
                {showPeriodDropdown && (
                  <>
                    <div
                      onClick={() => setShowPeriodDropdown(false)}
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
                      minWidth: '120px',
                      zIndex: 1000,
                      overflow: 'hidden'
                    }}>
                      {['daily', 'weekly', 'monthly'].map((option) => (
                        <div
                          key={option}
                          onClick={() => {
                            setPeriod(option)
                            setShowPeriodDropdown(false)
                            setCurrentPage(0)
                          }}
                          style={{
                            padding: '10px 16px',
                            cursor: 'pointer',
                            background: period === option ? '#eff6ff' : 'white',
                            color: period === option ? '#1e40af' : '#1e293b',
                            fontWeight: period === option ? '600' : '500',
                            fontSize: '13px',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (period !== option) e.currentTarget.style.background = '#f8fafc'
                          }}
                          onMouseLeave={(e) => {
                            if (period !== option) e.currentTarget.style.background = 'white'
                          }}
                        >
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
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
              <div style={{ position: 'relative', display: 'inline-block' }}>
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
                      {[7, 30, 90].map((days) => (
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

          <div style={{ position: 'relative', padding: '20px 0' }} key={`page-${currentPage}`}>
            <div style={{
              borderBottom: '2px solid #e2e8f0',
              paddingBottom: '20px',
              marginBottom: '8px'
            }}>
              <BarChart
                displayData={displayData}
                showPageViews={showPageViews}
                showUniqueVisits={showUniqueVisits}
                showReturningVisits={showReturningVisits}
                period={period}
              />
            </div>
            <div style={{
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0' }}>
          <div className="stat-card">
            <h3 style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>Average Daily Page Views</h3>
            <div className="value" style={{ fontSize: '32px', color: '#1e40af' }}>{data.averages.page_views}</div>
          </div>
          <div className="stat-card">
            <h3 style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>Average Daily Unique Visits</h3>
            <div className="value" style={{ fontSize: '32px', color: '#1e40af' }}>{data.averages.unique_visits}</div>
          </div>
          <div className="stat-card">
            <h3 style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>Average Daily First Time Visits</h3>
            <div className="value" style={{ fontSize: '32px', color: '#1e40af' }}>{data.averages.first_time_visits}</div>
          </div>
          <div className="stat-card">
            <h3 style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>Average Daily Returning Visits</h3>
            <div className="value" style={{ fontSize: '32px', color: '#1e40af' }}>{data.averages.returning_visits}</div>
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
              {displayData.map((day, idx) => (
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
                  <td
                    onClick={() => handleDateClick(day)}
                    style={{
                      padding: '12px',
                      color: '#1e40af',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#eff6ff'
                      e.currentTarget.style.transform = 'scale(1.02)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.transform = 'scale(1)'
                    }}
                  >
                    {day.date}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: '500' }}>{day.page_views}</td>
                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: '500' }}>{day.unique_visits}</td>
                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: '500' }}>{day.first_time_visits}</td>
                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: '500' }}>{day.returning_visits}</td>
                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: '500' }}>{day.returning_visits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default Summary
