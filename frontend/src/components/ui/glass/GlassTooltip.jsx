// src/components/ui/glass/GlassTooltip.jsx
import React, { useState } from 'react'
import PropTypes from 'prop-types'

/**
 * GlassTooltip displays an Apple Liquid Glass tooltip on hover/focus.
 */
export default function GlassTooltip({ content, children, position = 'top', className = '' }) {
  const [visible, setVisible] = useState(false)

  const posClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }[position] || 'bottom-full left-1/2 -translate-x-1/2 mb-2'

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && content && (
        <div
          role="tooltip"
          className={`absolute z-50 pointer-events-none px-2.5 py-1 text-[11px] font-medium text-[#F5F3ED] rounded-lg glass-panel bg-[#1B1D20]/95 border border-[rgba(241,223,177,0.18)] shadow-lg whitespace-nowrap animate-in fade-in duration-150 ${posClasses}`}
        >
          {content}
        </div>
      )}
    </div>
  )
}

GlassTooltip.propTypes = {
  content: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  position: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  className: PropTypes.string,
}
