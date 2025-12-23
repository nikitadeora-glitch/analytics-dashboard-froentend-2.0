import { useState } from 'react'
import { useParams, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { BarChart3, FileText, TrendingUp, Activity, ArrowLeft, BarChart2, ChevronDown, ChevronRight, Users, Route as RouteIcon, Map, Eye, LogOut } from 'lucide-react'
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
    <div style={{ display: 'flex', flex: 1, height: '100vh' }}>
      <div
        className="sidebar"
        style={{
          borderLeft: '1px solid #1e293b',
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

          <div
            className="menu-item"
            onClick={() => navigate('/dashboard')}
            style={{
              marginBottom: '20px',
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(51, 65, 85, 0.8)',
              color: 'white'
            }}
          >
            <ArrowLeft size={18} />
            Back to Projects
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

      <div className="main-content">
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
    </div>
  )
}

export default Dashboard