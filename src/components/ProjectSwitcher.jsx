import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Search, Plus, Globe } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { projectsAPI } from '../api/api'

function ProjectSwitcher({ currentProjectId, currentProjectName }) {
  const [isOpen, setIsOpen] = useState(false)
  const [projects, setProjects] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const dropdownRef = useRef(null)

  // Fetch projects when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchProjects()
    }
  }, [isOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const response = await projectsAPI.getSwitcher()
      setProjects(response.data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.domain.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleProjectSelect = (projectId) => {
    // Get current path without project ID
    const currentPath = window.location.pathname
    const pathParts = currentPath.split('/')
    
    // Find the project index and extract the current page
    const projectIndex = pathParts.findIndex(part => part === 'project')
    let currentPage = 'summary' // default page
    
    if (projectIndex !== -1 && pathParts[projectIndex + 2]) {
      currentPage = pathParts[projectIndex + 2]
    }
    
    // Navigate to same page for selected project
    navigate(`/dashboard/project/${projectId}/${currentPage}`)
    setIsOpen(false)
    setSearchQuery('')
  }

  const handleCreateProject = () => {
    navigate('/dashboard')
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('openAddProject'))
    }, 100)
    setIsOpen(false)
  }

  return (
    <div className="project-switcher" ref={dropdownRef}>
      {/* Current Project Button */}
      <button
        className="project-switcher-button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '8px',
          color: '#60a5fa',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.2s ease',
          minWidth: '200px',
          justifyContent: 'space-between'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(59, 130, 246, 0.2)'
          e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)'
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(59, 130, 246, 0.1)'
          e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
          <Globe size={16} />
          <span style={{ 
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            maxWidth: '150px'
          }}>
            {currentProjectName || 'Select Project'}
          </span>
        </div>
        <ChevronDown size={16} style={{ 
          transition: 'transform 0.2s ease',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
        }} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="project-switcher-dropdown"
          style={{
            position: 'absolute',
            top: '100%',
            left: '0',
            right: '0',
            marginTop: '4px',
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
            zIndex: 1000,
            maxHeight: '400px',
            overflow: 'hidden'
          }}
        >
          {/* Search */}
          <div style={{ padding: '12px', borderBottom: '1px solid #334155' }}>
            <div style={{ position: 'relative' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b'
                }}
              />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: '#e2e8f0',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Projects List */}
          <div style={{ 
            maxHeight: '250px', 
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: '#475569 #1e293b'
          }}>
            {loading ? (
              <div style={{ 
                padding: '20px', 
                textAlign: 'center', 
                color: '#64748b',
                fontSize: '14px'
              }}>
                Loading projects...
              </div>
            ) : filteredProjects.length === 0 ? (
              <div style={{ 
                padding: '20px', 
                textAlign: 'center', 
                color: '#64748b',
                fontSize: '14px'
              }}>
                {searchQuery ? 'No projects found' : 'No projects available'}
              </div>
            ) : (
              filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className={`project-option ${project.id == currentProjectId ? 'current' : ''}`}
                  onClick={() => handleProjectSelect(project.id)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #334155',
                    transition: 'background 0.2s ease',
                    background: project.id == currentProjectId ? 'rgba(59, 130, 246, 0.2)' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (project.id != currentProjectId) {
                      e.target.style.background = 'rgba(59, 130, 246, 0.1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (project.id != currentProjectId) {
                      e.target.style.background = 'transparent'
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Globe size={16} color={project.id == currentProjectId ? '#60a5fa' : '#64748b'} />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{
                        color: project.id == currentProjectId ? '#60a5fa' : '#e2e8f0',
                        fontSize: '14px',
                        fontWeight: project.id == currentProjectId ? '600' : '400',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {project.name}
                      </div>
                      <div style={{
                        color: '#64748b',
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginTop: '2px'
                      }}>
                        {project.domain}
                      </div>
                    </div>
                    {project.id == currentProjectId && (
                      <div style={{
                        background: '#60a5fa',
                        color: '#0f172a',
                        fontSize: '10px',
                        fontWeight: '600',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        textTransform: 'uppercase'
                      }}>
                        Current
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

         
        </div>
      )}
    </div>
  )
}

export default ProjectSwitcher
