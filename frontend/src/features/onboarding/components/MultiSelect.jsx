// src/features/onboarding/components/MultiSelect.jsx
import React, { useState, useRef, useEffect, useId } from 'react';
import PropTypes from 'prop-types';

export default function MultiSelect({
  label,
  options = [],
  value = [], // Array of values
  onChange,
  placeholder = 'Select items…',
  searchPlaceholder = 'Filter options…',
  error,
  helperText,
  disabled = false,
  required = false,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listboxId = useId();

  // Close on outside click
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

  const filteredOptions = options.filter((opt) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      opt.label.toLowerCase().includes(q) ||
      (opt.description && opt.description.toLowerCase().includes(q))
    );
  });

  const toggleOption = (val) => {
    if (value.includes(val)) {
      onChange?.(value.filter((v) => v !== val));
    } else {
      onChange?.([...value, val]);
    }
  };

  const removeValue = (e, val) => {
    e.stopPropagation();
    onChange?.(value.filter((v) => v !== val));
  };

  const clearAll = (e) => {
    e.stopPropagation();
    onChange?.([]);
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

      {/* Trigger & Chips Container */}
      <div
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full min-h-[44px] flex flex-wrap items-center gap-1.5 p-2 rounded-xl border text-sm transition-all duration-150 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-[#C3ABFA] focus:ring-offset-2 focus:ring-offset-[#101010] ${
          disabled
            ? 'opacity-40 cursor-not-allowed bg-[#181818]/60 border-[#292929]'
            : isOpen
            ? 'border-[#C3ABFA] bg-[#1E1E1E] ring-1 ring-[#C3ABFA]/40'
            : error
            ? 'border-[#F07891]/80 bg-[#181818]'
            : 'border-[#292929] bg-[#181818] hover:border-[#3D3D3D] hover:bg-[#1E1E1E]'
        }`}
      >
        {value.length === 0 ? (
          <span className="text-[#737373] text-sm px-2">{placeholder}</span>
        ) : (
          value.map((val) => {
            const opt = options.find((o) => o.value === val);
            const labelText = opt ? opt.label : val;

            return (
              <span
                key={val}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#C3ABFA]/15 border border-[#C3ABFA]/30 text-xs font-medium text-[#FAFAFA] animate-in fade-in zoom-in-95"
              >
                {opt?.icon && <span className="text-xs">{opt.icon}</span>}
                <span>{labelText}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => removeValue(e, val)}
                    aria-label={`Remove ${labelText}`}
                    className="p-0.5 rounded-full text-[#D5C5FF] hover:bg-[#C3ABFA]/30 hover:text-white transition-colors focus:outline-none"
                  >
                    <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3 stroke-current" strokeWidth={2}>
                      <path d="M3 3l6 6M9 3l-6 6" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
              </span>
            );
          })
        )}

        <div className="ml-auto flex items-center gap-1 pr-1">
          {value.length > 0 && !disabled && (
            <button
              type="button"
              onClick={clearAll}
              title="Clear all"
              className="text-[11px] font-mono px-1.5 py-0.5 rounded text-[#737373] hover:text-[#FAFAFA] hover:bg-[#2A2A2A] transition-colors"
            >
              Clear
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

      {/* Options Dropdown */}
      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          aria-multiselectable="true"
          className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-xl bg-[#181818] border border-[#292929] shadow-[0_12px_32px_rgba(0,0,0,0.65)] backdrop-blur-md overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Search */}
          <div className="p-2 border-b border-[#292929] bg-[#141414]">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full px-3 py-1.5 bg-[#1F1F1F] border border-[#292929] rounded-lg text-xs text-[#FAFAFA] placeholder-[#737373] focus:outline-none focus:border-[#C3ABFA]"
            />
          </div>

          <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = value.includes(opt.value);

                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => toggleOption(opt.value)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer select-none transition-colors ${
                      isSelected
                        ? 'bg-[#C3ABFA]/15 text-[#FAFAFA] font-medium'
                        : 'text-[#A3A3A3] hover:text-[#FAFAFA] hover:bg-[#1E1E1E]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[#C3ABFA] border-[#C3ABFA]'
                            : 'border-[#444444] bg-[#141414]'
                        }`}
                      >
                        {isSelected && (
                          <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5 stroke-[#101010]" strokeWidth={2.2}>
                            <path d="M2 5l2.2 2.2L8 2.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      {opt.icon && <span>{opt.icon}</span>}
                      <div>
                        <div>{opt.label}</div>
                        {opt.description && (
                          <div className="text-[11px] text-[#737373]">{opt.description}</div>
                        )}
                      </div>
                    </div>

                    {opt.badge && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#292929] text-[#D5C5FF]">
                        {opt.badge}
                      </span>
                    )}
                  </div>
                );
              })
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

MultiSelect.propTypes = {
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
  value: PropTypes.array,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  searchPlaceholder: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  className: PropTypes.string,
};
