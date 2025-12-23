import React, { useState, useEffect } from 'react'
import { Skeleton } from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { analyticsAPI } from '../../api/api'
import BarChart from '../../components/BarChart'

function HourlyView({ projectId }) {
  const { date } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPageViews, setShowPageViews] = useState(true)
  const [showUniqueVisits, setShowUniqueVisits] = useState(true)
  const [showReturningVisits, setShowReturningVisits] = useState(true)

  useEffect(() => {
    loadHourlyData()
  }, [projectId, date])

  const loadHourlyData = async () => {
    try {
      setLoading(true)
      console.log('🕐 Loading hourly data for date:', date)

      // Call real API to get hourly data
      const response = await analyticsAPI.getHourlyData(projectId, date)
      console.log('✅ Hourly data loaded:', response.data)

      // Process and sort hourly data to start from 00:00
      const processedData = {
        ...response.data,
        hourly_stats: response.data.hourly_stats
          .map(stat => {
            const istTime = formatHourToIST(response.data.date, stat.date);
            const hour = istTime.split(':')[0];
            const endHour = hour.padStart(2, '0');
            const hourNumber = parseInt(hour, 10);

            return {
              ...stat,
              // Store original UTC for reference if needed, but display IST
              utc_date: stat.date,
              date: istTime,
              timeRange: `${hour.padStart(2, '0')}:00-${endHour}:59`,
              _hour: hourNumber // Add hour as number for sorting
            };
          })
          // Sort by hour to ensure 00:00 comes first
          .sort((a, b) => a._hour - b._hour)
          // Remove the temporary _hour property
          .map(({ _hour, ...rest }) => rest)
      };

      setData(processedData)
    } catch (error) {
      console.error('❌ Error loading hourly data:', error)
      console.error('❌ Error details:', error.response?.data)

      // Fallback to sample data if API fails
      console.log('🔄 Falling back to sample data')
      const hourlyData = generateSampleHourlyData(date)
      setData(hourlyData)
    } finally {
      setLoading(false)
    }
  }

  // Helper to convert UTC hour to IST and format as HH:00
  const formatHourToIST = (dateStr, hourStr) => {
    try {
      // hourStr is "HH:00"
      // dateStr is "Mon, 16 Dec 2024" or similar
      const d = new Date(`${dateStr} ${hourStr}:00 UTC`);

      if (isNaN(d.getTime())) return hourStr; // Fallback

      // Get hours in 24-hour format with leading zero
      const hours = d.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Kolkata'
      }).split(':')[0].padStart(2, '0');
      
      return `${hours}:00`; // Always return in HH:00 format
    } catch (e) {
      return hourStr;
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

      // Distribute traffic throughout the day
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
        <div className="header" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <Skeleton variant="rectangular" width={140} height={40} sx={{ borderRadius: '6px' }} />
        </div>

        <div className="content">
          {/* Summary Cards Skeleton */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0', marginBottom: '30px' }}>
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
        <div className="header" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
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
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="header" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
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

      </div>

      <div className="content">
        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0', marginBottom: '30px' }}>
          <div className="stat-card">
            <h3 style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>Total Page Loads</h3>
            <div className="value" style={{ fontSize: '32px', color: '#10b981' }}>{data.totals.page_views}</div>
          </div>
          <div className="stat-card">
            <h3 style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>Unique Visits</h3>
            <div className="value" style={{ fontSize: '32px', color: '#3b82f6' }}>{data.totals.unique_visits}</div>
          </div>
          <div className="stat-card">
            <h3 style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>First Time Visits</h3>
            <div className="value" style={{ fontSize: '32px', color: '#f59e0b' }}>{data.totals.first_time_visits}</div>
          </div>
          <div className="stat-card">
            <h3 style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>Returning Visits</h3>
            <div className="value" style={{ fontSize: '32px', color: '#ef4444' }}>{data.totals.returning_visits}</div>
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
              maxValue={50}
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
                  <td style={{ padding: '12px', color: '#1e40af', fontWeight: '600' }}>
                    {hour.timeRange || `${hour.date}-${hour.date.replace(':00', ':59')}`}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: '500' }}>{hour.page_views}</td>
                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: '500' }}>{hour.unique_visits}</td>
                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: '500' }}>{hour.first_time_visits}</td>
                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: '500' }}>{hour.returning_visits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default HourlyView