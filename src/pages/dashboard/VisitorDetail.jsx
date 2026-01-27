import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { visitorsAPI } from '../../api/api'
import { ArrowLeft, Globe, Monitor, Smartphone, Tablet, Clock, Calendar, User, MapPin, Eye, ExternalLink, Link } from 'lucide-react'

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom visitor icon
const visitorIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

export default function VisitorDetail() {
  const { visitorId } = useParams()
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVisitorDetail()
  }, [visitorId, projectId])

  const loadVisitorDetail = async () => {
    try {
      setLoading(true)
      const response = await visitorsAPI.getVisitorDetail(projectId, visitorId)
      setData(response.data)
    } catch (error) {
      console.error('Error loading visitor detail:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (isoString) => {
    if (!isoString) return 'N/A'
    const date = new Date(isoString)
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

  const getDeviceIcon = (device) => {
    switch (device?.toLowerCase()) {
      case 'mobile':
      case 'iphone':
      case 'android':
        return <Smartphone size={16} />
      case 'tablet':
      case 'ipad':
        return <Tablet size={16} />
      default:
        return <Monitor size={16} />
    }
  }

  const getCountryFlag = (country) => {
    switch (country?.toLowerCase()) {
      case 'india':
        return '🇮🇳'
      case 'united states':
      case 'usa':
        return '🇺🇸'
      case 'united kingdom':
        return '🇬🇧'
      case 'canada':
        return '🇨🇦'
      case 'australia':
        return '🇦🇺'
      default:
        return '🌍'
    }
  }

  if (loading) {
    return (
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#f8fafc', 
        minHeight: '100vh',
        maxWidth: '100vw',
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}>
        {/* Header Skeleton */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px', 
          marginBottom: '24px',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          flexWrap: 'wrap'
        }}>
          <div style={{
            width: '120px',
            height: '40px',
            backgroundColor: '#e2e8f0',
            borderRadius: '8px',
            animation: 'pulse 2s infinite'
          }}></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              width: '200px',
              height: '32px',
              backgroundColor: '#e2e8f0',
              borderRadius: '4px',
              marginBottom: '8px',
              animation: 'pulse 2s infinite'
            }}></div>
            <div style={{
              width: '150px',
              height: '20px',
              backgroundColor: '#e2e8f0',
              borderRadius: '4px',
              animation: 'pulse 2s infinite'
            }}></div>
          </div>
        </div>

        {/* Cards Grid Skeleton */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '24px',
          maxWidth: '100%'
        }}>
          {/* Visitor Profile Card Skeleton */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '180px',
              height: '24px',
              backgroundColor: '#e2e8f0',
              borderRadius: '4px',
              marginBottom: '20px',
              animation: 'pulse 2s infinite'
            }}></div>
            
            {/* Profile Fields Skeleton */}
            {[...Array(9)].map((_, index) => (
              <div key={index} style={{ 
                display: 'grid', 
                gridTemplateColumns: '120px 1fr', 
                gap: '12px', 
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '100px',
                  height: '16px',
                  backgroundColor: '#e2e8f0',
                  borderRadius: '4px',
                  animation: 'pulse 2s infinite'
                }}></div>
                <div style={{
                  width: '80%',
                  height: '16px',
                  backgroundColor: '#e2e8f0',
                  borderRadius: '4px',
                  animation: 'pulse 2s infinite'
                }}></div>
              </div>
            ))}
          </div>

          {/* Map Card Skeleton */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '160px',
              height: '24px',
              backgroundColor: '#e2e8f0',
              borderRadius: '4px',
              marginBottom: '20px',
              animation: 'pulse 2s infinite'
            }}></div>
            
            <div style={{
              height: '300px',
              backgroundColor: '#e2e8f0',
              borderRadius: '8px',
              animation: 'pulse 2s infinite'
            }}></div>
          </div>
        </div>

        {/* Sessions Section Skeleton */}
        <div style={{ 
          marginTop: '24px',
          backgroundColor: 'white', 
          borderRadius: '12px', 
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <div style={{
            width: '140px',
            height: '24px',
            backgroundColor: '#e2e8f0',
            borderRadius: '4px',
            marginBottom: '20px',
            animation: 'pulse 2s infinite'
          }}></div>

          {/* Session Cards Skeleton */}
          {[...Array(3)].map((_, index) => (
            <div key={index} style={{
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '16px',
              backgroundColor: '#fafbfc',
              marginBottom: '16px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '12px',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div style={{
                  width: '120px',
                  height: '20px',
                  backgroundColor: '#e2e8f0',
                  borderRadius: '4px',
                  animation: 'pulse 2s infinite'
                }}></div>
                <div style={{
                  width: '140px',
                  height: '16px',
                  backgroundColor: '#e2e8f0',
                  borderRadius: '4px',
                  animation: 'pulse 2s infinite'
                }}></div>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '12px',
                marginBottom: '12px'
              }}>
                <div>
                  <div style={{
                    width: '60px',
                    height: '12px',
                    backgroundColor: '#e2e8f0',
                    borderRadius: '4px',
                    marginBottom: '4px',
                    animation: 'pulse 2s infinite'
                  }}></div>
                  <div style={{
                    width: '80px',
                    height: '16px',
                    backgroundColor: '#e2e8f0',
                    borderRadius: '4px',
                    animation: 'pulse 2s infinite'
                  }}></div>
                </div>
                
                <div>
                  <div style={{
                    width: '60px',
                    height: '12px',
                    backgroundColor: '#e2e8f0',
                    borderRadius: '4px',
                    marginBottom: '4px',
                    animation: 'pulse 2s infinite'
                  }}></div>
                  <div style={{
                    width: '100px',
                    height: '16px',
                    backgroundColor: '#e2e8f0',
                    borderRadius: '4px',
                    animation: 'pulse 2s infinite'
                  }}></div>
                </div>
                
                <div>
                  <div style={{
                    width: '80px',
                    height: '12px',
                    backgroundColor: '#e2e8f0',
                    borderRadius: '4px',
                    marginBottom: '4px',
                    animation: 'pulse 2s infinite'
                  }}></div>
                  <div style={{
                    width: '40px',
                    height: '16px',
                    backgroundColor: '#e2e8f0',
                    borderRadius: '4px',
                    animation: 'pulse 2s infinite'
                  }}></div>
                </div>
              </div>

              {/* Navigation Path Skeleton */}
              <div>
                <div style={{
                  width: '120px',
                  height: '16px',
                  backgroundColor: '#e2e8f0',
                  borderRadius: '4px',
                  marginBottom: '8px',
                  animation: 'pulse 2s infinite'
                }}></div>
                
                {[...Array(3)].map((_, pvIndex) => (
                  <div key={pvIndex} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    padding: '8px 12px',
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                    marginBottom: '6px'
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: '#e2e8f0',
                      animation: 'pulse 2s infinite',
                      flexShrink: 0
                    }}></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        width: '80%',
                        height: '13px',
                        backgroundColor: '#e2e8f0',
                        borderRadius: '4px',
                        marginBottom: '4px',
                        animation: 'pulse 2s infinite'
                      }}></div>
                      <div style={{
                        width: '60%',
                        height: '11px',
                        backgroundColor: '#e2e8f0',
                        borderRadius: '4px',
                        animation: 'pulse 2s infinite'
                      }}></div>
                    </div>
                    <div style={{
                      width: '60px',
                      height: '11px',
                      backgroundColor: '#e2e8f0',
                      borderRadius: '4px',
                      animation: 'pulse 2s infinite',
                      flexShrink: 0
                    }}></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Pulse Animation CSS */}
        <style>
          {`
            @keyframes pulse {
              0% {
                opacity: 1;
              }
              50% {
                opacity: 0.4;
              }
              100% {
                opacity: 1;
              }
            }
          `}
        </style>
      </div>
    )
  }

  if (!data) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <p>Visitor not found</p>
        <button 
          onClick={() => navigate(`/dashboard/project/${projectId}/visitor-map`)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Back to Visitor Map
        </button>
      </div>
    )
  }

  const { visitor, sessions } = data

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f8fafc', 
      minHeight: '100vh',
      maxWidth: '100vw',
      overflowX: 'hidden',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px', 
        marginBottom: '24px',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => navigate(`/dashboard/project/${projectId}/visitor-map`)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            cursor: 'pointer',
            color: '#475569',
            textDecoration: 'none',
            flexShrink: 0
          }}
        >
          <ArrowLeft size={16} />
          Back to Map
        </button>
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
            Visitor Details
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px', wordBreak: 'break-all' }}>
            ID: {visitor.visitor_id}
          </p>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '24px',
        maxWidth: '100%'
      }}>
        {/* Visitor Profile Card */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
            <User size={18} style={{ marginRight: '8px', display: 'inline' }} />
            Visitor Profile
          </h2>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontWeight: '500', color: '#64748b', fontSize: '14px' }}>IP Address:</span>
              <span style={{ 
                fontFamily: 'monospace', 
                backgroundColor: '#f1f5f9', 
                padding: '4px 8px', 
                borderRadius: '4px', 
                fontSize: '13px',
                wordBreak: 'break-all'
              }}>
                {visitor.ip}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontWeight: '500', color: '#64748b', fontSize: '14px' }}>ISP:</span>
              <span style={{ fontSize: '14px', wordBreak: 'break-word' }}>{visitor.isp || 'Unknown'}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontWeight: '500', color: '#64748b', fontSize: '14px' }}>Location:</span>
              <span style={{ fontSize: '14px', wordBreak: 'break-word' }}>
                {getCountryFlag(visitor.country)} {visitor.city}, {visitor.country}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontWeight: '500', color: '#64748b', fontSize: '14px' }}>Device:</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
                {getDeviceIcon(visitor.device)} {visitor.device || 'Unknown'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontWeight: '500', color: '#64748b', fontSize: '14px' }}>Browser:</span>
              <span style={{ fontSize: '14px', wordBreak: 'break-word' }}>{visitor.browser || 'Unknown'}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontWeight: '500', color: '#64748b', fontSize: '14px' }}>OS:</span>
              <span style={{ fontSize: '14px', wordBreak: 'break-word' }}>{visitor.os || 'Unknown'}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontWeight: '500', color: '#64748b', fontSize: '14px' }}>Resolution:</span>
              <span style={{ fontSize: '14px', wordBreak: 'break-word' }}>{visitor.resolution || 'Unknown'}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontWeight: '500', color: '#64748b', fontSize: '14px' }}>First Seen:</span>
              <span style={{ fontSize: '14px', wordBreak: 'break-word' }}>{formatTime(visitor.first_seen)}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontWeight: '500', color: '#64748b', fontSize: '14px' }}>Returning Visits:</span>
              <span style={{ fontSize: '14px' }}>{visitor.returning_visits}</span>
            </div>
          </div>
        </div>

        {/* Map Card */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
            <MapPin size={18} style={{ marginRight: '8px', display: 'inline' }} />
            Visitor Location
          </h2>
          
          <div style={{ height: '300px', borderRadius: '8px', overflow: 'hidden' }}>
            {visitor.lat && visitor.lng ? (
              <MapContainer
                center={[parseFloat(visitor.lat), parseFloat(visitor.lng)]}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
                zoomControl={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker
                  position={[parseFloat(visitor.lat), parseFloat(visitor.lng)]}
                  icon={visitorIcon}
                />
              </MapContainer>
            ) : (
              <div style={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#f8fafc',
                color: '#94a3b8'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <Globe size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                  <p>No location data</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sessions Section */}
      <div style={{ 
        marginTop: '24px',
        backgroundColor: 'white', 
        borderRadius: '12px', 
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
          <Clock size={18} style={{ marginRight: '8px', display: 'inline' }} />
          Sessions ({sessions.length})
        </h2>

        {sessions.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            color: '#94a3b8',
            backgroundColor: '#f8fafc',
            borderRadius: '8px'
          }}>
            <Clock size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p>No sessions found</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {sessions.map((session, index) => (
              <div key={session.session_id} style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: '#fafbfc',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '12px',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                    Session #{index + 1}
                  </h3>
                  <span style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap' }}>
                    {formatTime(session.start_time)}
                  </span>
                </div>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  <div>
                    <span style={{ fontWeight: '500', color: '#64748b', fontSize: '12px', display: 'block' }}>Duration</span>
                    <span style={{ fontSize: '14px', wordBreak: 'break-word' }}>{formatDuration(session.duration)}</span>
                  </div>
                  
                  {session.referrer && (
                    <div>
                      <span style={{ fontWeight: '500', color: '#64748b', fontSize: '12px', display: 'block' }}>Referrer</span>
                      <a 
                        href={session.referrer} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          fontSize: '14px', 
                          color: '#3b82f6', 
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          wordBreak: 'break-all'
                        }}
                      >
                        {(() => {
                          try {
                            // Try to create URL object and get hostname + pathname
                            const url = new URL(session.referrer)
                            return url.hostname + url.pathname
                          } catch (e) {
                            // If URL parsing fails, return the original string
                            return session.referrer
                          }
                        })()} <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                  
                  <div>
                    <span style={{ fontWeight: '500', color: '#64748b', fontSize: '12px', display: 'block' }}>Pages Viewed</span>
                    <span style={{ fontSize: '14px' }}>{session.pageviews.length}</span>
                  </div>

                  {session.entry_page && (
                    <div>
                      <span style={{ fontWeight: '500', color: '#64748b', fontSize: '12px', display: 'block' }}>Entry Page</span>
                      <a 
                        href={session.entry_page} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          fontSize: '14px', 
                          color: '#22c55e', 
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          wordBreak: 'break-all'
                        }}
                      >
                        {(() => {
                          try {
                            // Try to create URL object and get hostname + pathname
                            const url = new URL(session.entry_page)
                            return url.hostname + url.pathname
                          } catch (e) {
                            // If URL parsing fails, return the original string
                            return session.entry_page
                          }
                        })()} <ExternalLink size={12} />
                      </a>
                    </div>
                  )}

                  {session.exit_page && (
                    <div>
                      <span style={{ fontWeight: '500', color: '#64748b', fontSize: '12px', display: 'block' }}>Exit Page</span>
                      <a 
                        href={session.exit_page} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          fontSize: '14px', 
                          color: '#ef4444', 
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          wordBreak: 'break-all'
                        }}
                      >
                        {(() => {
                          try {
                            // Try to create URL object and get hostname + pathname
                            const url = new URL(session.exit_page)
                            return url.hostname + url.pathname
                          } catch (e) {
                            // If URL parsing fails, return the original string
                            return session.exit_page
                          }
                        })()} <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                </div>

                {session.pageviews.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      <Eye size={14} style={{ marginRight: '6px', display: 'inline' }} />
                      Navigation Path
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {session.pageviews.map((pageview, pvIndex) => (
                        <div key={pvIndex} style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                          padding: '8px 12px',
                          backgroundColor: 'white',
                          borderRadius: '6px',
                          border: '1px solid #e5e7eb'
                        }}>
                          <span style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: '600',
                            flexShrink: 0
                          }}>
                            {pvIndex + 1}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: '500', color: '#1f2937', wordBreak: 'break-word', marginBottom: '2px' }}>
                              {pageview.title || pageview.url}
                            </div>
                            <a 
                              href={pageview.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ 
                                fontSize: '11px', 
                                color: '#6b7280', 
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                wordBreak: 'break-all'
                              }}
                            >
                              <Link size={10} />
                              {pageview.url}
                            </a>
                          </div>
                          <span style={{ fontSize: '11px', color: '#9ca3af', whiteSpace: 'nowrap', flexShrink: 0 }}>
                            {pageview.timestamp}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
