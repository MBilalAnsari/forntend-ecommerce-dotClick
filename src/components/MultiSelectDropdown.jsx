import React, { useState, useEffect, useRef } from 'react';

const MultiSelectDropdown = ({
  options = [],
  selectedValues = [],
  onSelectionChange,
  placeholder = "Select options...",
  label = "Options",
  maxHeight = "200px"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle option selection
  const handleOptionToggle = (option) => {
    const newSelection = selectedValues.includes(option.value)
      ? selectedValues.filter(val => val !== option.value)
      : [...selectedValues, option.value];

    onSelectionChange(newSelection);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedValues.length === options.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(options.map(option => option.value));
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Dropdown Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-lg
          shadow-sm hover:border-blue-400 hover:shadow-md focus:outline-none
          focus:ring-2 focus:ring-blue-400 focus:border-transparent
          transition-all duration-200 min-h-[40px]
          ${isOpen ? 'border-blue-400 ring-2 ring-blue-400' : ''}
        `}
      >
        <div className="flex items-center justify-between">
          <span className={`text-sm ${selectedValues.length > 0 ? 'text-gray-900' : 'text-gray-500'}`}>
            {selectedValues.length > 0
              ? `${label} (${selectedValues.length} selected)`
              : placeholder
            }
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg animate-in slide-in-from-top-2"
          style={{ maxHeight, overflowY: 'auto' }}
        >
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search options..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
            />
          </div>

          {/* Select All Option */}
          {options.length > 1 && (
            <label className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 border-b border-gray-100">
              <input
                type="checkbox"
                checked={selectedValues.length === options.length}
                onChange={handleSelectAll}
                className="mr-2 text-blue-500 rounded focus:ring-blue-400"
              />
              <span className="font-medium">Select All</span>
            </label>
          )}

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.value)}
                    onChange={() => handleOptionToggle(option)}
                    className="mr-2 text-blue-500 rounded focus:ring-blue-400"
                  />
                  <span className="flex-1">{option.label}</span>
                  {option.color && (
                    <div
                      className="w-4 h-4 rounded-full ml-2 border border-gray-300"
                      style={{ backgroundColor: option.color }}
                    />
                  )}
                </label>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
