import React, { useState, useEffect } from "react";
import { Calendar, ChevronDown, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { seoAPI } from '../../api/api';
import "../../css/seoOverview.css";

function SeoOverview() {
  const { projectId } = useParams();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState('7d');
  const [seoData, setSeoData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [showSiteSelection, setShowSiteSelection] = useState(false);

  // Check connection status and load data
  useEffect(() => {
    checkConnectionAndLoadData();
  }, [projectId, selectedRange]);

  const checkConnectionAndLoadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Try to get overview data to check if connected
      const overviewResponse = await seoAPI.getOverview(projectId, selectedRange);
      
      if (overviewResponse.data) {
        setIsConnected(true);
        setSeoData(overviewResponse.data);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        // Not connected, show connect option
        setIsConnected(false);
        setShowSiteSelection(true);
      } else {
        setError(err.response?.data?.detail || 'Failed to load SEO data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      const connectResponse = await seoAPI.getConnectUrl(projectId);
      if (connectResponse.data.auth_url) {
        window.location.href = connectResponse.data.auth_url;
      }
    } catch (err) {
      setError('Failed to get connect URL');
    }
  };

  const handleSiteSelection = async () => {
    try {
      const sitesResponse = await seoAPI.getSites(projectId);
      setSites(sitesResponse.data.sites || []);
    } catch (err) {
      setError('Failed to fetch sites');
    }
  };

  const handleSelectSite = async (siteUrl) => {
    try {
      await seoAPI.selectSite(projectId, siteUrl);
      setSelectedSite(siteUrl);
      setShowSiteSelection(false);
      // Reload data after site selection
      checkConnectionAndLoadData();
    } catch (err) {
      setError('Failed to select site');
    }
  };

  const handleRangeChange = (range) => {
    setSelectedRange(range);
    setIsDropdownOpen(false);
  };

  // Format data for charts
  const formatLineChartData = () => {
    if (!seoData?.line) return [];
    return seoData.line.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      clicks: item.clicks
    }));
  };

  const formatDonutData = () => {
    if (!seoData?.donut) return [];
    return seoData.donut.map(item => ({
      name: item.name,
      value: item.value,
      percentage: item.percentage
    }));
  };

  const lineChartData = formatLineChartData();
  const clicksData = formatDonutData();
  const totalClicks = seoData?.metrics?.clicks || 0;

  // Colors for the chart segments
  const COLORS = ['#6366F1', '#8B5CF6', '#A78BFA', '#C4B5FD'];

  // Custom label for the center of the donut
  const renderCustomLabel = () => {
    return (
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="donut-center-text">
        <tspan x="50%" dy="-0.5em" className="donut-label">Link clicks</tspan>
        <tspan x="50%" dy="1.5em" className="donut-value">{totalClicks.toLocaleString()}</tspan>
      </text>
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-country">{payload[0].name}</p>
          <p className="tooltip-value">{payload[0].value.toLocaleString()} clicks</p>
          <p className="tooltip-percentage">{payload[0].payload.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="seo-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading SEO data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="seo-container">
        <div className="error-state">
          <AlertCircle size={24} />
          <p>{error}</p>
          <button onClick={checkConnectionAndLoadData} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="seo-container">
        <div className="connection-state">
          <div className="connection-card">
            <h2>Connect Google Search Console</h2>
            <p>Connect your Google Search Console account to view SEO analytics and performance data.</p>
            
            {showSiteSelection ? (
              <div className="site-selection">
                <h3>Select Your Website</h3>
                {sites.length > 0 ? (
                  <div className="sites-list">
                    {sites.map((site, index) => (
                      <div key={index} className="site-item">
                        <span>{site}</span>
                        <button 
                          onClick={() => handleSelectSite(site)}
                          className="select-site-btn"
                        >
                          Select
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-sites">
                    <p>No sites found. Please make sure you have access to Google Search Console.</p>
                    <button onClick={handleSiteSelection} className="refresh-btn">
                      Refresh Sites
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="connect-actions">
                <button onClick={handleConnect} className="connect-btn">
                  <ExternalLink size={16} />
                  Connect with Google
                </button>
                <button onClick={handleSiteSelection} className="already-connected-btn">
                  Already connected? Select site
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="seo-container">
      {/* Header with Date Filter */}
      <div className="seo-header">
        <h1>Statify Search Console Report</h1>
        <div className="date-filter-dropdown">
          <button 
            className="date-filter-btn"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <Calendar size={16} />
            <span>{selectedRange === '1d' ? '1 Day' : selectedRange === '7d' ? '7 Days' : selectedRange === '30d' ? '30 Days' : '90 Days'}</span>
            <ChevronDown size={16} />
          </button>
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-item" onClick={() => handleRangeChange('1d')}>1 Day</div>
              <div className="dropdown-item" onClick={() => handleRangeChange('7d')}>7 Days</div>
              <div className="dropdown-item" onClick={() => handleRangeChange('30d')}>30 Days</div>
              <div className="dropdown-item" onClick={() => handleRangeChange('90d')}>90 Days</div>
            </div>
          )}
        </div>
      </div>

      {/* Top Section */}
      <div className="seo-top-grid">
      
        {/* Chart Card - Line Chart */}
        <div className="card chart-card line-chart-wrapper">
          <div className="card-header">
            <h3>Clicks</h3>
            <span className="total-value">{seoData?.metrics?.clicks?.toLocaleString() || 0}</span>
          </div>
          <div className="line-chart-container">
            <ResponsiveContainer width="100%" height={380}>
              <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fill: '#666' }}
                  axisLine={{ stroke: '#e0e0e0' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#666' }}
                  axisLine={{ stroke: '#e0e0e0' }}
                  domain={[0, 'dataMax + 100']}
                  allowDataOverflow={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e0e0e0', 
                    borderRadius: '6px',
                    fontSize: '12px',
                    marginBottom:'0px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="clicks" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart Card */}
        <div className="card donut-chart-wrapper">
          <div className="card-header">
            <h3>Clicks by Country</h3>
          </div>

          <div className="donut-chart-container">
            <ResponsiveContainer width="100%" height={390}>
              <PieChart>
                <Pie
                  data={clicksData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={190}
                  innerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {clicksData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Legend below the chart */}
            <div className="chart-legend">
              {clicksData.map((item, index) => (
                <div key={item.name} className="legend-item">
                  <div 
                    className="legend-color" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="legend-text">{item.name}</span>
                  <span className="legend-percentage">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Metric Cards */}
      <div className="seo-metrics">
        <div className="metric-card">
          <p>Clicks</p>
          <h2>{seoData?.metrics?.clicks?.toLocaleString() || 0}</h2>
        </div>
        <div className="metric-card">
          <p>Impressions</p>
          <h2>{seoData?.metrics?.impressions ? (seoData.metrics.impressions >= 1000 ? `${(seoData.metrics.impressions / 1000).toFixed(1)}K` : seoData.metrics.impressions.toLocaleString()) : 0}</h2>
        </div>
        <div className="metric-card">
          <p>Avg Position</p>
          <h2>{seoData?.metrics?.position?.toFixed(1) || '0.0'}</h2>
        </div>
        <div className="metric-card">
          <p>CTR</p>
          <h2>{seoData?.metrics?.ctr?.toFixed(2) || '0.00'}%</h2>
        </div>
      </div>

      {/* Table Section */}
      <div className="card table-card">
        <div className="card-header">
          <h3>Top Keywords</h3>
        </div>

        <table className="seo-table">
          <thead>
            <tr>
              <th>Keyword</th>
              <th>Clicks</th>
              <th>Impressions</th>
              <th>Avg Position</th>
              <th>CTR</th>
            </tr>
          </thead>
          <tbody>
            {seoData?.table?.map((keyword, index) => (
              <tr key={index}>
                <td>{keyword.keyword}</td>
                <td>{keyword.clicks.toLocaleString()}</td>
                <td>{keyword.impressions.toLocaleString()}</td>
                <td>{keyword.position}</td>
                <td>{keyword.ctr}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default SeoOverview;