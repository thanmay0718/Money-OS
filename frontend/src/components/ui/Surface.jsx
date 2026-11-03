// src/components/ui/Surface.jsx
import React from 'react'
import PropTypes from 'prop-types'
import GlassSurface from './glass/GlassSurface'

/**
 * Standard elevated surface upgraded to Apple Liquid Glass visual language.
 * Backward compatible with existing consumers.
 */
export default function Surface({ children, className = '', variant = 'default', ...props }) {
  return (
    <GlassSurface variant={variant} className={`p-4 ${className}`} {...props}>
      {children}
    </GlassSurface>
  )
}

Surface.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'elevated', 'subtle', 'interactive', 'accent']),
}
