// src/components/ui/glass/GlassIconButton.jsx
import React from 'react'
import PropTypes from 'prop-types'

/**
 * GlassIconButton provides a circular or squircle translucent action button
 * with smooth micro-interactions, edge highlights, and accessible tooltips.
 */
export default function GlassIconButton({
  icon,
  onClick,
  title,
  ariaLabel,
  disabled = false,
  active = false,
  size = 'md', // 'sm' | 'md' | 'lg'
  variant = 'default', // 'default' | 'accent' | 'danger'
  className = '',
  ...rest
}) {
  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg text-xs',
    md: 'w-10 h-10 rounded-xl text-sm',
    lg: 'w-12 h-12 rounded-2xl text-base',
  }[size] || 'w-10 h-10 rounded-xl'

  const variantClasses = {
    default: active
      ? 'bg-[#D6B875]/25 text-[#D6B875] border-[#D6B875]/50 shadow-[0_0_15px_rgba(214,184,117,0.3)]'
      : 'glass-pill text-[#A5A5A0] hover:text-[#F5F3ED] hover:bg-[#292B2E] hover:border-[rgba(241,223,177,0.2)]',
    accent:
      'bg-[#D6B875] text-[#171512] font-semibold border border-[#F1DFB1]/30 shadow-[0_2px_12px_rgba(214,184,117,0.4)] hover:bg-[#F1DFB1]',
    danger:
      'bg-[#F08080]/15 text-[#F08080] border border-[#F08080]/30 hover:bg-[#F08080]/25 hover:border-[#F08080]/50',
  }[variant] || 'glass-pill text-[#A5A5A0]'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel || title}
      className={`inline-flex items-center justify-center transition-all duration-150 backdrop-blur-md active:scale-95 disabled:opacity-40 disabled:pointer-events-none ${sizeClasses} ${variantClasses} ${className}`}
      {...rest}
    >
      {icon}
    </button>
  )
}

GlassIconButton.propTypes = {
  icon: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  title: PropTypes.string,
  ariaLabel: PropTypes.string,
  disabled: PropTypes.bool,
  active: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['default', 'accent', 'danger']),
  className: PropTypes.string,
}
