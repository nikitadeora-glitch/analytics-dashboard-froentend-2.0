import { useState } from 'react'
import { reportsAPI } from '../../api/api'
import { Download } from 'lucide-react'

function Reports({ projectId }) {
  const [loading, setLoading] = useState(false)

  const handleExportCSV = async () => {
    setLoading(true)
    try {
      const response = await reportsAPI.exportCSV(projectId, 30)
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

  return (
    <>
      <div className="header">
        <h1>Reports</h1>
      </div>

      <div className="content">
        <div className="chart-container">
          <h3 style={{ marginBottom: '16px' }}>Export Data</h3>
          <p style={{ color: '#64748b', marginBottom: '20px' }}>
            Download your analytics data in CSV format for further analysis.
          </p>
          <button 
            className="btn btn-primary" 
            onClick={handleExportCSV}
            disabled={loading}
          >
            <Download size={16} style={{ marginRight: '8px' }} />
            {loading ? 'Exporting...' : 'Export Last 30 Days (CSV)'}
          </button>
        </div>

        <div className="chart-container" style={{ marginTop: '20px' }}>
          <h3 style={{ marginBottom: '16px' }}>Available Reports</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
              <strong>Visitor Analytics</strong>
              <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                Complete visitor data including IP, location, device, and session info
              </p>
            </div>
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
              <strong>Page Performance</strong>
              <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                Page views, time spent, bounce rates, and engagement metrics
              </p>
            </div>
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
              <strong>Traffic Sources</strong>
              <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                Referrers, search keywords, and campaign performance
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Reports
