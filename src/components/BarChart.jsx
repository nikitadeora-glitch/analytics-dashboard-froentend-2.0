import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

function BarChart({ 
  displayData, 
  showPageViews, 
  showUniqueVisits, 
  showReturningVisits,
  period = 'daily'
}) {
  // Prepare data for Chart.js with proper labels based on period
  const labels = displayData.map(day => {
    // Handle different period formats
    if (period === 'monthly') {
      // For monthly data, show just month and year
      if (day.date.includes('Week')) {
        return day.date // Keep week format as is
      }
      // Parse month format like "Jan 2024" or "January 2024"
      return day.date
    } else if (period === 'weekly') {
      // For weekly data, show week number
      return day.date
    } else {
      // For daily data, show short format
      const date = new Date(day.date)
      if (isNaN(date.getTime())) {
        // If date parsing fails, return original
        return day.date
      }
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      })
    }
  })

  const datasets = []

  if (showPageViews) {
    datasets.push({
      label: 'Page Views',
      data: displayData.map(day => day.page_views),
      backgroundColor: (ctx) => {
        const canvas = ctx.chart.ctx
        const gradient = canvas.createLinearGradient(0, 0, 0, 250)
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.9)')
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0.3)')
        return gradient
      },
      borderColor: 'rgba(16, 185, 129, 1)',
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
      hoverBackgroundColor: 'rgba(16, 185, 129, 1)',
      hoverBorderColor: 'rgba(16, 185, 129, 1)',
      hoverBorderWidth: 3,
    })
  }

  if (showUniqueVisits) {
    datasets.push({
      label: 'Unique Visits',
      data: displayData.map(day => day.unique_visits),
      backgroundColor: (ctx) => {
        const canvas = ctx.chart.ctx
        const gradient = canvas.createLinearGradient(0, 0, 0, 250)
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.9)')
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.3)')
        return gradient
      },
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
      hoverBackgroundColor: 'rgba(59, 130, 246, 1)',
      hoverBorderColor: 'rgba(59, 130, 246, 1)',
      hoverBorderWidth: 3,
    })
  }

  if (showReturningVisits) {
    datasets.push({
      label: 'Returning Visits',
      data: displayData.map(day => day.returning_visits),
      backgroundColor: (ctx) => {
        const canvas = ctx.chart.ctx
        const gradient = canvas.createLinearGradient(0, 0, 0, 250)
        gradient.addColorStop(0, 'rgba(245, 158, 11, 0.9)')
        gradient.addColorStop(1, 'rgba(245, 158, 11, 0.3)')
        return gradient
      },
      borderColor: 'rgba(245, 158, 11, 1)',
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
      hoverBackgroundColor: 'rgba(245, 158, 11, 1)',
      hoverBorderColor: 'rgba(245, 158, 11, 1)',
      hoverBorderWidth: 3,
    })
  }

  const data = {
    labels,
    datasets
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    categoryPercentage: 0.9, // Controls the width of the entire category (all bars for one date)
    barPercentage: 0.95, // Controls the width of individual bars within a category
    maxBarThickness: 60, // Maximum bar width
    minBarLength: 2, // Minimum bar height for visibility
    plugins: {
      legend: {
        display: false, // We'll use the existing checkboxes
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#f1f5f9',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderWidth: 1,
        cornerRadius: 12,
        displayColors: true,
        padding: 12,
        titleFont: {
          size: 14,
          weight: '600'
        },
        bodyFont: {
          size: 13,
          weight: '500'
        },
        callbacks: {
          title: function(context) {
            const dataIndex = context[0].dataIndex
            return displayData[dataIndex].date
          },
          label: function(context) {
            const value = context.parsed.y
            const label = context.dataset.label
            return `${label}: ${value.toLocaleString()}`
          },
          afterBody: function(context) {
            const dataIndex = context[0].dataIndex
            const day = displayData[dataIndex]
            return [
              '',
              `📊 Total Page Views: ${day.page_views}`,
              `👥 Unique Visitors: ${day.unique_visits}`,
              `🔄 Returning: ${day.returning_visits}`,
              `✨ First Time: ${day.first_time_visits}`
            ]
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#64748b',
          font: {
            size: period === 'monthly' ? 12 : 11,
            weight: '500'
          },
          maxRotation: period === 'monthly' ? 45 : 0,
          padding: 8,
          callback: function(value, index) {
            const label = labels[index]
            if (period === 'monthly') {
              return label
            } else if (period === 'weekly') {
              return label
            } else {
              // For daily, show shorter format
              return label
            }
          }
        },
        border: {
          display: false
        },
        categoryPercentage: 0.9,
        barPercentage: 0.95
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(226, 232, 240, 0.4)',
          drawBorder: false,
          lineWidth: 1
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 11,
            weight: '500'
          },
          padding: 8,
          callback: function(value) {
            return value.toLocaleString()
          }
        },
        border: {
          display: false
        }
      }
    },
    animation: {
      duration: 1200,
      easing: 'easeOutCubic',
      delay: (context) => {
        return context.dataIndex * 100 // Stagger animation
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    onHover: (event, elements) => {
      event.native.target.style.cursor = 'default'
    },
    elements: {
      bar: {
        borderWidth: 0,
        hoverBorderWidth: 2,
        borderRadius: 8,
        borderSkipped: false
      }
    },
    layout: {
      padding: {
        top: 20,
        bottom: 5,
        left: 5,
        right: 5
      }
    }
  }

  // Calculate optimal height based on number of datasets
  const activeDatasets = datasets.length
  const baseHeight = 300
  const extraHeight = activeDatasets > 1 ? 40 : 0
  const totalHeight = baseHeight + extraHeight

  return (
    <div style={{ 
      height: `${totalHeight + 40}px`, 
      width: '100%',
      position: 'relative',
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      border: '1px solid rgba(226, 232, 240, 0.8)',
      overflow: 'hidden'
    }}>
      {/* Decorative background elements */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '100px',
        height: '100px',
        background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.05), rgba(16, 185, 129, 0.05))',
        borderRadius: '50%',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-30px',
        left: '-30px',
        width: '60px',
        height: '60px',
        background: 'linear-gradient(45deg, rgba(245, 158, 11, 0.05), rgba(239, 68, 68, 0.05))',
        borderRadius: '50%',
        zIndex: 0
      }} />
      
      {/* Chart container */}
      <div style={{ 
        position: 'relative', 
        height: '100%', 
        zIndex: 1,
        background: 'rgba(255, 255, 255, 0.7)',
        borderRadius: '12px',
        padding: '12px'
      }}>
        <Bar data={data} options={options} />
      </div>
     
      
    </div>
  )
}

export default BarChart