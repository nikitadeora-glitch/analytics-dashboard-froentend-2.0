import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { projectsAPI } from '../api/api'
import { Plus, Settings, BarChart2, Download, Code, Copy, Check } from 'lucide-react'

function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', domain: '' })
  const [showTrackingCode, setShowTrackingCode] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [copied, setCopied] = useState(false)
  const [apiUrl, setApiUrl] = useState('http://127.0.0.1:8000')
  const navigate = useNavigate()

  useEffect(() => {
    loadProjects()
    const interval = setInterval(loadProjects, 30000) // Refresh every 30s
    
    const handleOpenAddProject = () => {
      setShowForm(true)
    }
    
    window.addEventListener('openAddProject', handleOpenAddProject)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('openAddProject', handleOpenAddProject)
    }
  }, [])

  const loadProjects = async () => {
    try {
      const response = await projectsAPI.getAllStats()
      setProjects(response.data)
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
      loadProjects()
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
    return `<!-- State Counter Analytics Tracking Code -->\n<script src="${apiUrl}/analytics.js" data-project-id="${project.id}" data-api-url="${apiUrl}/api" data-debug="true"></script>\n<!-- End Analytics Code -->`
  }

  if (loading) return <div className="loading">Loading projects...</div>

  return (
    <div className="main-content">
      <div className="header">
        <h1>Projects</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn" style={{ background: '#f1f5f9', color: '#475569' }}>
            <Download size={16} /> Export
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
                  📊 Tracking Code
                </h2>
                <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
                  {selectedProject.name} - {selectedProject.domain}
                </div>
                
                {/* API URL Configuration */}
                <div style={{ marginTop: '16px' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '13px', 
                    fontWeight: '600', 
                    color: '#475569',
                    marginBottom: '8px' 
                  }}>
                    API URL (Change for production):
                  </label>
                  <input
                    type="text"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="http://127.0.0.1:8000"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  />
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                    💡 For prpwebs.com, use ngrok or deploy backend to cloud
                  </div>
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

            <div style={{ marginBottom: '20px' }}>
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

            <div style={{
              padding: '16px',
              background: '#eff6ff',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#1e40af',
              border: '1px solid #bfdbfe',
              marginBottom: '16px'
            }}>
              <strong style={{ color: '#1e40af' }}>💡 Note:</strong> This tracking code is configured for Project ID: <strong>{selectedProject.id}</strong>. All analytics data will be tracked under this project.
            </div>

            <div style={{
              padding: '16px',
              background: '#fef3c7',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#92400e',
              border: '1px solid #fde68a',
              marginBottom: '12px'
            }}>
              <strong style={{ color: '#92400e' }}>⚠️ For External Websites (like prpwebs.com):</strong>
              <ul style={{ margin: '8px 0 0 20px', paddingLeft: 0 }}>
                <li>Localhost URL won't work on external sites</li>
                <li>Use <strong>ngrok</strong> for testing: <code style={{ background: '#fbbf24', padding: '2px 6px', borderRadius: '4px' }}>ngrok http 8000</code></li>
                <li>For production: Deploy backend to cloud (Heroku, Railway, etc.)</li>
                <li>Update API URL above with your public URL</li>
              </ul>
            </div>

            <div style={{
              padding: '16px',
              background: '#dcfce7',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#166534',
              border: '1px solid #bbf7d0'
            }}>
              <strong style={{ color: '#166534' }}>✅ Quick Setup with ngrok:</strong>
              <ol style={{ margin: '8px 0 0 20px', paddingLeft: 0 }}>
                <li>Install ngrok: <code style={{ background: '#86efac', padding: '2px 6px', borderRadius: '4px' }}>npm install -g ngrok</code></li>
                <li>Run: <code style={{ background: '#86efac', padding: '2px 6px', borderRadius: '4px' }}>ngrok http 8000</code></li>
                <li>Copy the https URL (e.g., https://abc123.ngrok.io)</li>
                <li>Paste it in the API URL field above</li>
                <li>Copy the updated tracking code</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      <div className="content">
        {showForm && (
          <div className="chart-container" style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '16px' }}>Create New Project</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Project Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  required
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Domain</label>
                <input
                  type="text"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  placeholder="example.com"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary">Create Project</button>
                <button type="button" className="btn" onClick={() => setShowForm(false)} style={{ background: '#f1f5f9', color: '#475569' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="chart-container" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Project</th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#475569' }}>Traffic</th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#475569' }}>Today</th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#475569' }}>Yesterday</th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#475569' }}>This Month</th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#475569' }}>Total</th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#475569' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr 
                  key={project.id} 
                  style={{ 
                    borderBottom: '1px solid #e2e8f0',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '16px' }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                        {project.name}
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>
                        {project.domain}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <span style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '4px',
                      padding: '4px 12px',
                      background: '#dbeafe',
                      color: '#1e40af',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}>
                      <BarChart2 size={14} />
                      {project.page_views} views
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center', fontWeight: '500', color: '#1e293b' }}>
                    {project.today}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center', fontWeight: '500', color: '#1e293b' }}>
                    {project.yesterday}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center', fontWeight: '500', color: '#1e293b' }}>
                    {project.month}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#3b82f6' }}>
                    {project.total.toLocaleString()}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => navigate(`/project/${project.id}/summary`)}
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
                        style={{
                          padding: '6px 10px',
                          background: '#f1f5f9',
                          color: '#64748b',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#e2e8f0'
                          e.currentTarget.style.color = '#475569'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#f1f5f9'
                          e.currentTarget.style.color = '#64748b'
                        }}
                      >
                        <Settings size={16} />
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
      </div>
    </div>
  )
}

export default Projects
