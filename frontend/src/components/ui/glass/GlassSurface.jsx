// src/components/ui/glass/GlassSurface.jsx
import React from 'react'
import PropTypes from 'prop-types'

/**
 * GlassSurface — Lavender Dawn palette.
 * accent variant now uses lavender tint instead of champagne gold.
 */
export default function GlassSurface({
  children,
  className = '',
  variant = 'default', // 'default' | 'elevated' | 'subtle' | 'interactive' | 'accent'
  onClick,
  as: Component = 'div',
  ...rest
}) {
  const variantClasses = {
    default:     'glass-surface',
    elevated:    'glass-panel',
    subtle:      'glass-subtle',
    interactive: 'glass-surface glass-interactive cursor-pointer',
    // Lavender-tinted accent card (was champagne gold)
    accent:      'glass-surface border-[#C3ABFA]/25 bg-[#C3ABFA]/[0.06] shadow-[0_4px_20px_-2px_rgba(195,171,250,0.15)]',
  }[variant] || 'glass-surface'

  return (
    <Component
      onClick={onClick}
      className={`rounded-2xl ${variantClasses} text-[#FAFAFA] transition-all duration-200 ${className}`}
      {...rest}
    >
      {children}
    </Component>
  )
}

GlassSurface.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'elevated', 'subtle', 'interactive', 'accent']),
  onClick: PropTypes.func,
  as: PropTypes.elementType,
}
