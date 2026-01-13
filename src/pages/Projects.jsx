import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { projectsAPI } from '../api/api'
import { Plus, BarChart2, Download, Code, Copy, Check, Trash2, TrendingUp } from 'lucide-react'
import { Skeleton, Box, TableContainer, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material'
import LineChart from '../components/LineChart'

function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', domain: '' })
  const [showTrackingCode, setShowTrackingCode] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState(false)
  const navigate = useNavigate()

  // Cache for projects data
  const [lastFetch, setLastFetch] = useState(null)
  const CACHE_DURATION = 2 * 60 * 1000 // 2 minutes cache

  // Auto-detect API URL based on environment
  // const getApiUrl = () => {
  //   // Check if we have a custom API URL from environment variable
  //   const envApiUrl = import.meta.env.VITE_API_URL
  //   if (envApiUrl) {
  //     return envApiUrl.replace('/api', '') // Remove /api suffix if present
  //   }

  //   // Auto-detect based on current hostname
  //   const hostname = window.location.hostname

  //   // Production detection
  //   if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
  //     // If frontend is deployed, assume backend is on same domain or use env variable
  //     return window.location.origin
  //   }

  //   // Local development
  //   return 'http://127.0.0.1:8000'
  // }

  useEffect(() => {
    loadProjects()
    const interval = setInterval(() => {
      // Only auto-refresh if cache is expired AND we have projects
      const now = Date.now()
      if (!lastFetch || (now - lastFetch) > CACHE_DURATION) {
        loadProjects()
      }
    }, 30000) // Check every 30s

    const handleOpenAddProject = () => {
      setShowForm(true)
    }

    window.addEventListener('openAddProject', handleOpenAddProject)

    return () => {
      clearInterval(interval)
      window.removeEventListener('openAddProject', handleOpenAddProject)
    }
  }, [lastFetch])

  const loadProjects = async (forceRefresh = false) => {
    // Check cache first
    const now = Date.now()
    if (!forceRefresh && lastFetch && (now - lastFetch) < CACHE_DURATION) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await projectsAPI.getAllStats()
      setProjects(response.data)
      setLastFetch(now)
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await projectsAPI.create(formData)
      setFormData({ name: '', domain: '' })
      setShowForm(false)
      // Force refresh after creating new project
      loadProjects(true)
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  const handleShowTrackingCode = (project) => {
    setSelectedProject(project)
    setShowTrackingCode(true)
    setCopied(false)
  }

  const handleCopyCode = () => {
    const trackingCode = getTrackingCode(selectedProject)
    navigator.clipboard.writeText(trackingCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getTrackingCode = (project) => {
    if (!project) return ''
    // const apiUrl = getApiUrl()
    const scriptUrl = `${import.meta.env.VITE_API_URL}/analytics.js`
    const apiEndpoint = `${import.meta.env.VITE_API_URL}`

    return `<!-- State Counter Analytics Tracking Code -->
<script src="${scriptUrl}" data-project-id="${project.id}" data-api-url="${apiEndpoint}"></script>
<!-- End Analytics Code -->`
  }

  const handleDeleteProject = async (project) => {
    if (window.confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
      try {
        await projectsAPI.delete(project.id)
        // Force refresh after deleting project
        loadProjects(true)
      } catch (error) {
        console.error('Error deleting project:', error)
        alert('Failed to delete project. Please try again.')
      }
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      // Create CSV content matching table structure
      const csvHeaders = [
        'Project ID',
        'Project Name',
        'Domain',
        'Traffic (Page Views)',
        'Today Page Views',
        'Yesterday Page Views',
        'This Month Page Views',
        'Total Page Views',
        'Unique Visitors',
        'Live Visitors',
        'Created Date',
        'Last Updated',
        'Status'
      ]
      const csvRows = projects.map(project => [
        project.id || 'N/A',
        project.name || 'N/A',
        project.domain || 'N/A',
        project.page_views || 0,
        project.today || 0,
        project.yesterday || 0,
        project.month || 0,
        project.total || 0,
        project.unique_visitors || 0,
        project.live_visitors || 0,
        project.created_at ? new Date(project.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'N/A',
        project.updated_at ? new Date(project.updated_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'N/A',
        project.status || 'Active'
      ])

      // Add summary row
      const totalProjects = projects.length
      const totalPageViews = projects.reduce((sum, p) => sum + (p.page_views || 0), 0)
      const totalToday = projects.reduce((sum, p) => sum + (p.today || 0), 0)
      const totalYesterday = projects.reduce((sum, p) => sum + (p.yesterday || 0), 0)
      const totalMonth = projects.reduce((sum, p) => sum + (p.month || 0), 0)
      const totalAll = projects.reduce((sum, p) => sum + (p.total || 0), 0)
      const totalUniqueVisitors = projects.reduce((sum, p) => sum + (p.unique_visitors || 0), 0)
      const totalLiveVisitors = projects.reduce((sum, p) => sum + (p.live_visitors || 0), 0)

      const summaryRow = [
        'TOTAL',
        `${totalProjects} Projects`,
        'All Domains',
        totalPageViews,
        totalToday,
        totalYesterday,
        totalMonth,
        totalAll,
        totalUniqueVisitors,
        totalLiveVisitors,
        new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        'Export Generated',
        'Summary'
      ]

      // Convert to CSV format
      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(field => `"${field}"`).join(',')),
        '', // Empty row before summary
        summaryRow.map(field => `"${field}"`).join(',')
      ].join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `projects-export-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  if (loading) return (
    <div className="main-content">
      {/* Header Skeleton - Material-UI */}
      <Box className="header" sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '20px',
        marginBottom: '24px',
        padding: '0 20px'
      }}>
        <Skeleton variant="text" width={120} height={40} animation="wave" />
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Skeleton variant="rounded" width={120} height={36} animation="wave" />
          <Skeleton variant="rounded" width={80} height={36} animation="wave" />
        </Box>
      </Box>

      {/* Table Skeleton - Material-UI */}
      <Box sx={{ padding: '0 20px' }}>
        <TableContainer sx={{
          background: 'white',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <Table>
            {/* Table Header */}
            <TableHead sx={{ background: '#f8fafc' }}>
              <TableRow>
                <TableCell><Skeleton variant="text" width={80} height={16} animation="wave" /></TableCell>
                <TableCell align="center"><Skeleton variant="text" width={90} height={16} animation="wave" /></TableCell>
                <TableCell align="center"><Skeleton variant="text" width={50} height={16} animation="wave" /></TableCell>
                <TableCell align="center"><Skeleton variant="text" width={70} height={16} animation="wave" /></TableCell>
                <TableCell align="center"><Skeleton variant="text" width={80} height={16} animation="wave" /></TableCell>
                <TableCell align="center"><Skeleton variant="text" width={40} height={16} animation="wave" /></TableCell>
                <TableCell align="center"><Skeleton variant="text" width={60} height={16} animation="wave" /></TableCell>
              </TableRow>
            </TableHead>

            {/* Table Body */}
            <TableBody>
              {[1, 2, 3, 4, 5].map(i => (
                <TableRow key={i} sx={{ borderBottom: '1px solid #e2e8f0' }}>
                  {/* Project Name & Domain */}
                  <TableCell>
                    <Box>
                      <Skeleton variant="text" width={140} height={16} animation="wave" sx={{ marginBottom: 0.5 }} />
                      <Skeleton variant="text" width={100} height={13} animation="wave" />
                    </Box>
                  </TableCell>

                  {/* Traffic Trend Chart */}
                  <TableCell align="center">
                    <Skeleton variant="rounded" width={160} height={35} animation="wave" sx={{ margin: '0 auto', marginBottom: 1, borderRadius: 2 }} />
                    <Skeleton variant="text" width={70} height={11} animation="wave" sx={{ margin: '0 auto' }} />
                  </TableCell>

                  {/* Today */}
                  <TableCell align="center">
                    <Skeleton variant="text" width={30} height={16} animation="wave" />
                  </TableCell>

                  {/* Yesterday */}
                  <TableCell align="center">
                    <Skeleton variant="text" width={30} height={16} animation="wave" />
                  </TableCell>

                  {/* This Month */}
                  <TableCell align="center">
                    <Skeleton variant="text" width={40} height={16} animation="wave" />
                  </TableCell>

                  {/* Total */}
                  <TableCell align="center">
                    <Skeleton variant="text" width={50} height={16} animation="wave" />
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Skeleton variant="rounded" width={80} height={28} animation="wave" />
                      <Skeleton variant="rounded" width={70} height={28} animation="wave" />
                      <Skeleton variant="rounded" width={60} height={28} animation="wave" />
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </div>
  )

  return (
    <>
      <div className="main-content" style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto'
      }}>
        <div className="header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '20px',
          marginBottom: '24px',
          padding: '0 20px'
        }}>
          <h1 style={{ margin: 0 }}>Projects</h1>
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}>
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary add-project-btn"
              style={{
                background: '#10b981',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
            >
              <Plus size={16} /> Add <span className="hide-mobile">Project</span>
            </button>
            <button
              onClick={handleExport}
              disabled={exporting || projects.length === 0}
              className="btn"
              style={{
                background: exporting ? '#e2e8f0' : '#f1f5f9',
                color: exporting ? '#94a3b8' : '#475569',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                cursor: exporting || projects.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                opacity: exporting || projects.length === 0 ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!exporting && projects.length > 0) {
                  e.currentTarget.style.background = '#e2e8f0'
                  e.currentTarget.style.borderColor = '#cbd5e1'
                }
              }}
              onMouseLeave={(e) => {
                if (!exporting && projects.length > 0) {
                  e.currentTarget.style.background = '#f1f5f9'
                  e.currentTarget.style.borderColor = '#e2e8f0'
                }
              }}
            >
              <Download size={16} /> {exporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>

        {/* Tracking Code Modal */}
        {showTrackingCode && selectedProject && (
          <div
            onClick={() => setShowTrackingCode(false)}
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
                maxWidth: '700px',
                width: '90%',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                animation: 'slideIn 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px 0' }}>
                    Tracking Code
                  </h2>
                  <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
                    {selectedProject.name} - {selectedProject.domain}
                  </div>


                </div>
                <button
                  onClick={() => setShowTrackingCode(false)}
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
                    transition: 'all 0.2s',
                    flexShrink: 0,
                    marginLeft: '16px'
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

              {/* Step 1: Tracking Code */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  fontSize: '16px',
                  color: '#1e293b',
                  marginBottom: '12px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{
                    background: '#3b82f6',
                    color: 'white',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>1</span>
                  Install Tracking Code
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#475569',
                  marginBottom: '12px',
                  fontWeight: '500'
                }}>
                  Copy and paste this code before the closing &lt;/head&gt; tag on your website:
                </div>

                <div style={{ position: 'relative' }}>
                  <pre style={{
                    background: '#1e293b',
                    color: '#e2e8f0',
                    padding: '20px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    overflow: 'auto',
                    margin: 0,
                    fontFamily: 'monospace'
                  }}>
                    {getTrackingCode(selectedProject)}
                  </pre>

                  <button
                    onClick={handleCopyCode}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      padding: '8px 16px',
                      background: copied ? '#10b981' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (!copied) e.currentTarget.style.background = '#2563eb'
                    }}
                    onMouseLeave={(e) => {
                      if (!copied) e.currentTarget.style.background = '#3b82f6'
                    }}
                  >
                    {copied ? (
                      <>
                        <Check size={14} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        Copy Code
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Add Project Modal */}
        {showForm && (
          <div
            onClick={() => setShowForm(false)}
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
                  Create New Project
                </h2>
                <button
                  onClick={() => setShowForm(false)}
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

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: '#475569',
                    fontSize: '14px'
                  }}>
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="My Website"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '2px solid #e2e8f0',
                      fontSize: '14px',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                    required
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: '#475569',
                    fontSize: '14px'
                  }}>
                    Domain *
                  </label>
                  <input
                    type="text"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    placeholder="example.com"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '2px solid #e2e8f0',
                      fontSize: '14px',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                    required
                  />
                  <div style={{
                    fontSize: '12px',
                    color: '#64748b',
                    marginTop: '6px'
                  }}>
                    Enter your website domain (e.g., mywebsite.com)
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: '12px 24px',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
                  >
                    <Plus size={16} />
                    Create Project
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    style={{
                      flex: 1,
                      padding: '12px 24px',
                      background: '#f1f5f9',
                      color: '#475569',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="content" style={{ padding: '0 20px' }}>
          <div className="table-responsive-wrapper" style={{
            padding: 0,
            overflowX: 'auto',
            marginTop: '0',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <table style={{ width: '100%' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569', minWidth: '200px' }}>Project</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#475569', minWidth: '180px' }}>Traffic Trend</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#475569' }}>Today</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#475569' }}>Yesterday</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#475569', minWidth: '100px' }}>This Month</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#475569' }}>Total</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#475569', minWidth: '250px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr
                    key={project.id}
                    style={{
                      borderBottom: '1px solid #e2e8f0'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td data-label="Project" style={{ padding: '16px' }}>
                      <div>
                        <div
                          onClick={() => navigate(`/dashboard/project/${project.id}/summary`)}
                          style={{
                            fontWeight: '600',
                            color: '#1e40af',
                            marginBottom: '4px',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderRadius = '4px'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.transform = 'scale(1)'
                            e.currentTarget.style.padding = '0'
                            e.currentTarget.style.borderRadius = '0'
                          }}
                        >
                          {project.name}
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                          {project.domain}
                        </div>
                      </div>
                    </td>
                    <td data-label="Traffic Trend" style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ width: '160px', height: '35px', margin: '0 auto' }}>
                        <LineChart
                          displayData={(() => {
                            // Generate deterministic trend data based on project ID and stats
                            const baseValue = Math.max(project.today, project.yesterday, 1)
                            const variation = Math.max(baseValue * 0.3, 5) // 30% variation or minimum 5
                            
                            // Create a simple hash from project ID for consistent randomness
                            const createSeed = (id) => {
                              let hash = 0
                              for (let i = 0; i < id.length; i++) {
                                const char = id.charCodeAt(i)
                                hash = ((hash << 5) - hash) + char
                                hash = hash & hash // Convert to 32-bit integer
                              }
                              return Math.abs(hash)
                            }
                            
                            const seed = createSeed(project.id.toString())
                            const seededRandom = (index) => {
                              const x = Math.sin(seed + index) * 10000
                              return x - Math.floor(x)
                            }

                            return [
                              { date: '5d', page_views: Math.max(1, Math.round(baseValue + (seededRandom(1) - 0.5) * variation)) },
                              { date: '4d', page_views: Math.max(1, Math.round(baseValue + (seededRandom(2) - 0.5) * variation)) },
                              { date: '3d', page_views: Math.max(1, Math.round(baseValue + (seededRandom(3) - 0.3) * variation)) },
                              { date: '2d', page_views: project.yesterday || Math.max(1, Math.round(baseValue * 0.8)) },
                              { date: '1d', page_views: project.today || Math.max(1, Math.round(baseValue)) },
                              { date: 'now', page_views: Math.max(1, Math.round(baseValue + (seededRandom(4) - 0.2) * variation * 0.5)) }
                            ]
                          })()}
                          showPageViews={true}
                          showUniqueVisits={false}
                          showReturningVisits={false}
                        />
                      </div>
                      <div style={{
                        fontSize: '11px',

                        marginTop: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        fontWeight: '500'
                      }}>


                      </div>
                    </td>
                    <td data-label="Today" style={{ padding: '16px', textAlign: 'center', fontWeight: '500', color: '#1e293b' }}>
                      {project.today}
                    </td>
                    <td data-label="Yesterday" style={{ padding: '16px', textAlign: 'center', fontWeight: '500', color: '#1e293b' }}>
                      {project.yesterday}
                    </td>
                    <td data-label="This Month" style={{ padding: '16px', textAlign: 'center', fontWeight: '500', color: '#1e293b' }}>
                      {project.month}
                    </td>
                    <td data-label="Total" style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#3b82f6' }}>
                      {project.total.toLocaleString()}
                    </td>
                    <td data-label="Actions" style={{ padding: '16px', textAlign: 'center' }}>
                      <div className="actions-container" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => navigate(`/dashboard/project/${project.id}/summary`)}
                          style={{
                            padding: '6px 12px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                        >
                          <BarChart2 size={14} />
                          View Stats
                        </button>
                        <button
                          onClick={() => handleShowTrackingCode(project)}
                          style={{
                            padding: '6px 12px',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
                        >
                          <Code size={14} />
                          Get Code
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project)}
                          style={{
                            padding: '6px 12px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {projects.length === 0 && !showForm && (
              <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                <p>No projects yet. Create your first project to get started!</p>
              </div>
            )}
          </div>
          <style>
            {`
            @media (max-width: 768px) {
              .header {
                padding: 15px !important;
                flex-direction: column !important;
                align-items: flex-start !important;
              }
              .header h1 {
                font-size: 24px !important;
                margin-bottom: 10px !important;
              }
              .content {
                padding: 10px !important;
              }
              .table-responsive-wrapper {
                margin: 0 !important;
                border: none !important;
                background: transparent !important;
                box-shadow: none !important;
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
              td[data-label="Traffic Trend"] > div {
                margin: 0 !important;
                width: 120px !important;
              }
              .actions-container {
                justify-content: flex-end !important;
                flex-wrap: wrap !important;
                gap: 5px !important;
              }
            }
        `}
          </style>
        </div>
      </div>
    </>
  )
}

export default Projects