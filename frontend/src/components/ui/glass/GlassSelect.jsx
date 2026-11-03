// src/components/ui/glass/GlassSelect.jsx
import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'

/**
 * GlassSelect provides a styled translucent select dropdown
 * matching the Liquid Glass aesthetic.
 */
const GlassSelect = forwardRef(function GlassSelect(
  {
    label,
    options = [],
    error,
    helperText,
    id,
    className = '',
    containerClassName = '',
    required = false,
    children,
    ...props
  },
  ref
) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className={`flex flex-col space-y-1.5 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-medium text-[#F5F3ED] tracking-wide flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-[#F08080] ml-1">*</span>}
          </span>
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          ref={ref}
          required={required}
          className={`w-full appearance-none rounded-xl glass-input py-2.5 px-3.5 pr-10 text-sm text-[#F5F3ED] font-sans cursor-pointer ${
            error ? 'border-[#F08080]/60 focus:border-[#F08080] focus:ring-[#F08080]/20' : ''
          } ${className}`}
          {...props}
        >
          {children ||
            options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className="bg-[#1B1D20] text-[#F5F3ED] py-1"
                disabled={opt.disabled}
              >
                {opt.label}
              </option>
            ))}
        </select>

        {/* Custom Chevron Indicator */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-[#A5A5A0]">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {error ? (
        <p className="text-[11px] text-[#F08080] font-medium mt-0.5">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-[#A5A5A0] mt-0.5">{helperText}</p>
      ) : null}
    </div>
  )
})

GlassSelect.propTypes = {
  label: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
      disabled: PropTypes.bool,
    })
  ),
  error: PropTypes.string,
  helperText: PropTypes.string,
  id: PropTypes.string,
  className: PropTypes.string,
  containerClassName: PropTypes.string,
  required: PropTypes.bool,
  children: PropTypes.node,
}

export default GlassSelect
