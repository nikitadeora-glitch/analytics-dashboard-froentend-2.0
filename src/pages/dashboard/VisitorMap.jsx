import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { visitorsAPI } from '../../api/api'
import { Globe } from 'lucide-react'
import { Skeleton, Box } from '@mui/material'

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom red pin icon
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

function VisitorMap({ projectId }) {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30') // Default 30 days

  useEffect(() => {
    loadMap()
  }, [projectId, dateRange])

  const loadMap = async () => {
    setLoading(true)
    try {
      const response = await visitorsAPI.getMapView(projectId, parseInt(dateRange))
      setLocations(response.data)
    } catch (error) {
      console.error('Error loading map:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="header">
        <h1>Visitor Map</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: 'white',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <option value="1">Today</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 3 Months</option>
          </select>
        </div>
      </div>

      <div className="content">
        {/* Interactive Real World Map */}
        <div className="chart-container" style={{ padding: 0, height: 'calc(100vh - 160px)', position: 'relative' }}>

          {loading && (
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(255,255,255,0.7)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div className="spinner"></div>
            </div>
          )}

          {locations.length > 0 ? (
            <div style={{ height: '100%', width: '100%' }}>
              <MapContainer
                center={[20, 0]}
                zoom={2}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
                zoomControl={true}
                dragging={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Visitor Pin Markers */}
                {locations.map((loc, idx) => {
                  if (!loc.latitude || !loc.longitude) return null

                  return (
                    <Marker
                      key={idx}
                      position={[parseFloat(loc.latitude), parseFloat(loc.longitude)]}
                      icon={redIcon}
                    >
                      <MapPopup
                        loc={loc}
                        projectId={projectId}
                        days={dateRange}
                      />
                    </Marker>
                  )
                })}
              </MapContainer>

              <div style={{
                position: 'absolute',
                bottom: '20px',
                right: '20px',
                background: 'white',
                padding: '16px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                fontSize: '12px',
                zIndex: 1000
              }}>
                <div style={{ fontWeight: '700', marginBottom: '8px', color: '#1e293b' }}>
                  📊 Legend
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    background: '#ef4444',
                    borderRadius: '50%',
                    border: '2px solid #dc2626'
                  }} />
                  <span>Active Visitors ({locations.length})</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f8fafc',
              color: '#94a3b8'
            }}>
              <div style={{ textAlign: 'center' }}>
                <Globe size={64} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                <p style={{ fontSize: '16px', fontWeight: '500' }}>No location data yet</p>
                <p style={{ fontSize: '14px' }}>Try selecting a different date range</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// Separate component for Popup logic to handle fetching
function MapPopup({ loc, projectId, days }) {
  const [visitors, setVisitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Fetch data only when popup is opened (mounted)
  useEffect(() => {
    // Leaflet mounts Popup content when opened
    loadVisitors()
  }, [])

  const loadVisitors = async () => {
    setLoading(true)
    try {
      const response = await visitorsAPI.getVisitorsByLocation(
        projectId,
        loc.latitude,
        loc.longitude,
        parseInt(days)
      )
      setVisitors(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error('Error fetching visitor details:', error)
      setVisitors([])
    } finally {
      setLoading(false)
    }
  }

  const currentVisitor = visitors[currentIndex]

  // Formatter helpers
  const formatTime = (isoString) => {
    if (!isoString) return 'N/A'

    // Ensure the date string is treated as UTC if it lacks timezone info
    let utcString = isoString
    if (typeof isoString === 'string' && !isoString.endsWith('Z') && !isoString.includes('+')) {
      utcString = isoString + 'Z'
    }

    const date = new Date(utcString)
    if (isNaN(date.getTime())) return 'N/A'

    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata'
    }) + ' (IST)'
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '0s'
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    let parts = []
    if (hrs > 0) parts.push(`${hrs} hour${hrs > 1 ? 's' : ''}`)
    if (mins > 0) parts.push(`${mins} min${mins > 1 ? 's' : ''}`)
    if (secs > 0 || parts.length === 0) parts.push(`${secs} sec${secs > 1 ? 's' : ''}`)

    return parts.join(' ')
  }

  return (
    <Popup maxWidth={400} minWidth={300}>
      <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#334155', fontFamily: 'Inter, sans-serif' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            <div className="spinner" style={{ width: '20px', height: '20px', border: '2px solid #e2e8f0', borderTop: '2px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          </div>
        ) : visitors.length === 0 ? (
          <div style={{ padding: '10px', textAlign: 'center', color: '#64748b' }}>
            No detailed data available
          </div>
        ) : currentVisitor ? (
          <>
            {/* Pagination Setup */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderBottom: '1px solid #e2e8f0',
              paddingBottom: '8px',
              marginBottom: '10px',
              fontWeight: '600',
              color: '#475569'
            }}>
              <div>
                <span
                  onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                  style={{
                    cursor: currentIndex > 0 ? 'pointer' : 'default',
                    color: currentIndex > 0 ? '#3b82f6' : '#cbd5e1',
                    marginRight: '8px',
                    fontWeight: 'bold'
                  }}
                >
                  PREV
                </span>
                <span style={{ color: '#cbd5e1' }}>-</span>
                <span
                  onClick={() => setCurrentIndex(prev => Math.min(visitors.length - 1, prev + 1))}
                  style={{
                    cursor: currentIndex < visitors.length - 1 ? 'pointer' : 'default',
                    color: currentIndex < visitors.length - 1 ? '#3b82f6' : '#cbd5e1',
                    marginLeft: '8px',
                    fontWeight: 'bold'
                  }}
                >
                  NEXT
                </span>
              </div>
              <div>
                Visitor {currentIndex + 1} of {visitors.length}
              </div>
            </div>

            {/* Details Content */}
            <div style={{ display: 'grid', gap: '6px' }}>
              <div>
                <strong>IP Address:</strong>
                <span style={{ color: '#2563eb', marginLeft: '6px' }}>
                  {currentVisitor.ip_address}
                </span>
              </div>

              <div>
                <strong>ISP:</strong> {currentVisitor.isp || 'Unknown'}
              </div>

              <div>
                <strong>Entry Page Time:</strong> {formatTime(currentVisitor.visited_at)}
              </div>

              <div>
                <strong>Session Length:</strong> {formatDuration(currentVisitor.session_duration)}
              </div>

              <div>
                <strong>Browser:</strong> {currentVisitor.browser}
              </div>

              <div>
                <strong>OS:</strong> {currentVisitor.os}
              </div>

              <div>
                <strong>Resolution:</strong> {currentVisitor.screen_resolution || 'N/A'}
              </div>

              <div>
                <strong>Location:</strong> {currentVisitor.city}, {currentVisitor.state}, {currentVisitor.country}
                <span style={{ marginLeft: '6px' }}>
                  {/* Simple flag emoji fallback if no image */}
                  {currentVisitor.country === 'India' ? '🇮🇳' :
                    currentVisitor.country === 'United States' ? '🇺🇸' : '🌍'}
                </span>
              </div>

              <div>
                <strong>Returning Visits:</strong> {currentVisitor.returning_visits || 1}
              </div>

              <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <strong>Entry Page:</strong>
                <a href={currentVisitor.entry_page} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none', marginLeft: '4px' }}>
                  {currentVisitor.entry_page} ↗
                </a>
              </div>

              <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <strong>Exit Page:</strong>
                <a href={currentVisitor.exit_page} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none', marginLeft: '4px' }}>
                  {currentVisitor.exit_page || 'N/A'} ↗
                </a>
              </div>

              <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <strong>Referring URL:</strong>
                <a href={currentVisitor.referrer} target="_blank" rel="noopener noreferrer" style={{ color: '#22c55e', textDecoration: 'none', marginLeft: '4px' }}>
                  {currentVisitor.referrer || 'Direct'} ↗
                </a>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </Popup>
  )
}

export default VisitorMap
