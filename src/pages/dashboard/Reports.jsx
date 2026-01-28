import { useState, useEffect, useMemo } from 'react'
import { reportsAPI, analyticsAPI, visitorsAPI, pagesAPI, trafficAPI, projectsAPI } from '../../api/api'
import { Download, TrendingUp, Users, Globe, BarChart3, Eye, RefreshCw, AlertCircle, CheckCircle, ArrowLeft, ExternalLink, Clock, MapPin } from 'lucide-react'
import { Skeleton, Box, Grid, Card, CardContent } from '@mui/material'
import { useSearchParams } from 'react-router-dom'

function Reports({ projectId }) {
  const [loading, setLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('7')
  const [reportData, setReportData] = useState(null)
  const [summaryData, setSummaryData] = useState(null)
  const [loadingData, setLoadingData] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)
  const [error, setError] = useState(null)
  const [exportStatus, setExportStatus] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()
  // URL me category store karne ke liye
  const [selectedCategoryKey, setSelectedCategoryKey] = useState(() => {
    return searchParams.get('category') || null
  })
  const [selectedCategory, setSelectedCategory] = useState(null)

  const reportCategories = useMemo(() => [
    {
      icon: <Users size={24} />,
      title: 'Visitor Analytics',
      description: 'Complete visitor data including IP, location, device, and session info',
      color: '#3b82f6',
      bgColor: '#eff6ff',
      value: summaryData?.unique_visitors || 0,
      label: 'Unique Visitors'
    },
    {
      icon: <Eye size={24} />,
      title: 'Page Performance',
      description: 'Page views, time spent, bounce rates, and engagement metrics',
      color: '#8b5cf6',
      bgColor: '#f5f3ff',
      value: summaryData?.total_visits || 0,
      label: 'Total Views'
    },
    {
      icon: <TrendingUp size={24} />,
      title: 'Traffic Sources',
      description: 'Referrers, search keywords, and campaign performance',
      color: '#10b981',
      bgColor: '#ecfdf5',
      value: reportData?.traffic?.reduce((total, source) => total + (source.count || 0), 0) || 0,
      label: 'Total Visits'
    },
    {
      icon: <Globe size={24} />,
      title: 'Geographic Data',
      description: 'Country, city, and regional visitor distribution',
      color: '#f59e0b',
      bgColor: '#fffbeb',
      value: reportData?.summary?.countries?.reduce((total, location) => total + (location.count || 0), 0) || 0,
      label: 'Total Visits'
    },
    {
      icon: <BarChart3 size={24} />,
      title: 'Top Pages',
      description: 'Most visited pages and content performance analysis',
      color: '#ec4899',
      bgColor: '#fdf2f8',
      value: reportData?.pages?.length || 0,
      label: 'Tracked Pages'
    }
  ], [summaryData, reportData])

  const [project, setProject] = useState(null)
  const [detailData, setDetailData] = useState(null)
  const [visitorDisplayLimit, setVisitorDisplayLimit] = useState(50)
  const [visitorSearchTerm, setVisitorSearchTerm] = useState('')
  const [visitorSortBy, setVisitorSortBy] = useState('visited_at')
  const [pageDisplayLimit, setPageDisplayLimit] = useState(15)
  const [pageSearchTerm, setPageSearchTerm] = useState('')
  const [pageSortBy, setPageSortBy] = useState('total_views')
  const [trafficDisplayLimit, setTrafficDisplayLimit] = useState(15)
  const [trafficSearchTerm, setTrafficSearchTerm] = useState('')
  const [trafficSortBy, setTrafficSortBy] = useState('visit_count')
  const [geoDisplayLimit, setGeoDisplayLimit] = useState(12)
  const [geoSearchTerm, setGeoSearchTerm] = useState('')
  const [geoSortBy, setGeoSortBy] = useState('count')
  const [geoViewMode, setGeoViewMode] = useState('grid')
  const [topPagesDisplayLimit, setTopPagesDisplayLimit] = useState(20)
  const [topPagesSearchTerm, setTopPagesSearchTerm] = useState('')
  const [topPagesSortBy, setTopPagesSortBy] = useState('total_views')
  const [topPagesViewMode, setTopPagesViewMode] = useState('detailed')

  useEffect(() => {
    if (projectId) {
      fetchReportData()
      loadProjectInfo()
    }
  }, [projectId, selectedPeriod])

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category')
    if (categoryFromUrl && reportCategories.length > 0) {
      const category = reportCategories.find(cat => cat.title === categoryFromUrl)
      if (category) {
        setSelectedCategory(category)
        setSelectedCategoryKey(categoryFromUrl)
        // Also set the detail data if reportData is available
        if (reportData) {
          handleCategoryClick(category)
        }
      }
    }
  }, [searchParams, reportData])

  const loadProjectInfo = async () => {
    try {
      const response = await projectsAPI.getOne(projectId)
      setProject(response.data)
    } catch (error) {
      console.error('Error loading project info:', error)
    }
  }

  // Update detailed data when period changes
  useEffect(() => {
    if (selectedCategory && reportData) {
      // Re-click the category to refresh its data with new period
      handleCategoryClick(selectedCategory, { syncUrl: false })
    }
  }, [selectedPeriod, reportData])

  const fetchReportData = async () => {
    console.log('🚀 fetchReportData() called!', {
      selectedPeriod,
      timestamp: new Date().toISOString()
    })
    
    setLoadingData(true)
    setError(null)
    try {
      // Use IST-aware date range calculation
      const { startDate, endDate } = createISTDateRange(parseInt(selectedPeriod))
      
      console.log('📅 Reports.jsx - IST Date range:', { startDate, endDate, selectedPeriod })
      console.log('🔗 API Base URL:', import.meta.env.VITE_API_URL)

      const [summaryResponse, analyticsResponse, visitorsResponse, pagesResponse, trafficResponse, geographicResponse] = await Promise.all([
        reportsAPI.getSummaryReport(projectId, startDate, endDate).catch(err => {
          console.error('❌ Summary API Error:', err)
          return { data: null }
        }),
        analyticsAPI.getSummary(projectId, selectedPeriod).catch(err => {
          console.error('❌ Analytics API Error:', err)
          return { data: null }
        }),
        visitorsAPI.getActivityView(projectId, 1000, startDate, endDate).catch(err => {
          console.error('❌ Visitors API Error:', err)
          return { data: [] }
        }),
        pagesAPI.getMostVisited(projectId, 200, startDate, endDate).catch(err => {
          console.error('❌ Pages API Error:', err)
          return { data: { data: [] } }
        }),
        trafficAPI.getSources(projectId, startDate, endDate).catch(err => {
          console.error('❌ Traffic API Error:', err)
          return { data: [] }
        }),
        visitorsAPI.getGeographicData(projectId, startDate, endDate).catch(err => {
          console.error('❌ Geographic API Error:', err)
          return { data: [] }
        })
      ])

      // Backend now handles period filtering, so we can use the data directly
      const visitorsData = visitorsResponse.data || []
      const pagesData = pagesResponse.data?.data || pagesResponse.data || [] // Handle both formats
      const trafficData = trafficResponse.data || []
      const geographicData = geographicResponse.data || []

      console.log('🎯 BACKEND FILTERED RESULT:', {
        period: selectedPeriod,
        startDate,
        endDate,
        counts: {
          visitors: visitorsData.length,
          pages: pagesData.length,
          traffic: {
            sources: trafficData.length,
            totalVisits: trafficData.reduce((total, source) => total + (source.count || 0), 0)
          },
          geographic: {
            locations: geographicData.length,
            totalVisits: geographicData.reduce((total, location) => total + (location.count || 0), 0)
          }
        }
      })

      // Use backend-filtered data directly - no client-side filtering needed
      setReportData({
        summary: {
          ...summaryResponse.data,
          countries: geographicData // Use the dedicated geographic API data
        },
        analytics: analyticsResponse.data,
        visitors: visitorsData, // Already filtered by backend
        pages: pagesData, // Already filtered by backend
        traffic: trafficData, // Already filtered by backend
        periodStartDate: startDate,
        periodEndDate: endDate
      })
      
      // IMPORTANT: Use summaryResponse.data for summaryData as it has the correct filtered data
      setSummaryData(summaryResponse.data)
      
      console.log('✅ Data successfully updated:', {
        period: selectedPeriod,
        visitorsCount: visitorsData.length,
        pagesCount: pagesData.length,
        trafficCount: trafficData.length,
        geographicCount: geographicData.length,
        summaryData: summaryResponse.data ? 'loaded from summaryResponse' : 'null',
        summaryResponseData: summaryResponse.data,
        analyticsResponseData: analyticsResponse.data
      })
    } catch (error) {
      console.error('❌ Error fetching report data:', error)
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      })
      setError('Failed to load report data. Please try again.')
    } finally {
      setLoadingData(false)
      setInitialLoad(false)
    }
  }

  // Helper to format date to IST (India Standard Time)
  const formatToIST = (dateString, options = {}) => {
    if (!dateString) return ''

    // Ensure the date string is treated as UTC if it lacks timezone info
    let utcString = typeof dateString === 'string' ? dateString : dateString.toISOString()
    if (typeof utcString === 'string' && !utcString.endsWith('Z') && !utcString.includes('+')) {
      utcString = utcString + 'Z'
    }

    const date = new Date(utcString)

    // Check if valid date
    if (isNaN(date.getTime())) return ''

    // Default to IST timezone
    const defaultOptions = {
      timeZone: 'Asia/Kolkata',
      ...options
    }

    return date.toLocaleString('en-IN', defaultOptions)
  }

  // Helper to create IST-aware date ranges
  const createISTDateRange = (days) => {
    // Get current time in IST
    const now = new Date()
    const istNow = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}))
    
    // Calculate start date (days ago from IST midnight)
    const startOfDayIST = new Date(istNow)
    startOfDayIST.setHours(0, 0, 0, 0)
    const startDate = new Date(startOfDayIST.getTime() - (days - 1) * 24 * 60 * 60 * 1000)
    
    // End date is current IST time
    const endDate = istNow
    
    // Convert to UTC for API calls
    const startDateUTC = new Date(startDate.getTime() - (startDate.getTimezoneOffset() * 60000))
    const endDateUTC = new Date(endDate.getTime() - (endDate.getTimezoneOffset() * 60000))
    
    return {
      startDate: startDateUTC.toISOString(),
      endDate: endDateUTC.toISOString()
    }
  }

  // Helper function to format period text with proper singular/plural
  const formatPeriodText = (period, includeSuffix = true) => {
    const num = parseInt(period)
    if (includeSuffix) {
      return num === 1 ? `${num} day` : `${num} days`
    }
    return period
  }

  // Helper function to format page text with proper singular/plural
  const formatPageText = (count) => {
    return count === 1 ? '1 page' : `${count} pages`
  }

  const refreshData = () => {
    fetchReportData()
  }

  const handleExportCSV = async () => {
    setLoading(true)
    setExportStatus(null)
    try {
      const response = await reportsAPI.exportCSV(projectId, parseInt(selectedPeriod))
      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics_${projectId}_last_${selectedPeriod}_${formatPeriodText(selectedPeriod)}_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      setExportStatus('success')
      setTimeout(() => setExportStatus(null), 3000)
    } catch (error) {
      console.error('Error exporting CSV:', error)
      setExportStatus('error')
      setTimeout(() => setExportStatus(null), 5000)
    } finally {
      setLoading(false)
    }
  }

  const filterDataByPeriod = (data, dateField = 'visited_at') => {
    if (!data || !Array.isArray(data)) return []

    const cutoffDate = new Date(Date.now() - parseInt(selectedPeriod) * 24 * 60 * 60 * 1000)

    return data.filter(item => {
      const itemDate = new Date(item[dateField] || item.visited_at || item.last_clicked || item.created_at)
      return itemDate >= cutoffDate && itemDate <= new Date() // Ensure within period range
    })
  }

  // Simplified data getter since backend handles filtering
  const getPeriodFilteredData = (dataType) => {
    if (!reportData) return []
    
    // Backend already filtered data by period, just return the appropriate data
    switch (dataType) {
      case 'visitors':
        return reportData.visitors || []
      case 'pages':
        return reportData.pages || []
      case 'traffic':
        return reportData.traffic || []
      case 'geographic':
        return reportData.summary?.countries || []
      default:
        return []
    }
  }

  const handleCategoryClick = (category, options = {}) => {
    const { syncUrl = true } = options
    setSelectedCategory(category)
    setSelectedCategoryKey(category.title)
    
    // Update URL with selected category
    if (syncUrl) {
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.set('category', category.title)
      setSearchParams(newSearchParams)
    }

    // Get fresh filtered data for the selected period
    const filteredData = getPeriodFilteredData(
      category.title === 'Top Pages' ? 'pages' : 
      category.title === 'Visitor Analytics' ? 'visitors' :
      category.title === 'Page Performance' ? 'pages' :
      category.title === 'Traffic Sources' ? 'traffic' :
      category.title === 'Geographic Data' ? 'geographic' : 'pages'
    )

    // Set detail data based on category with enhanced period filtering
    switch (category.title) {
      case 'Visitor Analytics':
        setDetailData({
          type: 'visitors',
          title: 'Visitor Analytics Details',
          data: filteredData,
          summary: summaryData,
          period: selectedPeriod,
          periodLabel: `Last ${formatPeriodText(selectedPeriod)}`
        })
        break
      case 'Page Performance':
        setDetailData({
          type: 'pages',
          title: 'Page Performance Details',
          data: filteredData,
          summary: summaryData,
          period: selectedPeriod,
          periodLabel: `Last ${formatPeriodText(selectedPeriod)}`
        })
        break
      case 'Traffic Sources':
        setDetailData({
          type: 'traffic',
          title: 'Traffic Sources Details',
          data: filteredData,
          summary: summaryData,
          period: selectedPeriod,
          periodLabel: `Last ${formatPeriodText(selectedPeriod)}`
        })
        break
      case 'Geographic Data':
        setDetailData({
          type: 'geographic',
          title: 'Geographic Distribution Details',
          data: filteredData,
          summary: summaryData,
          period: selectedPeriod,
          periodLabel: `Last ${formatPeriodText(selectedPeriod)}`
        })
        break
      case 'Top Pages':
        setDetailData({
          type: 'top-pages',
          title: 'Top Pages Details',
          data: filteredData,
          summary: summaryData,
          period: selectedPeriod,
          periodLabel: `Last ${formatPeriodText(selectedPeriod)}`
        })
        break
      default:
        setDetailData(null)
    }
  }

  const handleBackToCategories = () => {
    setSelectedCategory(null)
    setSelectedCategoryKey(null)
    setDetailData(null)
    
    // Remove category from URL
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.delete('category')
    setSearchParams(newSearchParams)
    
    setVisitorDisplayLimit(50) // Reset display limit
    setVisitorSearchTerm('') // Reset search
    setVisitorSortBy('visited_at') // Reset sort
    setPageDisplayLimit(15) // Reset page display limit
    setPageSearchTerm('') // Reset page search
    setPageSortBy('total_views') // Reset page sort
    setTrafficDisplayLimit(15) // Reset traffic display limit
    setTrafficSearchTerm('') // Reset traffic search
    setTrafficSortBy('visit_count') // Reset traffic sort
    setGeoDisplayLimit(12) // Reset geo display limit
    setGeoSearchTerm('') // Reset geo search
    setGeoSortBy('count') // Reset geo sort
    setGeoViewMode('grid') // Reset geo view mode
    setTopPagesDisplayLimit(20) // Reset top pages display limit
    setTopPagesSearchTerm('') // Reset top pages search
    setTopPagesSortBy('total_views') // Reset top pages sort
    setTopPagesViewMode('detailed') // Reset top pages view mode
  }

  const handleShowMoreVisitors = () => {
    setVisitorDisplayLimit(prev => prev + 50)
  }

  const handleShowAllVisitors = () => {
    setVisitorDisplayLimit(detailData?.data?.length || 1000)
  }

  const handleShowMorePages = () => {
    setPageDisplayLimit(prev => prev + 15)
  }

  const handleShowAllPages = () => {
    setPageDisplayLimit(detailData?.data?.length || 200)
  }

  const handleShowMoreTraffic = () => {
    setTrafficDisplayLimit(prev => prev + 15)
  }

  const handleShowAllTraffic = () => {
    setTrafficDisplayLimit(detailData?.data?.length || 100)
  }

  const handleShowMoreGeo = () => {
    setGeoDisplayLimit(prev => prev + 12)
  }

  const handleShowAllGeo = () => {
    setGeoDisplayLimit(detailData?.data?.length || 100)
  }

  const handleShowMoreTopPages = () => {
    setTopPagesDisplayLimit(prev => prev + 20)
  }

  const handleShowAllTopPages = () => {
    setTopPagesDisplayLimit(detailData?.data?.length || 200)
  }

  const getFilteredVisitors = () => {
    if (!detailData?.data) return []

    let filtered = detailData.data

    // Apply search filter
    if (visitorSearchTerm) {
      const searchLower = visitorSearchTerm.toLowerCase()
      filtered = filtered.filter(visitor =>
        visitor.ip_address?.toLowerCase().includes(searchLower) ||
        visitor.country?.toLowerCase().includes(searchLower) ||
        visitor.city?.toLowerCase().includes(searchLower) ||
        visitor.device?.toLowerCase().includes(searchLower) ||
        visitor.browser?.toLowerCase().includes(searchLower) ||
        visitor.visitor_id?.toLowerCase().includes(searchLower)
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (visitorSortBy) {
        case 'visited_at':
          return new Date(b.visited_at) - new Date(a.visited_at)
        case 'country':
          return (a.country || '').localeCompare(b.country || '')
        case 'page_views':
          return (b.page_views || 0) - (a.page_views || 0)
        case 'session_duration':
          return (b.session_duration || 0) - (a.session_duration || 0)
        default:
          return 0
      }
    })

    return filtered
  }

  const getFilteredPages = () => {
    if (!detailData?.data) return []

    let filtered = detailData.data

    // Apply search filter
    if (pageSearchTerm) {
      const searchLower = pageSearchTerm.toLowerCase()
      filtered = filtered.filter(page =>
        (page.url || page.page_url || '').toLowerCase().includes(searchLower) ||
        (page.title || '').toLowerCase().includes(searchLower)
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (pageSortBy) {
        case 'total_views':
          return (b.total_views || b.visits || 0) - (a.total_views || a.visits || 0)
        case 'unique_views':
          return (b.unique_views || 0) - (a.unique_views || 0)
        case 'avg_time_spent':
          return (b.avg_time_spent || 0) - (a.avg_time_spent || 0)
        case 'bounce_rate':
          return (b.bounce_rate || 0) - (a.bounce_rate || 0)
        case 'url':
          return (a.url || a.page_url || '').localeCompare(b.url || b.page_url || '')
        default:
          return 0
      }
    })

    return filtered
  }

  const getFilteredTraffic = () => {
    if (!detailData?.data) return []

    let filtered = detailData.data

    // Apply search filter
    if (trafficSearchTerm) {
      const searchLower = trafficSearchTerm.toLowerCase()
      filtered = filtered.filter(source =>
        (source.source_name || source.source || source.referrer || '').toLowerCase().includes(searchLower) ||
        (source.source_type || source.medium || '').toLowerCase().includes(searchLower) ||
        (source.referrer_url || '').toLowerCase().includes(searchLower)
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (trafficSortBy) {
        case 'visit_count':
          return (b.visit_count || b.visits || b.count || 0) - (a.visit_count || a.visits || a.count || 0)
        case 'source_name':
          return (a.source_name || a.source || a.referrer || '').localeCompare(b.source_name || b.source || b.referrer || '')
        case 'source_type':
          return (a.source_type || a.medium || '').localeCompare(b.source_type || b.medium || '')
        default:
          return 0
      }
    })

    return filtered
  }

  const getFilteredGeoData = () => {
    if (!detailData?.data) return []

    let filtered = detailData.data

    // Apply search filter
    if (geoSearchTerm) {
      const searchLower = geoSearchTerm.toLowerCase()
      filtered = filtered.filter(location =>
        (location.country || '').toLowerCase().includes(searchLower) ||
        (location.state || '').toLowerCase().includes(searchLower) ||
        (location.city || '').toLowerCase().includes(searchLower)
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (geoSortBy) {
        case 'count':
          return (b.count || 0) - (a.count || 0)
        case 'country':
          return (a.country || '').localeCompare(b.country || '')
        case 'state':
          return (a.state || '').localeCompare(b.state || '')
        case 'city':
          return (a.city || '').localeCompare(b.city || '')
        default:
          return 0
      }
    })

    return filtered
  }

  const getFilteredTopPages = () => {
    if (!detailData?.data) return []

    let filtered = detailData.data

    // Apply search filter
    if (topPagesSearchTerm) {
      const searchLower = topPagesSearchTerm.toLowerCase()
      filtered = filtered.filter(page =>
        (page.url || page.page_url || '').toLowerCase().includes(searchLower) ||
        (page.title || '').toLowerCase().includes(searchLower)
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (topPagesSortBy) {
        case 'total_views':
          return (b.total_views || b.visits || 0) - (a.total_views || a.visits || 0)
        case 'unique_views':
          return (b.unique_views || 0) - (a.unique_views || 0)
        case 'avg_time_spent':
          return (b.avg_time_spent || 0) - (a.avg_time_spent || 0)
        case 'bounce_rate':
          return (b.bounce_rate || 0) - (a.bounce_rate || 0)
        case 'url':
          return (a.url || a.page_url || '').localeCompare(b.url || b.page_url || '')
        case 'title':
          return (a.title || '').localeCompare(b.title || '')
        default:
          return 0
      }
    })

    return filtered
  }

  const renderDetailedData = () => {
    if (!detailData) return null

    return (
      <div className="chart-container" style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <button
            onClick={handleBackToCategories}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#475569'
            }}
          >
            <ArrowLeft size={16} />
            Back to Categories
          </button>
          <h3 style={{ fontSize: '20px', color: '#1e293b', margin: 0 }}>
            {detailData.title} - Last {formatPeriodText(selectedPeriod)}
          </h3>
          <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
            <div style={{
              padding: '4px 12px',
              background: '#dcfce7',
              color: '#166534',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
               Period: {formatPeriodText(selectedPeriod)}
            </div>
            <div style={{
              padding: '4px 12px',
              background: '#e0f2fe',
              color: '#0369a1',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              Updated: {formatToIST(new Date(), { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })} (IST)
            </div>
          </div>
        </div>

        {/* Summary Stats for Selected Category */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <div style={{
            padding: '16px',
            background: selectedCategory?.bgColor || '#f8fafc',
            borderRadius: '8px',
            border: `2px solid ${selectedCategory?.color || '#e2e8f0'}20`,
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: selectedCategory?.color || '#64748b',
              marginBottom: '4px'
            }}>
              {selectedCategory?.value?.toLocaleString() || 0}
            </div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              {selectedCategory?.label || 'Total'}
            </div>
          </div>
          <div style={{
            padding: '16px',
            background: '#f0f9ff',
            borderRadius: '8px',
            border: '2px solid #0ea5e920',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#0369a1',
              marginBottom: '4px'
            }}>
              {detailData.data?.length || 0}
            </div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              Records Found
            </div>
          </div>
          <div style={{
            padding: '16px',
            background: '#f0fdf4',
            borderRadius: '8px',
            border: '2px solid #10b98120',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#059669',
              marginBottom: '4px'
            }}>
              {selectedPeriod}
            </div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              {parseInt(selectedPeriod) === 1 ? 'Day Period' : 'Days Period'}
            </div>
          </div>
          <div style={{
            padding: '16px',
            background: '#fef3c7',
            borderRadius: '8px',
            border: '2px solid #f59e0b20',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#d97706',
              marginBottom: '4px'
            }}>
              {summaryData?.averages ?
                (detailData.type === 'visitors' ?
                  Math.round(summaryData.averages.unique_visits) :
                  Math.round(summaryData.averages.page_views)
                ) : 0
              }
            </div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              Daily Average
            </div>
          </div>
        </div>

        {
          detailData.type === 'visitors' && (
            <div>
              <div style={{ marginBottom: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, color: '#374151' }}>Recent Visitor Activity</h4>
                  <div style={{
                    fontSize: '12px',
                    color: '#64748b',
                    background: '#e0f2fe',
                    padding: '4px 8px',
                    borderRadius: '4px'
                  }}>
                    Showing visitors from last {formatPeriodText(selectedPeriod)}
                    {detailData.period && (
                      <span style={{
                        marginLeft: '8px',
                        padding: '2px 6px',
                        background: '#dcfce7',
                        color: '#166534',
                        borderRadius: '4px',
                        fontSize: '10px'
                      }}>
                        ✓ Period: {formatPeriodText(detailData.period)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Search and Sort Controls */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <input
                    type="text"
                    placeholder="Search visitors by IP, country, city, device, browser..."
                    value={visitorSearchTerm}
                    onChange={(e) => setVisitorSearchTerm(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                  <select
                    value={visitorSortBy}
                    onChange={(e) => setVisitorSortBy(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      background: 'white',
                      cursor: 'pointer',
                      minWidth: '150px'
                    }}
                  >
                    <option value="visited_at">Latest First</option>
                    <option value="country">By Country</option>
                    <option value="page_views">By Page Views</option>
                    <option value="session_duration">By Session Time</option>
                  </select>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    {(() => {
                      const filteredData = getFilteredVisitors()
                      const displayCount = Math.min(visitorDisplayLimit, filteredData.length)
                      return `Showing ${displayCount} of ${filteredData.length} visitors${visitorSearchTerm ? ' (filtered)' : ''}`
                    })()}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {(() => {
                      const filteredData = getFilteredVisitors()
                      return visitorDisplayLimit < filteredData.length && (
                        <>
                          <button
                            onClick={handleShowMoreVisitors}
                            style={{
                              padding: '4px 8px',
                              background: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Show 50 More
                          </button>
                          <button
                            onClick={handleShowAllVisitors}
                            style={{
                              padding: '4px 8px',
                              background: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Show All ({filteredData.length})
                          </button>
                        </>
                      )
                    })()}
                  </div>
                </div>
                <div style={{ display: 'grid', gap: '12px', maxHeight: '600px', overflowY: 'auto' }}>
                  {getFilteredVisitors().slice(0, visitorDisplayLimit).map((visitor, index) => (
                    <div key={index} style={{
                      padding: '12px',
                      background: 'white',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr 1fr',
                      gap: '12px',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>
                          {visitor.ip_address}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {visitor.visitor_id?.substring(0, 8)}...
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', color: '#374151', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} />
                          {visitor.country || 'Unknown'}, {visitor.city || 'Unknown'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {visitor.device} • {visitor.browser}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', color: '#374151' }}>
                          {formatPageText(visitor.page_views || 0)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} />
                          {visitor.session_duration ? `${Math.round(visitor.session_duration / 60)}m` : 'N/A'}
                        </div>
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {formatToIST(visitor.visited_at, {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false
                        })} (IST)
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        }

        {
          detailData.type === 'pages' && (
            <div>
              <div style={{ marginBottom: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, color: '#374151' }}>Top Performing Pages</h4>
                  <div style={{
                    fontSize: '12px',
                    color: '#64748b',
                    background: '#f3e8ff',
                    padding: '4px 8px',
                    borderRadius: '4px'
                  }}>
                    {detailData.periodLabel || `Data from last ${formatPeriodText(selectedPeriod)}`}
                  </div>
                </div>

                {/* Search and Sort Controls */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <input
                    type="text"
                    placeholder="Search pages by URL or title..."
                    value={pageSearchTerm}
                    onChange={(e) => setPageSearchTerm(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                  <select
                    value={pageSortBy}
                    onChange={(e) => setPageSortBy(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      background: 'white',
                      cursor: 'pointer',
                      minWidth: '150px'
                    }}
                  >
                    <option value="total_views">By Total Views</option>
                    <option value="unique_views">By Unique Views</option>
                    <option value="avg_time_spent">By Avg Time</option>
                    <option value="bounce_rate">By Bounce Rate</option>
                    <option value="url">By URL (A-Z)</option>
                  </select>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    {(() => {
                      const filteredData = getFilteredPages()
                      const displayCount = Math.min(pageDisplayLimit, filteredData.length)
                      return `Showing ${displayCount} of ${filteredData.length} pages${pageSearchTerm ? ' (filtered)' : ''}`
                    })()}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {(() => {
                      const filteredData = getFilteredPages()
                      return pageDisplayLimit < filteredData.length && (
                        <>
                          <button
                            onClick={handleShowMorePages}
                            style={{
                              padding: '4px 8px',
                              background: '#8b5cf6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Show 15 More
                          </button>
                          <button
                            onClick={handleShowAllPages}
                            style={{
                              padding: '4px 8px',
                              background: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Show All ({filteredData.length})
                          </button>
                        </>
                      )
                    })()}
                  </div>
                </div>
                <div style={{ display: 'grid', gap: '12px', maxHeight: '600px', overflowY: 'auto', overflowX: 'hidden' }}>
                  {getFilteredPages().slice(0, pageDisplayLimit).map((page, index) => (
                    <div key={index} style={{
                      padding: '12px',
                      background: 'white',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      minWidth: '0'
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#1e293b',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          marginBottom: '4px'
                        }}>
                          {page.url || page.page_url}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {page.title || 'No title'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '16px', fontWeight: '600', color: '#3b82f6' }}>
                            {page.total_views || page.visits || 0}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>Views</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '16px', fontWeight: '600', color: '#10b981' }}>
                            {page.unique_views || 0}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>Unique</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '16px', fontWeight: '600', color: '#f59e0b' }}>
                            {page.avg_time_spent ? `${Math.round(page.avg_time_spent)}s` : 'N/A'}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>Avg Time</div>
                        </div>
                        {page.bounce_rate !== undefined && (
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '16px', fontWeight: '600', color: '#ec4899' }}>
                              {Math.round(page.bounce_rate)}%
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>Bounce</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        }

        {
          detailData.type === 'traffic' && (
            <div>
              <div style={{ marginBottom: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, color: '#374151' }}>Traffic Sources Breakdown</h4>
                  <div style={{
                    fontSize: '12px',
                    color: '#64748b',
                    background: '#ecfdf5',
                    padding: '4px 8px',
                    borderRadius: '4px'
                  }}>
                    {detailData.periodLabel || `Data from last ${formatPeriodText(selectedPeriod)}`}
                  </div>
                </div>

                {/* Traffic Summary Stats */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    padding: '12px',
                    background: '#ecfdf5',
                    borderRadius: '6px',
                    border: '2px solid #10b98120',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#10b981',
                      marginBottom: '4px'
                    }}>
                      {detailData.data?.reduce((total, source) => total + (source.count || source.visit_count || source.visits || 0), 0) || 0}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      Total Visits
                    </div>
                  </div>
                  <div style={{
                    padding: '12px',
                    background: '#f0f9ff',
                    borderRadius: '6px',
                    border: '2px solid #0ea5e920',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#0369a1',
                      marginBottom: '4px'
                    }}>
                      {detailData.data?.length || 0}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      Source Types
                    </div>
                  </div>
                  <div style={{
                    padding: '12px',
                    background: '#fef3c7',
                    borderRadius: '6px',
                    border: '2px solid #f59e0b20',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#d97706',
                      marginBottom: '4px'
                    }}>
                      {detailData.data?.length > 0 ? 
                        Math.round((detailData.data.reduce((total, source) => total + (source.count || source.visit_count || source.visits || 0), 0) || 0) / parseInt(selectedPeriod)) 
                        : 0
                      }
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      Daily Average
                    </div>
                  </div>
                </div>

                {/* Search and Sort Controls */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <input
                    type="text"
                    placeholder="Search traffic sources by name, type, or URL..."
                    value={trafficSearchTerm}
                    onChange={(e) => setTrafficSearchTerm(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                  <select
                    value={trafficSortBy}
                    onChange={(e) => setTrafficSortBy(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      background: 'white',
                      cursor: 'pointer',
                      minWidth: '150px'
                    }}
                  >
                    <option value="visit_count">By Visit Count</option>
                    <option value="source_name">By Source Name</option>
                    <option value="source_type">By Source Type</option>
                  </select>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    {(() => {
                      const filteredData = getFilteredTraffic()
                      const displayCount = Math.min(trafficDisplayLimit, filteredData.length)
                      return `Showing ${displayCount} of ${filteredData.length} traffic sources${trafficSearchTerm ? ' (filtered)' : ''}`
                    })()}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {(() => {
                      const filteredData = getFilteredTraffic()
                      return trafficDisplayLimit < filteredData.length && (
                        <>
                          <button
                            onClick={handleShowMoreTraffic}
                            style={{
                              padding: '4px 8px',
                              background: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Show 15 More
                          </button>
                          <button
                            onClick={handleShowAllTraffic}
                            style={{
                              padding: '4px 8px',
                              background: '#059669',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Show All ({filteredData.length})
                          </button>
                        </>
                      )
                    })()}
                  </div>
                </div>
                <div style={{ display: 'grid', gap: '12px', maxHeight: '600px', overflowY: 'auto' }}>
                  {getFilteredTraffic().slice(0, trafficDisplayLimit).map((source, index) => (
                    <div key={index} style={{
                      padding: '12px',
                      background: 'white',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#1e293b',
                          marginBottom: '4px'
                        }}>
                          {source.source_name || source.source || source.referrer || 'Direct'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {source.source_type || source.medium || 'Traffic source'}
                          {source.referrer_url && (
                            <span style={{ marginLeft: '8px', fontSize: '11px', color: '#94a3b8' }}>
                              • {source.referrer_url.length > 30 ? source.referrer_url.substring(0, 30) + '...' : source.referrer_url}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '18px', fontWeight: '600', color: '#10b981' }}>
                            {source.visit_count || source.visits || source.count || 0}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>Visits</div>
                        </div>
                        {source.referrer_url && (
                          <ExternalLink size={16} style={{ color: '#64748b' }} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        }

        {
          detailData.type === 'geographic' && (
            <div>
              <div style={{ marginBottom: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, color: '#374151' }}>Geographic Distribution</h4>
                  <div style={{
                    fontSize: '12px',
                    color: '#64748b',
                    background: '#fffbeb',
                    padding: '4px 8px',
                    borderRadius: '4px'
                  }}>
                    Data from last {formatPeriodText(selectedPeriod)}
                  </div>
                </div>

                {/* Geographic Summary Stats */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    padding: '12px',
                    background: '#fffbeb',
                    borderRadius: '6px',
                    border: '2px solid #f59e0b20',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#f59e0b',
                      marginBottom: '4px'
                    }}>
                      {detailData.data?.reduce((total, location) => total + (location.count || 0), 0) || 0}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      Total Visits
                    </div>
                  </div>
                  <div style={{
                    padding: '12px',
                    background: '#f0f9ff',
                    borderRadius: '6px',
                    border: '2px solid #0ea5e920',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#0369a1',
                      marginBottom: '4px'
                    }}>
                      {detailData.data?.length || 0}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      Locations
                    </div>
                  </div>
                  <div style={{
                    padding: '12px',
                    background: '#f0fdf4',
                    borderRadius: '6px',
                    border: '2px solid #10b98120',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#059669',
                      marginBottom: '4px'
                    }}>
                      {detailData.data?.length > 0 ? 
                        Math.round((detailData.data.reduce((total, location) => total + (location.count || 0), 0) || 0) / parseInt(selectedPeriod)) 
                        : 0
                      }
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      Daily Average
                    </div>
                  </div>
                </div>

                {/* Search, Sort and View Controls */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <input
                    type="text"
                    placeholder="Search by country, state, or city..."
                    value={geoSearchTerm}
                    onChange={(e) => setGeoSearchTerm(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                  <select
                    value={geoSortBy}
                    onChange={(e) => setGeoSortBy(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      background: 'white',
                      cursor: 'pointer',
                      minWidth: '130px'
                    }}
                  >
                    <option value="count">By Visitor Count</option>
                    <option value="country">By Country</option>
                    <option value="state">By State</option>
                    <option value="city">By City</option>
                  </select>
                  <select
                    value={geoViewMode}
                    onChange={(e) => setGeoViewMode(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      background: 'white',
                      cursor: 'pointer',
                      minWidth: '100px'
                    }}
                  >
                    <option value="grid">Grid View</option>
                    <option value="list">List View</option>
                  </select>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    {(() => {
                      const filteredData = getFilteredGeoData()
                      const displayCount = Math.min(geoDisplayLimit, filteredData.length)
                      return `Showing ${displayCount} of ${filteredData.length} locations${geoSearchTerm ? ' (filtered)' : ''}`
                    })()}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {(() => {
                      const filteredData = getFilteredGeoData()
                      return geoDisplayLimit < filteredData.length && (
                        <>
                          <button
                            onClick={handleShowMoreGeo}
                            style={{
                              padding: '4px 8px',
                              background: '#f59e0b',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Show 12 More
                          </button>
                          <button
                            onClick={handleShowAllGeo}
                            style={{
                              padding: '4px 8px',
                              background: '#d97706',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Show All ({filteredData.length})
                          </button>
                        </>
                      )
                    })()}
                  </div>
                </div>

                {/* Grid View */}
                {geoViewMode === 'grid' && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '16px',
                    maxHeight: '600px',
                    overflowY: 'auto'
                  }}>
                    {getFilteredGeoData().slice(0, geoDisplayLimit).map((location, index) => (
                      <div key={index} style={{
                        padding: '16px',
                        background: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        textAlign: 'center',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                      }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)'
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      >
                        <div style={{
                          fontSize: '24px',
                          fontWeight: '700',
                          color: '#f59e0b',
                          marginBottom: '8px'
                        }}>
                          {location.count}
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#1e293b',
                          fontWeight: '500',
                          marginBottom: '4px'
                        }}>
                          {location.country || 'Unknown'}
                        </div>
                        {location.state && (
                          <div style={{
                            fontSize: '12px',
                            color: '#64748b',
                            marginBottom: '2px'
                          }}>
                            {location.state}
                          </div>
                        )}
                        {location.city && (
                          <div style={{
                            fontSize: '11px',
                            color: '#94a3b8',
                            marginBottom: '4px'
                          }}>
                            {location.city}
                          </div>
                        )}
                        <div style={{
                          fontSize: '12px',
                          color: '#64748b'
                        }}>
                          Visitors
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* List View */}
                {geoViewMode === 'list' && (
                  <div style={{
                    display: 'grid',
                    gap: '8px',
                    maxHeight: '600px',
                    overflowY: 'auto'
                  }}>
                    {getFilteredGeoData().slice(0, geoDisplayLimit).map((location, index) => (
                      <div key={index} style={{
                        padding: '12px 16px',
                        background: 'white',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#1e293b',
                            marginBottom: '2px'
                          }}>
                            {location.country || 'Unknown Country'}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#64748b'
                          }}>
                            {[location.state, location.city].filter(Boolean).join(', ') || 'No additional location data'}
                          </div>
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{
                              fontSize: '18px',
                              fontWeight: '600',
                              color: '#f59e0b'
                            }}>
                              {location.count}
                            </div>
                            <div style={{
                              fontSize: '11px',
                              color: '#64748b'
                            }}>
                              visitors
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        }

        {
          detailData.type === 'top-pages' && (
            <div>
              <div style={{ marginBottom: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, color: '#374151' }}>Top Pages Analysis</h4>
                  <div style={{
                    fontSize: '12px',
                    color: '#64748b',
                    background: '#fdf2f8',
                    padding: '4px 8px',
                    borderRadius: '4px'
                  }}>
                    {detailData.periodLabel || `Data from last ${formatPeriodText(selectedPeriod)}`}
                  </div>
                </div>

                {/* Search, Sort and View Controls */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <input
                    type="text"
                    placeholder="Search pages by URL or title..."
                    value={topPagesSearchTerm}
                    onChange={(e) => setTopPagesSearchTerm(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                  <select
                    value={topPagesSortBy}
                    onChange={(e) => setTopPagesSortBy(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      background: 'white',
                      cursor: 'pointer',
                      minWidth: '150px'
                    }}
                  >
                    <option value="total_views">By Total Views</option>
                    <option value="unique_views">By Unique Views</option>
                    <option value="avg_time_spent">By Avg Time</option>
                    <option value="bounce_rate">By Bounce Rate</option>
                    <option value="url">By URL (A-Z)</option>
                    <option value="title">By Title (A-Z)</option>
                  </select>
                  <select
                    value={topPagesViewMode}
                    onChange={(e) => setTopPagesViewMode(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      background: 'white',
                      cursor: 'pointer',
                      minWidth: '120px'
                    }}
                  >
                    <option value="detailed">Detailed View</option>
                    <option value="compact">Compact View</option>
                    <option value="analytics">Analytics View</option>
                  </select>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    {(() => {
                      const filteredData = getFilteredTopPages()
                      const displayCount = Math.min(topPagesDisplayLimit, filteredData.length)
                      return `Showing ${displayCount} of ${filteredData.length} pages${topPagesSearchTerm ? ' (filtered)' : ''}`
                    })()}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {(() => {
                      const filteredData = getFilteredTopPages()
                      return topPagesDisplayLimit < filteredData.length && (
                        <>
                          <button
                            onClick={handleShowMoreTopPages}
                            style={{
                              padding: '4px 8px',
                              background: '#ec4899',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Show 20 More
                          </button>
                          <button
                            onClick={handleShowAllTopPages}
                            style={{
                              padding: '4px 8px',
                              background: '#be185d',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Show All ({filteredData.length})
                          </button>
                        </>
                      )
                    })()}
                  </div>
                </div>

                {/* Detailed View */}
                {topPagesViewMode === 'detailed' && (
                  <div style={{ display: 'grid', gap: '12px', maxHeight: '600px', overflowY: 'auto', overflowX: 'hidden' }}>
                    {getFilteredTopPages().slice(0, topPagesDisplayLimit).map((page, index) => (
                      <div key={index} style={{
                        padding: '16px',
                        background: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        transition: 'all 0.2s ease'
                      }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)'
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: '16px',
                              fontWeight: '600',
                              color: '#1e293b',
                              marginBottom: '4px',
                              wordBreak: 'break-all'
                            }}>
                              {page.url || page.page_url}
                            </div>
                            <div style={{
                              fontSize: '14px',
                              color: '#64748b',
                              marginBottom: '8px'
                            }}>
                              {page.title || 'No title available'}
                            </div>
                          </div>
                        </div>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                          gap: '16px'
                        }}>
                          <div style={{ textAlign: 'center', padding: '8px', background: '#eff6ff', borderRadius: '6px' }}>
                            <div style={{ fontSize: '20px', fontWeight: '700', color: '#3b82f6', marginBottom: '2px' }}>
                              {page.total_views || page.visits || 0}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>Total Views</div>
                          </div>
                          <div style={{ textAlign: 'center', padding: '8px', background: '#f0fdf4', borderRadius: '6px' }}>
                            <div style={{ fontSize: '20px', fontWeight: '700', color: '#10b981', marginBottom: '2px' }}>
                              {page.unique_views || 0}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>Unique Views</div>
                          </div>
                          <div style={{ textAlign: 'center', padding: '8px', background: '#fffbeb', borderRadius: '6px' }}>
                            <div style={{ fontSize: '20px', fontWeight: '700', color: '#f59e0b', marginBottom: '2px' }}>
                              {page.avg_time_spent ? `${Math.round(page.avg_time_spent)}s` : 'N/A'}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>Avg Time</div>
                          </div>
                          {page.bounce_rate !== undefined && (
                            <div style={{ textAlign: 'center', padding: '8px', background: '#fdf2f8', borderRadius: '6px' }}>
                              <div style={{ fontSize: '20px', fontWeight: '700', color: '#ec4899', marginBottom: '2px' }}>
                                {Math.round(page.bounce_rate)}%
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>Bounce Rate</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Compact View */}
                {topPagesViewMode === 'compact' && (
                  <div style={{ display: 'grid', gap: '8px', maxHeight: '600px', overflowY: 'auto', overflowX: 'hidden' }}>
                    {getFilteredTopPages().slice(0, topPagesDisplayLimit).map((page, index) => (
                      <div key={index} style={{
                        padding: '12px 16px',
                        background: 'white',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#1e293b',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            marginBottom: '2px'
                          }}>
                            {page.url || page.page_url}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#64748b',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {page.title || 'No title'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '16px', fontWeight: '600', color: '#3b82f6' }}>
                              {page.total_views || page.visits || 0}
                            </div>
                            <div style={{ fontSize: '10px', color: '#64748b' }}>Views</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '16px', fontWeight: '600', color: '#10b981' }}>
                              {page.unique_views || 0}
                            </div>
                            <div style={{ fontSize: '10px', color: '#64748b' }}>Unique</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Analytics View */}
                {topPagesViewMode === 'analytics' && (
                  <div style={{ display: 'grid', gap: '12px', maxHeight: '600px', overflowY: 'auto', overflowX: 'hidden' }}>
                    {getFilteredTopPages().slice(0, topPagesDisplayLimit).map((page, index) => (
                      <div key={index} style={{
                        padding: '16px',
                        background: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#1e293b',
                            marginBottom: '4px',
                            wordBreak: 'break-all'
                          }}>
                            {page.url || page.page_url}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#64748b'
                          }}>
                            {page.title || 'No title available'}
                          </div>
                        </div>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                          gap: '8px'
                        }}>
                          <div style={{ textAlign: 'center', padding: '6px', background: '#f8fafc', borderRadius: '4px' }}>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#3b82f6' }}>
                              {page.total_views || page.visits || 0}
                            </div>
                            <div style={{ fontSize: '9px', color: '#64748b' }}>Views</div>
                          </div>
                          <div style={{ textAlign: 'center', padding: '6px', background: '#f8fafc', borderRadius: '4px' }}>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#10b981' }}>
                              {page.unique_views || 0}
                            </div>
                            <div style={{ fontSize: '9px', color: '#64748b' }}>Unique</div>
                          </div>
                          <div style={{ textAlign: 'center', padding: '6px', background: '#f8fafc', borderRadius: '4px' }}>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#f59e0b' }}>
                              {page.avg_time_spent ? `${Math.round(page.avg_time_spent)}s` : 'N/A'}
                            </div>
                            <div style={{ fontSize: '9px', color: '#64748b' }}>Time</div>
                          </div>
                          {page.bounce_rate !== undefined && (
                            <div style={{ textAlign: 'center', padding: '6px', background: '#f8fafc', borderRadius: '4px' }}>
                              <div style={{ fontSize: '14px', fontWeight: '600', color: '#ec4899' }}>
                                {Math.round(page.bounce_rate)}%
                              </div>
                              <div style={{ fontSize: '9px', color: '#64748b' }}>Bounce</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        }
      </div >
    )
  }

  const renderReportCategories = () => {
    return (
      <div style={{ display: 'grid', gap: '16px', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
        {reportCategories.map((category, index) => (
          <div key={index} style={{
            padding: '16px',
            background: category.bgColor,
            borderRadius: '8px',
            border: `2px solid ${category.color}20`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
            onClick={() => handleCategoryClick(category)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {category.icon}
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: category.color, marginBottom: '4px' }}>
                  {category.value.toLocaleString()}
                </div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                  {category.label}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', marginBottom: '4px' }}>
                {category.title}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                {category.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Don't render if no project is selected
  if (!projectId) {
    return (
      <div className="content" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px',
        color: '#64748b'
      }}>
        <BarChart3 size={64} style={{ marginBottom: '16px', opacity: 0.3 }} />
        <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>No Project Selected</h3>
        <p>Please select a project to view reports and analytics data.</p>
      </div>
    )
  }

  // Show skeleton during initial load or when data is loading
  if (loadingData || initialLoad) {
    // Check if we have a category in URL to show appropriate skeleton
    const categoryFromUrl = searchParams.get('category')
    const isCategoryView = categoryFromUrl && selectedCategoryKey
    
    return (
      <>
        <div className="header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
          <h1 style={{ margin: 0 }}>
            {isCategoryView ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <ArrowLeft size={20} style={{ color: '#64748b' }} />
                </button>
                {categoryFromUrl || 'Reports & Analytics'}
              </span>
            ) : (
              'Reports & Analytics'
            )}
          </h1>
          {project && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#64748b',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              <span>Project: {project.name}</span>
            </div>
          )}
        </div>

        <div className="content">
          {isCategoryView ? (
            // Category-specific skeleton
            <div className="chart-container" style={{ marginBottom: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <Skeleton variant="rectangular" width={100} height={36} animation="wave" />
                <Skeleton variant="text" width={300} height={24} animation="wave" />
                <Skeleton variant="rectangular" width={120} height={28} animation="wave" />
                <Skeleton variant="rectangular" width={150} height={28} animation="wave" />
              </div>

              {/* Summary Stats Skeleton */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '16px',
                marginBottom: '20px'
              }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{
                    padding: '16px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    textAlign: 'center'
                  }}>
                    <Skeleton variant="text" width={60} height={32} animation="wave" sx={{ margin: '0 auto 4px' }} />
                    <Skeleton variant="text" width={80} height={16} animation="wave" sx={{ margin: '0 auto' }} />
                  </div>
                ))}
              </div>

              {/* Data Table Skeleton */}
              <div style={{ marginBottom: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <Skeleton variant="text" width={200} height={20} animation="wave" />
                  <Skeleton variant="rectangular" width={150} height={24} animation="wave" />
                </div>

                {/* Search and Sort Controls Skeleton */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <Skeleton variant="rectangular" width="100%" height={40} animation="wave" />
                  <Skeleton variant="rectangular" width={150} height={40} animation="wave" />
                </div>

                {/* Data Rows Skeleton */}
                <div style={{ display: 'grid', gap: '12px', maxHeight: '600px', overflowY: 'auto' }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} style={{
                      padding: '12px',
                      background: 'white',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr 1fr',
                      gap: '12px',
                      alignItems: 'center'
                    }}>
                      <Skeleton variant="text" width={120} height={16} animation="wave" />
                      <Skeleton variant="text" width={100} height={14} animation="wave" />
                      <Skeleton variant="text" width={60} height={16} animation="wave" />
                      <Skeleton variant="text" width={80} height={14} animation="wave" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Main Reports page skeleton
            <>
              {/* Period Selector Skeleton */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                marginBottom: 4,
                padding: 2.5,
                background: '#f8fafc',
                borderRadius: 3,
                border: '1px solid #e2e8f0'
              }}>
                <Skeleton variant="text" width={120} height={16} animation="wave" />
                <Skeleton variant="rounded" width={150} height={40} animation="wave" />
                <Skeleton variant="rounded" width={100} height={40} animation="wave" />
              </Box>

              {/* Report Categories Grid */}
              <Grid container spacing={3}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <Grid item xs={12} md={6} lg={4} key={i}>
                    <Card sx={{
                      padding: 3,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}>
                      <CardContent sx={{ padding: 0, '&:last-child': { paddingBottom: 0 } }}>
                        {/* Category Header */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, marginBottom: 2 }}>
                          <Skeleton variant="rectangular" width={24} height={24} animation="wave" />
                          <Skeleton variant="text" width={150} height={20} animation="wave" />
                        </Box>

                        {/* Category Description */}
                        <Skeleton variant="text" width="90%" height={14} animation="wave" sx={{ marginBottom: 2.5 }} />

                        {/* Stats */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                          <Box>
                            <Skeleton variant="text" width={60} height={24} animation="wave" sx={{ marginBottom: 0.5 }} />
                            <Skeleton variant="text" width={40} height={12} animation="wave" />
                          </Box>
                          <Skeleton variant="rounded" width={80} height={36} animation="wave" />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </div>
      </>
    )
  }

  return (
    <>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <div className="header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <h1 style={{ margin: 0 }}>
            {selectedCategory ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={handleBackToCategories}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <ArrowLeft size={20} style={{ color: '#64748b' }} />
                </button>
                {selectedCategory.title} Details
              </span>
            ) : (
              'Reports & Analytics'
            )}
          </h1>
          <div style={{ display: 'flex', gap: '12px', paddingRight: '40px', alignItems: 'center' }}>
            {exportStatus && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '14px',
                background: exportStatus === 'success' ? '#dcfce7' : '#fef2f2',
                color: exportStatus === 'success' ? '#166534' : '#dc2626'
              }}>
                {exportStatus === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                {exportStatus === 'success' ? 'Export successful!' : 'Export failed. Please try again.'}
              </div>
            )}

            <button className="btn btn-primary" onClick={handleExportCSV} disabled={loading}>
              <Download size={16} />
              {loading ? 'Exporting...' : `Export Last ${formatPeriodText(selectedPeriod)}`}
            </button>
          </div>
        </div>
        {project && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#64748b',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            <span>Project: {project.name}</span>
          </div>
        )}
      </div>

      <div className="content">
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#dc2626'
          }}>
            <AlertCircle size={20} />
            <div>
              <strong>Error:</strong> {error}
              <button
                onClick={refreshData}
                style={{
                  marginLeft: '12px',
                  padding: '4px 8px',
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {loadingData ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px',
            color: '#64748b'
          }}>
            <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>Loading report data...</p>
            <p style={{ fontSize: '14px', opacity: 0.7 }}>Fetching data for last {selectedPeriod} days</p>
          </div>
        ) : (
          <>
            {/* Period Controls */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              padding: '16px',
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div>
                <h3 style={{ fontSize: '16px', color: '#1e293b', margin: 0, marginBottom: '4px' }}>
                  Analytics Period
                </h3>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                  Select the time period for your analytics data
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button
                  className="btn"
                  onClick={refreshData}
                  disabled={loadingData}
                  style={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    color: '#475569'
                  }}
                >
                  <RefreshCw size={16} style={{ marginRight: '6px' }} />
                  Refresh Data
                </button>
                <select
                  className="btn"
                  style={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    color: '#475569',
                    cursor: 'pointer',
                    minWidth: '150px'
                  }}
                  value={selectedPeriod}
                  onChange={(e) => {
                    const newPeriod = e.target.value
                    console.log('🔄 Period filter changed:', {
                      from: selectedPeriod,
                      to: newPeriod,
                      timestamp: new Date().toISOString()
                    })
                    
                    setSelectedPeriod(newPeriod)
                    console.log('✅ setSelectedPeriod called with:', newPeriod)
                    
                    // Trigger immediate data refresh for better UX
                    console.log('🚀 Calling fetchReportData() due to period change...')
                    fetchReportData()
                  }}
                >
                  <option value="1">Last 1 Day</option>
                  <option value="7">Last 7 Days</option>
                  <option value="30">Last 30 Days</option>
                  <option value="60">Last 60 Days</option>
                </select>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="stats-grid" style={{ marginBottom: '10px' }}>
              <div className="stat-card">
                <h3>Total Visits</h3>
                <div className="value">{summaryData?.total_visits?.toLocaleString() || 0}</div>
              </div>
              <div className="stat-card">
                <h3>Unique Visitors</h3>
                <div className="value">{summaryData?.unique_visitors?.toLocaleString() || 0}</div>
              </div>
              <div className="stat-card live">
                <h3>Live Visitors</h3>
                <div className="value">{summaryData?.live_visitors || 0}</div>
              </div>
              <div className="stat-card">
                <h3>Avg. Session</h3>
                <div className="value">
                  {summaryData?.total_visits > 0
                    ? Math.round((summaryData.total_visits / summaryData.unique_visitors) * 10) / 10
                    : 0}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Detailed Data View */}
        {selectedCategory && renderDetailedData()}

        {/* Report Categories Grid - Show only when no category is selected */}
        <div style={{ marginBottom: '30px' }}>
          {!selectedCategory && !loadingData && (
            <>
              <h3 style={{ fontSize: '18px', marginBottom: '20px', color: '#1e293b' }}>
                Available Report Categories
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px'
              }}>
                {reportCategories.map((category, index) => (
                  <div
                    key={index}
                    className="report-category-card"
                    style={{
                      background: 'white',
                      padding: '24px',
                      borderRadius: '12px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      border: '2px solid transparent',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                    onClick={() => handleCategoryClick(category)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)'
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)'
                      e.currentTarget.style.borderColor = category.color
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
                      e.currentTarget.style.borderColor = 'transparent'
                    }}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: category.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: category.color,
                      marginBottom: '16px'
                    }}>
                      {category.icon}
                    </div>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1e293b',
                      marginBottom: '8px'
                    }}>
                      {category.title}
                    </h4>
                    <p style={{
                      fontSize: '14px',
                      color: '#64748b',
                      lineHeight: '1.6',
                      marginBottom: '12px'
                    }}>
                      {category.description}
                    </p>
                    <div style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '8px',
                      marginTop: 'auto',
                      marginBottom: '12px'
                    }}>
                      <span style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: category.color
                      }}>
                        {category.value.toLocaleString()}
                      </span>
                      <span style={{
                        fontSize: '13px',
                        color: '#94a3b8'
                      }}>
                        {category.label}
                      </span>
                    </div>
                    <div style={{
                      padding: '8px 12px',
                      background: category.bgColor,
                      color: category.color,
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500',
                      textAlign: 'center',
                      border: `1px solid ${category.color}20`
                    }}>
                      Click to view details
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}    

export default Reports