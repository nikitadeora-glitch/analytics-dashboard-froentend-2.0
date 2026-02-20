import React, { createContext, useContext, useState, useCallback } from 'react'

const FilterContext = createContext()

export const useFilters = () => {
  const context = useContext(FilterContext)
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider')
  }
  return context
}

export const FilterProvider = ({ children }) => {
  const [filters, setFilters] = useState([])

  const addFilter = useCallback((filter) => {
    setFilters(prev => {
      // Check if filter already exists (same category and option)
      const existingIndex = prev.findIndex(f => 
        f.category.id === filter.category.id && f.option.id === filter.option.id
      )
      
      if (existingIndex >= 0) {
        // Replace existing filter
        const newFilters = [...prev]
        newFilters[existingIndex] = filter
        return newFilters
      } else {
        // Add new filter
        return [...prev, filter]
      }
    })
  }, [])

  const removeFilter = useCallback((filterId) => {
    setFilters(prev => prev.filter(filter => filter.id !== filterId))
  }, [])

  const clearAllFilters = useCallback(() => {
    setFilters([])
  }, [])

  const getFilterParams = useCallback(() => {
    const params = {}
    
    filters.forEach(filter => {
      // Special handling for page_views_per_session to avoid category prefix
      let key
      if (filter.option.id === 'page_views_per_session') {
        key = 'page_views_per_session'
      } else if (filter.option.id === 'session_length') {
        // Special case: session_length should map to engagement_session_length
        key = 'engagement_session_length'
      } else if (filter.category.id === 'traffic' && filter.option.id === 'traffic_sources') {
        // Special case: traffic_sources should not have category prefix
        key = 'traffic_sources'
      } else if (filter.category.id === 'page' && (filter.option.id === 'page' || filter.option.id === 'page_page')) {
        // Special case: page filters should not have category prefix
        key = 'page_page'
      } else if (filter.option.id === 'country_city') {
        // Special case: country_city should not have category prefix
        key = 'country_city'
      } else if (filter.option.id === 'system_platform_os') {
        // Special case: system_platform_os should map to platform_os
        key = 'platform_os'
      } else if (filter.category.id === 'system' && filter.option.id === 'browser') {
        // Special case: browser should not have category prefix
        key = 'browser'
      } else if (filter.category.id === 'system' && filter.option.id === 'device') {
        // Special case: device should not have category prefix
        key = 'device'
      } else if (filter.option.id === 'exit_link') {
        // Special case: exit_link should map to engagement_exit_link
        key = 'engagement_exit_link'
      } else {
        key = `${filter.category.id}_${filter.option.id}`
      }
      
      if (filter.type === 'range' && typeof filter.value === 'object') {
        if (filter.value.min) params[`${key}_min`] = filter.value.min
        if (filter.value.max) params[`${key}_max`] = filter.value.max
        if (filter.value.operator) params[`${key}_operator`] = filter.value.operator
      } else if (filter.type === 'number' && typeof filter.value === 'object') {
        params[key] = filter.value.value
        params[`${key}_operator`] = filter.value.operator
      } else {
        params[key] = filter.value
      }
      
      // Debug logging
      console.log(`🔍 Filter param: ${key} = ${filter.value}`)
    })
    
    console.log('🔍 Final filter params:', params)
    return params
  }, [filters])

  const hasActiveFilters = filters.length > 0

  const value = {
    filters,
    addFilter,
    removeFilter,
    clearAllFilters,
    getFilterParams,
    hasActiveFilters
  }

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  )
}

export default FilterContext
