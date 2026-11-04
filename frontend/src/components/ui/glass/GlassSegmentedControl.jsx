// src/components/ui/glass/GlassSegmentedControl.jsx
import React from 'react'
import PropTypes from 'prop-types'

/**
 * GlassSegmentedControl implements an Apple-style fluid segmented slider.
 * Ideal for filtering transaction types, switching tabs, and setting modes.
 */
export default function GlassSegmentedControl({
  options = [],
  value,
  onChange,
  className = '',
  size = 'md', // 'sm' | 'md' | 'lg'
  name,
}) {
  const sizeClasses = {
    sm: 'p-0.5 text-xs rounded-xl',
    md: 'p-1 text-xs sm:text-sm rounded-xl',
    lg: 'p-1.5 text-sm sm:text-base rounded-2xl',
  }[size] || 'p-1 text-sm rounded-xl'

  const itemPadding = {
    sm: 'py-1 px-2.5',
    md: 'py-1.5 px-3.5',
    lg: 'py-2 px-4',
  }[size] || 'py-1.5 px-3.5'

  return (
    <div
      role="radiogroup"
      aria-label={name || 'Segmented control'}
      className={`relative inline-flex items-center glass-subtle backdrop-blur-md border border-[#C3ABFA]/15 bg-[#141414]/80 shadow-inner overflow-hidden select-none ${sizeClasses} ${className}`}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(opt.value)}
            disabled={opt.disabled}
            className={`relative z-10 flex items-center justify-center font-medium transition-all duration-200 rounded-lg whitespace-nowrap cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${itemPadding} ${
              isSelected
                ? 'text-[#18151F] font-semibold bg-gradient-to-b from-[#D5C5FF] to-[#B99BF5] shadow-[0_2px_10px_rgba(195,171,250,0.3),inset_0_1px_1px_rgba(255,255,255,0.45)] border border-[#D5C5FF]/40'
                : 'text-[#A3A3A3] hover:text-[#FAFAFA] hover:bg-white/[0.04]'
            }`}
          >
            {opt.icon && <span className="mr-1.5 inline-flex">{opt.icon}</span>}
            {opt.label}
            {opt.badge != null && (
              <span className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                isSelected ? 'bg-[#18151F]/15 text-[#18151F]' : 'bg-[#292929] text-[#A3A3A3]'
              }`}>
                {opt.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

GlassSegmentedControl.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.node.isRequired,
      icon: PropTypes.node,
      badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      disabled: PropTypes.bool,
    })
  ).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  name: PropTypes.string,
}
