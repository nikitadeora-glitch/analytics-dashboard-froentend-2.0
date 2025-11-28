import { useState, useEffect } from 'react'
import { analyticsAPI } from '../../api/api'

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

  useEffect(() => {
    loadSummary()
    const interval = setInterval(loadSummary, 30000)
    return () => clearInterval(interval)
  }, [projectId])

  const loadSummary = async () => {
    try {
      const response = await analyticsAPI.getSummary(projectId)
      setData(response.data)
    } catch (error) {
      console.error('Error loading summary:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePeriodChange = (e) => {
    setPeriod(e.target.value)
  }

  const handleDateRangeClick = () => {
    const ranges = [7, 30, 90]
    const currentIndex = ranges.indexOf(dateRange)
    const nextIndex = (currentIndex + 1) % ranges.length
    setDateRange(ranges[nextIndex])
  }

  const getDateRangeLabel = () => {
    if (dateRange === 7) return 'Last 7 Days'
    if (dateRange === 30) return 'Last 30 Days'
    if (dateRange === 90) return 'Last 90 Days'
    return 'Last 30 Days'
  }

  const handleNavigation = (direction) => {
    if (direction === 'first') setCurrentPage(0)
    else if (direction === 'prev') setCurrentPage(Math.max(0, currentPage - 1))
    else if (direction === 'next') setCurrentPage(currentPage + 1)
    else if (direction === 'last') setCurrentPage(Math.floor(data.daily_stats.length / 7))
  }

  if (loading) return <div className="loading">Loading summary...</div>
  if (!data) return <div className="loading">No data available</div>

  const getMaxValue = () => {
    let values = []
    if (showPageViews) values.push(...data.daily_stats.map(d => d.page_views))
    if (showUniqueVisits) values.push(...data.daily_stats.map(d => d.unique_visits))
    if (showReturningVisits) values.push(...data.daily_stats.map(d => d.returning_visits))
    return Math.max(...values, 1)
  }

  const handleDateClick = (day) => {
    setSelectedDate(day)
  }

  const closeModal = () => {
    setSelectedDate(null)
  }

  const maxValue = getMaxValue()

  return (
    <>
      <div className="header">
        <h1>Summary </h1>
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
                📅 {selectedDate.date}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <select 
                value={period} 
                onChange={handlePeriodChange}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#1e40af', color: 'white', fontWeight: '500', fontSize: '13px', cursor: 'pointer' }}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button 
                  onClick={() => handleNavigation('first')}
                  style={{ padding: '8px 12px', background: '#1e40af', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
                  title="First page"
                >«</button>
                <button 
                  onClick={() => handleNavigation('prev')}
                  disabled={currentPage === 0}
                  style={{ padding: '8px 12px', background: currentPage === 0 ? '#64748b' : '#1e40af', color: 'white', border: 'none', borderRadius: '4px', cursor: currentPage === 0 ? 'not-allowed' : 'pointer', fontSize: '14px' }}
                  title="Previous"
                >‹</button>
                <button 
                  onClick={() => handleNavigation('next')}
                  style={{ padding: '8px 12px', background: '#1e40af', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
                  title="Next"
                >›</button>
                <button 
                  onClick={() => handleNavigation('last')}
                  style={{ padding: '8px 12px', background: '#1e40af', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
                  title="Last page"
                >»</button>
              </div>
              <button 
                onClick={handleDateRangeClick}
                style={{ padding: '8px 12px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
              >
                 {getDateRangeLabel()}
              </button>
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
          
          <div style={{ position: 'relative', padding: '20px 0' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '300px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
              {data.daily_stats.map((day, idx) => {
                const barWidth = showPageViews + showUniqueVisits + showReturningVisits
                const barGap = 2
                
                return (
                  <div 
                    key={idx} 
                    onClick={() => handleDateClick(day)}
                    style={{ 
                      flex: 1, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      gap: '8px', 
                      position: 'relative',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '8px',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f8fafc'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: '100%', gap: `${barGap}px` }}>
                      {showPageViews && (
                        <div style={{
                          width: `${70 / barWidth}%`,
                          height: `${(day.page_views / maxValue) * 250}px`,
                          background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
                          borderRadius: '6px 6px 0 0',
                          position: 'relative',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          cursor: 'pointer',
                          boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3), 0 2px 4px -1px rgba(16, 185, 129, 0.2)',
                          animation: 'slideUp 0.6s ease-out'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px) scaleY(1.02)'
                          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(16, 185, 129, 0.4), 0 4px 6px -2px rgba(16, 185, 129, 0.3)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0) scaleY(1)'
                          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(16, 185, 129, 0.3), 0 2px 4px -1px rgba(16, 185, 129, 0.2)'
                        }}>
                          <div style={{
                            position: 'absolute',
                            top: '-26px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '12px',
                            fontWeight: '700',
                            color: '#10b981',
                            background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)',
                            whiteSpace: 'nowrap',
                            border: '1px solid #d1fae5'
                          }}>
                            {day.page_views}
                          </div>
                        </div>
                      )}
                      {showUniqueVisits && (
                        <div style={{
                          width: `${70 / barWidth}%`,
                          height: `${(day.unique_visits / maxValue) * 250}px`,
                          background: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)',
                          borderRadius: '6px 6px 0 0',
                          position: 'relative',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          cursor: 'pointer',
                          boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3), 0 2px 4px -1px rgba(59, 130, 246, 0.2)',
                          animation: 'slideUp 0.6s ease-out 0.1s backwards'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px) scaleY(1.02)'
                          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(59, 130, 246, 0.4), 0 4px 6px -2px rgba(59, 130, 246, 0.3)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0) scaleY(1)'
                          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.3), 0 2px 4px -1px rgba(59, 130, 246, 0.2)'
                        }}>
                          <div style={{
                            position: 'absolute',
                            top: '-26px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '12px',
                            fontWeight: '700',
                            color: '#3b82f6',
                            background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)',
                            whiteSpace: 'nowrap',
                            border: '1px solid #dbeafe'
                          }}>
                            {day.unique_visits}
                          </div>
                        </div>
                      )}
                      {showReturningVisits && (
                        <div style={{
                          width: `${70 / barWidth}%`,
                          height: `${(day.returning_visits / maxValue) * 250}px`,
                          background: 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)',
                          borderRadius: '6px 6px 0 0',
                          position: 'relative',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          cursor: 'pointer',
                          boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.3), 0 2px 4px -1px rgba(245, 158, 11, 0.2)',
                          animation: 'slideUp 0.6s ease-out 0.2s backwards'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px) scaleY(1.02)'
                          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(245, 158, 11, 0.4), 0 4px 6px -2px rgba(245, 158, 11, 0.3)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0) scaleY(1)'
                          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(245, 158, 11, 0.3), 0 2px 4px -1px rgba(245, 158, 11, 0.2)'
                        }}>
                          <div style={{
                            position: 'absolute',
                            top: '-26px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '12px',
                            fontWeight: '700',
                            color: '#f59e0b',
                            background: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.2)',
                            whiteSpace: 'nowrap',
                            border: '1px solid #fef3c7'
                          }}>
                            {day.returning_visits}
                          </div>
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '500', marginTop: '8px' }}>
                      {day.date.split(' ')[1]}
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>
              <span>{data.daily_stats[0]?.date.split(',')[0]}</span>
              <span>{data.daily_stats[data.daily_stats.length - 1]?.date.split(',')[0]}</span>
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
              {data.daily_stats.map((day, idx) => (
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
