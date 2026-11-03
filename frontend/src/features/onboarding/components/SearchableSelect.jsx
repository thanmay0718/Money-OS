// src/features/onboarding/components/SearchableSelect.jsx
import React, { useState, useRef, useEffect, useId } from 'react';
import PropTypes from 'prop-types';

export default function SearchableSelect({
  label,
  options = [],
  value = '',
  onChange,
  placeholder = 'Select an option…',
  searchPlaceholder = 'Search…',
  error,
  helperText,
  disabled = false,
  allowCustom = false,
  required = false,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listboxId = useId();

  // Find label of selected value
  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : value || '';

  // Filtered options
  const filteredOptions = options.filter((opt) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      opt.label.toLowerCase().includes(query) ||
      (opt.description && opt.description.toLowerCase().includes(query)) ||
      (opt.badge && opt.badge.toLowerCase().includes(query))
    );
  });

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (val) => {
    onChange?.(val);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.('');
    setSearchQuery('');
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setSearchQuery('');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions[highlightedIndex]) {
        handleSelect(filteredOptions[highlightedIndex].value);
      } else if (allowCustom && searchQuery.trim()) {
        handleSelect(searchQuery.trim());
      }
    }
  };

  return (
    <div className={`relative flex flex-col space-y-1.5 ${className}`} ref={containerRef}>
      {label && (
        <label className="text-xs font-medium text-[#E5E5E5] flex items-center justify-between tracking-wide">
          <span>
            {label}
            {required && <span className="text-[#F07891] ml-1">*</span>}
          </span>
          {helperText && <span className="text-[11px] text-[#737373]">{helperText}</span>}
        </label>
      )}

      {/* Trigger Button */}
      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-sm transition-all duration-150 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-[#C3ABFA] focus:ring-offset-2 focus:ring-offset-[#101010] ${
          disabled
            ? 'opacity-40 cursor-not-allowed bg-[#181818]/60 border-[#292929] text-[#737373]'
            : isOpen
            ? 'border-[#C3ABFA] bg-[#1E1E1E] text-[#FAFAFA] ring-1 ring-[#C3ABFA]/40'
            : error
            ? 'border-[#F07891]/80 bg-[#181818] text-[#FAFAFA]'
            : 'border-[#292929] bg-[#181818] hover:border-[#3D3D3D] hover:bg-[#1E1E1E] text-[#FAFAFA]'
        }`}
      >
        <span className={displayLabel ? 'text-[#FAFAFA] font-medium' : 'text-[#737373]'}>
          {displayLabel || placeholder}
        </span>

        <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear selection"
              className="p-1 rounded-md text-[#737373] hover:text-[#FAFAFA] hover:bg-[#2A2A2A] transition-colors"
            >
              <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 stroke-current" strokeWidth={2}>
                <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
              </svg>
            </button>
          )}

          <svg
            viewBox="0 0 16 16"
            fill="none"
            className={`w-4 h-4 text-[#737373] transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-[#C3ABFA]' : ''
            }`}
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-xl bg-[#181818] border border-[#292929] shadow-[0_12px_32px_rgba(0,0,0,0.65)] backdrop-blur-md overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Search box */}
          <div className="p-2 border-b border-[#292929] bg-[#141414]">
            <div className="relative">
              <svg
                viewBox="0 0 16 16"
                fill="none"
                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="7" cy="7" r="4.5" />
                <path d="M10.5 10.5L14 14" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-1.5 bg-[#1F1F1F] border border-[#292929] rounded-lg text-xs text-[#FAFAFA] placeholder-[#737373] focus:outline-none focus:border-[#C3ABFA]"
              />
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, index) => {
                const isSelected = opt.value === value;
                const isHighlighted = index === highlightedIndex;

                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt.value)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer select-none transition-colors ${
                      isSelected
                        ? 'bg-[#C3ABFA]/15 text-[#FAFAFA] font-medium'
                        : isHighlighted
                        ? 'bg-[#222222] text-[#FAFAFA]'
                        : 'text-[#A3A3A3] hover:text-[#FAFAFA] hover:bg-[#1E1E1E]'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      {opt.icon && <span className="flex-shrink-0 text-sm">{opt.icon}</span>}
                      <div className="truncate">
                        <div className="truncate">{opt.label}</div>
                        {opt.description && (
                          <div className="text-[11px] text-[#737373] truncate">{opt.description}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                      {opt.badge && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#292929] text-[#D5C5FF]">
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && (
                        <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 stroke-[#C3ABFA]" strokeWidth={2.5}>
                          <path d="M3 8l3.5 3.5L13 4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </div>
                );
              })
            ) : allowCustom && searchQuery.trim() ? (
              <div
                role="option"
                aria-selected={false}
                onClick={() => handleSelect(searchQuery.trim())}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs text-[#D5C5FF] bg-[#C3ABFA]/10 hover:bg-[#C3ABFA]/20 cursor-pointer font-medium"
              >
                <span>Use custom:</span>
                <span className="text-white underline truncate font-semibold">"{searchQuery.trim()}"</span>
              </div>
            ) : (
              <div className="px-3 py-4 text-center text-xs text-[#737373]">
                No matching options found
              </div>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-[#F07891] text-xs mt-1">{error}</p>}
    </div>
  );
}

SearchableSelect.propTypes = {
  label: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
      description: PropTypes.string,
      badge: PropTypes.string,
      icon: PropTypes.node,
    })
  ),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  searchPlaceholder: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  disabled: PropTypes.bool,
  allowCustom: PropTypes.bool,
  required: PropTypes.bool,
  className: PropTypes.string,
};
