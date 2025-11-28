import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Plus, FolderOpen, BarChart2 } from 'lucide-react'

function Layout() {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => location.pathname === path
  const isDashboard = location.pathname.includes('/project/')

  return (
    <div className="app">
      {!isDashboard && (
        <div className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '30px' }}>
          <BarChart2 size={24} color="#60a5fa" />
          <h2 style={{ margin: 0 }}>Analytics</h2>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ 
            fontSize: '11px', 
            fontWeight: '600', 
            color: '#94a3b8', 
            marginBottom: '12px',
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            PROJECTS
            <button
              onClick={() => navigate('/')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#60a5fa',
                cursor: 'pointer',
                padding: '4px'
              }}
              title="View all projects"
            >
            
            </button>
          </div>

          <div 
            className={`menu-item ${isActive('/') ? 'active' : ''}`}
            onClick={() => navigate('/')}
          >
            <FolderOpen size={18} />
            Projects
          </div>

          <div 
            className="menu-item"
            onClick={() => {
              navigate('/')
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('openAddProject'))
              }, 100)
            }}
          >
            <Plus size={18} />
            Add Project
          </div>
        </div>
        </div>
      )}

      <Outlet />
    </div>
  )
}

export default Layout
