import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

function LineChart({ 
  displayData = [], 
  showPageViews = true, 
  showUniqueVisits = true, 
  showReturningVisits = true,
  period = 'daily'
}) {
 
  const chartData = displayData.length > 0 ? displayData : sampleData

  // Create labels
  const labels = chartData.map(day => day.date)

  // Create gradient function
  const createGradient = (ctx, color1, color2) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 60)
    gradient.addColorStop(0, color1)
    gradient.addColorStop(1, color2)
    return gradient
  }

  const datasets = []

  if (showPageViews) {
    datasets.push({
      label: 'Page Views',
      data: chartData.map(day => day.page_views || 0),
      borderColor: '#3b82f6',
      backgroundColor: (context) => {
        const chart = context.chart
        const { ctx } = chart
        return createGradient(ctx, 'rgba(59, 130, 246, 0.2)', 'rgba(59, 130, 246, 0.02)')
      },
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 0,
      pointBorderWidth: 0,
      tension: 0.4,
      fill: true,
    })
  }

  if (showUniqueVisits) {
    datasets.push({
      label: 'Unique Visits',
      data: chartData.map(day => day.unique_visits || 0),
      borderColor: '#2196F3',
      backgroundColor: 'rgba(33, 150, 243, 0.1)',
      borderWidth: 3,
      pointBackgroundColor: '#2196F3',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8,
      tension: 0.4,
      fill: true,
    })
  }

  if (showReturningVisits) {
    datasets.push({
      label: 'Returning Visits',
      data: chartData.map(day => day.returning_visits || 0),
      borderColor: '#FF9800',
      backgroundColor: 'rgba(255, 152, 0, 0.1)',
      borderWidth: 3,
      pointBackgroundColor: '#FF9800',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8,
      tension: 0.4,
      fill: true,
    })
  }

  const data = {
    labels,
    datasets
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false
      }
    },
    scales: {
      x: {
        display: false,
        grid: {
          display: false
        }
      },
      y: {
        display: false,
        beginAtZero: true,
        grid: {
          display: false
        }
      }
    },
    animation: {
      duration: 0
    },
    interaction: {
      events: []
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 0,
        borderWidth: 0
      },
      line: {
        borderJoinStyle: 'round',
        borderCapStyle: 'round'
      }
    },
    layout: {
      padding: 0
    }
  }

  return (
    <div style={{ 
      height: '100%',
      width: '100%',
      background: 'transparent'
    }}>
      <Line data={data} options={options} />
    </div>
  )
}

export default LineChart