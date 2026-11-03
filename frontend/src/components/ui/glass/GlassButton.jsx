// src/components/ui/glass/GlassButton.jsx
import React from 'react'
import PropTypes from 'prop-types'

/**
 * GlassButton — Lavender Dawn variant.
 * Primary = soft lavender; Secondary = dark surface; Accent = lavender gradient.
 */
export default function GlassButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
  variant = 'primary', // 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon = null,
  className = '',
  ...rest
}) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
    md: 'px-4 py-2 text-sm rounded-xl gap-2',
    lg: 'px-5 py-2.5 text-base rounded-2xl gap-2.5',
  }[size] || 'px-4 py-2 text-sm rounded-xl gap-2'

  const variantClasses = {
    // Lavender primary button
    primary:
      'bg-[#C3ABFA] hover:bg-[#D5C5FF] text-[#18151F] font-semibold border border-[#D5C5FF]/30 shadow-[0_4px_16px_rgba(195,171,250,0.25),inset_0_1px_1px_rgba(255,255,255,0.35)] hover:shadow-[0_6px_22px_rgba(195,171,250,0.4),inset_0_1px_1px_rgba(255,255,255,0.5)] hover:-translate-y-0.5 active:translate-y-0',
    // Dark surface secondary button
    secondary:
      'bg-[#222222] text-[#FAFAFA] border border-[#292929] hover:bg-[#2a2a2a] hover:text-[#D5C5FF] hover:border-[#C3ABFA]/40 hover:-translate-y-0.5 active:translate-y-0 shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]',
    // Transparent ghost button
    ghost:
      'bg-transparent text-[#A3A3A3] hover:text-[#FAFAFA] hover:bg-white/[0.06] active:bg-white/[0.1] border border-transparent',
    // Lavender gradient accent
    accent:
      'bg-gradient-to-r from-[#C3ABFA] to-[#A98AF4] hover:from-[#D5C5FF] hover:to-[#C3ABFA] text-[#18151F] font-semibold border border-[#D5C5FF]/25 shadow-[0_4px_16px_rgba(195,171,250,0.3)] hover:-translate-y-0.5 active:translate-y-0',
    // Destructive / danger stays red
    danger:
      'bg-[#F07891]/15 hover:bg-[#F07891]/25 text-[#F07891] border border-[#F07891]/30 hover:border-[#F07891]/50 shadow-[0_2px_12px_rgba(240,120,145,0.2)] hover:-translate-y-0.5 active:translate-y-0',
  }[variant] || 'bg-[#222222] text-[#FAFAFA]'

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium transition-all duration-150 select-none backdrop-blur-md disabled:opacity-40 disabled:pointer-events-none disabled:transform-none ${sizeClasses} ${variantClasses} ${className}`}
      {...rest}
    >
      {loading ? (
        <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin inline-block mr-1" />
      ) : icon ? (
        <span className="inline-flex shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  )
}

GlassButton.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'danger', 'accent']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  icon: PropTypes.node,
  className: PropTypes.string,
}
