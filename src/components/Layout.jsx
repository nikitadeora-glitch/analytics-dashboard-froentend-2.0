import { Plus, FolderOpen, BarChart2, LogOut, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import analyticImage from '../assets/analytic.png'

function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const isActive = (path) => location.pathname === path
  const isDashboard = location.pathname.includes('/project/')

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="app">
      {!isDashboard && (
        <>
          {/* Mobile Header */}
          <div className="mobile-header" style={{
            display: 'none',
            padding: '12px 20px',
            backgroundColor: '#0f172a', // Dark theme for mobile header
            borderBottom: '1px solid #1e293b',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1001
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={20} color="#60a5fa" />
              <h2 style={{ margin: 0, color: 'white', fontSize: '18px' }}>Statify</h2>
            </div>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px'
              }}
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Sidebar Overlay */}
          {isSidebarOpen && (
            <div
              onClick={() => setIsSidebarOpen(false)}
              className="sidebar-overlay"
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 999
              }}
            />
          )}

          <div
            className={`sidebar ${isSidebarOpen ? 'open' : ''}`}
            style={{
              backgroundImage: `url(${analyticImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              position: 'relative',
              transition: 'transform 0.3s ease'
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
              <div className="sidebar-brand" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '30px',
                paddingTop: '30px'
              }}>
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
        </>
      )}

      <div className="main-content-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </div>

      <style>
        {`
          @media (max-width: 768px) {
            .mobile-header {
              display: flex !important;
            }
            .sidebar {
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              bottom: 0 !important;
              transform: translateX(-100%) !important;
              z-index: 2000 !important;
              width: 280px !important;
              box-shadow: 4px 0 15px rgba(0, 0, 0, 0.3) !important;
              padding-top: 20px !important;
            }
            .sidebar.open {
              transform: translateX(0) !important;
            }
            .app {
              padding-top: 60px !important;
              flex-direction: column !important;
              overflow-x: hidden !important;
              width: 100vw !important;
            }
            .main-content-wrapper {
              width: 100% !important;
              overflow-x: hidden !important;
            }
            .sidebar-brand {
              display: none !important;
            }
          }
        `}
      </style>
    </div>
  )
}

export default Layout