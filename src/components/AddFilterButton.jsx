import React, { useState, useRef } from 'react'
import { Plus } from 'lucide-react'
import FilterDropdown from './FilterDropdown'
import FilterValueInput from './FilterValueInput'

const AddFilterButton = ({ onFilterSelect, style = {} }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showValueInput, setShowValueInput] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)
  const buttonRef = useRef(null)

  const handleButtonClick = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handleDropdownClose = () => {
    setIsDropdownOpen(false)
  }

  const handleFilterSelect = (category, option) => {
    // Store the selected option and show value input modal
    setSelectedOption({ category, option })
    setShowValueInput(true)
    setIsDropdownOpen(false)
  }

  const handleValueInputClose = () => {
    setShowValueInput(false)
    setSelectedOption(null)
  }

  const handleApplyFilter = (filterData) => {
    if (onFilterSelect) {
      // Generate unique ID for the filter
      const filterWithId = {
        ...filterData,
        id: `${filterData.category.id}-${filterData.option.id}-${Date.now()}`
      }
      onFilterSelect(filterWithId)
    }
  }

  return (
    <div style={{ marginBottom: '16px', ...style }}>
      <button
        ref={buttonRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          background: '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s',
          userSelect: 'none',
          position: 'relative'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#059669'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#10b981'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
        onClick={handleButtonClick}
      >
        <Plus size={16} />
        Add Filter
      </button>
      
      <FilterDropdown
        isOpen={isDropdownOpen}
        onClose={handleDropdownClose}
        onSelectFilter={handleFilterSelect}
        buttonRef={buttonRef}
      />
      
      <FilterValueInput
        isOpen={showValueInput}
        onClose={handleValueInputClose}
        filterOption={selectedOption}
        onApplyFilter={handleApplyFilter}
      />
    </div>
  )
}

export default AddFilterButton
