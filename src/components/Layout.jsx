import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Plus, FolderOpen, BarChart2, LogOut } from 'lucide-react'
import analyticImage from '../assets/analytic.png'

function Layout() {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => location.pathname === path
  const isDashboard = location.pathname.includes('/project/')

  const handleLogout = () => {
    // Clear any stored auth tokens
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // Navigate to login page
    navigate('/login')
  }

  return (
    <div className="app">
      {!isDashboard && (
        <div 
          className="sidebar"
          style={{
            backgroundImage: `url(${analyticImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            position: 'relative'
          }}
        >
          {/* Overlay for better text readability */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            zIndex: 1
          }} />
          
          {/* Content */}
          <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '30px' }}>
              <BarChart2 size={24} color="#60a5fa" />
              <h2 style={{ margin: 0, color: 'white' }}>Statify</h2>
            </div>

            <div style={{ marginBottom: '24px', flex: 1 }}>
              <div style={{ 
                fontSize: '11px', 
                fontWeight: '600', 
                color: '#cbd5e1', 
                marginBottom: '12px',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                PROJECTS
                <button
                  onClick={() => navigate('/dashboard')}
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
                className={`menu-item ${isActive('/dashboard') ? 'active' : ''}`}
                onClick={() => navigate('/dashboard')}
                style={{
                  color: 'white',
                  backgroundColor: isActive('/dashboard') ? 'rgba(59, 130, 246, 0.2)' : 'transparent'
                }}
              >
                <FolderOpen size={18} />
                Projects
              </div>

              <div 
                className="menu-item"
                onClick={() => {
                  navigate('/dashboard')
                  setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('openAddProject'))
                  }, 100)
                }}
                style={{ color: 'white' }}
              >
                <Plus size={18} />
                Add Project
              </div>
            </div>

            {/* Logout Button at Bottom */}
            <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
              <div 
                className="menu-item"
                onClick={handleLogout}
                style={{ 
                  color: '#f1ededff',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  paddingTop: '16px',
                  marginTop: '16px'
                }}
              >
                <LogOut size={18} />
                Logout
              </div>
            </div>
          </div>
        </div>
      )}

      <Outlet />
    </div>
  )
}

export default Layout
