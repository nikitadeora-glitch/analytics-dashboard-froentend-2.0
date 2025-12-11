import React, { useState, useEffect } from 'react'
import { analyticsAPI } from '../../api/api'
import BarChart from '../../components/BarChart'

function Summary({ projectId }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('daily')
  const [dateRange, setDateRange] = useState(7)
  const [currentPage, setCurrentPage] = useState(0)
  const [showPageViews, setShowPageViews] = useState(true)
  const [showUniqueVisits, setShowUniqueVisits] = useState(false)
  const [showReturningVisits, setShowReturningVisits] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false)
  const [showDateRangeDropdown, setShowDateRangeDropdown] = useState(false)

  useEffect(() => {
    loadSummary()
    const interval = setInterval(loadSummary, 30000)
    return () => clearInterval(interval)
  }, [projectId, dateRange])

  useEffect(() => {
    console.log('✅ Page changed to:', currentPage)
  }, [currentPage])

  useEffect(() => {
    console.log('📆 DateRange changed to:', dateRange)
  }, [dateRange])

  const loadSummary = async () => {
    try {
      console.log('🌐 API Call with dateRange:', dateRange)
      const response = await analyticsAPI.getSummary(projectId, dateRange)
      console.log('✅ API Response - daily_stats length:', response.data.daily_stats?.length)
      console.log('📅 All dates from API:', response.data.daily_stats?.map(d => d.date))
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







  if (loading) return <div className="loading">Loading summary...</div>
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
    ;(data.daily_stats || []).forEach(day => {
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
  
  console.log('🔪 Slicing:', { 
    currentPage,
    start, 
    end, 
    filteredDataLength: filteredData.length,
    allFilteredDates: filteredData.map(d => d.date)
  })
  
  const displayData = filteredData.slice(start, end)
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage))
  const isLastPage = currentPage >= totalPages - 1
  const isFirstPage = currentPage === 0

  console.log('📊 Result:', { 
    displayDataLength: displayData.length,
    displayDates: displayData.map(d => d.date)
  })

  // Chart.js handles scaling automatically

  const handleDateClick = (day) => {
    setSelectedDate(day)
  }

  const closeModal = () => {
    setSelectedDate(null)
  }

  return (
    <>
      <div className="header">
        <h1>Summary</h1>
      </div>

      {/* Date Details Modal */}
      {selectedDate && (
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
                 {selectedDate.date}
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
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #bbf7d0'
              }}>
                <div style={{ fontSize: '14px', color: '#166534', fontWeight: '600', marginBottom: '8px' }}>
                  📊 Page Views
                </div>
                <div style={{ fontSize: '36px', fontWeight: '700', color: '#15803d' }}>
                  {selectedDate.page_views}
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #bfdbfe'
              }}>
                <div style={{ fontSize: '14px', color: '#1e40af', fontWeight: '600', marginBottom: '8px' }}>
                  👥 Unique Visits
                </div>
                <div style={{ fontSize: '36px', fontWeight: '700', color: '#1d4ed8' }}>
                  {selectedDate.unique_visits}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '2px solid #fcd34d'
                }}>
                  <div style={{ fontSize: '12px', color: '#92400e', fontWeight: '600', marginBottom: '6px' }}>
                    ✨ First Time
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#b45309' }}>
                    {selectedDate.first_time_visits}
                  </div>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '2px solid #fde68a'
                }}>
                  <div style={{ fontSize: '12px', color: '#78350f', fontWeight: '600', marginBottom: '6px' }}>
                    🔄 Returning
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#92400e' }}>
                    {selectedDate.returning_visits}
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              marginTop: '24px',
              padding: '16px',
              background: '#f8fafc',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#64748b'
            }}>
              <strong style={{ color: '#1e293b' }}>💡 Tip:</strong> Click outside or press × to close
            </div>
          </div>
        </div>
      )}

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
                    console.log('🔵 First clicked')
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
                    console.log('🔵 Prev clicked, current:', currentPage)
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
                    console.log('🔵 Next clicked, current:', currentPage, 'isLastPage:', isLastPage)
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
                    console.log('🔵 Last clicked, totalPages:', totalPages)
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
              {(data.all_daily_stats || data.daily_stats || []).map((day, idx) => (
                <tr 
                  key={idx} 
                  onClick={() => handleDateClick(day)}
                  style={{ 
                    borderBottom: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f8fafc'
                    e.currentTarget.style.transform = 'scale(1.01)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                >
                  <td style={{ padding: '12px', color: '#1e40af', fontWeight: '600' }}>
                    {day.date}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: '500' }}>{day.page_views}</td>
                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: '500' }}>{day.unique_visits}</td>
                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: '500' }}>{day.first_time_visits}</td>
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
