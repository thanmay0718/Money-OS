// src/components/ui/glass/GlassInput.jsx
import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'

/**
 * GlassInput provides an accessible, translucent form input
 * with subtle depth, crisp typography, and fluid focus states.
 */
const GlassInput = forwardRef(function GlassInput(
  {
    label,
    error,
    helperText,
    icon,
    endIcon,
    id,
    className = '',
    containerClassName = '',
    required = false,
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className={`flex flex-col space-y-1.5 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-[#F5F3ED] tracking-wide flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-[#F08080] ml-1">*</span>}
          </span>
        </label>
      )}

      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3.5 text-[#777A80] pointer-events-none flex items-center">
            {icon}
          </span>
        )}

        <input
          id={inputId}
          ref={ref}
          required={required}
          className={`w-full rounded-xl glass-input py-2.5 px-3.5 text-sm text-[#F5F3ED] placeholder-[#777A80] font-sans ${
            icon ? 'pl-10' : ''
          } ${endIcon ? 'pr-10' : ''} ${
            error ? 'border-[#F08080]/60 focus:border-[#F08080] focus:ring-[#F08080]/20' : ''
          } ${className}`}
          {...props}
        />

        {endIcon && (
          <span className="absolute right-3.5 text-[#777A80] flex items-center">
            {endIcon}
          </span>
        )}
      </div>

      {error ? (
        <p className="text-[11px] text-[#F08080] font-medium mt-0.5">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-[#A5A5A0] mt-0.5">{helperText}</p>
      ) : null}
    </div>
  )
})

GlassInput.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  icon: PropTypes.node,
  endIcon: PropTypes.node,
  id: PropTypes.string,
  className: PropTypes.string,
  containerClassName: PropTypes.string,
  required: PropTypes.bool,
}

export default GlassInput
