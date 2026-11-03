// src/features/onboarding/components/DatePickerField.jsx
import React, { useState, useRef, useEffect, useId } from 'react';
import PropTypes from 'prop-types';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function DatePickerField({
  label,
  value = '', // Format: 'YYYY-MM-DD'
  onChange,
  minDate, // Format: 'YYYY-MM-DD'
  placeholder = 'Select target date…',
  error,
  helperText,
  disabled = false,
  required = false,
  allowNoTarget = true,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const dialogId = useId();

  // Parse initial view year and month
  const today = new Date();
  const initialDate = value ? new Date(value + 'T00:00:00') : today;
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Synchronize view when value changes
  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  const prevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day) => {
    const formattedMonth = String(viewMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${viewYear}-${formattedMonth}-${formattedDay}`;
    onChange?.(dateStr);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e?.stopPropagation();
    onChange?.('');
    setIsOpen(false);
  };

  // Generate calendar days
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 for Sunday
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  // Check if a day is disabled
  const isDayDisabled = (day) => {
    if (!minDate) return false;
    const formattedMonth = String(viewMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${viewYear}-${formattedMonth}-${formattedDay}`;
    return dateStr < minDate;
  };

  // Check if day is selected
  const isDaySelected = (day) => {
    if (!value) return false;
    const [y, m, d] = value.split('-').map(Number);
    return y === viewYear && m === viewMonth + 1 && d === day;
  };

  // Format display text
  const formatDisplay = (val) => {
    if (!val) return '';
    try {
      const d = new Date(val + 'T00:00:00');
      if (isNaN(d.getTime())) return val;
      return d.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return val;
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

      {/* Input button */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
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
        <div className="flex items-center gap-2.5">
          <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 text-[#A3A3A3]" stroke="currentColor" strokeWidth={1.7}>
            <rect x="3" y="4" width="14" height="14" rx="2" />
            <path d="M16 2v4M4 2v4M3 8h14" strokeLinecap="round" />
          </svg>
          <span className={value ? 'text-[#FAFAFA] font-medium' : 'text-[#737373]'}>
            {value ? formatDisplay(value) : placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              title="Clear date"
              className="p-1 rounded-md text-[#737373] hover:text-[#FAFAFA] hover:bg-[#2A2A2A] transition-colors"
            >
              <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 stroke-current" strokeWidth={2}>
                <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Calendar Popover */}
      {isOpen && (
        <div
          id={dialogId}
          role="dialog"
          aria-label="Date selector"
          className="absolute top-full left-0 mt-2 z-50 p-4 rounded-2xl bg-[#181818] border border-[#292929] shadow-[0_16px_40px_rgba(0,0,0,0.7)] backdrop-blur-md w-72 sm:w-80 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header navigation */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#292929]">
            <button
              type="button"
              onClick={prevMonth}
              aria-label="Previous month"
              className="p-1.5 rounded-lg text-[#A3A3A3] hover:text-[#FAFAFA] hover:bg-[#242424] transition-colors"
            >
              <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 stroke-current" strokeWidth={2}>
                <path d="M10 12l-4-4 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <span className="text-sm font-semibold text-[#FAFAFA]">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={nextMonth}
              aria-label="Next month"
              className="p-1.5 rounded-lg text-[#A3A3A3] hover:text-[#FAFAFA] hover:bg-[#242424] transition-colors"
            >
              <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 stroke-current" strokeWidth={2}>
                <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {DAYS_OF_WEEK.map((d) => (
              <span key={d} className="text-[11px] font-mono text-[#737373] py-1">
                {d}
              </span>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Prev month fill days */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div
                key={`prev-${i}`}
                className="h-8 flex items-center justify-center text-xs text-[#404040] select-none"
              >
                {daysInPrevMonth - firstDayOfWeek + i + 1}
              </div>
            ))}

            {/* Current month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected = isDaySelected(day);
              const isDisabled = isDayDisabled(day);

              return (
                <button
                  key={`cur-${day}`}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelectDay(day)}
                  className={`h-8 rounded-lg text-xs font-medium transition-all duration-150 flex items-center justify-center ${
                    isSelected
                      ? 'bg-[#C3ABFA] text-[#101010] font-bold shadow-[0_0_12px_rgba(195,171,250,0.4)]'
                      : isDisabled
                      ? 'text-[#3A3A3A] cursor-not-allowed'
                      : 'text-[#E5E5E5] hover:bg-[#262626] hover:text-white'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Quick preset buttons / Clear */}
          <div className="mt-3 pt-2 border-t border-[#292929] flex items-center justify-between text-xs">
            {allowNoTarget && (
              <button
                type="button"
                onClick={handleClear}
                className="text-[#A3A3A3] hover:text-[#FAFAFA] font-medium transition-colors"
              >
                No Target Date
              </button>
            )}

            <div className="flex items-center gap-1.5 ml-auto">
              <button
                type="button"
                onClick={() => {
                  const target = new Date();
                  target.setMonth(target.getMonth() + 6);
                  onChange?.(target.toISOString().split('T')[0]);
                  setIsOpen(false);
                }}
                className="px-2 py-1 rounded bg-[#202020] text-[#D5C5FF] hover:bg-[#2A2A2A] transition-colors text-[11px]"
              >
                +6m
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = new Date();
                  target.setFullYear(target.getFullYear() + 1);
                  onChange?.(target.toISOString().split('T')[0]);
                  setIsOpen(false);
                }}
                className="px-2 py-1 rounded bg-[#202020] text-[#D5C5FF] hover:bg-[#2A2A2A] transition-colors text-[11px]"
              >
                +1y
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = new Date();
                  target.setFullYear(target.getFullYear() + 3);
                  onChange?.(target.toISOString().split('T')[0]);
                  setIsOpen(false);
                }}
                className="px-2 py-1 rounded bg-[#202020] text-[#D5C5FF] hover:bg-[#2A2A2A] transition-colors text-[11px]"
              >
                +3y
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-[#F07891] text-xs mt-1">{error}</p>}
    </div>
  );
}

DatePickerField.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  minDate: PropTypes.string,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  allowNoTarget: PropTypes.bool,
  className: PropTypes.string,
};
