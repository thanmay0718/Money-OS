// src/components/ui/glass/GlassBadge.jsx
import React from 'react'
import PropTypes from 'prop-types'

/**
 * GlassBadge — Lavender Dawn palette.
 * accent / default → lavender tints; positive → green; negative → pink; warning → amber; transfer → blue.
 */
export default function GlassBadge({
  children,
  variant = 'default', // 'default' | 'positive' | 'negative' | 'accent' | 'warning' | 'purple' | 'transfer'
  size = 'md', // 'sm' | 'md'
  className = '',
}) {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 rounded-lg',
    md: 'text-xs px-2.5 py-1 rounded-xl',
  }[size] || 'text-xs px-2.5 py-1 rounded-xl'

  const variantClasses = {
    default:  'bg-[#242424]/80 text-[#A3A3A3] border border-[#292929] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
    positive: 'bg-[#70D6A3]/15 text-[#70D6A3] border border-[#70D6A3]/30 shadow-[inset_0_1px_0_rgba(112,214,163,0.15)]',
    negative: 'bg-[#F07891]/15 text-[#F07891] border border-[#F07891]/30 shadow-[inset_0_1px_0_rgba(240,120,145,0.15)]',
    // accent → lavender (replaces old champagne gold)
    accent:   'bg-[#C3ABFA]/15 text-[#D5C5FF] border border-[#C3ABFA]/30 shadow-[inset_0_1px_0_rgba(195,171,250,0.2)]',
    warning:  'bg-[#E9BC68]/15 text-[#E9BC68] border border-[#E9BC68]/30 shadow-[inset_0_1px_0_rgba(233,188,104,0.15)]',
    transfer: 'bg-[#86B8F5]/15 text-[#86B8F5] border border-[#86B8F5]/30 shadow-[inset_0_1px_0_rgba(134,184,245,0.15)]',
    purple:   'bg-[#C3ABFA]/15 text-[#D5C5FF] border border-[#C3ABFA]/30 shadow-[inset_0_1px_0_rgba(195,171,250,0.15)]',
  }[variant] || 'bg-[#242424]/80 text-[#A3A3A3] border border-[#292929]'

  return (
    <span
      className={`inline-flex items-center font-medium backdrop-blur-md select-none tracking-wide ${sizeClasses} ${variantClasses} ${className}`}
    >
      {children}
    </span>
  )
}

GlassBadge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'positive', 'negative', 'accent', 'warning', 'purple', 'transfer']),
  size: PropTypes.oneOf(['sm', 'md']),
  className: PropTypes.string,
}
