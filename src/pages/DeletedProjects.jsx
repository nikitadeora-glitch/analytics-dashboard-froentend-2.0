import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { projectsAPI } from '../api/api'
import { RotateCcw, Trash2, AlertCircle } from 'lucide-react'
import { Skeleton, Box, TableContainer, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material'

function DeletedProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [successMessage, setSuccessMessage] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadDeletedProjects()
  }, [])

  const loadDeletedProjects = async () => {
    try {
      setLoading(true)
      const response = await projectsAPI.getDeleted()
      setProjects(response.data)
    } catch (error) {
      console.error('Error loading deleted projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRestoreProject = async (project) => {
    if (window.confirm(`Are you sure you want to restore "${project.name}"? It will be moved back to your active projects.`)) {
      try {
        await projectsAPI.restore(project.id)
        setSuccessMessage('Project restored successfully!')
        setTimeout(() => setSuccessMessage(null), 3000)
        loadDeletedProjects() // Refresh the list
      } catch (error) {
        console.error('Error restoring project:', error)
        alert('Failed to restore project. Please try again.')
      }
    }
  }

  if (loading) return (
    <div className="main-content">
      {/* Header Skeleton */}
      <Box className="header" sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '20px',
        marginBottom: '24px',
        padding: '0 20px'
      }}>
        <Skeleton variant="text" width={180} height={40} animation="wave" />
      </Box>

      {/* Table Skeleton */}
      <Box sx={{ padding: '0 20px' }}>
        <TableContainer sx={{
          background: 'white',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <Table>
            <TableHead sx={{ background: '#fef2f2' }}>
              <TableRow>
                <TableCell><Skeleton variant="text" width={80} height={16} animation="wave" /></TableCell>
                <TableCell><Skeleton variant="text" width={100} height={16} animation="wave" /></TableCell>
                <TableCell><Skeleton variant="text" width={80} height={16} animation="wave" /></TableCell>
                <TableCell><Skeleton variant="text" width={120} height={16} animation="wave" /></TableCell>
                <TableCell><Skeleton variant="text" width={80} height={16} animation="wave" /></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[1, 2, 3, 4, 5].map(i => (
                <TableRow key={i} sx={{ borderBottom: '1px solid #fecaca' }}>
                  <TableCell>
                    <Box>
                      <Skeleton variant="text" width={140} height={16} animation="wave" sx={{ marginBottom: 0.5 }} />
                      <Skeleton variant="text" width={100} height={13} animation="wave" />
                    </Box>
                  </TableCell>
                  <TableCell><Skeleton variant="text" width={100} height={16} animation="wave" /></TableCell>
                  <TableCell><Skeleton variant="text" width={80} height={16} animation="wave" /></TableCell>
                  <TableCell><Skeleton variant="text" width={120} height={16} animation="wave" /></TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Skeleton variant="rounded" width={80} height={28} animation="wave" />
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ margin: 0, color: '#413f3fff' }}>Deleted Projects</h1>
            <div style={{
              background: '#fef2f2',
              color: '#e6d6d6ff',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              
            </div>
          </div>
        </div>

        {/* Success Message Popup */}
        {successMessage && (
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: '#10b981',
              color: 'white',
              padding: '16px 24px',
              borderRadius: '12px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              zIndex: 2000,
              fontSize: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              animation: 'slideIn 0.3s ease',
              minWidth: '250px',
              justifyContent: 'center'
            }}
          >
            <div style={{
              width: '8px',
              height: '8px',
              background: 'white',
              borderRadius: '50%',
              animation: 'pulse 1.5s infinite'
            }} />
            {successMessage}
          </div>
        )}

        <div className="content" style={{ padding: '0 20px' }}>
          <div className="table-responsive-wrapper" style={{
            padding: 0,
            overflowX: 'auto',
            marginTop: '0',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            
          }}>
            <table style={{ width: '100%' }}>
              <thead>
                <tr style={{ background: '#fef2f2', borderBottom: '2px solid #faf8f8ff' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#black', minWidth: '200px' }}>Project</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#black' }}>Domain</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#black' }}>Created</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#black' }}>Tracking Code</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#black', minWidth: '150px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr
                    key={project.id}
                    style={{
                      borderBottom: '1px solid #fecaca',
                      background: '#fafafa'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#fafafa'}
                  >
                    <td data-label="Project" style={{ padding: '16px' }}>
                      <div>
                        <div
                          style={{
                            fontWeight: '600',
                            color: '#1E40AF',
                            marginBottom: '4px'
                          }}
                        >
                          {project.name}
                        </div>
                        
                      </div>
                    </td>
                    <td data-label="Domain" style={{ padding: '16px', color: '#64748B' }}>
                      {project.domain}
                    </td>
                    <td data-label="Created" style={{ padding: '16px', color: '#64748B' }}>
                      {project.created_at ? new Date(project.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : 'N/A'}
                    </td>
                    <td data-label="Tracking Code" style={{ padding: '16px' }}>
                      <code style={{
                        background: '#f3f4f6',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>
                        {project.tracking_code.substring(0, 8)}...
                      </code>
                    </td>
                    <td data-label="Actions" style={{ padding: '16px', textAlign: 'center' }}>
                      <div className="actions-container" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleRestoreProject(project)}
                          style={{
                            padding: '8px 16px',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
                          title="Restore this project"
                        >
                          <RotateCcw size={14} />
                          Restore
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {projects.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px', color: '#991b1b' }}>
                <Trash2 size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p style={{ fontSize: '18px', marginBottom: '8px' }}>No deleted projects</p>
                <p style={{ fontSize: '14px', opacity: 0.7 }}>Projects you delete will appear here</p>
              </div>
            )}
          </div>
          <style>
            {`
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.9);
              }
              to {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
              }
            }
            @keyframes pulse {
              0%, 100% {
                opacity: 1;
              }
              50% {
                opacity: 0.5;
              }
            }
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
                border: 1px solid #fecaca !important;
              }
              td {
                text-align: right !important;
                padding: 10px 15px !important;
                position: relative !important;
                border-bottom: 1px solid #fef2f2 !important;
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
                color: #dc2626;
                font-size: 13px;
                text-align: left !important;
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

export default DeletedProjects
