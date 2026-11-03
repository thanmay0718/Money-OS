// src/components/ui/glass/GlassProgressIndicator.jsx
import React from 'react'
import PropTypes from 'prop-types'

/**
 * GlassProgressIndicator — Lavender Dawn palette.
 * Default / indigo / lavender variant → lavender gradient.
 * emerald → income green; rose → expense pink; amber → warning; gradient → lavender multi-stop.
 */
export default function GlassProgressIndicator({
  value = 0,
  max = 100,
  showLabel = false,
  label = '',
  size = 'md', // 'sm' | 'md' | 'lg'
  variant = 'lavender', // 'lavender' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'gradient'
  className = '',
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }[size] || 'h-2.5'

  const fillColors = {
    lavender: 'bg-gradient-to-r from-[#C3ABFA] to-[#D5C5FF] shadow-[0_0_12px_rgba(195,171,250,0.45)]',
    // 'indigo' kept as alias so existing code still works
    indigo:   'bg-gradient-to-r from-[#C3ABFA] to-[#D5C5FF] shadow-[0_0_12px_rgba(195,171,250,0.45)]',
    emerald:  'bg-gradient-to-r from-[#70D6A3] to-[#A3E8C4] shadow-[0_0_12px_rgba(112,214,163,0.45)]',
    amber:    'bg-gradient-to-r from-[#E9BC68] to-[#F5D68A] shadow-[0_0_12px_rgba(233,188,104,0.45)]',
    rose:     'bg-gradient-to-r from-[#F07891] to-[#F8A0B4] shadow-[0_0_12px_rgba(240,120,145,0.45)]',
    gradient: 'bg-gradient-to-r from-[#C3ABFA] via-[#A98AF4] to-[#70D6A3] shadow-[0_0_12px_rgba(195,171,250,0.45)]',
  }[variant] || 'bg-gradient-to-r from-[#C3ABFA] to-[#D5C5FF] shadow-[0_0_12px_rgba(195,171,250,0.45)]'

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between text-xs font-medium text-[#A3A3A3] mb-1.5">
          <span>{label}</span>
          <span className="font-semibold text-[#FAFAFA] font-mono">{percentage.toFixed(1)}%</span>
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={`w-full ${heightClasses} rounded-full overflow-hidden bg-[#141414] border border-[#292929] shadow-inner p-0.5 backdrop-blur-sm relative`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out relative ${fillColors}`}
          style={{ width: `${percentage}%` }}
        >
          {/* Specular highlight */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/25 to-transparent rounded-full pointer-events-none" />
        </div>
      </div>
    </div>
  )
}

GlassProgressIndicator.propTypes = {
  value: PropTypes.number,
  max: PropTypes.number,
  showLabel: PropTypes.bool,
  label: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['lavender', 'indigo', 'emerald', 'amber', 'rose', 'gradient']),
  className: PropTypes.string,
}
