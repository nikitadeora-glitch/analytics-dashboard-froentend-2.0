import React from 'react'
import { X } from 'lucide-react'

const ActiveFilters = ({ filters, onRemoveFilter, onClearAll }) => {
  if (filters.length === 0) {
    return null
  }

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '16px',
      padding: '12px',
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '8px'
    }}>
      <span style={{
        fontSize: '14px',
        fontWeight: '500',
        color: '#64748b',
        marginRight: '8px'
      }}>
        Active Filters:
      </span>
      
      {filters.map(filter => (
        <div
          key={filter.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 10px',
            backgroundColor: '#10b981',
            color: 'white',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: '500',
            maxWidth: '300px',
            overflow: 'hidden'
          }}
        >
          <span style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {filter.label}
          </span>
          <button
            onClick={() => onRemoveFilter(filter.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              lineHeight: 1
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <X size={12} />
          </button>
        </div>
      ))}
      
      {filters.length > 1 && (
        <button
          onClick={onClearAll}
          style={{
            padding: '6px 12px',
            backgroundColor: 'transparent',
            color: '#ef4444',
            border: '1px solid #ef4444',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#ef4444'
            e.currentTarget.style.color = 'white'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = '#ef4444'
          }}
        >
          Clear All
        </button>
      )}
    </div>
  )
}

export default ActiveFilters
