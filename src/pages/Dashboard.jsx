import { useState } from 'react'
import { useParams, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { BarChart3, FileText, TrendingUp, Activity, ArrowLeft, BarChart2, ChevronDown, ChevronRight, Users, Route as RouteIcon, Map, Eye, Link, LogOut } from 'lucide-react'
import Summary from './dashboard/Summary'
import Pages from './dashboard/Pages'
import TrafficSources from './dashboard/TrafficSources'
import TrafficSourcesSimple from './dashboard/TrafficSourcesSimple'
import VisitorActivity from './dashboard/VisitorActivity'
import VisitorPath from './dashboard/VisitorPath'
import PagesView from './dashboard/PagesView'
import CameFrom from './dashboard/CameFrom'
import ExitLink from './dashboard/ExitLink'
import VisitorMap from './dashboard/VisitorMap'
import Reports from './dashboard/Reports'

function Dashboard() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [isRecentActivityOpen, setIsRecentActivityOpen] = useState(true)

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
      <div className="sidebar" style={{ borderLeft: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '30px' }}>
          <BarChart2 size={24} color="#60a5fa" />
          <h2 style={{ margin: 0 }}>StatCounter</h2>
        </div>

        <div 
          className="menu-item" 
          onClick={() => navigate('/')}
          style={{ marginBottom: '20px', background: '#1e293b', border: '1px solid #334155' }}
        >
          <ArrowLeft size={18} />
          Back to Projects
        </div>

        <div style={{ 
          fontSize: '11px', 
          fontWeight: '600', 
          color: '#94a3b8', 
          marginBottom: '12px',
          letterSpacing: '0.5px'
        }}>
          ANALYTICS
        </div>

        {menuItems.map((item, idx) => (
          <div key={idx}>
            {item.isDropdown ? (
              <>
                <div 
                  className="menu-item" 
                  onClick={() => setIsRecentActivityOpen(!isRecentActivityOpen)}
                  style={{ 
                    cursor: 'pointer',
                    background: isRecentActivityOpen ? '#1e293b' : 'transparent',
                    justifyContent: 'space-between'
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
                    borderLeft: '2px solid #334155',
                    paddingLeft: '8px',
                    marginTop: '4px',
                    marginBottom: '8px'
                  }}>
                    {item.subItems.map((sub, subIdx) => (
                      <div
                        key={subIdx}
                        className={`menu-item ${isActive(sub.path) ? 'active' : ''}`}
                        onClick={() => navigate(`/project/${projectId}/${sub.path}`)}
                        style={{
                          padding: '10px 12px',
                          fontSize: '13px',
                          marginBottom: '2px'
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
                onClick={() => navigate(`/project/${projectId}/${item.path}`)}
              >
                <item.icon size={18} />
                {item.label}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="main-content">
        <Routes>
          <Route path="summary" element={<Summary projectId={projectId} />} />
          <Route path="pages" element={<Pages projectId={projectId} />} />
          <Route path="traffic" element={<TrafficSourcesSimple projectId={projectId} />} />
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
