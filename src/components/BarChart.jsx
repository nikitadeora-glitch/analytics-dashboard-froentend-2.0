import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
)

function BarChart({ 
  displayData = [], 
  showPageViews = true, 
  showUniqueVisits = true, 
  showReturningVisits = true,
  period = 'daily',
  stepSize = 20,
  maxValue = 220
}) {
  // Sample data matching your image if no data provided
  const sampleData = [
    { date: '8 Mon', page_views: 35, unique_visits: 18, returning_visits: 5 },
    { date: '9 Tues', page_views: 55, unique_visits: 38, returning_visits: 12 },
    { date: '10 Wed', page_views: 53, unique_visits: 37, returning_visits: 8 },
    { date: '11 Thur', page_views: 205, unique_visits: 62, returning_visits: 16 },
    { date: '12 Fri', page_views: 148, unique_visits: 85, returning_visits: 14 },
    { date: '13 Sat', page_views: 0, unique_visits: 0, returning_visits: 0 },
    { date: '14 Sun', page_views: 0, unique_visits: 0, returning_visits: 0 },
    { date: '15 Mon', page_views: 0, unique_visits: 0, returning_visits: 0 }
  ]

  const chartData = displayData.length > 0 ? displayData : sampleData

  // Create labels exactly like your image
  const labels = chartData.map(day => day.date)

  const datasets = []

  if (showPageViews) {
    datasets.push({
      label: 'Page Views',
      data: chartData.map(day => day.page_views || 0),
      backgroundColor: '#8BC34A', // Green color from your image
      borderColor: '#8BC34A',
      borderWidth: 0,
      borderRadius: 2,
      borderSkipped: false,
    })
  }

  if (showUniqueVisits) {
    datasets.push({
      label: 'Unique Visits',
      data: chartData.map(day => day.unique_visits || 0),
      backgroundColor: '#2196F3', // Blue color from your image
      borderColor: '#2196F3',
      borderWidth: 0,
      borderRadius: 2,
      borderSkipped: false,
    })
  }

  if (showReturningVisits) {
    datasets.push({
      label: 'Returning Visits',
      data: chartData.map(day => day.returning_visits || 0),
      backgroundColor: '#FF9800', // Orange color from your image
      borderColor: '#FF9800',
      borderWidth: 0,
      borderRadius: 2,
      borderSkipped: false,
    })
  }

  const data = {
    labels,
    datasets
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    categoryPercentage: 0.6, // Controls spacing between groups (reduced from 0.7 to 0.5)
    barPercentage: 0.9, // Controls bar width within groups (reduced from 0.8 to 0.6)
    plugins: {
      legend: {
        display: false, // Hide legend for now, can be enabled later
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 6,
        displayColors: true,
        padding: 8,
        titleFont: {
          size: 12,
          weight: '600'
        },
        bodyFont: {
          size: 11,
          weight: '400'
        },
        callbacks: {
          title: function(context) {
            return context[0].label
          },
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}`
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: true,
         
          drawBorder: false,
          lineWidth: 1
        },
        ticks: {
          color: '#666666',
          font: {
            size: 11,
            weight: '400'
          },
          maxRotation: 0,
          padding: 8
        },
        border: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        max: maxValue, // Use dynamic max value from props
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false,
          lineWidth: 1
        },
        ticks: {
          color: '#666666',
          font: {
            size: 11,
            weight: '400'
          },
          padding: 8,
          stepSize: stepSize, // Use dynamic step size from props
          callback: function(tickValue) {
            return tickValue
          }
        },
        border: {
          display: false
        }
      }
    },
    animation: {
      duration: 600,
      easing: 'easeOutQuart'
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    elements: {
      bar: {
        borderWidth: 0,
        borderRadius: 2,
        borderSkipped: false
      }
    },
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10
      }
    }
  }

  return (
    <div style={{ 
      height: '400px', // Fixed height like your image
      width: '100%',
      background: '#ffffff',
      
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      
    }}>
      <Bar data={data} options={options} />
    </div>
  )
}

export default BarChart