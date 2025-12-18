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

  useEffect(() => {
    loadMap()
  }, [projectId])

  const loadMap = async () => {
    try {
      const response = await visitorsAPI.getMap(projectId)
      setLocations(response.data)
    } catch (error) {
      console.error('Error loading map:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <>
      <div className="header">
        <h1>Visitor Map</h1>
      </div>
      <div className="content">
        <Box className="chart-container">
          {/* Map Placeholder - Material-UI */}
          <Box sx={{
            width: '100%',
            height: '500px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <Skeleton 
              variant="rectangular" 
              width="100%" 
              height="100%" 
              animation="wave"
              sx={{ 
                borderRadius: 2,
                border: '1px solid #e2e8f0'
              }}
            />
            
            {/* Map Icon Overlay */}
            <Box sx={{
              position: 'absolute',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 1
            }}>
              <Box sx={{ fontSize: '48px', marginBottom: 2, opacity: 0.3 }}>
                🗺️
              </Box>
              <Box sx={{ fontSize: '16px', color: '#64748b', fontWeight: 500 }}>
                Loading visitor locations...
              </Box>
            </Box>
          </Box>
        </Box>
      </div>
    </>
  )

  return (
    <>
      <div className="header">
        <h1>🗺️ Visitor Map</h1>
      </div>

      <div className="content">
        {/* Interactive Real World Map */}
        <div className="chart-container" style={{ padding: 0, height: 'calc(100vh - 120px)' }}>
          
          {locations.length > 0 ? (
            <div style={{ 
              height: '100%',
              width: '100%',
              position: 'relative'
            }}>
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
                      <Popup>
                        <div style={{ padding: '8px', minWidth: '200px' }}>
                          <div style={{ 
                            fontSize: '16px', 
                            fontWeight: '700', 
                            color: '#1e293b',
                            marginBottom: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            📍 {loc.city || 'Unknown City'}
                          </div>
                          <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>
                            <strong>State:</strong> {loc.state || 'N/A'}
                          </div>
                          <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
                            <strong>Country:</strong> {loc.country || 'Unknown'}
                          </div>
                          <div style={{
                            padding: '8px 12px',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            color: 'white',
                            borderRadius: '6px',
                            textAlign: 'center',
                            fontSize: '14px',
                            fontWeight: '600'
                          }}>
                            👥 {loc.count} Visitor{loc.count > 1 ? 's' : ''}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  )
                })}
              </MapContainer>

              {/* Legend */}
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
                  <span>Active Visitors</span>
                </div>
                <div style={{ marginTop: '4px', fontSize: '11px', color: '#94a3b8' }}>
                  Circle size = Number of visitors
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
                <p style={{ fontSize: '14px' }}>Visitors with location data will appear on the map</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default VisitorMap
