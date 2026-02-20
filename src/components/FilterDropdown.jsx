import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, X, Search, Globe, Users, Clock, MousePointer, Monitor, Mail, Link, MapPin, Cpu } from 'lucide-react'

const FilterDropdown = ({ isOpen, onClose, onSelectFilter, buttonRef }) => {
  const dropdownRef = useRef(null)

  // Filter categories and options based on the image
  const filterCategories = [
    {
      id: 'engagement',
      name: 'Engagement',
      icon: Clock,
      options: [
        { id: 'session_length', name: 'Session Length', type: 'range' },
        { id: 'page_views_per_session', name: 'Page Views per Session', type: 'number' },
        { id: 'sessions_per_visitor', name: 'Sessions per Visitor', type: 'number' },
        { id: 'exit_link', name: 'Exit Link', type: 'text' }
      ]
    },
    {
      id: 'traffic',
      name: 'Traffic & Referrers',
      icon: Globe,
      options: [
        { id: 'traffic_sources', name: 'Traffic Sources ', type: 'select' },
        { id: 'utm_campaign', name: 'UTM Campaign', type: 'text' },
        { id: 'utm_source', name: 'UTM Source', type: 'text' },
        { id: 'utm_medium', name: 'UTM Medium', type: 'text' },
        
      ]
    },
    {
      id: 'page',
      name: 'Page URL or Title',
      icon: Link,
      options: [
        { id: 'page', name: 'Page', type: 'text' },
        { id: 'entry_page', name: 'Entry Page', type: 'text' },
       
      ]
    },
    {
      id: 'location',
      name: 'Location',
      icon: MapPin,
      options: [
        { id: 'country_city', name: 'Country & City', type: 'select' },
        { id: 'ip_address', name: 'IP Address', type: 'text' },
       
      ]
    },
    {
      id: 'system',
      name: 'System',
      icon: Monitor,
      options: [
        { id: 'platform_os', name: 'Platform & OS', type: 'select' },
        { id: 'browser', name: 'Browser', type: 'select' },
        { id: 'device', name: 'Device', type: 'select' },
      ]
    }
  ]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose, buttonRef])

  const handleOptionClick = (category, option) => {
    onSelectFilter(category, option)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: buttonRef.current ? buttonRef.current.getBoundingClientRect().bottom + window.scrollY + 8 : 0,
        left: buttonRef.current ? buttonRef.current.getBoundingClientRect().left + window.scrollX : 0,
        zIndex: 1000,
        width: '280px',
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '14px',
          fontWeight: '600',
          color: '#111827'
        }}>
          Add Filter
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={14} color="#6b7280" />
        </button>
      </div>

      {/* Filter Options */}
      <div style={{
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        {filterCategories.map(category => (
          <div key={category.id}>
            {/* Category Header */}
            <div style={{
              padding: '8px 16px 6px',
              fontSize: '11px',
              fontWeight: '600',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: '#f9fafb'
            }}>
              <category.icon size={12} />
              {category.name}
            </div>

            {/* Category Options */}
            {category.options.map(option => (
              <button
                key={option.id}
                onClick={() => handleOptionClick(category, option)}
                style={{
                  width: '100%',
                  padding: '8px 16px 8px 24px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  textAlign: 'left',
                  fontSize: '13px',
                  color: '#374151',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <span>{option.name}</span>
                <ChevronDown size={12} color="#9ca3af" style={{ transform: 'rotate(-90deg)' }} />
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default FilterDropdown
