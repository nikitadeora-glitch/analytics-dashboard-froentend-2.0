import { useState, useEffect } from 'react'
import { reportsAPI, analyticsAPI, visitorsAPI, pagesAPI, trafficAPI } from '../../api/api'
import { Download, Calendar, FileText, TrendingUp, Users, Globe, MousePointer, BarChart3, Eye } from 'lucide-react'

function Reports({ projectId }) {
  const [loading, setLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('30')
  const [reportData, setReportData] = useState(null)
  const [summaryData, setSummaryData] = useState(null)
  const [loadingData, setLoadingData] = useState(true)
  const [selectedReport, setSelectedReport] = useState(null)

  useEffect(() => {
    fetchReportData()
  }, [projectId, selectedPeriod])

  const fetchReportData = async () => {
    setLoadingData(true)
    try {
      const endDate = new Date().toISOString()
      const startDate = new Date(Date.now() - parseInt(selectedPeriod) * 24 * 60 * 60 * 1000).toISOString()
      
      const [summary, analytics, visitors, pages, traffic] = await Promise.all([
        reportsAPI.getSummaryReport(projectId, startDate, endDate),
        analyticsAPI.getSummary(projectId),
        visitorsAPI.getActivity(projectId, 100),
        pagesAPI.getMostVisited(projectId, 20),
        trafficAPI.getSources(projectId)
      ])

      setReportData({
        summary: summary.data,
        analytics: analytics.data,
        visitors: visitors.data,
        pages: pages.data,
        traffic: traffic.data
      })
      setSummaryData(analytics.data)
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleExportCSV = async () => {
    setLoading(true)
    try {
      const response = await reportsAPI.exportCSV(projectId, parseInt(selectedPeriod))
      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics_${projectId}_${Date.now()}.csv`
      a.click()
    } catch (error) {
      console.error('Error exporting CSV:', error)
      alert('Failed to export CSV')
    } finally {
      setLoading(false)
    }
  }

  const reportCategories = [
    {
      icon: <Users size={24} />,
      title: 'Visitor Analytics',
      description: 'Complete visitor data including IP, location, device, and session info',
      color: '#3b82f6',
      bgColor: '#eff6ff',
      value: summaryData?.unique_visitors || 0,
      label: 'Unique Visitors'
    },
    {
      icon: <Eye size={24} />,
      title: 'Page Performance',
      description: 'Page views, time spent, bounce rates, and engagement metrics',
      color: '#8b5cf6',
      bgColor: '#f5f3ff',
      value: summaryData?.total_visits || 0,
      label: 'Total Views'
    },
    {
      icon: <TrendingUp size={24} />,
      title: 'Traffic Sources',
      description: 'Referrers, search keywords, and campaign performance',
      color: '#10b981',
      bgColor: '#ecfdf5',
      value: reportData?.traffic?.length || 0,
      label: 'Traffic Sources'
    },
    {
      icon: <Globe size={24} />,
      title: 'Geographic Data',
      description: 'Country, city, and regional visitor distribution',
      color: '#f59e0b',
      bgColor: '#fffbeb',
      value: reportData?.summary?.countries?.length || 0,
      label: 'Countries'
    },
    {
      icon: <BarChart3 size={24} />,
      title: 'Top Pages',
      description: 'Most visited pages and content performance analysis',
      color: '#ec4899',
      bgColor: '#fdf2f8',
      value: reportData?.pages?.length || 0,
      label: 'Tracked Pages'
    }
  ]

  return (
    <>
      <div className="header">
        <h1>Reports</h1>
        <div style={{ display: 'flex', gap: '12px', paddingRight: '40px' }}>
          <button className="btn btn-primary" onClick={handleExportCSV} disabled={loading}>
            <Download size={16} />
            {loading ? 'Exporting...' : 'Download Logs'}
          </button>
          <select 
            className="btn"
            style={{ 
              background: 'white', 
              border: '1px solid #e2e8f0',
              color: '#475569',
              cursor: 'pointer'
            }}
            value={selectedPeriod}
            onChange={(e) => {
              setSelectedPeriod(e.target.value)
              fetchReportData()
            }}
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 3 Months</option>
          </select>
        </div>
      </div>

      <div className="content">
        {loadingData ? (
          <div className="loading">Loading report data...</div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="stats-grid" style={{ marginBottom: '30px' }}>
              <div className="stat-card">
                <h3>Total Visits</h3>
                <div className="value">{summaryData?.total_visits?.toLocaleString() || 0}</div>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>
                  Last {selectedPeriod} days
                </p>
              </div>
              <div className="stat-card">
                <h3>Unique Visitors</h3>
                <div className="value">{summaryData?.unique_visitors?.toLocaleString() || 0}</div>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>
                  Distinct users
                </p>
              </div>
              <div className="stat-card live">
                <h3>Live Visitors</h3>
                <div className="value">{summaryData?.live_visitors || 0}</div>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>
                  Active now
                </p>
              </div>
              <div className="stat-card">
                <h3>Avg. Session</h3>
                <div className="value">
                  {summaryData?.total_visits > 0 
                    ? Math.round((summaryData.total_visits / summaryData.unique_visitors) * 10) / 10
                    : 0}
                </div>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>
                  Pages per visit
                </p>
              </div>
            </div>

            {/* Export Section */}
            <div className="chart-container" style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              marginBottom: '30px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ fontSize: '24px', marginBottom: '8px', color: 'white' }}>
                    Export Your Analytics Data
                  </h2>
                  <p style={{ opacity: 0.9, fontSize: '15px' }}>
                    Download comprehensive reports in CSV format for detailed analysis and insights
                  </p>
                </div>
                <Calendar size={48} style={{ opacity: 0.3 }} />
              </div>
            </div>
          </>
        )}

        {/* Report Categories Grid */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '20px', color: '#1e293b' }}>
            Available Report Categories
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {reportCategories.map((category, index) => (
              <div 
                key={index}
                className="report-category-card"
                style={{
                  background: 'white',
                  padding: '24px',
                  borderRadius: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  border: '2px solid transparent',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onClick={() => setSelectedReport(category.title)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)'
                  e.currentTarget.style.borderColor = category.color
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
                  e.currentTarget.style.borderColor = 'transparent'
                }}
              >
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px',
                  background: category.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: category.color,
                  marginBottom: '16px'
                }}>
                  {category.icon}
                </div>
                <h4 style={{ 
                  fontSize: '16px', 
                  fontWeight: '600',
                  color: '#1e293b',
                  marginBottom: '8px'
                }}>
                  {category.title}
                </h4>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#64748b',
                  lineHeight: '1.6',
                  marginBottom: '12px'
                }}>
                  {category.description}
                </p>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'baseline',
                  gap: '8px',
                  marginTop: 'auto'
                }}>
                  <span style={{ 
                    fontSize: '24px', 
                    fontWeight: '700',
                    color: category.color
                  }}>
                    {category.value.toLocaleString()}
                  </span>
                  <span style={{ 
                    fontSize: '13px', 
                    color: '#94a3b8'
                  }}>
                    {category.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export Formats */}
        <div className="chart-container">
          <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#1e293b' }}>
            Export Formats & Options
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginTop: '20px'
          }}>
            <div style={{ 
              padding: '20px', 
              background: '#f8fafc', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <FileText size={32} style={{ color: '#3b82f6', marginBottom: '8px' }} />
              <strong style={{ display: 'block', marginBottom: '4px' }}>CSV Format</strong>
              <p style={{ fontSize: '13px', color: '#64748b' }}>
                Excel compatible
              </p>
            </div>
            <div style={{ 
              padding: '20px', 
              background: '#f8fafc', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <Calendar size={32} style={{ color: '#8b5cf6', marginBottom: '8px' }} />
              <strong style={{ display: 'block', marginBottom: '4px' }}>Custom Range</strong>
              <p style={{ fontSize: '13px', color: '#64748b' }}>
                Select date period
              </p>
            </div>
            <div style={{ 
              padding: '20px', 
              background: '#f8fafc', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <TrendingUp size={32} style={{ color: '#10b981', marginBottom: '8px' }} />
              <strong style={{ display: 'block', marginBottom: '4px' }}>Full Analytics</strong>
              <p style={{ fontSize: '13px', color: '#64748b' }}>
                All metrics included
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Reports
