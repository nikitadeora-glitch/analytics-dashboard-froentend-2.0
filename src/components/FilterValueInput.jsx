import React, { useState, useEffect } from 'react'
import { X, ChevronDown } from 'lucide-react'
import { visitorsAPI } from '../api/api'
import { useFilters } from '../contexts/FilterContext'

const FilterValueInput = ({ isOpen, onClose, filterOption, onApplyFilter }) => {
  const [value, setValue] = useState('')
  const [operator, setOperator] = useState('equals')
  const [rangeValue, setRangeValue] = useState({ min: '', max: '' })
  const [countries, setCountries] = useState([])
  const [loadingCountries, setLoadingCountries] = useState(false)
  const { addFilter } = useFilters()

  // Fetch countries when component opens for country_city filter
  useEffect(() => {
    if (isOpen && filterOption?.option?.id === 'country_city' && countries.length === 0) {
      fetchCountries()
    }
  }, [isOpen, filterOption])

  const fetchCountries = async () => {
    try {
      setLoadingCountries(true)
      const response = await visitorsAPI.getCountries()
      setCountries(response.data.countries || [])
      console.log('🌍 Loaded countries:', response.data.countries)
    } catch (error) {
      console.error('❌ Error fetching countries:', error)
      setCountries([])
    } finally {
      setLoadingCountries(false)
    }
  }

  if (!isOpen || !filterOption) return null

  const handleApply = () => {
    let filterData = {
      category: filterOption.category,
      option: filterOption.option,
      type: filterOption.option.type,
      label: `${filterOption.option.name}: ${getDisplayValue()}`
    }

    // Set filter value based on type
    if (filterOption.option.type === 'range') {
      filterData.value = { min: rangeValue.min, max: rangeValue.max, operator }
    } else if (filterOption.option.type === 'number') {
      filterData.value = { value: value, operator }
    } else {
      filterData.value = value
    }

    // Add filter to context
    addFilter(filterData)
    
    onApplyFilter(filterData)
    onClose()
    resetForm()
  }

  const getDisplayValue = () => {
    if (filterOption.option.type === 'range') {
      if (rangeValue.min && rangeValue.max) {
        return `${rangeValue.min} - ${rangeValue.max}`
      } else if (rangeValue.min) {
        return `≥ ${rangeValue.min}`
      } else if (rangeValue.max) {
        return `≤ ${rangeValue.max}`
      }
      return 'Range'
    } else if (filterOption.option.type === 'number') {
      return `${operator} ${value}`
    }
    return value || 'Enter value'
  }

  const resetForm = () => {
    setValue('')
    setOperator('equals')
    setRangeValue({ min: '', max: '' })
  }

  const renderInput = () => {
    switch (filterOption.option.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`Enter ${filterOption.option.name.toLowerCase()}`}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db'
            }}
            autoFocus
          />
        )

      case 'number':
        return (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              style={{
                padding: '10px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                minWidth: '80px'
              }}
            >
              <option value="equals">=</option>
              <option value="greater">&gt;</option>
              <option value="less">&lt;</option>
              <option value="greater_equal">≥</option>
              <option value="less_equal">≤</option>
            </select>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter number"
              style={{
                flex: 1,
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none'
              }}
              autoFocus
            />
          </div>
        )

      case 'range':
        return (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="number"
              value={rangeValue.min}
              onChange={(e) => setRangeValue(prev => ({ ...prev, min: e.target.value }))}
              placeholder="Min"
              style={{
                flex: 1,
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none'
              }}
              autoFocus
            />
            <span style={{ color: '#6b7280', fontSize: '14px' }}>to</span>
            <input
              type="number"
              value={rangeValue.max}
              onChange={(e) => setRangeValue(prev => ({ ...prev, max: e.target.value }))}
              placeholder="Max"
              style={{
                flex: 1,
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
        )

      case 'select':
        // For select type, we need to show actual options based on the filter category
        const getSelectOptions = () => {
          switch (filterOption.option.id) {
            case 'traffic_sources':
              return [
                { value: 'direct', label: 'Direct Traffic' },
                { value: 'organic', label: 'Organic Search' },
                { value: 'social', label: 'Social Media' },
                { value: 'ai', label: 'AI Tools' },
                { value: 'email', label: 'Email' },
                { value: 'paid', label: 'Paid Ads' },
           
                { value: 'referral', label: 'Website Referrals' }
              ]
            case 'country_city':
              // Use dynamic countries from API
              if (loadingCountries) {
                return [
                  { value: '', label: 'Loading countries...' }
                ]
              }
              if (countries.length === 0) {
                return [
                  { value: '', label: 'No countries available' }
                ]
              }
              return [
                { value: '', label: '' },
                ...countries.map(country => ({
                  value: country,
                  label: country
                }))
              ]
          
            case 'platform_os':
              return [
                { value: 'Windows', label: 'Windows' },
                { value: 'macOS', label: 'macOS' },
                { value: 'Linux', label: 'Linux' },
                { value: 'Android', label: 'Android' },
                { value: 'iOS', label: 'iOS' }
              ]
            case 'browser':
              return [
                { value: 'Chrome', label: 'Chrome' },
                { value: 'Firefox', label: 'Firefox' },
                { value: 'Safari', label: 'Safari' },
                { value: 'Edge', label: 'Edge' },
                { value: 'Opera', label: 'Opera' }
              ]
            case 'device':
              return [
                { value: 'Desktop', label: 'Desktop' },
                { value: 'Mobile', label: 'Mobile' },
                { value: 'Tablet', label: 'Tablet' }
              ]
            default:
              return []
          }
        }

        const options = getSelectOptions()
        return (
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              backgroundColor: 'white'
            }}
            autoFocus
          >
            <option value="">Select {filterOption.option.name.toLowerCase()}...</option>
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter value"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none'
            }}
            autoFocus
          />
        )
    }
  }

  const isApplyDisabled = () => {
    if (filterOption.option.type === 'range') {
      return !rangeValue.min && !rangeValue.max
    }
    return !value
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        width: '90%',
        maxWidth: '460px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827'
          }}>
            Filter by {filterOption.option.name}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={16} color="#6b7280" />
          </button>
        </div>

        {/* Filter Category Info */}
        <div style={{
          marginBottom: '16px',
          padding: '8px 12px',
          backgroundColor: '#f3f4f6',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#6b7280'
        }}>
          Category: {filterOption.category.name}
        </div>

        {/* Input Field */}
        <div style={{ marginBottom: '20px' }}>
          {renderInput()}
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 16px',
              backgroundColor: 'transparent',
              color: '#6b7280',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={isApplyDisabled()}
            style={{
              padding: '10px 16px',
              backgroundColor: isApplyDisabled() ? '#d1d5db' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isApplyDisabled() ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!isApplyDisabled()) {
                e.currentTarget.style.backgroundColor = '#059669'
              }
            }}
            onMouseLeave={(e) => {
              if (!isApplyDisabled()) {
                e.currentTarget.style.backgroundColor = '#10b981'
              }
            }}
          >
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  )
}

export default FilterValueInput
