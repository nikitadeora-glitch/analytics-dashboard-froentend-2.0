import { BarChart3, FileText, TrendingUp, Activity, ArrowLeft, BarChart2, ChevronDown, ChevronRight, Users, Route as RouteIcon, Map, Eye, LogOut, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useParams, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import analyticImage from '../assets/analytic.png'
import Summary from './dashboard/Summary'
import Pages from './dashboard/Pages'
import TrafficSourcesSimple from './dashboard/TrafficSourcesSimple'
import TrafficSourceDetailView from './dashboard/TrafficSourceDetailView'
import VisitorActivity from './dashboard/VisitorActivity'
import VisitorPath from './dashboard/VisitorPath'
import PagesView from './dashboard/PagesView'
import CameFrom from './dashboard/CameFrom'
import ExitLink from './dashboard/ExitLink'
import VisitorMap from './dashboard/VisitorMap'
import Reports from './dashboard/Reports'
import HourlyView from './dashboard/HourlyView'

function Dashboard() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [isRecentActivityOpen, setIsRecentActivityOpen] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Close sidebar on path change
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    // Clear any stored auth tokens
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // Navigate to login page
    navigate('/login')
  }

  const menuItems = [
    { path: 'summary', label: 'Summary', icon: BarChart3 },
    { path: 'pages', label: 'Pages', icon: FileText },
    { path: 'traffic', label: 'Traffic Sources', icon: TrendingUp },
    {
      label: 'Recent Activity',
      icon: Activity,
      isDropdown: true,
      subItems: [
        { path: 'visitor-activity', label: 'Visitor Activity', icon: Users },
        { path: 'visitor-path', label: 'Visitor Path', icon: RouteIcon },
        { path: 'pages-view', label: 'Pages View', icon: Eye },
        { path: 'came-from', label: 'Came From', icon: TrendingUp },
        { path: 'exit-link', label: 'Exit Link', icon: LogOut },
        { path: 'visitor-map', label: 'Visitor Map', icon: Map }
      ]
    },
    { path: 'reports', label: 'Reports', icon: FileText }
  ]

  const isActive = (path) => location.pathname.includes(path)

  return (
    <div className="app-container" style={{ display: 'flex', flex: 1, height: '100vh', position: 'relative' }}>
      {/* Mobile Header */}
      <div className="mobile-header" style={{
        display: 'none',
        padding: '12px 20px',
        backgroundColor: '#0f172a',
        borderBottom: '1px solid #1e293b',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1001,
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
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
          borderLeft: '1px solid #1e293b',
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
            gap: '10px',
            marginBottom: '32px',
            padding: '24px 16px 0 16px'
          }}>
            <BarChart2 size={24} color="#60a5fa" strokeWidth={2.5} />
            <h2 style={{ margin: 0, color: 'white', fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' }}>Statify</h2>
          </div>

          <div
            className="menu-item back-button"
            onClick={() => navigate('/dashboard')}
            style={{
              marginBottom: '20px',
              background: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            <ArrowLeft size={18} color="#60a5fa" />
            <span style={{ fontWeight: '600', fontSize: '14px' }}>Back to Projects</span>
          </div>

          <div style={{
            fontSize: '11px',
            fontWeight: '600',
            color: '#cbd5e1',
            marginBottom: '12px',
            letterSpacing: '0.5px'
          }}>
            ANALYTICS
          </div>

          <div style={{ flex: 1 }}>
            {menuItems.map((item, idx) => (
              <div key={idx}>
                {item.isDropdown ? (
                  <>
                    <div
                      className="menu-item"
                      onClick={() => setIsRecentActivityOpen(!isRecentActivityOpen)}
                      style={{
                        cursor: 'pointer',
                        background: isRecentActivityOpen ? 'rgba(30, 41, 59, 0.8)' : 'transparent',
                        justifyContent: 'space-between',
                        color: 'white'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <item.icon size={18} />
                        {item.label}
                      </div>
                      {isRecentActivityOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                    {isRecentActivityOpen && (
                      <div style={{
                        marginLeft: '12px',
                        borderLeft: '2px solid rgba(51, 65, 85, 0.8)',
                        paddingLeft: '8px',
                        marginTop: '4px',
                        marginBottom: '8px'
                      }}>
                        {item.subItems.map((sub, subIdx) => (
                          <div
                            key={subIdx}
                            className={`menu-item ${isActive(sub.path) ? 'active' : ''}`}
                            onClick={() => navigate(`/dashboard/project/${projectId}/${sub.path}`)}
                            style={{
                              padding: '10px 12px',
                              fontSize: '13px',
                              marginBottom: '2px',
                              color: 'white',
                              backgroundColor: isActive(sub.path) ? 'rgba(59, 130, 246, 0.2)' : 'transparent'
                            }}
                          >
                            <sub.icon size={16} />
                            {sub.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div
                    className={`menu-item ${isActive(item.path) ? 'active' : ''}`}
                    onClick={() => navigate(`/dashboard/project/${projectId}/${item.path}`)}
                    style={{
                      color: 'white',
                      backgroundColor: isActive(item.path) ? 'rgba(59, 130, 246, 0.2)' : 'transparent'
                    }}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Logout Button at Bottom */}
          <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
            <div
              className="menu-item"
              onClick={handleLogout}
              style={{
                color: '#f2e7e7ff',
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

      <div className="main-content" style={{ flex: 1, overflowY: 'auto' }}>
        <Routes>
          <Route path="summary" element={<Summary projectId={projectId} />} />
          <Route path="hourly/:date" element={<HourlyView projectId={projectId} />} />
          <Route path="pages" element={<Pages projectId={projectId} />} />
          <Route path="traffic" element={<TrafficSourcesSimple projectId={projectId} />} />
          <Route path="traffic/detail" element={<TrafficSourceDetailView projectId={projectId} />} />
          <Route path="visitor-activity" element={<VisitorActivity projectId={projectId} />} />
          <Route path="visitor-path" element={<VisitorPath projectId={projectId} />} />
          <Route path="pages-view" element={<PagesView projectId={projectId} />} />
          <Route path="came-from" element={<CameFrom projectId={projectId} />} />
          <Route path="exit-link" element={<ExitLink projectId={projectId} />} />
          <Route path="visitor-map" element={<VisitorMap projectId={projectId} />} />
          <Route path="reports" element={<Reports projectId={projectId} />} />
        </Routes>
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
              box-shadow: 10px 0 25px rgba(0, 0, 0, 0.5) !important;
              padding-top: 10px !important;
              overflow-x: hidden !important;
              background-color: #0f172a !important;
            }
            .sidebar .back-button {
              margin: 10px 16px !important;
            }
            .sidebar.open {
              transform: translateX(0) !important;
            }
            .app-container {
              padding-top: 56px !important;
              flex-direction: column !important;
              overflow-x: hidden !important;
              width: 100% !important;
              height: 100vh !important;
            }
            .main-content {
              width: 100% !important;
              padding: 0 !important;
              overflow-x: hidden !important;
            }
            .sidebar-brand {
              display: flex !important;
              padding: 20px 16px !important;
              margin-bottom: 10px !important;
            }
            .menu-item {
              margin: 2px 16px !important;
              padding: 12px 16px !important;
            }
            .sidebar-overlay {
              backdrop-filter: blur(2px) !important;
            }
          }
        `}
      </style>
    </div>
  )
}

export default Dashboard