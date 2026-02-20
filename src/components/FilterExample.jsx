import React, { useState } from 'react'
import AddFilterButton from './AddFilterButton'
import ActiveFilters from './ActiveFilters'

// Example component showing how to implement the filter system
const FilterExample = () => {
  const [filters, setFilters] = useState([])

  // Generate unique ID for filters
  const generateFilterId = () => {
    return `filter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Handle filter selection
  const handleFilterSelect = (category, option) => {
    // For now, we'll just add a basic filter
    // In a real implementation, you might show a modal for entering values
    const newFilter = {
      id: generateFilterId(),
      category: category.name,
      type: option.name,
      operator: 'equals', // This could be dynamic based on filter type
      value: '', // This would be set by user input
      label: `${option.name}` // This would be more descriptive with actual values
    }

    setFilters([...filters, newFilter])
    console.log('Filter selected:', { category: category.name, option: option.name })
  }

  // Remove individual filter
  const handleRemoveFilter = (filterId) => {
    setFilters(filters.filter(filter => filter.id !== filterId))
  }

  // Clear all filters
  const handleClearAll = () => {
    setFilters([])
  }

  // Apply filters to data (this would make API calls in real implementation)
  const applyFilters = () => {
    console.log('Applying filters:', filters)
    // Here you would make API calls with the filters
    // Example: fetch(`/api/data?filters=${encodeURIComponent(JSON.stringify(filters))}`)
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>
        Analytics Dashboard with Filters
      </h2>

      {/* Add Filter Button */}
      <AddFilterButton 
        onFilterSelect={handleFilterSelect}
        style={{ marginBottom: '16px' }}
      />

      {/* Active Filters */}
      <ActiveFilters
        filters={filters}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={handleClearAll}
      />

      {/* Apply Filters Button */}
      {filters.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={applyFilters}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#3b82f6'
            }}
          >
            Apply Filters
          </button>
        </div>
      )}

      {/* Content Area - This would be your actual dashboard content */}
      <div style={{
        padding: '20px',
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        minHeight: '400px'
      }}>
        <h3 style={{ marginBottom: '16px', color: '#374151' }}>
          Dashboard Content
        </h3>
        
        {filters.length === 0 ? (
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>
            Click "Add Filter" to apply filters to your analytics data.
          </p>
        ) : (
          <div>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
              Showing data with {filters.length} active filter{filters.length > 1 ? 's' : ''} applied.
            </p>
            
            {/* This is where your filtered data would appear */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              <div style={{
                padding: '16px',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '14px' }}>
                  Total Visitors
                </h4>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                  1,234
                </p>
              </div>
              
              <div style={{
                padding: '16px',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '14px' }}>
                  Page Views
                </h4>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
                  5,678
                </p>
              </div>
              
              <div style={{
                padding: '16px',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '14px' }}>
                  Bounce Rate
                </h4>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
                  42.3%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Debug Information */}
      <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#374151' }}>
          Debug: Current Filters
        </h4>
        <pre style={{ 
          margin: 0, 
          fontSize: '12px', 
          color: '#6b7280',
          whiteSpace: 'pre-wrap',
          backgroundColor: 'white',
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #e5e7eb'
        }}>
          {JSON.stringify(filters, null, 2)}
        </pre>
      </div>
    </div>
  )
}

export default FilterExample
